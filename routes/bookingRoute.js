import express from 'express';
import {
  getAllBookings,
  createBooking,
  deleteBooking,
  retrieveBookingByDate,
  createBookingUsingCategory,
} from '../controllers/bookingController.js';
import { protect } from '../middleware/authMiddleware.js';

const bookingRouter = express.Router();

// Protected routes (login required)
bookingRouter.get("/", protect, getAllBookings);                          // FIX: was missing — AdminBooking needs GET /api/bookings
bookingRouter.post("/", protect, createBooking);
bookingRouter.post("/create-by-category", protect, createBookingUsingCategory); // FIX: was "/category" in frontend — standardised here
bookingRouter.post("/filter-date", protect, retrieveBookingByDate);

// Admin-only routes
bookingRouter.delete("/:id", protect, deleteBooking);

export default bookingRouter;