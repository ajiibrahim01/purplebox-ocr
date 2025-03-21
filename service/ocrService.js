import { getDocument } from "pdfjs-dist";
import { fromPath } from "pdf2pic";
import Tesseract from "tesseract.js";
import nlp from "compromise";
import dates from "compromise-dates";
import path from "path";
import fs from "fs";
import regex from "./utils/regex.js";

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

async function processImage(filePath) {
  const worker = await Tesseract.createWorker();
  const {
    data: { text },
  } = await worker.recognize(filePath);
  await worker.terminate();
  return text;
}

async function processPdf(filePath) {
  const buffer = await fs.promises.readFile(filePath);
  const uint8Array = new Uint8Array(
    buffer.buffer,
    buffer.byteOffset,
    buffer.length
  );
  const pdf = await getDocument({
    data: uint8Array,
    useSystemFonts: true,
    disableFontFace: true,
  }).promise;

  let text = "";
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    text += content.items.map((item) => item.str).join(" ");
  }

  if (!text.trim()) {
    const converter = fromPath(filePath, {
      density: 300,
      format: "png",
      outdir: tempDir,
      prefix: path.parse(filePath).name,
    });
    const pages = await converter.bulk(-1);
    for (const page of pages) {
      text += await processImage(page.path);
    }
  }
  return text;
}

async function ocrService(filename) {
  try {
    const filePath = path.join(baseStorage, filename);
    const fileExt = path.extname(filename).toLowerCase();
    const isImage = [".png", ".jpg", ".jpeg", ".tiff", ".tif"].includes(
      fileExt
    );

    const text = isImage
      ? await processImage(filePath)
      : await processPdf(filePath);

    const structuredData = {
      ...regex(text),
      entities: nlp(text),
      rawText: text,
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
