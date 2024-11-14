const Tesseract = require('tesseract.js');

// Функция для распознавания текста
async function recognizeText(imagePath) {
    const { data: { text } } = await Tesseract.recognize(imagePath, 'eng', {
        logger: info => console.log(info),
    });
    return text;
}

module.exports = { recognizeText };
