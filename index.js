import bodyParser from 'body-parser';
import express from 'express';
import mongoose from 'mongoose';
import userRouter from './routes/userRoute.js';
import galleryItemRouter from './routes/galleryItemRoute.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import categoryRouter from './routes/categoryRoute.js';
import roomRouter from './routes/roomRoute.js';
import bookingRouter from './routes/bookingRoute.js';
import cors from 'cors';

dotenv.config();

const app = express();

app.use(cors());
app.use(bodyParser.json());

const connectionString = process.env.MONGO_URL;

app.use((req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");
  if (token) {
    jwt.verify(token, process.env.JWT_KEY, (err, decoded) => {
      if (err) {
        console.error("JWT verification failed:", err.message);
        return next();
      }
      req.user = decoded;
      next();
    });
  } else {
    next();
  }
});

mongoose.connect(connectionString)
  .then(() => {
    console.log("Connected to the database");
  })
  .catch((err) => {
    console.error("MongoDB connection failed:", err.message);
  });


app.use("/api/users", userRouter);
app.use("/api/gallery", galleryItemRouter);
app.use("/api/categories", categoryRouter);
app.use("/api/rooms", roomRouter);
app.use("/api/bookings", bookingRouter);

app.listen(5000, () => {
  console.log("Server is running on port 5000.");
});
