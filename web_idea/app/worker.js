importScripts('https://cdn.jsdelivr.net/pyodide/v0.27.2/full/pyodide.js');
importScripts("js/DebugMapper.js");

let pyodide;
let pyodideReady = false;

let debugLines = [];
let currentLine = 0;

// Inicia o pyodide.
async function initPyodide() {
  pyodide = await loadPyodide();

  pyodideReady = true;
  postMessage({status: "UPDATE_TABLE", vars:{}}) // Recarrega a tabela de DEBUG.
  postMessage({status: 'WORKER_READY'});
}

/* 
Altera a função original de 'console.log', para sempre que for chamado 
(como quando é chamado ao executar o `print` do pytodide) 
também enviar uma mensagem de PRINT_VALUE.
*/
(function() {
    const originalLog = console.log;

    console.log = function(...args) {
        originalLog.apply(console, args);
        const message = args.join(" ");

        postMessage({status: 'PRINT_VALUE', message:">>> " + message})
    };
})();

onmessage = async function(event) {
    while (!pyodideReady) {await new Promise(resolve => setTimeout(resolve, 50));} // Aguarda o pyodide estar pronto.

    /*
    O worker recebe as mensagens do programa principal através de um objeto com o valor "action".
    O action define o que deve ser feito pelo worker.
    */
    if (event.data.action !== undefined){
        
        switch (event.data.action) {
            // A action 'evaluate' diz ao pyodide para executar um código recebido pelo valor 'codeToRun'.
            case "evaluate":
                this.postMessage({ status: "STARTING_TO_RUN" });
                await pyodide.runPythonAsync(event.data.codeToRun)
                    .then(() => this.postMessage({ status: "FINISHING_TO_RUN" }))
                    .catch((error) => {
                        this.postMessage({ status: "BREAK", error: error });
                        if (!error.toString().includes("KeyboardInterrupt")) {
                            console.log("[ERROR] -> " + error);
                        }
                    });
                break;
        
            // A action 'debug' diz ao pyodide para executar o código em modo de DEBUG.
            case "debug":
                startDebug(event.data.codeToRun);
                break;
        
            // A action 'step' diz ao worker para avançar o DEBUG em uma linha.
            case "step":
                stepDebug();
                break;
        
            // A action 'loadBuffer' diz ao worker para carregar o buffer que será usado para interromper o código - uso conforme a documentação: https://pyodide.org/en/stable/usage/keyboard-interrupts.html
            case "loadBuffer":
                pyodide.setInterruptBuffer(event.data.buffer);
                break;
        
            default:
                console.warn("Ação desconhecida:", event.data.action);
        }
        
    }
};


/*
    As funções abaixo fazem referência ao DEBUG - não mais exigido no trabalho, e que portanto não serão comentadas.
*/
async function startDebug(code) {
    debugLines = code.split("\n");
    debugFormatedCode = formatDebugCode(debugLines);

    pyodide.runPythonAsync(debugFormatedCode)
    .catch(
        (error) => {
            postMessage({status: "DEBUG_FINISHED"});
            if (!error.toString().includes("KeyboardInterrupt")) {
                console.log("[ERROR] -> " + error)
            }
        }
    );

    postMessage({status: "DEBUG_STARTED"})
}

async function finishDebug() {
    debugLines = [];
    currentLine = 0;
    
    postMessage({status: "DEBUG_FINISHED"});
}

async function stepDebug() {
    if (pyodide.globals.get("__debugFinishedFlag") === 0){
      pyodide.runPython("__debugCodeFlag = 1");
      await new Promise(resolve => setTimeout(resolve, 100));
      currentLine += 1;

      const debugVars = pyodide.globals.get("__currentVars").toJs();
      const currentLineVar = pyodide.globals.get("__RealVisibleLine");
      postMessage({status: "UPDATE_TABLE", vars:JSON.parse(JSON.stringify(debugVars))})
      postMessage({status: "HIGHLIGHT_LINE", currentLine:currentLineVar})
    } else {
      finishDebug();
      postMessage({status: "UPDATE_TABLE", vars:{}})
    }
}

initPyodide();
