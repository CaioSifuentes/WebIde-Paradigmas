import { evaluatePython, stepDebug } from "../main.js"
import { clearConsole } from "./UserInterface.js";
import { setCode } from "./CodeSamples.js";

export const editor = CodeMirror.fromTextArea(document.getElementById("code"), {
    mode: "python",     // Linguagem do código
    theme: "dracula",   // Tema escuro
    lineNumbers: true,  // Exibir números das linhas
    indentUnit: 4,      // Espaços por indentação
    matchBrackets: true // Destacar pares de colchetes
});
export const output = document.getElementById("output");

export const evaluteButton = document.getElementById("evaluteButton");
export const stepButton = document.getElementById("stepButton");
export const debugButton = document.getElementById("debugButton");
export const clearButton = document.getElementById("clearButton");
export const codeButtons = document.getElementById("codeButtons");


evaluteButton.onclick = () => evaluatePython('evaluate');
debugButton.onclick = () => evaluatePython('debug');
stepButton.onclick = () => stepDebug();
clearButton.onclick = () => clearConsole();
codeButtons.onclick = (event) => {
    if (event.target.tagName === "BUTTON") {
        setCode(Number(event.target.dataset.codeId));
    }
};


function addPressCoolDown(button, cooldown){
    button.addEventListener("click", function () {
        button.disabled = true;
        setTimeout(() => {
            button.disabled = false;
        }, cooldown);
    });
}
addPressCoolDown(evaluteButton, 1000)
addPressCoolDown(clearButton, 500)
