import jwt from "jsonwebtoken";
import User from "../models/user.js";
import dotenv from "dotenv";
dotenv.config();

export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_KEY);
      req.user = await User.findById(decoded.id).select("-password");
      return next(); // ✅ FIX: Added return to prevent fall-through to !token check
    } catch (err) {
      console.error(err);
      return res.status(401).json({ message: "Not authorized, token failed" }); // ✅ FIX: Added return
    }
  }

  if (!token) {
    return res.status(401).json({ message: "Not authorized, no token" });
  }
};