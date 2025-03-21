import sharp from "sharp";
import fs from "fs";
import Tesseract from "tesseract.js";

const PREPROCESS_SETTINGS = {
  resize: { width: 2480 }, // Optimal for OCR resolution
  grayscale: true, // Improve contrast
  normalize: true, // Enhance brightness
  threshold: 80, //Binarization
};

async function processImage(filePath) {
  const worker = await Tesseract.createWorker();
  try {
    const imageBuffer = await fs.promises.readFile(filePath);
    const processedBuffer = await sharp(imageBuffer)
      .resize(PREPROCESS_SETTINGS.resize)
      .grayscale(PREPROCESS_SETTINGS.grayscale)
      .normalize(PREPROCESS_SETTINGS.normalize)
      .threshold(PREPROCESS_SETTINGS.threshold)
      .toBuffer();

    // OCR preprocessed image
    const {
      data: { text },
    } = await worker.recognize(processedBuffer);
    return text;
  } finally {
    await worker.terminate();
  }
}
export default processImage;
