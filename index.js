import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import nodemailer from "nodemailer";

// Routes
import userRouter from "./routes/userRoute.js";
import galleryItemRouter from "./routes/galleryItemRoute.js";
import categoryRouter from "./routes/categoryRoute.js";
import bookingRouter from "./routes/bookingRoute.js"
import roomRouter from "./routes/roomRoute.js";
import feedbackRouter from "./routes/feedbackRouter.js";

dotenv.config();

const app = express();

const allowedOrigins = [
  "https://hotel-management-system-front-end.vercel.app",
  process.env.HOSTLINK,
].filter(Boolean);

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    if (
      origin.endsWith(".vercel.app") &&
      origin.includes("hotel-management-system")
    ) {
      return callback(null, true);
    }
    return callback(new Error("Not allowed by CORS: " + origin));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));
app.use(express.json());

mongoose
  .connect(process.env.MONGO_URL)
  .then(() => console.log("Connected to the database"))
  .catch((err) => console.error("MongoDB connection failed:", err.message));

// API Routes
app.use("/api/users", userRouter);
app.use("/api/gallery", galleryItemRouter);
app.use("/api/categories", categoryRouter);
app.use("/api/rooms", roomRouter);
app.use("/api/bookings", bookingRouter);
app.use("/api/feedbacks", feedbackRouter);

// Health check
app.get("/", (req, res) => {
  res.status(200).json({ message: "Server is running" });
});

// ✅ TEMPORARY EMAIL TEST — remove after debugging
app.get("/test-email", async (req, res) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASS,
      },
    });
    await transporter.verify();
    await transporter.sendMail({
      from: process.env.EMAIL,
      to: process.env.EMAIL,
      subject: "Test",
      text: "Working!",
    });
    res.json({ success: true, message: "Email sent!" });
  } catch (err) {
    console.error("EMAIL ERROR:", err.message);
    res.json({ success: false, error: err.message });
  }
});

// 404 Fallback
app.use((req, res) => {
  res.status(404).json({ message: "Endpoint not found" });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("Server error:", err.message);
  res.status(500).json({ message: "Internal server error", error: err.message });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});