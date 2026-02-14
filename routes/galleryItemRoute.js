import express from 'express'
import { createGalleryItems, deleteGalleryItem, getGalleryItem, updateGalleryItem } from '../controllers/galleryController.js'


const galleryItemRouter = express.Router();

galleryItemRouter.post("/",createGalleryItems)
galleryItemRouter.get("/",getGalleryItem)
galleryItemRouter.delete("/:id",deleteGalleryItem)
galleryItemRouter.put("/:id",updateGalleryItem)

export default galleryItemRouter