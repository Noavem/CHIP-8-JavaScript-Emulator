const keyMap = {
    'Digit1': 0x1, 'Digit2': 0x2, 'Digit3': 0x3, 'Digit4': 0xC,
    'KeyQ': 0x4, 'KeyW': 0x5, 'KeyE': 0x6, 'KeyR': 0xD,
    'KeyA': 0x7, 'KeyS': 0x8, 'KeyD': 0x9, 'KeyF': 0xE,
    'KeyZ': 0xA, 'KeyX': 0x0, 'KeyC': 0xB, 'KeyV': 0xF
};

export function initializeInput(state, window) {
    window.addEventListener('keydown', (e) => {
        const key = keyMap[e.code];
        if (key !== undefined) {
            state.keys[key] = 1;
        }
    });

    window.addEventListener('keyup', (e) => {
        const key = keyMap[e.code];
        if (key !== undefined) {
            state.keys[key] = 0;
        }
    });
}