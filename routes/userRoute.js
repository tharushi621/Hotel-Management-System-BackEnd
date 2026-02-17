import express from "express";
import {
  getAllUsers,
  postUsers,
  loginUser,
  getUser,
  deleteUserById, // updated
  disableUser,
  changeUserType,
  verifyUserEmail,
} from "../controllers/userController.js";
import { protect } from "../middleware/authMiddleware.js";

const userRouter = express.Router();

// Admin routes
userRouter.post("/all", protect, getAllUsers);
userRouter.delete("/admin-delete/:id", protect, deleteUserById);

// Other user routes
userRouter.post("/register", postUsers);
userRouter.post("/login", loginUser);
userRouter.get("/me", protect, getUser);
userRouter.post("/verify-email", verifyUserEmail);
userRouter.patch("/disable/:userId", protect, disableUser);
userRouter.patch("/type/:userId", protect, changeUserType);

export default userRouter;
