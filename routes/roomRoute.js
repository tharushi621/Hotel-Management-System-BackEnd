import express from "express";
import {
  createRoom,
  deleteRoom,
  findRoomById,
  getRooms,
  getRoomsByCategory,
  updateRoom,
} from "../controllers/roomControllers.js";

const roomRouter = express.Router();

// Routes
roomRouter.post("/", createRoom);
roomRouter.delete("/:roomId", deleteRoom);
roomRouter.get("/", getRooms);
roomRouter.get("/:category", getRoomsByCategory); // updated to match frontend
roomRouter.get("/:roomId", findRoomById);
roomRouter.put("/:roomId", updateRoom);

export default roomRouter;
