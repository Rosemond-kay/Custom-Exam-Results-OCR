const sharp = require('sharp');
const { Jimp } = require('jimp');
const path = require('path');
const fs = require('fs');

class ImageService {
    /**
     * Main Preprocessing Pipeline
     * @param {string|Buffer} input - Path to image or Buffer from PDF
     * @param {string} outputName - Name for the processed file
     */
    async preprocess(input, outputName) {
        const processedPath = path.join(__dirname, '../../data/processed', outputName);
        
        try {
            // 1. HIGH-DPI SCALING & GRAYSCALE (via Sharp)
            // We upscale to ensure OCR can read small text in 300+ DPI quality
            const sharpBuffer = await sharp(input)
                .resize({ width: 2400 }) // Upscale to simulate high DPI
                .grayscale()            // Operation: Grayscale
                .modulate({ contrast: 1.5 }) // Bump contrast
                .toBuffer();

            // 2. DENOISING & BINARIZATION (via Jimp)
            // PHASE 2: JIMP (Denoising & Binarization)
const image = await Jimp.read(sharpBuffer);

// 1. Denoising (Gaussian Blur replacement)
image.blur(1); 

// 2. Manual Binarization (Scan replacement)
// We iterate through the raw buffer directly for better performance in v1.0
for (let i = 0; i < image.bitmap.data.length; i += 4) {
    const threshold = 140;
    // Check the Red channel (since it's grayscale, R=G=B)
    const val = image.bitmap.data[i] < threshold ? 0 : 255;
    
    image.bitmap.data[i] = val;     // R
    image.bitmap.data[i + 1] = val; // G
    image.bitmap.data[i + 2] = val; // B
    // i + 3 is Alpha (transparency)
}

// 3. Save the file (writeAsync is now just write)
await image.write(processedPath);

            return processedPath;
        } catch (error) {
            console.error("Preprocessing Error:", error);
            throw error;
        }
    }
}

module.exports = new ImageService();