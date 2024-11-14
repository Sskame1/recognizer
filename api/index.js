const express = require('express');
const multer = require('multer');
const path = require('path');
const { recognizeText } = require('../ocr/ocr');
const { createModel } = require('../model/model');
const model = createModel();

const app = express();
const upload = multer({ dest: 'uploads/' }); // Загрузка файлов

app.post('/upload', upload.single('file'), async (req, res) => {
    const imagePath = req.file.path;
    
    // Прогнозирование с помощью модели (здесь нужно загрузить предобученную модель и использовать её для предсказания)
    // В этом примере просто распознаем текст
    const text = await recognizeText(imagePath);
    res.json({ text });
});

app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});
