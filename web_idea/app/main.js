import { output, stepButton, debugButton, evaluteButton, editor } from "./js/DocumentVars.js"
import { updateVarsTable } from "./js/DebugTableManager.js";
import { updateButton } from "./js/UserInterface.js";

export const runnerWorker = new Worker('worker.js');
export let interruptBuffer = new Uint8Array(new SharedArrayBuffer(1));
runnerWorker.postMessage({ action: "loadBuffer", buffer:interruptBuffer });

export let running = false;

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
                stepButton.disabled = false;
                debugButton.disabled = true;
                output.value = "Debugging started...\n";
                break;

            case 'DEBUG_FINISHED':
                stepButton.disabled = true;
                debugButton.disabled = false;
                evaluteButton.disabled = false;
                output.value += "Debugging finished.\n";
                break;

            case 'UPDATE_TABLE':
                updateVarsTable(event.data.vars);
                break;

            case 'STARTING_TO_RUN':
                running = true;
                updateButton();
                break;

            case 'FINISHING_TO_RUN':
                running = false;
                updateButton();
                break;
        }
    }
};

export async function evaluatePython(action) {
    if (running == true){ breakRun(); return; }

    interruptBuffer[0] = 0;
    try {
        console.log("cl: RUNNING CODE " + `[${action}]`)
        evaluteButton.disabled = action === "debug" ? true : false
        runnerWorker.postMessage({action:action, codeToRun:editor.getValue()})
    } catch (err) {
        addToOutput("Error: " + err);
    }
}

export async function stepDebug() {
    try {
        console.log("cl: STEPED ")
        runnerWorker.postMessage({action:"step"})
    } catch (err) {
        addToOutput("Error: " + err);
    }
}

export function breakRun(){
    interruptBuffer[0] = 2;
    running = false;
    updateButton()
}
