const sharp = require('sharp');
const fs = require('fs');
const tesseract = require('tesseract.js');
const { createCanvas, loadImage } = require('canvas');

// Функция для загрузки файла JSON с ключевыми словами
function loadKeywords(filePath) {
    try {
        const data = fs.readFileSync(__dirname + '/' + filePath);
        return JSON.parse(data).keywords;
    } catch (error) {
        console.error(`Ошибка при загрузке ключевых слов: ${error.message}`);
        process.exit(1);
    }
}

// Функция для распознавания текста в извлеченных столбцах
async function recognizeTextFromColumns(columnImages, keywords) {
    for (const columnImage of columnImages) {
        const { data: { text, hocr }} = await tesseract.recognize(columnImage, 'rus');
        console.log(`Текст из ${columnImage}:`, text);

        const boxes = hocrToBoxes(hocr);
        const foundKeywords = [];

        boxes.forEach(box => {
            const foundText = box.text;
            keywords.forEach(keyword => {
                if (foundText.includes(keyword) && !foundKeywords.includes(keyword)) {
                    foundKeywords.push(keyword);
                }
            });
        });

        if (foundKeywords.length > 0) {
            console.log('Найденные ключевые слова:', foundKeywords.join(', '));
        } else {
            console.log('Ключевые слова не найдены.');
        }
    }
}

// Функция для извлечения столбцов и распознавания текста
async function splitAndRecognize(imagePath, keywords) {
    const image = sharp(imagePath);
    const metadata = await image.metadata();

    const columns = 13; // Количество столбцов
    const columnWidth = Math.floor(metadata.width / columns);
    const columnImages = [];

    // Извлечение каждого столбца
    for (let i = 0; i < columns; i++) {
        const xOffset = i * columnWidth;
        const outputPath = `column_${i + 1}.png`;

        await image
            .extract({ left: xOffset, top: 0, width: columnWidth, height: metadata.height })
            .toFile(outputPath);
        
        columnImages.push(outputPath);
    }

    // Распознавание текста в извлеченных столбцах
    await recognizeTextFromColumns(columnImages, keywords);
}

// Функция для парсинга hocr и получения координат найденного текста
function hocrToBoxes(hocr) {
    const boxes = [];
    const regex = /bbox (\d+) (\d+) (\d+) (\d+).*?\n.+?title="text: (.*?)"/g;
    let match;
    while ((match = regex.exec(hocr)) !== null) {
        const [_, x1, y1, x2, y2] = match.map(Number);
        boxes.push({
            x: x1,
            y: y1,
            width: x2 - x1,
            height: y2 - y1,
            text: match[5] // Храним текст для последующей проверки
        });
    }
    return boxes;
}

// Загружаем ключевые слова и вызываем основную функцию
const keywords = loadKeywords('keywords.json');
splitAndRecognize(__dirname + '/image/image.jpg', keywords);
