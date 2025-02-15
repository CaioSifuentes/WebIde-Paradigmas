import { output, stepButton, debugButton, evaluteButton, toggleButton, menu, arrow } from "./DocumentVars.js";
import { running, breakRun } from "../main.js";

export function addToOutput(s) {
    output.value += s + "\n";
    output.scrollTop = output.scrollHeight;
}

export function updateButton() {
    evaluteButton.textContent = running ? "Stop" : "Run";
    debugButton.disabled = running;
    stepButton.disabled = true;
}

export function clearConsole() {
    breakRun();

    stepButton.disabled = true;
    debugButton.disabled = false;
    evaluteButton.disabled = false;
    output.value = "";
}

export function toggleSideMenu(){
    console.log("A")
    if (menu.style.width === "0px" || menu.style.width === "") {
        menu.style.width = "300px"; // Abre o menu
        toggleButton.innerHTML = '<i class="fas fa-arrow-left"></i>';
    } else {
        menu.style.width = "0px"; // Fecha o menu
        toggleButton.innerHTML = '<i class="fas fa-arrow-right"></i>';
    }

    menu.classList.toggle("open");
    arrow.classList.toggle("open");
}
