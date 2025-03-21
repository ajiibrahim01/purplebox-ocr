import express from "express";
import ocr from "./router/ocrRoutes.js";
const app = express();

app.use(express.json());

app.use("/api", ocr);

export default app;
