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

const upload = multer({
  storage: multer.diskStorage({
    destination: storageDir,
    filename: (req, file, cb) => {
      cb(null, `${Date.now()}-${file.originalname}`);
    },
  }),
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      "application/pdf",
      "image/png",
      "image/jpeg",
      "image/tiff",
    ];
    cb(null, allowedTypes.includes(file.mimetype));
  },
  limits: { fileSize: 10 * 1024 * 1024 },
}).single("file");

router.post("/extract", (req, res) => {
  upload(req, res, async (err) => {
    try {
      if (err) {
        return res.status(400).json({
          error: err.message || "File upload failed",
        });
      }

      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      // Process file
      const extractedData = await ocrService(req.file.filename);

      // Save to database
      const newFile = await dataSchema.create({
        filename: req.file.originalname,
        uploadDate: new Date(),
        extractedData,
      });

      // Send response
      res.json({
        message: "File processed successfully",
        id: newFile._id,
        filename: req.file.originalname,
      });
    } catch (error) {
      console.error("Processing error:", error);

      // Cleanup uploaded file on error
      if (req.file) {
        await fs
          .unlink(path.join(storageDir, req.file.filename))
          .catch((cleanupError) =>
            console.error("Cleanup failed:", cleanupError)
          );
      }

      res.status(500).json({
        error: error.message || "Internal server error",
      });
    }
  });
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
