import express from "express";
import { 
  postUsers,
  loginUser,
  getUser,
  verifyUserEmail,
  deleteUserByEmail,
  disableUser,
  changeUserType,
  getAllUsers
} from "../controllers/userController.js";

const userRouter = express.Router();

// User routes
userRouter.post("/", postUsers);
userRouter.post("/login", loginUser);
userRouter.get("/", getUser);
userRouter.post("/all", getAllUsers); // POST allows page & limit in body
userRouter.put("/change-type/:userId", changeUserType);
userRouter.put("/disable/:userId", disableUser);
userRouter.delete("/admin-delete/:email", deleteUserByEmail);
userRouter.post("/verify-email", verifyUserEmail);

export default userRouter;
