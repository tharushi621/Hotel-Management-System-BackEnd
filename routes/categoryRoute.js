import express from "express";
import {
  createCategory,
  deleteCategory,
  getCategories,
  getCategoryByName,
  updateCategory,
  updateCategoryByName,
} from "../controllers/categoryController.js";
import { protect } from "../middleware/authMiddleware.js";

const categoryRouter = express.Router();

// Public
categoryRouter.get("/", getCategories);
categoryRouter.get("/:name", getCategoryByName);

// Admin-protected
categoryRouter.post("/", protect, createCategory);
categoryRouter.put("/:id", protect, updateCategory);           // update by MongoDB _id
categoryRouter.put("/name/:name", protect, updateCategoryByName); // update by name (used by frontend)
categoryRouter.delete("/:id", protect, deleteCategory);

export default categoryRouter;