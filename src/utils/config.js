const fs = require('fs');
const path = require('path');

const CONFIG_FILE = path.join(__dirname, '../../config.json');

function loadConfig() {
    if (!fs.existsSync(CONFIG_FILE)) return {};
    try {
        const data = fs.readFileSync(CONFIG_FILE, 'utf8');
        return JSON.parse(data);
    } catch (e) {
        console.error("Erro ao carregar config.json:", e);
        return {};
    }
}

function saveConfig(newData) {
    const currentConfig = loadConfig();
    const updatedConfig = { ...currentConfig, ...newData };
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(updatedConfig, null, 4), 'utf8');
    return updatedConfig;
}

function getConfig(key) {
    return loadConfig()[key];
}

module.exports = { loadConfig, saveConfig, getConfig };

