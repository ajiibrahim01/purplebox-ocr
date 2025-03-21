import { Schema, model } from "mongoose";

const ocrFileSchema = new Schema({
  filename: {
    type: String,
    required: true,
  },
  uploadDate: {
    type: Date,
    default: Date.now,
  },
  extractedData: {
    type: [Schema.Types.Mixed],
    default: [],
  },
});

export default model("dataSchema", ocrFileSchema);
