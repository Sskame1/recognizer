const tf = require('@tensorflow/tfjs-node');
const fs = require('fs');
const path = require('path');
const { createModel } = require('./model');

// Загружаем данные
async function loadData(dataDir) {
    const images = [];
    const labels = [];
    const labelNames = fs.readdirSync(dataDir); // Получение имен папок-классов

    for (let labelIndex = 0; labelIndex < labelNames.length; labelIndex++) {
        const label = labelNames[labelIndex];
        const imageFiles = fs.readdirSync(path.join(dataDir, label));

        for (const imageFile of imageFiles) {
            const imgPath = path.join(dataDir, label, imageFile);
            const image = fs.readFileSync(imgPath);
            const tensor = tf.node.decodeImage(image).resizeBilinear([128, 128]).expandDims(0).div(255);
            images.push(tensor);
            labels.push(labelIndex);
        }
    }

    return [tf.concat(images), tf.tensor1d(labels, 'int32')];
}

async function train() {
    const model = createModel();
    const [images, labels] = await loadData(path.join(__dirname, '../data/raw'));

    await model.fit(images, labels, {
        epochs: 10,
        callbacks: tf.callbacks.earlyStopping({ monitor: 'loss' }),
    });

    // Сохранение модели
    await model.save('file://model/my_model');
}

train().catch(console.error);
