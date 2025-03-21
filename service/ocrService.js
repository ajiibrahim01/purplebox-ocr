import nlp from "compromise";
import dates from "compromise-dates";
import path from "path";
import processImage from "./utils/imageProcessed.js";
import processPdf from "./utils/pdfProcessed.js";
import regex from "./utils/regex.js";
// Added for preprocessing

nlp.extend(dates);

if (typeof Promise.withResolvers !== "function") {
  Promise.withResolvers = function withResolvers() {
    let resolve, reject;
    const promise = new Promise((res, rej) => {
      resolve = res;
      reject = rej;
    });
    return { promise, resolve, reject };
  };
}

const __dirname = path.resolve();
const baseStorage = path.join(__dirname, "storage");

async function ocrService(filename) {
  try {
    const filePath = path.join(baseStorage, filename);
    const fileExt = path.extname(filename).toLowerCase();
    const isImage = [".png", ".jpg", ".jpeg", ".tiff", ".tif"].includes(
      fileExt
    );

    const rawText = isImage
      ? await processImage(filePath)
      : await processPdf(filePath);

    // Post-process text
    const cleanedText = rawText
      .replace(/\s+/g, " ") // Collapse whitespace
      .replace(/-\n/g, "") // Join hyphenated words
      .replace(/\n{3,}/g, "\n"); // Normalize newlines

    const structuredData = {
      ...regex(cleanedText),
      entities: nlp(cleanedText),
      rawText: cleanedText,
      metadata: {
        fileType: isImage ? "Image" : "PDF",
        processedDate: new Date().toISOString(),
      },
    };

    return {
      success: true,
      data: structuredData,
    };
  } catch (error) {
    console.error(`Processing error: ${error.message}`);
    return {
      success: false,
      error: error.message,
    };
  }
}

export default ocrService;
