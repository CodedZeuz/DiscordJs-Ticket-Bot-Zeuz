const fs = require('fs');
const path = require('path');

const TICKET_COUNT_FILE = path.join(__dirname, '../../ticket_count.txt');

function getNextTicketNumber() {
    if (!fs.existsSync(TICKET_COUNT_FILE)) {
        fs.writeFileSync(TICKET_COUNT_FILE, "0", 'utf8');
        return 1;
    }
    try {
        const data = fs.readFileSync(TICKET_COUNT_FILE, 'utf8');
        return parseInt(data.trim()) + 1;
    } catch (e) {
        return 1;
    }
}

function saveNextTicketNumber(number) {
    fs.writeFileSync(TICKET_COUNT_FILE, number.toString(), 'utf8');
}

module.exports = { getNextTicketNumber, saveNextTicketNumber };

