const mobilenet = require('@tensorflow-models/mobilenet');
const tf = require('@tensorflow/tfjs');
const sharp = require('sharp');

let model = null;

async function loadModel() {
    if (!model) {
        await tf.ready();
        console.log('Loading AI model...');
        model = await mobilenet.load();
        console.log('AI model loaded successfully!');
    }

    return model;
}

async function classifyImage(imagePath) {
    try {
        const loadedModel = await loadModel();

        const { data, info } = await sharp(imagePath)
            .resize(224, 224)
            .removeAlpha()
            .toColourspace('srgb')
            .raw()
            .toBuffer({ resolveWithObject: true });

        const imageTensor = tf.tensor3d(
            new Uint8Array(data),
            [info.height, info.width, info.channels]
        );

        const predictions = await loadedModel.classify(imageTensor);

        imageTensor.dispose();

        console.log('AI Predictions:', predictions);

        const labels = predictions
            .map(prediction => prediction.className.toLowerCase())
            .join(' ');

        let category = 'Other';

        if (
            labels.includes('garbage') ||
            labels.includes('trash') ||
            labels.includes('rubbish') ||
            labels.includes('waste') ||
            labels.includes('dump') ||
            labels.includes('litter') ||
            labels.includes('bin') ||
            labels.includes('carton') ||
            labels.includes('plastic bag')
        ) {
            category = 'Garbage';
        } else if (
            labels.includes('street') ||
            labels.includes('road') ||
            labels.includes('asphalt') ||
            labels.includes('highway') ||
            labels.includes('traffic') ||
            labels.includes('pothole') ||
            labels.includes('pavement') ||
            labels.includes('sidewalk')
        ) {
            category = 'Road';
        } else if (
            labels.includes('electric') ||
            labels.includes('power') ||
            labels.includes('wire') ||
            labels.includes('cable') ||
            labels.includes('pole') ||
            labels.includes('transformer') ||
            labels.includes('lamp')
        ) {
            category = 'Electrical';
        } else if (
            labels.includes('water') ||
            labels.includes('fountain') ||
            labels.includes('waterfall') ||
            labels.includes('pipe') ||
            labels.includes('flood') ||
            labels.includes('puddle') ||
            labels.includes('sewer')
        ) {
            category = 'Water';
        }

        console.log('Suggested Category:', category);

        return {
            predictions,
            suggestedCategory: category
        };

    } catch (error) {
        console.error('AI classification error:', error.message);
        console.error(error.stack);

        return {
            predictions: [],
            suggestedCategory: 'Other'
        };
    }
}

module.exports = { classifyImage };