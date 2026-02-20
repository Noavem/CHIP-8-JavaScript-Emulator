const canvas = document.getElementById('chip8-display');
const ctx = canvas.getContext('2d');

const COLOR_OFF = '#000000';
const COLOR_ON = '#FFFFFF';

export function render(state) {
    ctx.fillStyle = COLOR_OFF;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = COLOR_ON;

    for (let i = 0; i < state.display.length; i++) {
        if (state.display[i] === 1) {
            const x = i % 64;
            const y = Math.floor(i / 64);
            ctx.fillRect(x, y, 1, 1);
        }
    }
}