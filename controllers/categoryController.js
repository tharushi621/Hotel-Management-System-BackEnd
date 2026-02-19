import Category from "../models/categories.js";
import { isAdminValid } from "./userController.js";

//Create Category
export async function createCategory(req, res) {
  if (!isAdminValid(req)) return res.status(403).json({ message: "Forbidden" });

  try {
    const newCategory = new Category(req.body);
    const result = await newCategory.save();
    res.status(201).json({ message: "Category created successfully", result });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Category creation failed", error: err.message });
  }
}

//Delete Category
export async function deleteCategory(req, res) {
  if (!isAdminValid(req)) return res.status(403).json({ message: "Forbidden" });

  try {
    const deleted = await Category.findByIdAndDelete(req.params.id);
    if (!deleted)
      return res.status(404).json({ message: "Category not found" });

    res.json({ message: "Category deleted successfully", result: deleted });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Category deletion failed", error: err.message });
  }
}

//Get all categories
export async function getCategories(req, res) {
  try {
    const result = await Category.find().select("-__v");
    res.json({ list: result });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to get categories", error: err.message });
  }
}

//Get Category By Name
export async function getCategoryByName(req, res) {
  try {
    const result = await Category.findOne({ name: req.params.name }).select(
      "-__v",
    );
    if (!result) return res.status(404).json({ message: "Category not found" });

    res.json({ category: result });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to get category", error: err.message });
  }
}

//Update Category
export async function updateCategory(req, res) {
  if (!isAdminValid(req)) return res.status(403).json({ message: "Forbidden" });

  try {
    const updated = await Category.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    }).select("-__v");
    if (!updated)
      return res.status(404).json({ message: "Category not found" });

    res.json({ message: "Category updated successfully", result: updated });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Category update failed", error: err.message });
  }
}
