const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");
const MUTOOL_PATH = path.join(__dirname, "../../bin/mutool.exe");
async function processPDF(pdfPath) {
  try {
    const tempImagePath = path.join(
      __dirname,
      "../../data/temp",
      `${path.basename(pdfPath)}.png`
    );

    // Ensure temp directory exists
    if (!fs.existsSync(path.dirname(tempImagePath))) {
      fs.mkdirSync(path.dirname(tempImagePath), { recursive: true });
    }

    // command: mutool draw -o [output] -r [DPI] [input] [pages]
    // -r 300 ensures the high resolution needed for OCR
    const command = `"${MUTOOL_PATH}" draw -o "${tempImagePath}" -r 300 "${pdfPath}" 1`;
   execSync(command, { 
    windowsHide: true, 
    shell: 'cmd.exe',
    stdio: 'pipe' // This helps capture internal errors if it fails again
});

    return {
      type: "image_path",
      buffer: fs.readFileSync(tempImagePath),
      path: tempImagePath,
    };
  } catch (error) {
    console.error(
      "PDF Rendering Error. Ensure mutool.exe is in your path:",
      error
    );
    throw error;
  }
}

module.exports = { processPDF };
