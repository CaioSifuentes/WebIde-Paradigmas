import { output, stepButton, debugButton, evaluteButton, editor, clearButton } from "./js/DocumentVars.js"
import { updateVarsTable } from "./js/DebugTableManager.js";
import { updateButton, highlightVisibleLine, getFirstNonEmptyLine, addToOutput, defineWorkerMessage } from "./js/UserInterface.js";

export let runnerWorker;
export let interruptBuffer = new Uint8Array(new SharedArrayBuffer(1));

export let running = false;

function loadWorker(){
    // Recarrega o worker.
    try {runnerWorker.terminate();} catch (e) {}
    defineWorkerMessage(0); // Muda a mensagem no codigo para READY ou NOT READY.
    runnerWorker = new Worker('worker.js');

    runnerWorker.postMessage({ action: "loadBuffer", buffer:interruptBuffer }); //  Carrega o Buffer de interrupção de código.

    /*
    O programa principal recebe as mensagens do worker através de um objeto com o valor "status".
    O status define o que deve ser feito pelo programa principal.
    */
    runnerWorker.onmessage = function (event) {
        if (event.data.status !== undefined) {
            switch (event.data.status) {

                // WORKER_READY indica que o worker carregou o Pyodide e está pronto para executar um código em python.
                case 'WORKER_READY':
                    defineWorkerMessage(1);
                    console.log("cl: Worker Ready");
                    break;
    
                // PRINT_VALUE imprime um valor recebido em 'message' no output da página.
                case 'PRINT_VALUE':
                    const message = event.data.message;
                    if (!message.startsWith("cl: ")) {
                        output.value += message + "\n";
                        output.scrollTop = output.scrollHeight;
                    }
                    break;
    
                // DEBUG_STARTED indica que o código começou a executar no modo DEBUG.
                case 'DEBUG_STARTED':
                    console.log(editor.lineAtHeight(editor.getScrollInfo().top, "local") + 1)
                    highlightVisibleLine(1);

                    stepButton.disabled = false;
                    debugButton.disabled = true;
                    clearButton.innerHTML = `<i class="fa-regular fa-circle-stop" style="color:rgb(182, 36, 36)"></i>`
                    output.value = "Debugging started...\n";
                    break;
    
                // DEBUG_FINISHED indica que o código acabou de executar o modo DEBUG.
                case 'DEBUG_FINISHED':
                    highlightVisibleLine(0);

                    stepButton.disabled = true;
                    debugButton.disabled = false;
                    evaluteButton.disabled = false;
                    clearButton.innerHTML = `<i class="fa-solid fa-broom"></i>`
                    output.value += "Debugging finished.\n";
                    break;
    
                // UPDATE_TABLE exige que o aplicativo atualize a tabela de variaveis de DEBUG. Essa mensagem é recebida sempre que um STEP é avançado.
                case 'UPDATE_TABLE':
                    updateVarsTable(event.data.vars);
                    break;
    
                // HIGHLIGHT_LINE deixa a linha atual em que o DEBUG se encontra destacada.
                case 'HIGHLIGHT_LINE':
                    console.log(getFirstNonEmptyLine())
                    let lineToHighLight = event.data.currentLine === undefined ? 0 : event.data.currentLine;
                    highlightVisibleLine(lineToHighLight);
                    break;
    
                // STARTING_TO_RUN indica que o código começou a executar.
                case 'STARTING_TO_RUN':
                    running = true;
                    updateButton();
                    break;
    
                // FINISHING_TO_RUN indica que o código terminou de executar.
                case 'FINISHING_TO_RUN':
                    running = false;
                    updateButton();
                    break;
    
                // BREAK exige que o código pare. Caso o BREAK venha com algum erro, este erro é adicionado ao output.
                case 'BREAK':
                    running = false;
                    breakRun();
                    if (event.data.error){
                        addToOutput("[ERROR] -> " + event.data.error);
                    }
                    break;
            }
        }
    };
}

loadWorker();

// Executa o código.
export async function evaluatePython(action) {
    debugButton.disabled = true;
    if (running == true){ breakRun(); return; } // Interrompe o código anterior.

    interruptBuffer[0] = 0; 
    try {
        // Envia uma mensagem ao worker exigindo que o código seja executado.
        console.log("cl: RUNNING CODE " + `[${action}]`)
        evaluteButton.disabled = action === "debug" ? true : false
        runnerWorker.postMessage({action:action, codeToRun:editor.getValue()})
    } catch (err) {
        console.error("Error: " + err);
    }
}

// Interrompe o código.
export function breakRun(){
    interruptBuffer[0] = 2;
    loadWorker();

    running = false;
    updateButton()
}

// Avança uma linha no DEBUG.
export async function stepDebug() {
    try {
        console.log("cl: STEPED ")
        runnerWorker.postMessage({action:"step"})
    } catch (err) {
        console.error("Error: " + err);
    }
}
