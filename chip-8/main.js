import { state, initializeFont } from './state.js';
import { fetch, decode_execute } from './interpreter.js';
import { initializeRomLoader } from './romLoader.js';
import { initAudio, stopBeep, setSoundTimerPreviousState, handleBeep } from './sound.js';
import { initializeInput } from './input.js';
import { render } from './renderer.js';
import { updateInternals } from './interface.js';
import { config } from './config.js';

/** Meta variables **/
let romLoaded = false;

let lag = 0;
let lastTime = performance.now();
const MS_PER_UPDATE = 1000 / 60;

/** Frame loop at 60hz **/

function frame(currentTime) {
    requestAnimationFrame(frame);

    console.log(config);

    let elapsed = currentTime - lastTime;
    lastTime = currentTime;

    if (elapsed > 100) elapsed = MS_PER_UPDATE;

    lag += elapsed;

    if (romLoaded) {
        state.spritesDrawnThisFrame = 0;
        instruction_execution:
        while (lag >= MS_PER_UPDATE) {

            lag -= MS_PER_UPDATE;

            if (state.delayTimer > 0) state.delayTimer--;
            if (state.soundTimer > 0) state.soundTimer--;

            for (let i = 0; i < config.IPF; i++) {
                let opcode = fetch(state);
                decode_execute(opcode, state);
                // Display wait quirk: if sprite was drawn, stop execution until next frame.
                if (config.displayWait && state.spritesDrawnThisFrame > 0) {
                    break instruction_execution;
                }
            }
        }
    }

    handleBeep(state);
    render(state);
    updateInternals(state, document);
}

/** Initialization **/

// Needed because browsers block AudioContext creation without a user gesture
function onFirstInteraction() {
    initAudio(window);
    window.removeEventListener('click', onFirstInteraction);
    window.removeEventListener('keydown', onFirstInteraction);
}
window.addEventListener('click', onFirstInteraction);
window.addEventListener('keydown', onFirstInteraction);

initializeFont();
initializeInput(state, window);
initializeRomLoader(state, stopBeep, setSoundTimerPreviousState, () => {
    lag = 0;
    lastTime = performance.now();
    romLoaded = true;
    for (let i = 0; i < 16; i++) {
        state.keys[i] = 0;
    }
});

requestAnimationFrame(frame);