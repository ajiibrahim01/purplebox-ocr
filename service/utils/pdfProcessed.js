import fs from "fs";
import { fromPath } from "pdf2pic";
import { getDocument } from "pdfjs-dist";
import path from "path";
const __dirname = path.resolve();
const baseStorage = path.join(__dirname, "storage");
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

  // Fallback to OCR with preprocessed pages
  if (!text.trim()) {
    const converter = fromPath(filePath, {
      density: 300,
      format: "png",
      outdir: baseStorage, // Use existing storage directory
      prefix: path.parse(filePath).name,
    });

    const pages = await converter.bulk(-1);
    for (const page of pages) {
      text += await processImage(page.path);
      // Clean up converted page immediately
      fs.unlink(page.path, () => {});
    }
  }
  return text;
}
export default processPdf;
