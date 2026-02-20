import { resetState } from './state.js';

export async function loadRom(file, state) {
    resetState();

    const arrayBuffer = await file.arrayBuffer();
    const romData = new Uint8Array(arrayBuffer);

    for (let i = 0; i < romData.length; i++) {
        state.memory[0x200 + i] = romData[i];
    }
    console.log(`${file.name} loaded into memory!`);
}

export function initializeRomLoader(state, stopBeep, setSoundTimerPreviousState, onRomLoad) {
    const loadRomLink = document.getElementById('load-rom-link');
    const romInput = document.getElementById('rom-upload');

    loadRomLink.addEventListener('click', (e) => {
        e.preventDefault();
        romInput.click();
    });

    romInput.addEventListener('change', async (e) => {
        if (e.target.files.length > 0) {
            const file = e.target.files[0];
            stopBeep();
            setSoundTimerPreviousState(false);

            await loadRom(file, state);
            onRomLoad();
        }
        romInput.value = '';
        loadRomLink.blur();
    });
}