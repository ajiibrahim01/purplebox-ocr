import mongoose from "mongoose";

const dbURI = "mongodb://localhost:27017/purplebox_ocr_db";
const connect = async () => {
  try {
    await mongoose.connect(dbURI);
    console.log("MongoDB connected successfully");
    mongoose.connection.on("disconnected", () => {
      console.log("MongoDB disconnected");
    });
    mongoose.connection.on("error", (error) => {
      console.error("MongoDB connection error:", error);
      process.exit(1);
    });
  } catch (error) {
    console.error("Database connection failed:", error.message);
    process.exit(1);
  }
};

export default connect;
