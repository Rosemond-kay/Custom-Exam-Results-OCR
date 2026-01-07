const { scanInputDirectory } = require('./src/utils/fileScanner');
const path = require('path');

const INPUT_DIR = path.join(__dirname, 'data/input');

console.log("🚀 Starting Ingestion Test...");

const profiles = scanInputDirectory(INPUT_DIR);

if (profiles.length === 0) {
    console.log("❌ Result: No student folders found. Check if your folders are inside data/input.");
} else {
    console.log(`✅ Success: Found ${profiles.length} student profiles.\n`);

    profiles.forEach(profile => {
        console.log(`Student ID: ${profile.studentId}`);
        console.log(`Files found: ${profile.files.length}`);
        profile.files.forEach(file => {
            console.log(`  - ${path.basename(file)}`);
        });
        console.log('---');
    });
}