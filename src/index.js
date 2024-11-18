const path = require('path');
const { loadImagePath, sliceImageAndExtractText } = require('./imageProccesor');

(async () => {
    const imagePath = await loadImagePath();
    const outputDir = path.join(__dirname, 'image', 'result');
    const rows = 1; // количество строк
    const cols = 13 // количество столбцов

    const customNames = ['5A', '5B', '6A', '6B', '7A', '7B', '8A', '8B', '9A', '9B', '10A', '10B', '11']; // rows * cols = количество кастомных имен

    const verbose = false;

    await sliceImageAndExtractText(imagePath, rows, cols, outputDir, customNames, verbose);
})();