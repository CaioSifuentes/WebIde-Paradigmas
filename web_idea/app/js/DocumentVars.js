import { evaluatePython, stepDebug } from "../main.js"
import { clearConsole, toggleSideMenu } from "./UserInterface.js";
import { setCode } from "./CodeSamples.js";
import { togglePalette } from "./PageColorModifier.js";

export const editor = CodeMirror.fromTextArea(document.getElementById("code"), {
    mode: "python",     // Linguagem do código
    theme: "dracula",   // Tema escuro
    lineNumbers: true,  // Exibir números das linhas
    indentUnit: 4,      // Espaços por indentação
    matchBrackets: true // Destacar pares de colchetes
});
editor.addLineClass(5 - 1, 'background', 'highlighted-line');
export const output = document.getElementById("output");

export const evaluteButton = document.getElementById("evaluteButton");
export const stepButton = document.getElementById("stepButton");
export const debugButton = document.getElementById("debugButton");
export const clearButton = document.getElementById("clearButton");
export const paletButtons = document.getElementById("togglePaletteBtn");
export const codeButtons = document.getElementById("codeButtons");

export const menu = document.getElementById("sideMenu");
export const toggleButton = document.getElementById("toggleMenu");
export const arrow = document.getElementById("toggleMenu");


evaluteButton.onclick = () => evaluatePython('evaluate');
debugButton.onclick = () => evaluatePython('debug');
stepButton.onclick = () => stepDebug();
clearButton.onclick = () => clearConsole();
paletButtons.onclick = () => togglePalette();
codeButtons.onclick = (event) => {
    if (event.target.tagName === "BUTTON") {
        setCode(Number(event.target.dataset.codeId));
    }
};
arrow.onclick = () => toggleSideMenu();


function addPressCoolDown(button, cooldown){
    button.addEventListener("click", function () {
        button.disabled = true;
        setTimeout(() => {
            button.disabled = false;
            console.log("DESABLED")
        }, cooldown);
    });
}
addPressCoolDown(evaluteButton, 800)
addPressCoolDown(clearButton, 500)
