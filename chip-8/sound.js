const speaker = {
    audioContext: null,
    oscillator: null,
    gainNode: null,
    soundTimerPreviousState: false
}

export function initAudio(window) {
    if (!speaker.audioContext) {
        speaker.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
}

export function setSoundTimerPreviousState(bool) {
    speaker.soundTimerPreviousState = bool;
}

export function startBeep() {
    if (speaker.oscillator) return;

    speaker.oscillator = speaker.audioContext.createOscillator();
    speaker.gainNode = speaker.audioContext.createGain();

    speaker.oscillator.connect(speaker.gainNode);
    speaker.gainNode.connect(speaker.audioContext.destination);

    speaker.oscillator.frequency.value = 880;
    speaker.oscillator.type = 'square';
    speaker.gainNode.gain.value = 0.1;

    speaker.oscillator.start();
}

export function stopBeep() {
    if (speaker.oscillator) {
        speaker.oscillator.stop();
        speaker.oscillator = null;
        speaker.gainNode = null;
    }
}

export function handleBeep(state) {
    const soundTimerActive = state.soundTimer > 0;
    if (soundTimerActive && !speaker.soundTimerPreviousState) {
        startBeep();
    } else if (!soundTimerActive && speaker.soundTimerPreviousState) {
        stopBeep();
    }
    speaker.soundTimerPreviousState = soundTimerActive;
}