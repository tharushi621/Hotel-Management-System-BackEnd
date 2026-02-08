import express from 'express'
import { createCategory, deleteCategory, getcategory, getCategoryByName, updateCategory } from '../controllers/categoryController.js'

const categoryRouter = express.Router()

categoryRouter.post("/",createCategory)
categoryRouter.delete("/:name",deleteCategory)
categoryRouter.get("/:name",getCategoryByName)
categoryRouter.get("/",getcategory)
categoryRouter.put("/:name",updateCategory)

export default categoryRouter