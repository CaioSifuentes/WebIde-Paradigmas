importScripts('https://cdn.jsdelivr.net/pyodide/v0.27.2/full/pyodide.js');
importScripts("js/DebugMapper.js");

let pyodide;
let pyodideReady = false;

let debugLines = [];
let currentLine = 0;

async function initPyodide() {
  pyodide = await loadPyodide();

  pyodideReady = true;
  postMessage({status: "UPDATE_TABLE", vars:{}})
  postMessage({status: 'WORKER_READY'});
}

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

(function() {
    const originalLog = console.log;

    console.log = function(...args) {
        originalLog.apply(console, args);
        const message = args.join(" ");

        postMessage({status: 'PRINT_VALUE', message:">>> " + message})
    };
})();

onmessage = async function(event) {
    while (!pyodideReady) {
        await new Promise(resolve => setTimeout(resolve, 50)); // Aguarda 50ms antes de verificar novamente
    }

    if (event.data.action !== undefined){
        if (event.data.action == "evaluate"){
            this.postMessage({ status: "STARTING_TO_RUN"});
            await pyodide.runPythonAsync(event.data.codeToRun)
            .then(() => this.postMessage({ status: "FINISHING_TO_RUN"}))
            .catch(
                (error) => {
                    this.postMessage({ status: "BREAK", error:error})
                    if (!error.toString().includes("KeyboardInterrupt")) {
                        console.log("[ERROR] -> " + error)
                    }
                }
            );
        }
        else if (event.data.action == "debug"){
            startDebug(event.data.codeToRun);
        }
        else if (event.data.action == "step"){
            stepDebug();
        }
        else if (event.data.action == "loadBuffer"){
            pyodide.setInterruptBuffer(event.data.buffer);
        }
    }
};

initPyodide();
