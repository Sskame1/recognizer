const fs = require('fs');
const path = require('path');
const { recognizeText } = require('./ocr/ocr.js');

// Основная функция тестирования
async function test() {
    const model = await tf.loadLayersModel('file://model/my_model/model.json');
    const testImagePath = 'path_to_your_test_image.jpg'; // Укажи путь к тестовому изображению
    const imageTensor = await loadTestImage(testImagePath);

    const prediction = model.predict(imageTensor);
    const predictedClass = prediction.argMax(-1).dataSync()[0];

    console.log(`Predicted class: ${predictedClass}`);

    // Распознавание текста
    const recognizedText = await recognizeText(testImagePath);
    console.log(`Recognized text:\n${recognizedText}`);

    // Обработка текста и формирование JSON
    const lines = recognizedText.split('\n');
    const schedule = {};
    
    // Считываем класс и предметы
    const className = lines[0].trim(); // Предполагается, что название класса на первой строке
    const subjects = lines.slice(1).map(line => line.trim()).filter(line => line); // Остальные строки

    // Проверяем наличие класса в searchClasses.json
    const classData = JSON.parse(fs.readFileSync(path.join(__dirname, 'searchClasses.json')));
    const foundClass = classData.classes.includes(className);

    if (foundClass) {
        schedule[className] = subjects; // Создание объекта JSON
        console.log(`Class "${className}" found!`);
    } else {
        console.log(`Class "${className}" not found in the list.`);
    }

    // Выводим результат
    console.log(JSON.stringify(schedule, null, 2));
}

test().catch(console.error);
