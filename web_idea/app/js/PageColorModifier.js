import { editor } from "./DocumentVars.js"

/*
Esse arquivo tem como principal função trabalhar na troca de paletas de cores do aplicativo.
*/


// Definindo as duas paletas de cores
const palette1 = {
    '--color-text': '#ffffff',
    '--color-bg-primary': '#28242c',
    '--color-accent': '#ea7cc8',
    '--color-white': '#ffffff',
    '--color-bg-secondary': '#1f1b2a',
    '--color-shadow': 'rgba(0, 0, 0, 0.2)',
    '--color-bg-dark': '#2a2a30',
    '--color-border': '#ccc',
    '--color-output-bg': '#302c34',
    '--color-output-border': '#885076',
    '--color-border-dark': '#444',
    '--color-border-alt': '#555',
    '--color-table-header': '#333',
    '--color-scrollbar-hover': '#e08dc6',
  };
  
  const palette2 = {
    '--color-text': '#000000',
    '--color-bg-primary': '#f8f9fa',
    '--color-accent': '#ffcc00',
    '--color-white': '#ffffff',
    '--color-bg-secondary': '#4a4d38',
    '--color-shadow': 'rgba(0, 0, 0, 0.2)',
    '--color-bg-dark': '#d6d6d6',
    '--color-border': '#bbbbbb',
    '--color-output-bg': '#f5f5dc',
    '--color-output-border': '#d4af37',
    '--color-border-dark': '#999999',
    '--color-border-alt': '#aaaaaa',
    '--color-table-header': '#ffdb58',
    '--color-scrollbar-hover': '#ffcc33',
  };
  
  // Função para aplicar a paleta
  function applyPalette(palette) {
    for (const [key, value] of Object.entries(palette)) {
      document.documentElement.style.setProperty(key, value);
    }
  }
  
  // Função para alternar entre as paletas
export function togglePalette() {
    const currentPalette = getComputedStyle(document.documentElement).getPropertyValue('--color-accent').trim();
    if (currentPalette === '#ea7cc8') { // Verifica se a paleta atual é a de rosa
      applyPalette(palette2); // Muda para a paleta de amarelo
    } else {
      applyPalette(palette1); // Muda para a paleta de rosa
    }

    const currentTheme = editor.getOption('theme');
    const newTheme = currentTheme === 'dracula' ? 'idea' : 'dracula'; // Altera entre dois temas
    const newIcon = currentTheme === 'dracula' ? `<i class="fa-regular fa-moon"></i>` : `<i class="fa-solid fa-sun"></i>`;
    
    editor.setOption('theme', newTheme);
    document.getElementById("togglePaletteBtn").innerHTML = newIcon;
}
  