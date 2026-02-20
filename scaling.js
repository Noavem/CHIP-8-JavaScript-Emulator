const canvas = document.getElementById('chip8-display');
const pane = canvas.parentElement;
const baseWidth = 64;
const baseHeight = 32;

function resize() {
    let padding = 64;
    const maxWidth = pane.clientWidth - padding;

    const scale = Math.max(1, Math.floor(maxWidth / baseWidth));

    canvas.style.width = `${baseWidth * scale}px`;
    canvas.style.height = `${baseHeight * scale}px`;
}

window.addEventListener('resize', resize);
new ResizeObserver(resize).observe(document.body);
resize();