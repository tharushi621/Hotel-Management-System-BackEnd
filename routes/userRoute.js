import express from 'express'
import {getUser, loginUser, postUsers, sendSampleEmail} from '../controllers/userController.js'

const userRouter = express.Router();

userRouter.post("/",postUsers)
userRouter.post("/login",loginUser)
userRouter.get("/",getUser)
userRouter.post("/email",sendSampleEmail)


export default userRouter