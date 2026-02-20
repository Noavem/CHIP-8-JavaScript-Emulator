import { config } from './config.js';

export function fetch(state) {
    const byte1 = state.memory[state.pc];
    const byte2 = state.memory[state.pc + 1];

    // Multiply higher byte by 256, then bitwise OR to combine with lower byte
    const opcode = (byte1 << 8) | byte2;

    state.currentInstruction = opcode;

    state.pc += 2;

    return opcode;
}

export function decode_execute(opcode, state) {
    const type = (opcode & 0xF000) >> 12;
    const x = (opcode & 0x0F00) >> 8;
    const y = (opcode & 0x00F0) >> 4;

    const n = (opcode & 0x000F);
    const nn = (opcode & 0x00FF);
    const nnn = (opcode & 0x0FFF);

    switch (type) {
        case 0x0:
            if (nnn === 0x0E0) {
                // 00E0 - CLS
                state.display.fill(0);
            } else if (nnn === 0x0EE) {
                // 00EE - RET from subroutine
                state.sp--;
                state.pc = state.stack[state.sp];
            }
            // no-op for 0x0nnn
            break;

        case 0x1:
            // 1nnn - JUMP
            state.pc = nnn;
            break;

        case 0x2:
            // 2nnn - CALL subroutine
            state.stack[state.sp] = state.pc;
            state.sp++;
            state.pc = nnn;
            break;

        case 0x3:
            // 3xnn - SKIP next instruction IF Vx = nn
            if (state.V[x] === nn) state.pc += 2;
            break;

        case 0x4:
            // 4xnn - SKIP next instruction IF Vx != nn
            if (state.V[x] !== nn) state.pc += 2;
            break;

        case 0x5:
            // 5xy0 - SKIP next instruction IF Vx = Vy
            if (state.V[x] === state.V[y]) state.pc += 2;
            break;

        case 0x6:
            // 6xnn - SET Vx = nn
            state.V[x] = nn;
            break;

        case 0x7:
            // 7xnn - SET Vx = Vx + nn
            state.V[x] += nn;
            break;

        case 0x8:
            switch (n) {
                case 0x0:
                    // 8xy0 - SET Vx = Vy
                    state.V[x] = state.V[y];
                    break;
                case 0x1:
                    // 8xy1 - SET Vx = Vx OR Vy
                    state.V[x] |= state.V[y];
                    if (config.VfReset) state.V[0xF] = 0; // vF reset quirk
                    break;
                case 0x2:
                    // 8xy2 - SET Vx = Vx AND Vy
                    state.V[x] &= state.V[y];
                    if (config.VfReset) state.V[0xF] = 0; // vF reset quirk
                    break;
                case 0x3:
                    // 8xy3 - SET Vx = Vx XOR Vy
                    state.V[x] ^= state.V[y];
                    if (config.VfReset) state.V[0xF] = 0; // vF reset quirk
                    break;
                case 0x4:
                    // 8xy4 - SET Vx = Vx + Vy
                    const sum = state.V[x] + state.V[y];
                    state.V[x] = sum;
                    state.V[0xF] = sum > 255 ? 1 : 0;
                    break;
                case 0x5:
                    // 8xy5 - SET Vx = Vx - Vy, Vf = NOT borrow
                    const notBorrow5 = state.V[x] >= state.V[y] ? 1 : 0;
                    state.V[x] = state.V[x] - state.V[y];
                    state.V[0xF] = notBorrow5;
                    break;
                case 0x6:
                    // 8xy6 - Shift right
                    if (config.shifting) {
                        // Modern behavior: Vx = Vx >> 1 (ignore y)
                        const shiftedOutRight = state.V[x] & 0x1;
                        state.V[x] = state.V[x] >> 1;
                        state.V[0xF] = shiftedOutRight;
                    } else {
                        // Original behavior: Vx = Vy >> 1
                        const shiftedOutRight = state.V[y] & 0x1;
                        state.V[x] = state.V[y] >> 1;
                        state.V[0xF] = shiftedOutRight;
                    }
                    break;
                case 0x7:
                    // 8xy7 - SET Vx = Vy - Vx, Vf = NOT borrow
                    const notBorrow7 = state.V[y] >= state.V[x] ? 1 : 0;
                    state.V[x] = state.V[y] - state.V[x];
                    state.V[0xF] = notBorrow7;
                    break;
                case 0xE:
                    // 8xyE - Shift left
                    if (config.shifting) {
                        // Modern behavior: Vx = Vx << 1 (ignore y)
                        const shiftedOutLeft = (state.V[x] >> 7) & 0x1;
                        state.V[x] = state.V[x] << 1;
                        state.V[0xF] = shiftedOutLeft;
                    } else {
                        // Original behavior: Vx = Vy << 1
                        const shiftedOutLeft = (state.V[y] >> 7) & 0x1;
                        state.V[x] = state.V[y] << 1;
                        state.V[0xF] = shiftedOutLeft;
                    }
                    break;
            }
            break;

        case 0x9:
            // 9xy0 - SKIP next instruction IF Vx != Vy
            if (state.V[x] !== state.V[y]) state.pc += 2;
            break;

        case 0xA:
            // Annn - SET I = nnn
            state.I = nnn;
            break;

        case 0xB:
            // Bnnn - JUMP with offset
            if (config.jumping) {
                // SUPER-CHIP behavior: JUMP to (nnn + Vx) where x = high nibble of nnn
                const highNibble = (nnn & 0x0F00) >> 8;
                state.pc = nnn + state.V[highNibble];
            } else {
                // Original behavior: JUMP to (nnn + V0)
                state.pc = nnn + state.V[0];
            }
            break;

        case 0xC:
            // Cxnn - SET Vx = RND() & nn
            state.V[x] = Math.floor(Math.random() * 256) & nn;
            break;

        case 0xD:
            renderSprite(x, y, n, state, config);
            break;

        case 0xE:
            if (nn === 0x9E) {
                // Ex9E - SKIP if certain key pressed
                if (state.keys[state.V[x]]) state.pc += 2;
            } else if (nn === 0xA1) {
                // ExA1 - SKIP if certain key is not pressed
                if (!state.keys[state.V[x]]) state.pc += 2;
            }
            break;

        case 0xF:
            switch (nn) {
                case 0x07: state.V[x] = state.delayTimer; break;
                case 0x15: state.delayTimer = state.V[x]; break;
                case 0x18: state.soundTimer = state.V[x]; break;
                case 0x1E:
                    state.I += state.V[x];
                    state.V[0xF] = state.I > 0xFFF ? 1 : 0;
                    state.I &= 0xFFF;
                    break;
                case 0x29:
                    // 0x050 is starting address for fontset
                    state.I = 0x050 + (state.V[x] * 5);
                    break;
                case 0x33:
                    // Vx -> 3-digit BCD
                    state.memory[state.I] = Math.floor(state.V[x] / 100);
                    state.memory[state.I + 1] = Math.floor((state.V[x] % 100) / 10);
                    state.memory[state.I + 2] = state.V[x] % 10;
                    break;
                case 0x55:
                    for (let j = 0; j <= x; j++) state.memory[state.I + j] = state.V[j];
                    if (config.memory) state.I += x + 1; // Memory quirk - increment I
                    break;
                case 0x65:
                    for (let j = 0; j <= x; j++) state.V[j] = state.memory[state.I + j];
                    if (config.memory) state.I += x + 1; // Memory quirk - increment I
                    break;
                case 0x0A:
                    // Fx0A - Wait for key press (key down then up)
                    let keyPressed = false;
                    for (let i = 0; i < 16; i++) {
                        if (state.keys[i]) {
                            state.lastKeyPressed = i;
                            keyPressed = true;
                            break;
                        }
                    }

                    // If a key was previously pressed and now released
                    if (!keyPressed && state.lastKeyPressed !== null) {
                        state.V[x] = state.lastKeyPressed;
                        state.lastKeyPressed = null;
                    } else {
                        // Still waiting - repeat this instruction
                        state.pc -= 2;
                    }
                    break;
            }
            break;
    }
}

function renderSprite(x, y, n, state, config) {
    const startX = state.V[x] % 64;
    const startY = state.V[y] % 32;

    state.V[0xF] = 0;
    state.spritesDrawnThisFrame++;

    for (let row = 0; row < n; row++) {
        let spriteByte = state.memory[state.I + row];
        let pixelY = startY + row;

        if (config.clipping) {
            // CLIPPING: If the row is off the bottom, stop drawing
            if (pixelY >= 32) break;
        } else {
            // WRAPPING: Wrap around to top
            pixelY = pixelY % 32;
        }

        for (let col = 0; col < 8; col++) {
            if ((spriteByte & (0x80 >> col)) !== 0) {
                let pixelX = startX + col;

                if (config.clipping) {
                    // CLIPPING: If pixel is off the right edge, skip rest of row
                    if (pixelX >= 64) break;
                } else {
                    // WRAPPING: Wrap around to left
                    pixelX = pixelX % 64;
                }

                const index = pixelX + (pixelY * 64);

                if (state.display[index] === 1) {
                    state.V[0xF] = 1;
                }
                state.display[index] ^= 1;
            }
        }
    }
}