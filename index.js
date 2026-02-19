import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";

// Routes
import userRouter from "./routes/userRoute.js";
import galleryItemRouter from "./routes/galleryItemRoute.js";
import categoryRouter from "./routes/categoryRoute.js";
import roomRouter from "./routes/roomRoute.js";
import bookingRouter from "./routes/bookingRoute.js";
import feedbackRouter from "./routes/feedbackRouter.js";

dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: [
    process.env.FRONTEND_URL,
    process.env.LOCAL_URL
  ],
  credentials: true
}));
app.use(express.json());

// MongoDB connection
const connectionString = process.env.MONGO_URL;
mongoose
  .connect(connectionString)
  .then(() => console.log("Connected to the database"))
  .catch((err) => console.error("MongoDB connection failed:", err.message));

// API Routes
app.use("/api/users", userRouter);
app.use("/api/gallery", galleryItemRouter);
app.use("/api/categories", categoryRouter);
app.use("/api/rooms", roomRouter);
app.use("/api/bookings", bookingRouter);
app.use("/api/feedbacks", feedbackRouter);

// Fallback route for unknown endpoints
app.use((req, res) => {
  res.status(404).json({ message: "Endpoint not found" });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});