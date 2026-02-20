import Booking from "../models/booking.js";
import Room from "../models/room.js";

// Helper: generate unique bookingId using timestamp + random suffix
function generateBookingId() {
  return parseInt(`${Date.now()}${Math.floor(1000 + Math.random() * 9000)}`);
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

    const room = await Room.findOne({ roomId: Number(roomId) });
    if (!room) return res.status(404).json({ message: "Room not found" });
    if (!room.available)
      return res.status(409).json({ message: "This room is currently unavailable" });

    const overlapping = await Booking.findOne({
      roomId: Number(roomId),
      start: { $lt: e },
      end: { $gt: s },
    });

    if (overlapping)
      return res.status(409).json({ message: "Room is already booked in this time range" });

    const newBooking = new Booking({
      bookingId: generateBookingId(),
      roomId: Number(roomId),
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

    const overlappingBookings = await Booking.find({
      start: { $lt: e },
      end: { $gt: s },
    });
    const occupiedRoomIds = overlappingBookings.map((b) => b.roomId);

    const availableRooms = await Room.find({
      category,
      available: true,
      roomId: { $nin: occupiedRoomIds },
    });

    if (!availableRooms.length)
      return res.status(409).json({
        message: "No rooms available for the selected category and dates. Please try different dates.",
      });

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
    if (req.user.type !== "admin")
      return res.status(403).json({ message: "Not authorized" });

    const bookings = await Booking.find({}).sort({ start: -1 });
    return res.status(200).json({ message: "All bookings", result: bookings });
  } catch (err) {
    return res.status(500).json({ message: "Failed to get bookings", error: err.message });
  }
}

// Delete booking by bookingId (admin only)
export async function deleteBooking(req, res) {
  try {
    if (!req.user) return res.status(401).json({ message: "Please login" });
    if (req.user.type !== "admin")
      return res.status(403).json({ message: "Not authorized" });

    const bookingId = Number(req.params.id);
    const deleted = await Booking.findOneAndDelete({ bookingId });
    if (!deleted) return res.status(404).json({ message: "Booking not found" });

    return res.status(200).json({ message: "Booking deleted", result: deleted });
  } catch (err) {
    return res.status(500).json({ message: "Failed to delete booking", error: err.message });
  }
}

// Update booking (admin only)
export async function updateBooking(req, res) {
  try {
    if (!req.user) return res.status(401).json({ message: "Please login" });
    if (req.user.type !== "admin")
      return res.status(403).json({ message: "Not authorized" });

    const bookingId = Number(req.params.bookingId);
    const { status, notes, start, end, reason } = req.body;

    // Build update object with only provided fields
    const updateData = {};
    if (status !== undefined) updateData.status = status;
    if (notes !== undefined) updateData.notes = notes;
    if (reason !== undefined) updateData.reason = reason;

    if (start !== undefined) {
      const s = new Date(start);
      if (isNaN(s)) return res.status(400).json({ message: "Invalid start date" });
      updateData.start = s;
    }
    if (end !== undefined) {
      const e = new Date(end);
      if (isNaN(e)) return res.status(400).json({ message: "Invalid end date" });
      updateData.end = e;
    }

    // If both dates are provided, validate range
    if (updateData.start && updateData.end && updateData.end <= updateData.start)
      return res.status(400).json({ message: "End date must be after start date" });

    const updated = await Booking.findOneAndUpdate(
      { bookingId },
      updateData,
      { new: true }
    );

    if (!updated) return res.status(404).json({ message: "Booking not found" });

    return res.status(200).json({ message: "Booking updated", result: updated });
  } catch (err) {
    return res.status(500).json({ message: "Failed to update booking", error: err.message });
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

    const emailFilter =
      req.user.type === "admin" ? {} : { email: req.user.email };

    const result = await Booking.find({
      start: { $lt: e },
      end: { $gt: s },
      ...emailFilter,
    });

    return res.status(200).json({ message: "Filtered bookings", result });
  } catch (err) {
    return res.status(500).json({ message: "Failed to get filtered bookings", error: err.message });
  }
}