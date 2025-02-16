import { output, stepButton, debugButton, evaluteButton, editor, clearButton } from "./js/DocumentVars.js"
import { updateVarsTable } from "./js/DebugTableManager.js";
import { updateButton, highlightVisibleLine, getFirstNonEmptyLine, addToOutput } from "./js/UserInterface.js";

export let runnerWorker;
export let interruptBuffer = new Uint8Array(new SharedArrayBuffer(1));

export let running = false;

function loadWorker(){
    try {runnerWorker.terminate();} catch (e) {}
    runnerWorker = new Worker('worker.js');
    runnerWorker.postMessage({ action: "loadBuffer", buffer:interruptBuffer });
    runnerWorker.onmessage = function (event) {
        if (event.data.status !== undefined) {
            switch (event.data.status) {
                case 'WORKER_READY':
                    console.log("cl: Worker Ready");
                    break;
    
                case 'PRINT_VALUE':
                    const message = event.data.message;
                    if (!message.startsWith("cl: ")) {
                        output.value += message + "\n";
                        output.scrollTop = output.scrollHeight;
                    }
                    break;
    
                case 'DEBUG_STARTED':
                    console.log(editor.lineAtHeight(editor.getScrollInfo().top, "local") + 1)
                    highlightVisibleLine(1);
                    stepButton.disabled = false;
                    debugButton.disabled = true;
                    clearButton.innerHTML = `<i class="fa-regular fa-circle-stop" style="color:rgb(182, 36, 36)"></i>`
                    output.value = "Debugging started...\n";
                    break;
    
                case 'DEBUG_FINISHED':
                    highlightVisibleLine(0);
                    stepButton.disabled = true;
                    debugButton.disabled = false;
                    evaluteButton.disabled = false;
                    clearButton.innerHTML = `<i class="fa-solid fa-broom"></i>`
                    output.value += "Debugging finished.\n";
                    break;
    
                case 'UPDATE_TABLE':
                    updateVarsTable(event.data.vars);
                    break;
    
                case 'HIGHLIGHT_LINE':
                    console.log(getFirstNonEmptyLine())
                    let lineToHighLight = event.data.currentLine === undefined ? 0 : event.data.currentLine;
                    highlightVisibleLine(lineToHighLight);
                    break;
    
                case 'STARTING_TO_RUN':
                    running = true;
                    updateButton();
                    break;
    
                case 'FINISHING_TO_RUN':
                    running = false;
                    updateButton();
                    break;
    
                case 'BREAK':
                    running = false;
                    breakRun();
                    if (event.data.error){
                        addToOutput(event.data.error);
                    }
                    break;
            }
        }
    };
}

loadWorker();

export async function evaluatePython(action) {
    if (running == true){ breakRun(); return; }

    interruptBuffer[0] = 0;
    try {
        console.log("cl: RUNNING CODE " + `[${action}]`)
        evaluteButton.disabled = action === "debug" ? true : false
        runnerWorker.postMessage({action:action, codeToRun:editor.getValue()})
    } catch (err) {
        console.error("Error: " + err);
    }
}

export async function stepDebug() {
    try {
        console.log("cl: STEPED ")
        runnerWorker.postMessage({action:"step"})
    } catch (err) {
        console.error("Error: " + err);
    }
}

export function breakRun(){
    interruptBuffer[0] = 2;
    loadWorker();

    running = false;
    updateButton()
}
