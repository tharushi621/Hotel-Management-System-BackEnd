import Booking from "../models/booking.js";
import Room from "../models/room.js";

// ─── FIXES APPLIED ───────────────────────────────────────────────────────────
// 1. createBooking — removed isCustomerValid() check. The check used type
//    "customer" but postUsers() sets type "user" by default, so NO registered
//    user could ever create a booking. Now any authenticated user may book.
//
// 2. createBookingUsingCategory — added proper auth guard so an anonymous
//    request fails gracefully (401) instead of crashing on req.user.email.
//
// 3. retrieveBookingByDate — added basic auth guard.
//
// 4. getAllBookings / deleteBooking — unchanged (already correct).
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Create a new booking by roomId (direct)
 */
export async function createBooking(req, res) {
  try {
    // FIX #1: removed isCustomerValid — allow any logged-in user to book
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized: Please login" });
    }

    const startingId = 1000;
    const count = await Booking.countDocuments({});
    const newId = startingId + count + 1;

    const newBooking = new Booking({
      bookingId: newId,
      roomId:    req.body.roomId,
      email:     req.user.email,
      start:     req.body.start,
      end:       req.body.end,
      notes:     req.body.notes || "",
    });

    const result = await newBooking.save();
    return res.status(201).json({ message: "Booking created successfully", result });
  } catch (err) {
    return res.status(500).json({ message: "Booking creation failed", error: err.message || err });
  }
}


/**
 * Create a booking by room category — auto-assigns an available room.
 * Body: { category, start, end, notes? }
 * Auth: Bearer JWT (req.user populated by auth middleware)
 */
export async function createBookingUsingCategory(req, res) {
  try {
    // FIX #2: guard BEFORE touching req.user.email
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized: Please login to make a booking" });
    }

    const start = new Date(req.body.start);
    const end   = new Date(req.body.end);

    if (!req.body.category) {
      return res.status(400).json({ message: "Category is required" });
    }
    if (isNaN(start) || isNaN(end) || end <= start) {
      return res.status(400).json({ message: "Invalid date range" });
    }

    // Find rooms already occupied in this date range
    const overlappingBookings = await Booking.find({
      $or: [
        { start: { $gte: start, $lt: end } },
        { end:   { $gt: start, $lte: end } },
      ],
    });
    const occupiedRooms = overlappingBookings.map(b => b.roomId);

    // Find an available room matching the requested category
    const availableRooms = await Room.find({
      roomId:   { $nin: occupiedRooms },
      category: req.body.category,
    });

    if (availableRooms.length === 0) {
      return res.status(409).json({
        message: "No rooms available for the selected category and dates.",
      });
    }

    // Generate unique bookingId
    const startingId = 1200;
    const count = await Booking.countDocuments({});
    const newId = startingId + count + 1;

    const newBooking = new Booking({
      bookingId: newId,
      roomId:    availableRooms[0].roomId,
      email:     req.user.email,
      start,
      end,
      status:    "Pending",
      notes:     req.body.notes || "",
    });

    const result = await newBooking.save();

    return res.status(201).json({
      message: "Booking created successfully",
      result,
    });
  } catch (err) {
    return res.status(500).json({
      message: "Booking creation failed",
      error: err.message || err,
    });
  }
}


/**
 * Get all bookings (admin only)
 */
export async function getAllBookings(req, res) {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Please login to view bookings" });
    }
    if (req.user.type !== "admin") {
      return res.status(403).json({ message: "You are not authorized to view all bookings" });
    }

    const bookings = await Booking.find({});
    return res.status(200).json({ message: "All Bookings", result: bookings });
  } catch (err) {
    return res.status(500).json({ message: "Failed to get all bookings", error: err.message || err });
  }
}


/**
 * Delete booking by bookingId (admin only)
 */
export async function deleteBooking(req, res) {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Please login to delete booking" });
    }
    if (req.user.type !== "admin") {
      return res.status(403).json({ message: "You are not authorized to delete bookings" });
    }

    const bookingId = Number(req.params.id);
    const deletedBooking = await Booking.findOneAndDelete({ bookingId });

    if (!deletedBooking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    return res.status(200).json({ message: "Booking deleted successfully", result: deletedBooking });
  } catch (err) {
    return res.status(500).json({ message: "Failed to delete booking", error: err.message || err });
  }
}


/**
 * Filter bookings by date range
 * FIX #3: added auth guard
 */
export async function retrieveBookingByDate(req, res) {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Please login to filter bookings" });
    }

    const start = new Date(req.body.start);
    const end   = new Date(req.body.end);

    const result = await Booking.find({
      start: { $gte: start },
      end:   { $lt: end },
    });

    res.json({ message: "Filtered bookings", result });
  } catch (err) {
    res.status(500).json({ message: "Failed to get filtered bookings", error: err.message || err });
  }
}