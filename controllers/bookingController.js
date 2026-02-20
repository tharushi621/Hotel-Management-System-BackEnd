import Booking from "../models/booking.js";
import Room from "../models/room.js";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

// Helper: generate unique bookingId
function generateBookingId() {
  return parseInt(`${Date.now()}${Math.floor(1000 + Math.random() * 9000)}`);
}

// Helper: format date
function formatDate(date) {
  return new Date(date).toLocaleDateString("en-GB", {
    day: "numeric", month: "long", year: "numeric",
  });
}

// Helper: send booking confirmation email
async function sendBookingConfirmationEmail(email, booking, categoryLabel) {
  try {
    await resend.emails.send({
      from: "Leonine Villa <onboarding@resend.dev>",
      to: email,
      subject: `Reservation Confirmed — Reference #${booking.bookingId}`,
      html: `
        <div style="font-family: Georgia, serif; max-width: 560px; margin: 0 auto; padding: 36px; background: #f7e8c8; border: 1px solid #d4b888;">
          <h2 style="color: #2c1810; text-align: center; font-size: 1.4rem; letter-spacing: 0.06em; margin-bottom: 4px;">
            Leonine Villa Natura Resort
          </h2>
          <p style="text-align: center; color: #8b6030; font-size: 0.78rem; font-style: italic; margin-top: 0;">
            Kandy, Sri Lanka
          </p>
          <hr style="border-color: #b8860b; margin: 16px 0;" />

          <p style="color: #5a3e2b; font-style: italic;">Dear Esteemed Guest,</p>
          <p style="color: #2c1810; line-height: 1.7;">
            Your reservation has been duly received at the estate. We are delighted
            to confirm the following details of your sanctuary:
          </p>

          <!-- Booking Reference Banner -->
          <div style="text-align: center; margin: 24px 0; padding: 16px; background: #1a3d1a11; border: 1px solid #1a3d1a44; border-radius: 4px;">
            <p style="color: #5a3e2b; font-size: 0.8rem; margin: 0 0 6px 0; font-style: italic;">Booking Reference</p>
            <span style="font-size: 2rem; font-weight: bold; color: #1a3d1a; letter-spacing: 0.15em;">
              #${booking.bookingId}
            </span>
          </div>

          <!-- Booking Details Table -->
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 0.88rem;">
            <tr style="border-bottom: 1px solid #d4b88855;">
              <td style="padding: 10px 8px; color: #8b6030; font-style: italic; width: 40%;">Sanctuary</td>
              <td style="padding: 10px 8px; color: #2c1810; font-weight: bold;">${categoryLabel || "Leonine Villa"}</td>
            </tr>
            <tr style="border-bottom: 1px solid #d4b88855;">
              <td style="padding: 10px 8px; color: #8b6030; font-style: italic;">Room Assigned</td>
              <td style="padding: 10px 8px; color: #2c1810; font-weight: bold;">${booking.roomId}</td>
            </tr>
            <tr style="border-bottom: 1px solid #d4b88855;">
              <td style="padding: 10px 8px; color: #8b6030; font-style: italic;">Arrival</td>
              <td style="padding: 10px 8px; color: #2c1810; font-weight: bold;">${formatDate(booking.start)}</td>
            </tr>
            <tr style="border-bottom: 1px solid #d4b88855;">
              <td style="padding: 10px 8px; color: #8b6030; font-style: italic;">Departure</td>
              <td style="padding: 10px 8px; color: #2c1810; font-weight: bold;">${formatDate(booking.end)}</td>
            </tr>
            <tr style="border-bottom: 1px solid #d4b88855;">
              <td style="padding: 10px 8px; color: #8b6030; font-style: italic;">Status</td>
              <td style="padding: 10px 8px; color: #b8860b; font-weight: bold;">${booking.status}</td>
            </tr>
            ${booking.notes ? `
            <tr>
              <td style="padding: 10px 8px; color: #8b6030; font-style: italic;">Notes</td>
              <td style="padding: 10px 8px; color: #2c1810;">${booking.notes}</td>
            </tr>` : ""}
          </table>

          <hr style="border-color: #b8860b; margin: 20px 0;" />

          <p style="color: #2c1810; line-height: 1.8; font-size: 0.88rem;">
            Our butler shall correspond with thee shortly to confirm your sanctuary.
            A deposit of <strong>30%</strong> will be requested upon confirmation.
            Full cancellation is permitted up to <strong>7 days</strong> prior to arrival.
          </p>

          <p style="color: #5a3e2b; font-style: italic; line-height: 1.8; font-size: 0.88rem;">
            Please retain this correspondence as confirmation of your reservation.
            Should you wish to amend or enquire about your booking, kindly quote
            reference <strong>#${booking.bookingId}</strong>.
          </p>

          <hr style="border-color: #b8860b; margin: 20px 0;" />
          <p style="color: #8b6030; font-size: 0.75rem; text-align: center; font-style: italic;">
            With warmest anticipation of your arrival,<br />
            <strong style="color: #2c1810;">Leonine Villa Natura Resort</strong> · Kandy, Sri Lanka
          </p>
        </div>
      `,
    });
    console.log(`Booking confirmation email sent to ${email} for booking #${booking.bookingId}`);
  } catch (err) {
    // Don't fail the booking if email fails — just log it
    console.error("Booking confirmation email failed:", err.message);
  }
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

    // Send confirmation email
    await sendBookingConfirmationEmail(req.user.email, result, `Room ${roomId}`);

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

    // Send confirmation email
    await sendBookingConfirmationEmail(req.user.email, result, category);

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