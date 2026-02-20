export function updateInternals(state, document) {
    const registersDiv = document.getElementById('registers');
    let regHtml = '';
    for (let i = 0; i < 16; i++) {
        const hex = state.V[i].toString(16).toUpperCase().padStart(2, '0');
        regHtml += `V${i.toString(16).toUpperCase()}: 0x${hex} `;
        if ((i + 1) % 4 === 0) regHtml += '<br>';
    }
    registersDiv.innerHTML = regHtml;

    document.getElementById('pc').textContent = '0x' + state.pc.toString(16).toUpperCase().padStart(4, '0');

    document.getElementById('i-reg').textContent = '0x' + state.I.toString(16).toUpperCase().padStart(4, '0');

    document.getElementById('sp').textContent = state.sp;

    const instrEl = document.getElementById('instruction');
    if (instrEl) {
        const ci = typeof state.currentInstruction === 'number' ? state.currentInstruction : 0;
        instrEl.textContent = '0x' + ci.toString(16).toUpperCase().padStart(4, '0');
    }

    document.getElementById('delay-timer').textContent = state.delayTimer;
    document.getElementById('sound-timer').textContent = state.soundTimer;

    updateMemoryDisplay(state, document);
}

function updateMemoryDisplay(state, document) {
    const memoryDiv = document.getElementById('memory');
    let memHtml = '';
    for (let i = 0; i < state.memory.length; i += 16) {
        const address = '0x' + i.toString(16).toUpperCase().padStart(4, '0');
        let rowHex = '';
        for (let j = 0; j < 16; j++) {
            const byte = state.memory[i + j].toString(16).toUpperCase().padStart(2, '0');
            rowHex += byte + ' ';
        }
        memHtml += address + ': ' + rowHex + '\n';
    }
    memoryDiv.textContent = memHtml;
}