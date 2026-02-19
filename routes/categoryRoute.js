import express from "express";
import {
  createCategory,
  deleteCategory,
  getCategories,
  getCategoryByName,
  updateCategory,
} from "../controllers/categoryController.js";

const categoryRouter = express.Router();

// Public
categoryRouter.get("/", getCategories);
categoryRouter.get("/:name", getCategoryByName);

// Admin-protected
categoryRouter.post("/", createCategory);
categoryRouter.put("/:id", updateCategory);
categoryRouter.delete("/:id", deleteCategory);

export default categoryRouter;
