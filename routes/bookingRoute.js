import express from "express";
import {
  createBooking,
  createBookingUsingCategory,
  getAllBookings,
  deleteBooking,
  retrieveBookingByDate,
  updateBooking,
} from "../controllers/bookingController.js";
import { protect } from "../middleware/authMiddleware.js";

const bookingRouter = express.Router();

// Admin Routes
bookingRouter.get("/", protect, getAllBookings);
bookingRouter.delete("/:id", protect, deleteBooking);
bookingRouter.patch("/:bookingId", protect, updateBooking); 

// Customer Routes
bookingRouter.post("/", protect, createBooking);
bookingRouter.post("/category", protect, createBookingUsingCategory);
bookingRouter.post("/filter", protect, retrieveBookingByDate);

export default bookingRouter;