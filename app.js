import express from "express";
import ocr from "./router/ocrRoutes.js";
const app = express();

app.use("/api", ocr);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

export default app;
