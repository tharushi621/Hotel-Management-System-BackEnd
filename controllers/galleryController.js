import GalleryItem from "../models/gallery.js";

/**
 * Create a gallery item (Admin only)
 */
export async function createGalleryItems(req, res) {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ message: "Please login" });
    if (user.type !== "admin")
      return res.status(403).json({ message: "Not authorized" });

    const galleryItem = req.body;
    const newGalleryItem = new GalleryItem(galleryItem);
    const result = await newGalleryItem.save();

    res
      .status(201)
      .json({ message: "Gallery item created successfully", result });
  } catch (err) {
    res
      .status(500)
      .json({
        message: "Gallery item creation failed",
        error: err.message || err,
      });
  }
}

/**
 * Get all gallery items (Public)
 */
export async function getGalleryItem(req, res) {
  try {
    const galleryItemList = await GalleryItem.find();
    res.status(200).json({ list: galleryItemList });
  } catch (err) {
    res
      .status(500)
      .json({
        message: "Failed to fetch gallery items",
        error: err.message || err,
      });
  }
}

/**
 * Delete a gallery item (Admin only)
 */
export async function deleteGalleryItem(req, res) {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ message: "Please login" });
    if (user.type !== "admin")
      return res.status(403).json({ message: "Not authorized" });

    const deleted = await GalleryItem.findByIdAndDelete(req.params.id);
    if (!deleted)
      return res.status(404).json({ message: "Gallery item not found" });

    res
      .status(200)
      .json({ message: "Gallery item deleted successfully", result: deleted });
  } catch (err) {
    res
      .status(500)
      .json({
        message: "Gallery item deletion failed",
        error: err.message || err,
      });
  }
}

/**
 * Update a gallery item (Admin only)
 */
export async function updateGalleryItem(req, res) {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ message: "Please login" });
    if (user.type !== "admin")
      return res.status(403).json({ message: "Not authorized" });

    const updated = await GalleryItem.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true },
    );
    if (!updated)
      return res.status(404).json({ message: "Gallery item not found" });

    res
      .status(200)
      .json({ message: "Gallery item updated successfully", result: updated });
  } catch (err) {
    res
      .status(500)
      .json({
        message: "Gallery item update failed",
        error: err.message || err,
      });
  }
}
