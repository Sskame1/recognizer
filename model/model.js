const tf = require('@tensorflow/tfjs');

// Определение архитектуры
function createModel() {
    const model = tf.sequential();
    model.add(tf.layers.conv2d({filters: 32, kernelSize: 3, activation: 'relu', inputShape: [128, 128, 3]}));
    model.add(tf.layers.maxPooling2d({poolSize: 2}));
    model.add(tf.layers.conv2d({filters: 64, kernelSize: 3, activation: 'relu'}));
    model.add(tf.layers.maxPooling2d({poolSize: 2}));
    model.add(tf.layers.flatten());
    model.add(tf.layers.dense({units: 128, activation: 'relu'}));
    model.add(tf.layers.dense({units: 3, activation: 'softmax'})); // 3 класса

    model.compile({optimizer: 'adam', loss: 'sparseCategoricalCrossentropy', metrics: ['accuracy']});
    return model;
}

module.exports = { createModel };
