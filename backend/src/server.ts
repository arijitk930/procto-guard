import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser"; // Added this
import { connectDB } from "./config/db.js";
import { errorHandler } from "./middlewares/error.middleware.js"; // Added this

// Load environment variables immediately
dotenv.config({
  path: "./.env",
});

const app = express();

// Security Middleware
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  }),
);

// Body Parsing & Cookie Middleware
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(cookieParser()); // Initialize cookie-parser here

// Basic Health Check
app.get("/", (req, res) => {
  res.send("ProctoGuard API is running securely on Express 5.");
});

//routes import
import userRouter from "./routes/user.routes.js";
import examRouter from "./routes/exam.routes.js";
import attemptRouter from "./routes/attempt.routes.js";

//routes declaration
app.use("/api/v1/users", userRouter);
app.use("/api/v1/exams", examRouter);
app.use("/api/v1/attempts", attemptRouter);

// Global Error Handler - MUST be placed after all routes
app.use(errorHandler);

const PORT = process.env.PORT || 8000;
// Connect to DB, then start the server
connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 Server locked and loaded on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error(
      "Server failed to start due to database connection error:",
      err,
    );
  });
