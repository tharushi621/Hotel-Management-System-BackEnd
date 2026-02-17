import Room from "../models/room.js";
import { isAdminValid } from "./userController.js";

// ─── FIXES APPLIED ───────────────────────────────────────────────────────────
// RoomsPage calls: GET /api/rooms?category=<categoryId>
// Old getRooms() ignored query params and returned ALL rooms.
// Fix: getRooms now checks req.query.category and filters if provided.
// The existing getRoomsByCategory (route param version) is kept for backwards
// compatibility but is no longer needed by the current frontend.
// ─────────────────────────────────────────────────────────────────────────────

// CREATE ROOM
export async function createRoom(req, res) {
  if (!isAdminValid(req)) return res.status(403).json({ message: "Forbidden" });

  try {
    const newRoom = new Room(req.body);
    const result = await newRoom.save();
    res.json({ message: "Room created successfully", result });
  } catch (err) {
    res.status(500).json({ message: "Room creation failed", error: err.message });
  }
}

// DELETE ROOM
export async function deleteRoom(req, res) {
  if (!isAdminValid(req)) return res.status(403).json({ message: "Forbidden" });

  const roomId = req.params.roomId;
  try {
    const deleted = await Room.findOneAndDelete({ roomId });
    if (!deleted) return res.status(404).json({ message: "Room not found" });
    res.json({ message: "Room deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Room deletion failed", error: err.message });
  }
}

// FIND ROOM BY ID
export async function findRoomById(req, res) {
  const roomId = req.params.roomId;
  try {
    const result = await Room.findOne({ roomId });
    if (!result) return res.status(404).json({ message: "Room not found" });
    res.json({ message: "Room found", result });
  } catch (err) {
    res.status(500).json({ message: "Room search failed", error: err.message });
  }
}

// GET ALL ROOMS — FIX: supports ?category=<value> query param
export async function getRooms(req, res) {
  try {
    const filter = {};
    // FIX: RoomsPage sends ?category=<categoryId> — filter if provided
    if (req.query.category) {
      filter.category = req.query.category;
    }
    const result = await Room.find(filter);
    res.json({ rooms: result });
  } catch (err) {
    res.status(500).json({ message: "Failed to get rooms", error: err.message });
  }
}

// UPDATE ROOM
export async function updateRoom(req, res) {
  if (!isAdminValid(req)) return res.status(403).json({ message: "Forbidden" });

  const roomId = req.params.roomId;
  try {
    const updated = await Room.findOneAndUpdate({ roomId }, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: "Room not found" });
    res.json({ message: "Room updated successfully", result: updated });
  } catch (err) {
    res.status(500).json({ message: "Room update failed", error: err.message });
  }
}

// GET ROOMS BY CATEGORY (route param — kept for backwards compat)
export async function getRoomsByCategory(req, res) {
  const category = req.params.category;
  try {
    const result = await Room.find({ category });
    res.json({ rooms: result });
  } catch (err) {
    res.status(500).json({ message: "Failed to get rooms", error: err.message });
  }
}