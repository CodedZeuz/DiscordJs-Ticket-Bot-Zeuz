const fs = require('fs');
const path = require('path');

const EMOJIS_FILE = path.join(__dirname, '../../emojis.json');

const EMOJI_FILENAME_MAP = {
    "confirm": "certo",
    "cancel": "errado",
    "star": "estrela",
    "notes": "notas",
    "photo": "camera",
    "others": "livro",
    "trash": "sirene",
    "discord": "discord",
    "minecraft": "minecraft",
    "sites": "sites",
    "loading": "loading",
    "info": "info"
};

const DEFAULTS = {
    "confirm": "✅", "cancel": "❌", "star": "⭐", "notes": "📝", 
    "photo": "📷", "discord": "🤖", "minecraft": "🧱", "sites": "🌐", 
    "others": "📚", "loading": "⌛", "trash": "🗑️", "info": "ℹ️"
};

function loadEmojis() {
    if (!fs.existsSync(EMOJIS_FILE)) return {};
    try {
        const data = fs.readFileSync(EMOJIS_FILE, 'utf8');
        return JSON.parse(data);
    } catch (e) {
        return {};
    }
}

function saveEmojisToFile(data) {
    fs.writeFileSync(EMOJIS_FILE, JSON.stringify(data, null, 4), 'utf8');
}

function getEmoji(logicKey) {
    const emojis = loadEmojis();
    const fileName = EMOJI_FILENAME_MAP[logicKey] || logicKey;
    const emojiStr = emojis[fileName];
    
    if (!emojiStr) return DEFAULTS[logicKey] || "❓";
    return emojiStr;
}

module.exports = { loadEmojis, saveEmojisToFile, getEmoji, EMOJI_FILENAME_MAP };

