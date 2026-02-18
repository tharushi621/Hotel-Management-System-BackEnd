import mongoose from "mongoose";

const gallerySchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: true
        },
        image: {
            type: String,
            required: true
        },
        description: {
            type: String,
            required: true
        },
        category: {
            type: String,
            default: ""
        }
    }
);

const GalleryItem = mongoose.model("galleryItems", gallerySchema);

export default GalleryItem;