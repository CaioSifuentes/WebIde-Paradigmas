import { output, stepButton, debugButton, evaluteButton } from "./DocumentVars.js";
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
