const Jimp = require('jimp');
const sharp = require('sharp');
const path = require('path');

/**
 * Advanced Cleaning for Blurry Exam Slips
 * Goal: Get crisp black text on a pure white background.
 */
async function preprocessForOCR(inputPath, outputName) {
    const outputPath = path.join(__dirname, '../../data/processed', outputName);
    
    try {
        // 1. Use Sharp for the heavy lifting (Resizing & Grayscale)
        // High resolution (300 DPI equivalent) is better for OCR.
        const buffer = await sharp(inputPath)
            .resize({ width: 2000 }) // Upscale if the photo is small/blurry
            .grayscale()
            .toBuffer();

        // 2. Use Jimp for Thresholding (Turning pixels into strictly 0 or 255)
        const image = await Jimp.read(buffer);
        
        image
            .contrast(0.7)         // Bump contrast to separate ink from paper
            .normalize()          // Fix uneven lighting
            .threshold({ 
                max: 160,         // Pixels darker than 160 become black
                replace: 255      // Everything else becomes white
            })
            .write(outputPath);

        return outputPath;
    } catch (err) {
        console.error(`Error processing ${inputPath}:`, err);
    }
}

/**
 * Splits a cleaned image into separate lines of text
 * This prevents the OCR from getting confused by page layout.
 */
async function segmentLines(imageBuffer) {
    const image = await Jimp.read(imageBuffer);
    const width = image.bitmap.width;
    const height = image.bitmap.height;
    
    let lines = [];
    let inLine = false;
    let startY = 0;

    for (let y = 0; y < height; y++) {
        let hasBlackPixel = false;
        for (let x = 0; x < width; x++) {
            const color = Jimp.intToRGBA(image.getPixelColor(x, y));
            if (color.r < 128) { // Detecting black text on white background
                hasBlackPixel = true;
                break;
            }
        }

        if (!inLine && hasBlackPixel) {
            inLine = true;
            startY = y;
        } else if (inLine && !hasBlackPixel) {
            inLine = false;
            // Crop out the line strip
            const lineImg = image.clone().crop(0, startY, width, y - startY);
            lines.push(await lineImg.getBufferAsync(Jimp.MIME_PNG));
        }
    }
    return lines;
}

module.exports = { preprocessForOCR };