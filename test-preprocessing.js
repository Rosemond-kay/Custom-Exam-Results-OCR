const imageService = require('./src/services/imageService');
const path = require('path');
const fs = require('fs');

async function testPreprocessing() {
    const testDir = path.join(__dirname, 'data/input/Test_Student_001');
    const files = fs.readdirSync(testDir).filter(f => /\.(jpg|jpeg|png)$/i.test(f));

    console.log(`🧪 Starting Preprocessing Test on ${files.length} files...`);

    for (const file of files) {
        const inputPath = path.join(testDir, file);
        const outputName = `TEST_CLEAN_${file}`;
        
        console.log(`\nChecking: ${file}`);
        try {
            // This will trigger your deskew, sharpen, and binarize logic
            const resultPath = await imageService.preprocess(inputPath, outputName);
            console.log(`✅ Processed saved to: ${resultPath}`);
        } catch (err) {
            console.error(`❌ Failed on ${file}:`, err.message);
        }
    }
}

testPreprocessing();