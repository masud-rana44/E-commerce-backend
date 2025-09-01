import dotenv from "dotenv";
import express, { Request, Response } from "express";
import mongoose from "mongoose";

// Load environment variables early
dotenv.config();

const app = express();

// Middlewares
app.use(express.json());

// Routes
app.get("/", (_req: Request, res: Response) => {
  res.send("Hello World 🌍");
});

// Database connection
const connectDB = async (): Promise<void> => {
  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      throw new Error("❌ MONGODB_URI is not defined in environment variables");
    }
    await mongoose.connect(uri);
    console.log("✅ MongoDB connected successfully");
  } catch (error) {
    console.error("❌ Database connection failed:", error);
    process.exit(1);
  }
};

// Bootstrap function
const bootstrap = async (): Promise<void> => {
  try {
    await connectDB();

    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`🚀 Server running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("❌ Application startup failed:", error);
    process.exit(1);
  }
};

bootstrap();
