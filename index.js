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

// ✅ UPDATED: Dynamic CORS origin to support Vercel preview deployments
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      process.env.HOSTLINK, // e.g. https://hotel-management-system-front-end.vercel.app
      process.env.BE,       // e.g. https://hotel-management-system-be-gcfq.onrender.com
    ];

    // Allow requests with no origin (e.g. Postman, server-to-server)
    if (!origin) return callback(null, true);

    // Allow exact matches
    if (allowedOrigins.includes(origin)) return callback(null, true);

    // Allow any Vercel preview deployment URL for this project
    if (
      origin.endsWith(".vercel.app") &&
      origin.includes("hotel-management-system")
    ) {
      return callback(null, true);
    }

    // Block everything else
    callback(new Error("Not allowed by CORS: " + origin));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

app.use(express.json());

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

// Health check
app.get("/", (req, res) => {
  res.status(200).json({ message: "Server is running" });
});

// Fallback
app.use((req, res) => {
  res.status(404).json({ message: "Endpoint not found" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});