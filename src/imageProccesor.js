const Tesseract = require('tesseract.js');
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function loadImagePath() {
    const imagePath = path.join(__dirname, 'image', 'raw', 'image.jpg'); // Замените на фактический путь
    return imagePath;
}

async function sliceImageAndExtractText(imagePath, rows, cols, outputDir, customNames, verbose = false) {
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    const image = sharp(imagePath);
    const metadata = await image.metadata();
    const { width, height } = metadata;

    const sliceWidth = Math.floor(width / cols);
    const sliceHeight = Math.floor(height / rows);
    const promises = [];
    const jsonResult = {};

    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            const left = col * sliceWidth;
            const top = row * sliceHeight;
            const outputFileName = path.join(outputDir, `slice_${row}_${col}.jpg`);

            const extractPromise = sharp(imagePath)
                .extract({ left, top, width: sliceWidth, height: sliceHeight })
                .toFile(outputFileName)
                .then(async () => {
                    const { data: { text } } = await Tesseract.recognize(outputFileName, 'rus');
                    const nameKey = customNames[row * cols + col] || `slice_${row}_${col}`;
                    jsonResult[nameKey] = text.trim();

                    if (verbose) {
                        console.log(`Извлечен текст для ${nameKey}: ${jsonResult[nameKey]}`);
                    }
                });

            promises.push(extractPromise);
        }
    }

    await Promise.all(promises);
    console.log(`Создано и обработано ${rows * cols} изображений в папке "${outputDir}"`);

    const resultFilePath = path.join(outputDir, 'result.json');
    fs.writeFileSync(resultFilePath, JSON.stringify(jsonResult, null, 2));
    console.log(`Результаты сохранены в "${resultFilePath}"`);

    await cleanUpImages(outputDir, verbose);
}

async function cleanUpImages(outputDir, verbose = false) {
    fs.readdir(outputDir, (err, files) => {
        if (err) {
            console.error('Ошибка при чтении папки:', err);
            return;
        }

        const deletePromises = files.map(file => {
            if (path.extname(file) === '.jpg') {
                return new Promise((resolve, reject) => {
                    fs.unlink(path.join(outputDir, file), (err) => {
                        if (err) {
                            console.error('Ошибка при удалении файла:', err);
                            reject(err);
                        } else {
                            if (verbose) {
                                console.log(`Удален файл: ${file}`);
                            }
                            resolve();
                        }
                    });
                });
            }
        });

        return Promise.all(deletePromises);
    });
}

module.exports = {
    loadImagePath,
    sliceImageAndExtractText
};
