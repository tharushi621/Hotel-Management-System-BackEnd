import express from "express";
import {
  getAllUsers,
  postUsers,
  loginUser,
  getUser,
  deleteUserById,
  disableUser,
  changeUserType,
  verifyUserEmail,
  resendOtp,
  forgotPassword,
  resetPassword,
  testEmail,
} from "../controllers/userController.js";
import { protect } from "../middleware/authMiddleware.js";

const userRouter = express.Router();

// Admin Routes
userRouter.get("/all", protect, getAllUsers);
userRouter.delete("/delete/:id", protect, deleteUserById);
userRouter.patch("/disable/:userId", protect, disableUser);
userRouter.patch("/type/:userId", protect, changeUserType);

// Public / User Routes
userRouter.post("/register", postUsers);
userRouter.post("/login", loginUser);
userRouter.post("/verify-email", verifyUserEmail);
userRouter.post("/resend-otp", resendOtp);
userRouter.post("/forgot-password", forgotPassword);
userRouter.post("/reset-password", resetPassword);
userRouter.get("/me", protect, getUser);
userRouter.get("/test-email", testEmail);

export default userRouter;