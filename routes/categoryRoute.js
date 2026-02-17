import express from "express";
import {
  createCategory,
  deleteCategory,
  getCategories,
  getCategoryByName,
  updateCategory,
} from "../controllers/categoryController.js";

// ─── FIXES APPLIED ───────────────────────────────────────────────────────────
// Old routes used :name param for delete & update.
// Frontend AdminCategory sends MongoDB _id, so routes updated to use :id.
// GET /  now calls renamed getCategories (was getcategory) which returns { list }
// ─────────────────────────────────────────────────────────────────────────────

const categoryRouter = express.Router();

// Public
categoryRouter.get("/",              getCategories);       // GET  /api/categories
categoryRouter.get("/:name",         getCategoryByName);   // GET  /api/categories/:name

// Admin-protected
categoryRouter.post("/",             createCategory);       // POST /api/categories
categoryRouter.put("/:id",           updateCategory);       // PUT  /api/categories/:id
categoryRouter.delete("/:id",        deleteCategory);       // DELETE /api/categories/:id

export default categoryRouter;