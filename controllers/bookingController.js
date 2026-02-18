import Booking from "../models/booking.js";
import Room from "../models/room.js";

// Helper: generate unique bookingId
function generateBookingId() {
  return Date.now(); // simple unique number
}

// Create booking by room
export async function createBooking(req, res) {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });

    const { roomId, start, end, notes } = req.body;
    const s = new Date(start);
    const e = new Date(end);

    if (!roomId || isNaN(s) || isNaN(e) || e <= s)
      return res.status(400).json({ message: "Invalid room or date range" });

    // Check overlap for this room
    const overlapping = await Booking.findOne({
      roomId,
      start: { $lt: e },
      end: { $gt: s },
    });

    if (overlapping)
      return res.status(409).json({ message: "Room is already booked in this time range" });

    const newBooking = new Booking({
      bookingId: generateBookingId(),
      roomId,
      email: req.user.email,
      start: s,
      end: e,
      notes: notes || "",
      status: "Pending",
    });

    const result = await newBooking.save();
    return res.status(201).json({ message: "Booking created", result });
  } catch (err) {
    return res.status(500).json({ message: "Booking creation failed", error: err.message });
  }
}

// Create booking by category
export async function createBookingUsingCategory(req, res) {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });

    const { category, start, end, notes } = req.body;
    const s = new Date(start);
    const e = new Date(end);

    if (!category || isNaN(s) || isNaN(e) || e <= s)
      return res.status(400).json({ message: "Invalid category or date range" });

    // Find occupied rooms
    const overlappingBookings = await Booking.find({
      start: { $lt: e },
      end: { $gt: s },
    });
    const occupiedRooms = overlappingBookings.map(b => b.roomId);

    // Available rooms in category
    const availableRooms = await Room.find({
      category,
      roomId: { $nin: occupiedRooms },
    });

    if (!availableRooms.length)
      return res.status(409).json({ message: "No rooms available" });

    const newBooking = new Booking({
      bookingId: generateBookingId(),
      roomId: availableRooms[0].roomId,
      email: req.user.email,
      start: s,
      end: e,
      status: "Pending",
      notes: notes || "",
    });

    const result = await newBooking.save();
    return res.status(201).json({ message: "Booking created", result });
  } catch (err) {
    return res.status(500).json({ message: "Booking creation failed", error: err.message });
  }
}

// Get all bookings (admin only)
export async function getAllBookings(req, res) {
  try {
    if (!req.user) return res.status(401).json({ message: "Please login" });
    if (req.user.type !== "admin") return res.status(403).json({ message: "Not authorized" });

    const bookings = await Booking.find({});
    return res.status(200).json({ message: "All bookings", result: bookings });
  } catch (err) {
    return res.status(500).json({ message: "Failed to get bookings", error: err.message });
  }
}

// Delete booking by bookingId (admin only)
export async function deleteBooking(req, res) {
  try {
    if (!req.user) return res.status(401).json({ message: "Please login" });
    if (req.user.type !== "admin") return res.status(403).json({ message: "Not authorized" });

    const bookingId = Number(req.params.id);
    const deleted = await Booking.findOneAndDelete({ bookingId });
    if (!deleted) return res.status(404).json({ message: "Booking not found" });

    return res.status(200).json({ message: "Booking deleted", result: deleted });
  } catch (err) {
    return res.status(500).json({ message: "Failed to delete booking", error: err.message });
  }
}

// Retrieve bookings by date range
export async function retrieveBookingByDate(req, res) {
  try {
    if (!req.user) return res.status(401).json({ message: "Please login" });

    const s = new Date(req.body.start);
    const e = new Date(req.body.end);

    if (isNaN(s) || isNaN(e) || e <= s)
      return res.status(400).json({ message: "Invalid date range" });

    const result = await Booking.find({
      start: { $lt: e },
      end: { $gt: s },
    });

    return res.status(200).json({ message: "Filtered bookings", result });
  } catch (err) {
    return res.status(500).json({ message: "Failed to get filtered bookings", error: err.message });
  }
}
