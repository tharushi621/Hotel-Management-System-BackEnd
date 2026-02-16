import Booking from "../models/booking.js";
import Room from "../models/room.js";
import { isCustomerValid } from "./userController.js";


/**
 * Create a new booking
 */
export async function createBooking(req, res) {
  try {
    // Check if the customer is valid
    if (!isCustomerValid(req)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    // Ensure req.user exists
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized: Please login" });
    }

    const startingId = 1000;

    // Count existing bookings to generate a new bookingId
    const count = await Booking.countDocuments({});
    const newId = startingId + count + 1;

    const newBooking = new Booking({
      bookingId: newId,
      roomId: req.body.roomId,
      email: req.user.email,
      start: req.body.start,
      end: req.body.end,
    });

    const result = await newBooking.save();

    return res.status(201).json({
      message: "Booking created successfully",
      result: result,
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
    // Check if user is logged in
    if (!req.user) {
      return res.status(401).json({
        message: "Please login to view bookings",
      });
    }

    // Only admin can access all bookings
    if (req.user.type !== "admin") {
      return res.status(403).json({
        message: "You are not authorized to view all bookings",
      });
    }

    const bookings = await Booking.find({});

    return res.status(200).json({
      message: "All Bookings",
      result: bookings,
    });
  } catch (err) {
    return res.status(500).json({
      message: "Failed to get all bookings",
      error: err.message || err,
    });
  }
}
/**
 * Delete booking by bookingId (admin only)
 */
export async function deleteBooking(req, res) {
  try {
    // Check if logged in
    if (!req.user) {
      return res.status(401).json({
        message: "Please login to delete booking",
      });
    }

    // Only admin can delete
    if (req.user.type !== "admin") {
      return res.status(403).json({
        message: "You are not authorized to delete bookings",
      });
    }

    const bookingId = req.params.id;

    const deletedBooking = await Booking.findOneAndDelete({
      bookingId: bookingId,
    });

    if (!deletedBooking) {
      return res.status(404).json({
        message: "Booking not found",
      });
    }

    return res.status(200).json({
      message: "Booking deleted successfully",
      result: deletedBooking,
    });
  } catch (err) {
    return res.status(500).json({
      message: "Failed to delete booking",
      error: err.message || err,
    });
  }
}
export function retrieveBookingByDate(req, res) {
  const start = req.body.start;
  const end = req.body.end;

  Booking.find({
    start: { $gte: start },
    end: { $lt: new Date(end) },
  })
    .then((result) => {
      res.json({
        message: "Filtered bookings",
        result: result,
      });
    })
    .catch((err) => {
      res.status(500).json({
        message: "Failed to get filtered bookings",
        error: err,
      });
    });
}export async function createBookingUsingCategory(req, res) {
    try {
        const start = new Date(req.body.start);
        const end = new Date(req.body.end);

        // Find overlapping bookings
        const overlappingBookings = await Booking.find({
            $or: [
                { start: { $gte: start, $lt: end } },
                { end: { $gt: start, $lte: end } }
            ]
        });

        const occupiedRooms = overlappingBookings.map(b => b.roomId);

        // Find available rooms in the requested category
        const availableRooms = await Room.find({
            roomId: { $nin: occupiedRooms },
            category: req.body.category
        });

        if (availableRooms.length === 0) {
            return res.json({ message: "No rooms available" });
        }

        // Generate bookingId
        const startingId = 1200;
        const count = await Booking.countDocuments({});
        const newId = startingId + count + 1;

        // Create booking with first available room
        const newBooking = new Booking({
            bookingId: newId,
            roomId: availableRooms[0].roomId,
            email: req.user.email,
            start,
            end
        });

        const result = await newBooking.save();

        return res.status(201).json({
            message: "Booking created successfully",
            result
        });

    } catch (err) {
        return res.status(500).json({
            message: "Booking creation failed",
            error: err.message || err
        });
    }
}
