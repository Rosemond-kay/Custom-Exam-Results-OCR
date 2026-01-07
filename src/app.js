const fs = require("fs");
const path = require("path");
const { scanInputDirectory } = require("./utils/fileScanner");
const imageService = require("./services/imageService");
const { preprocessForOCR } = require("./services/imageService");
const { processPDF } = require("./services/pdfService");
const { parseResultLine } = require("./services/parserService");
// Placeholder for OCR
// const ocrService = require('./services/ocrService');

const INPUT_DIR = path.join(__dirname, "../data/input");
const OUTPUT_DIR = path.join(__dirname, "../data/output");

async function runPipeline() {
  // 1. Ingest folders (each folder = one student profile)
  const studentProfiles = scanInputDirectory(INPUT_DIR);
  console.log(`--- Ingested ${studentProfiles.length} student profiles ---`);

  for (const profile of studentProfiles) {
    console.log(`\n Processing Profile: ${profile.studentId}`);

    // This object will hold combined data from all files in this student's folder
    let aggregatedData = {
      studentProfileId: profile.studentId,
      processedDate: new Date().toISOString(),
      exams: [],
    };

    for (const filePath of profile.files) {
      const fileName = path.basename(filePath);
      const ext = path.extname(filePath).toLowerCase();
      console.log(`Reading: ${fileName}`);

      let textToParse = "";

      if (ext === ".pdf") {
        const pdfResult = await processPDF(filePath);
        if (pdfResult.type === "text") {
          textToParse = pdfResult.data;
        } else {
          // Scanned PDF: Clean and prepare for OCR
          const cleanBuffer = await preprocessForOCR(filePath);
          // textToParse = await ocrService.recognize(cleanBuffer);
        }
      } else {
        // Image/Screenshot: Clean and prepare for OCR
        const cleanBuffer = await preprocessForOCR(filePath);
        console.log(`Cleaned image: ${fileName}`);
        // textToParse = await ocrService.recognize(cleanBuffer);

        for (const file of profile.files) {
          console.log(`Preprocessing: ${path.basename(file)}`);

          // Process the file and get the path to the "Clean" version
          const cleanImagePath = await imageService.preprocess(
            file,
            `clean_${path.basename(file)}`
          );

          console.log(`Ready for OCR: ${cleanImagePath}`);
        }
      }

      // 2. Parsing & Merging
      // Split the read text into lines and send to Parser
      const lines = textToParse.split("\n");
      const examResults = lines
        .map((line) => parseResultLine(line))
        .filter((result) => result !== null);

      if (examResults.length > 0) {
        aggregatedData.exams.push({
          sourceFile: fileName,
          results: examResults,
        });
      }
    }

    // 3. Output Phase: Save the combined results
    const outputFilePath = path.join(OUTPUT_DIR, `${profile.studentId}.json`);
    fs.writeFileSync(outputFilePath, JSON.stringify(aggregatedData, null, 2));
    console.log(`Saved combined results to: ${profile.studentId}.json`);
  }
}

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

runPipeline().catch((err) => console.error("Pipeline Error:", err));
