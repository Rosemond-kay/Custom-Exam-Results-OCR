const { processPDF } = require('./src/services/pdfService');
const imageService = require('./src/services/imageService');
const path = require('path');
const fs = require('fs');

async function testPreprocessing() {
    const testDir = path.join(__dirname, 'data/input/Test_Student_001');
    
    // Check if directory exists
    if (!fs.existsSync(testDir)) {
        console.error(`❌ Directory not found: ${testDir}`);
        return;
    }

    const files = fs.readdirSync(testDir);
    console.log(`🚀 Starting Preprocessing Test on ${files.length} files...`);

    for (const file of files) {
        const inputPath = path.join(testDir, file);
        const ext = path.extname(file).toLowerCase();
        const outputName = `TEST_CLEAN_${file}.png`;
        
        try {
            let dataToClean;

            if (ext === '.pdf') {
                console.log(`\n📄 Rendering PDF: ${file}`);
                const pdfData = await processPDF(inputPath);
                dataToClean = pdfData.buffer; // Pass the Buffer from MuPDF
            } else if (['.jpg', '.jpeg', '.png'].includes(ext)) {
                console.log(`\n🖼️  Processing Image: ${file}`);
                dataToClean = inputPath; // Pass the file path string
            } else {
                continue; // Skip other files
            }

            // Ensure dataToClean is valid before calling preprocess
            if (dataToClean) {
                const resultPath = await imageService.preprocess(dataToClean, outputName);
                console.log(`✅ Success: ${path.basename(resultPath)}`);
            }

        } catch (err) {
            console.error(`❌ Failed on ${file}:`, err.message);
        }
    }
}

testPreprocessing();