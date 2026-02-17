import Category from "../models/categories.js";
import { isAdminValid } from "./userController.js";

// ─── FIXES APPLIED ───────────────────────────────────────────────────────────
// 1. createCategory  — use isAdminValid helper for consistency.
// 2. deleteCategory  — was deleting by `name` param; frontend sends MongoDB _id.
//                      Changed route param to :id and use findByIdAndDelete.
//                      Restored auth guard (was commented out).
// 3. getCategory     — renamed to getCategories, now returns { list: result }
//                      so both frontend consumers (AdminCategory + CategoriesPage)
//                      succeed with `res.data.list || res.data.categories`.
// 4. updateCategory  — was updating by `name` param; frontend sends _id.
//                      Changed route param to :id and use findByIdAndUpdate.
// 5. All catch blocks now return proper HTTP status codes.
// ─────────────────────────────────────────────────────────────────────────────

export async function createCategory(req, res) {
  if (!isAdminValid(req)) {
    return res.status(403).json({ message: "Forbidden" });
  }

  try {
    const newCategory = new Category(req.body);
    const result = await newCategory.save();
    res.status(201).json({ message: "Category created successfully", result });
  } catch (err) {
    res.status(500).json({ message: "Category creation failed", error: err.message });
  }
}

// FIX #2: param is now :id (MongoDB _id), auth guard restored
export async function deleteCategory(req, res) {
  if (!isAdminValid(req)) {
    return res.status(403).json({ message: "Forbidden" });
  }

  try {
    const deleted = await Category.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: "Category not found" });
    }
    res.json({ message: "Category deleted successfully", result: deleted });
  } catch (err) {
    res.status(500).json({ message: "Category deletion failed", error: err.message });
  }
}

// FIX #3: returns { list: result } — matches frontend expectation
export async function getCategories(req, res) {
  try {
    const result = await Category.find();
    res.json({ list: result });
  } catch (err) {
    res.status(500).json({ message: "Failed to get categories", error: err.message });
  }
}

export async function getCategoryByName(req, res) {
  try {
    const result = await Category.findOne({ name: req.params.name });
    if (!result) {
      return res.status(404).json({ message: "Category not found" });
    }
    res.json({ category: result });
  } catch (err) {
    res.status(500).json({ message: "Failed to get category", error: err.message });
  }
}

// FIX #4: param is now :id (MongoDB _id)
export async function updateCategory(req, res) {
  if (!isAdminValid(req)) {
    return res.status(403).json({ message: "Forbidden" });
  }

  try {
    const updated = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) {
      return res.status(404).json({ message: "Category not found" });
    }
    res.json({ message: "Category updated successfully", result: updated });
  } catch (err) {
    res.status(500).json({ message: "Category update failed", error: err.message });
  }
}