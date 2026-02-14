import GalleryItem from "../models/gallery.js";

export function createGalleryItems(req,res){
const user = req.user 

if(user==null){
    res.status(403).json({
        message:"Please login to create a gallery item"
    })
    return
}
if(user.type!="admin"){
    res.status(403).json({
        message:"not authorized to create a gallery item"
    })
    return
}
    const galleryItem = req.body

    const newGalleryItem = new GalleryItem(galleryItem)

    newGalleryItem.save().then(
        ()=>{
            res.json(
                {
                    message:"Gallery Item created successfully"
                }
            )
        }
    ).catch(
        ()=>{
            res.status(500).json({
                  message:"Gallery Item creation failed"
            })
        }
    )
}
export function getGalleryItem(req,res){
    GalleryItem.find().then(
        (galleryItemList)=>{
            res.json({
                list:galleryItemList
            })
        }
    )
}
export function deleteGalleryItem(req,res){
    const id = req.params.id
    const user = req.user

    if(!user){
        res.status(403).json({
            message:"Please login to create a gallery item"
        })
        return
    }
    if(user.type != "admin"){
        res.status(403).json({
            message:"You are not authorized to create a gallery item"
        })
        return
    }
    GalleryItem.findByIdAndDelete(id).then(
        ()=>{
            res.json({
                message:"Gallery item deleted successfully"
            })
        }
    ).catch(
        ()=>{
            res.status(500).json({
                message:"Gallery item deletion failed"
            })
        }
    )
}
export function updateGalleryItem(req,res){
     const id = req.params.id
    const user = req.user

    if(!user){
        res.status(403).json({
            message:"Please login to update a gallery item"
        })
        return
    }
    if(user.type != "admin"){
        res.status(403).json({
            message:"You are not authorized to create a gallery item"
        })
        return
    }
    const galleryItem=req.body

    GalleryItem.findByIdAndUpdate(id,galleryItem).then(
        ()=>{
            res.json({
                message:"Gallery item updated successfully"
            })
        }
    ).catch(
        ()=>{
            res.status(500).json({
                message:"Gallery item update failed"
            })
        }
    )
}