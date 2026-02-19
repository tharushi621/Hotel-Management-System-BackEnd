import Room from "../models/room.js";
import { isAdminValid } from "./userController.js";

// CREATE ROOM
export async function createRoom(req, res) {
  if (!isAdminValid(req)) return res.status(403).json({ message: "Forbidden" });

  try {
    const newRoom = new Room(req.body);
    const result = await newRoom.save();
    res.json({ message: "Room created successfully", result });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Room creation failed", error: err.message });
  }
}

// DELETE ROOM
export async function deleteRoom(req, res) {
  if (!isAdminValid(req)) return res.status(403).json({ message: "Forbidden" });

  // ✅ FIX: cast to Number — roomId in schema is Number, params come as String
  const roomId = Number(req.params.roomId);
  try {
    const deleted = await Room.findOneAndDelete({ roomId });
    if (!deleted) return res.status(404).json({ message: "Room not found" });
    res.json({ message: "Room deleted successfully" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Room deletion failed", error: err.message });
  }
}

// FIND ROOM BY ID
export async function findRoomById(req, res) {
  // ✅ FIX: cast to Number
  const roomId = Number(req.params.roomId);
  try {
    const result = await Room.findOne({ roomId });
    if (!result) return res.status(404).json({ message: "Room not found" });
    res.json({ message: "Room found", result });
  } catch (err) {
    res.status(500).json({ message: "Room search failed", error: err.message });
  }
}

// GET ALL ROOMS
export async function getRooms(req, res) {
  try {
    const filter = {};
    if (req.query.category) {
      filter.category = req.query.category;
    }
    const result = await Room.find(filter);
    res.json({ rooms: result });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to get rooms", error: err.message });
  }
}

// UPDATE ROOM
export async function updateRoom(req, res) {
  if (!isAdminValid(req)) return res.status(403).json({ message: "Forbidden" });

  // ✅ FIX: cast to Number
  const roomId = Number(req.params.roomId);
  try {
    const updated = await Room.findOneAndUpdate({ roomId }, req.body, {
      new: true,
    });
    if (!updated) return res.status(404).json({ message: "Room not found" });
    res.json({ message: "Room updated successfully", result: updated });
  } catch (err) {
    res.status(500).json({ message: "Room update failed", error: err.message });
  }
}

// GET ROOMS BY CATEGORY
export async function getRoomsByCategory(req, res) {
  const category = req.params.category;
  try {
    const result = await Room.find({ category });
    res.json({ rooms: result });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to get rooms", error: err.message });
  }
}
