import express from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import dataSchema from "../model/ocrSchema.js";
import ocrService from "../service/ocrService.js";

const router = express.Router();
const __dirname = path.resolve();
const storageDir = path.join(__dirname, "storage");

if (!fs.existsSync(storageDir)) {
  fs.mkdirSync(storageDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, storageDir);
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    "application/pdf", // PDF
    "image/png", // PNG
    "image/jpeg", // JPEG
    "image/tiff", // TIFF
  ];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error("Invalid file type. Only PDF, PNG, JPEG, TIFF are allowed."),
      false
    );
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 },
});

async function fileExists(filePath) {
  try {
    await fs.promises.access(filePath);
    return true;
  } catch (error) {
    return false;
  }
}

router.post("/extract", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded." });
    }
    const storageDir = path.resolve("storage");
    const filePath = path.join(storageDir, req.file.filename);

    fileExists(filePath).then((exists) => {
      console.log(exists ? "File exists!" : "File does not exist.");
    });
    //OCR Processing
    const extractedPdf = await ocrService(req.file.filename);
    // Save processed file to MongoDB
    const newFile = await dataSchema.create({
      filename: req.file.filename,
      uploadDate: new Date(),
      extractedData: extractedPdf,
    });

    //response
    const id = newFile._id;
    res.json({
      message: "File uploaded & processed successfully",
      filename: req.file.originalname,
      retrieveDataId: id,
    });
  } catch (error) {
    console.error("Error during upload:", error);

    if (req.file) {
      fs.unlink(path.join(uploadDir, req.file.filename), (err) => {
        if (err) console.error("Failed to delete file:", err);
      });
    }

    res.status(500).json({ error: "Failed to save file information." });
  }
});

router.get("/retrieve/:id", async (req, res) => {
  try {
    // Fetch the document by its _id
    const fileId = req.params.id;
    const file = await dataSchema.findById(fileId);

    if (!file) {
      return res.status(404).json({ error: "File not found." });
    }

    res.status(200).json(file);
  } catch (error) {
    console.error("Error retrieving file:", error);
    res.status(500).json({ error: "Failed to retrieve file." });
  }
});

export default router;
