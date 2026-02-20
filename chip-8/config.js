export const config = {
    IPF: 11,

    VfReset: true,

    memory: true,

    displayWait: true,

    clipping: true,

    shifting: false,

    jumping: false
};

const STORAGE_KEY = 'chip8-config';

function loadSavedConfig() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return;
        const parsed = JSON.parse(raw);
        if (typeof parsed !== 'object' || parsed === null) return;

        for (const key of Object.keys(parsed)) {
            if (key in config) {
                config[key] = parsed[key];
            }
        }
        if (typeof config.IPF === 'string') config.IPF = Number(config.IPF) || config.IPF;
    } catch (e) {
        console.log("something went wrong while loading the config");
    }
}

function saveConfig() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    } catch (e) {
        console.log("something went wrong while saving the config");
    }
}

function createNumberInput(container, labelText, prop, opts = {}) {
    const row = document.createElement('div');
    row.style.marginBottom = '6px';

    const label = document.createElement('label');
    label.style.marginRight = '8px';
    label.textContent = labelText;

    const input = document.createElement('input');
    input.type = 'number';
    if (opts.min !== undefined) input.min = String(opts.min);
    if (opts.max !== undefined) input.max = String(opts.max);
    input.value = String(config[prop] ?? '');
    input.style.width = '5em';

    input.addEventListener('change', () => {
        const v = Number(input.value) || 0;
        config[prop] = v;
        saveConfig();
    });

    row.appendChild(label);
    row.appendChild(input);
    container.appendChild(row);
}

function createCheckbox(container, labelText, prop) {
    const row = document.createElement('div');
    row.style.marginBottom = '6px';

    const input = document.createElement('input');
    input.type = 'checkbox';
    input.id = `cfg-${prop}`;
    input.checked = Boolean(config[prop]);

    input.addEventListener('change', () => {
        config[prop] = input.checked;
        saveConfig();
    });

    const label = document.createElement('label');
    label.htmlFor = input.id;
    label.textContent = labelText;

    row.appendChild(input);
    row.appendChild(label);
    container.appendChild(row);
}

function renderSettings() {
    const container = document.getElementById('chip8-settings');
    if (!container) return;
    container.innerHTML = '';

    createNumberInput(container, 'Instructions/frame (IPF):', 'IPF', { min: 1 });

    const booleans = [
        ['VfReset', 'VfReset (VF reset quirk)'],
        ['memory', 'Memory (I behaviour)'],
        ['displayWait', 'Display wait quirk'],
        ['clipping', 'Clipping'],
        ['shifting', 'Shifting quirk'],
        ['jumping', 'Jumping quirk']
    ];

    for (const [prop, label] of booleans) {
        createCheckbox(container, label, prop);
    }
}

loadSavedConfig();
renderSettings();
saveConfig();

window.addEventListener('storage', (ev) => {
    if (ev.key === STORAGE_KEY) {
        loadSavedConfig();
        renderSettings();
    }
});