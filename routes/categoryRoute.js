import express from "express";
import {
  createCategory,
  deleteCategory,
  getCategories,
  getCategoryByName,
  updateCategory,
} from "../controllers/categoryController.js";
import { protect } from "../middleware/authMiddleware.js";

const categoryRouter = express.Router();

// Public
categoryRouter.get("/", getCategories);
categoryRouter.get("/:name", getCategoryByName);

// Admin-protected ✅ FIX: Added protect middleware to all mutation routes
categoryRouter.post("/", protect, createCategory);
categoryRouter.put("/:id", protect, updateCategory);
categoryRouter.delete("/:id", protect, deleteCategory);

export default categoryRouter;