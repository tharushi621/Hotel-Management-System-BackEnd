import express from 'express'
import { createGalleryItems, deleteGalleryIyem, getGalleryItem } from '../controllers/galleryController.js'


const galleryItemRouter = express.Router();

galleryItemRouter.post("/",createGalleryItems)
galleryItemRouter.get("/",getGalleryItem)
galleryItemRouter.delete("/",deleteGalleryItem)

export default galleryItemRouter