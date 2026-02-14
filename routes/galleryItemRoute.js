import express from 'express'
import { createGalleryItems, deleteGalleryItem, getGalleryItem } from '../controllers/galleryController.js'


const galleryItemRouter = express.Router();

galleryItemRouter.post("/",createGalleryItems)
galleryItemRouter.get("/",getGalleryItem)
galleryItemRouter.delete("/:id",deleteGalleryItem)

export default galleryItemRouter