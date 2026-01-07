// src/utils/fileScanner.js
const fs = require('fs');
const path = require('path');

function scanInputDirectory(baseDir) {
    const entries = fs.readdirSync(baseDir, { withFileTypes: true });
    return entries
        .filter(entry => entry.isDirectory())
        .map(folder => {
            const folderPath = path.join(baseDir, folder.name);
            return {
                studentId: folder.name,
                files: fs.readdirSync(folderPath)
                    .filter(f => /\.(jpg|jpeg|png|pdf)$/i.test(f))
                    .map(f => path.join(folderPath, f))
            };
        });
}

module.exports = { scanInputDirectory };