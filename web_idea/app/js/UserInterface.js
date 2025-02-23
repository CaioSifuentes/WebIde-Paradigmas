import { output, stepButton, debugButton, evaluteButton, toggleButton, menu, arrow, clearButton, editor } from "./DocumentVars.js";
import { running, breakRun } from "../main.js";

export function addToOutput(s) {
    output.value += s + "\n";
    output.scrollTop = output.scrollHeight;
}

export function updateButton() {
    evaluteButton.innerHTML = running ? `<i class="fa-solid fa-stop" style="color:rgb(182, 36, 36)"></i>` : `<i class="fa-solid fa-play" style="color:rgb(141, 209, 39)"></i>`;
    clearButton.innerHTML = running ? `<i class="fa-regular fa-circle-stop" style="color:rgb(182, 36, 36)"></i>` : `<i class="fa-solid fa-broom"></i>`;
    debugButton.disabled = running;
    stepButton.disabled = true;

    evaluteButton.disabled = false;
}

export function clearConsole() {
    breakRun();
    highlightVisibleLine(0);
    clearButton.innerHTML = `<i class="fa-solid fa-broom"></i>`

    stepButton.disabled = true;
    debugButton.disabled = false;
    evaluteButton.disabled = false;
    output.value = "";
}

export function toggleSideMenu(){
    console.log("A")
    if (menu.style.width === "0px" || menu.style.width === "") {
        menu.style.width = "300px"; // Abre o menu
        toggleButton.innerHTML = '<i class="fas fa-arrow-right"></i>';
    } else {
        menu.style.width = "0px"; // Fecha o menu
        toggleButton.innerHTML = '<i class="fas fa-arrow-left"></i>';
    }

    menu.classList.toggle("open");
    arrow.classList.toggle("open");
}

let highlightedLine = -1;

export function highlightVisibleLine(line) {
    const totalLines = editor.lineCount();
    for (let i = 0; i < totalLines; i++) {
        editor.removeLineClass(i, 'background', 'highlighted-line');
    }

    if (line) {
        const lineToHighlight = line - 1;

        // Destacar a linha
        editor.addLineClass(lineToHighlight, 'background', 'highlighted-line');
    }
}

export function getFirstNonEmptyLine() {
    for (let i = 0; i < editor.lineCount(); i++) {
        const lineContent = editor.getLine(i).trim();
        if (lineContent.length > 0) {
            return i + 1;
        }
    }
    
    return 0;
}

export function defineWorkerMessage(status){
    const workerStatus = document.getElementById("editor-label");
    console.log(workerStatus)

    if (workerStatus != null)
        workerStatus.innerHTML = status ? `WORKER <span style="color: green;">READY</span>` : `WORKER <span style="color: red;">NOT READY</span>`;
}
