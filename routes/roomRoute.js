import express from "express";
import { createRoom,deleteRoom,updateRoom,getRoomsByCategory,findRoomById,getRooms } from "../controllers/roomControllers.js";
import { protect } from "../middleware/authMiddleware.js";

const roomRouter = express.Router();

// Admin Routes
roomRouter.post("/", protect, createRoom);           
roomRouter.delete("/:roomId", protect, deleteRoom); 
roomRouter.patch("/:roomId", protect, updateRoom); 

// Public Routes
roomRouter.get("/category/:category", getRoomsByCategory);
roomRouter.get("/:roomId", findRoomById);        
roomRouter.get("/", getRooms);                     

export default roomRouter;
