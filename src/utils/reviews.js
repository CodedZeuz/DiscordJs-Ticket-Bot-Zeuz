const fs = require('fs');
const path = require('path');

const REVIEWS_FILE = path.join(__dirname, '../../reviews.json');

function generateReviewId() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '#';
    for (let i = 0; i < 7; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

function saveReview(reviewId, data) {
    let reviews = {};
    if (fs.existsSync(REVIEWS_FILE)) {
        try {
            const content = fs.readFileSync(REVIEWS_FILE, 'utf8');
            reviews = JSON.parse(content);
        } catch (e) {}
    }
    reviews[reviewId] = data;
    fs.writeFileSync(REVIEWS_FILE, JSON.stringify(reviews, null, 4), 'utf8');
}

module.exports = { generateReviewId, saveReview };

