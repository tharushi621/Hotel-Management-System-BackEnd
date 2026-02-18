import express from "express";
import {
  createGalleryItems,
  deleteGalleryItem,
  getGalleryItem,
  updateGalleryItem
} from "../controllers/galleryController.js";
import { protect } from "../middleware/authMiddleware.js"; // make sure protect is applied

const galleryItemRouter = express.Router();

// Public route
galleryItemRouter.get("/", getGalleryItem);

// Admin-only routes (login required)
galleryItemRouter.post("/", protect, createGalleryItems);
galleryItemRouter.put("/:id", protect, updateGalleryItem);
galleryItemRouter.delete("/:id", protect, deleteGalleryItem);

export default galleryItemRouter;
