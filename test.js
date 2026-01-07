const sharp = require('sharp');
const Jimp = require('jimp');

// Use the absolute path discovered via your ls command
const pdfjsLib = require('./node_modules/pdfjs-dist/legacy/build/pdf.js');

console.log("--- Library Check ---");

if (sharp) console.log("✅ Sharp is ready");
if (Jimp) console.log("✅ Jimp is ready");
if (pdfjsLib) console.log("✅ PDF.js (Legacy) is ready");

console.log("---------------------");
console.log("Environment check complete. You are ready to build!");