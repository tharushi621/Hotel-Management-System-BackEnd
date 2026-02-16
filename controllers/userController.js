import User from "../models/user.js";
import Otp from "../models/otp.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import nodemailer from "nodemailer";

dotenv.config();

/* ================= CREATE USER ================= */
export async function postUsers(req, res) {
  try {
    const user = req.body;
    const password = user.password;

    if (!password) {
      return res.status(400).json({ message: "Password is required" });
    }

    // Hash password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);
    user.password = passwordHash;

    // Save new user
    const newUser = new User(user);
    await newUser.save();

    // Generate OTP
    const otp = Math.floor(1000 + Math.random() * 9000);
    const newOtp = new Otp({ email: user.email, otp });
    await newOtp.save();

    // Send OTP email
    await sendOtpEmail(user.email, otp);

    res.status(201).json({ message: "User created successfully, OTP sent to email" });
  } catch (error) {
    console.log("Error creating user:", error);
    res.status(500).json({ message: "User creation failed", error: error.message });
  }
}

/* ================= LOGIN USER ================= */
export async function loginUser(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ message: "Email and password required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid)
      return res.status(403).json({ message: "Incorrect password" });

    const payload = {
      id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      type: user.type,
    };

    const token = jwt.sign(payload, process.env.JWT_KEY, { expiresIn: "48h" });

    res.json({ message: "Login successful", user, token });
  } catch (error) {
    console.log("Login error:", error);
    res.status(500).json({ message: "Login failed", error: error.message });
  }
}

/* ================= ROLE CHECKS ================= */
export function isAdminValid(req) {
  return req.user && req.user.type === "admin";
}

export function isCustomerValid(req) {
  return req.user && req.user.type === "customer";
}

/* ================= GET USER ================= */
export function getUser(req, res) {
  if (!req.user) return res.status(404).json({ message: "User not found" });
  res.status(200).json({ message: "User found", user: req.user });
}

/* ================= SEND OTP EMAIL ================= */
export async function sendOtpEmail(email, otp) {
  if (!email) {
    console.log("No email provided, skipping OTP email");
    return;
  }

  try {
    const transport = nodemailer.createTransport({
      service: "gmail",
      auth: { user: process.env.EMAIL, pass: process.env.PASSWORD },
    });

    const message = {
      from: process.env.EMAIL,
      to: email,
      subject: "Validating OTP",
      text: `Your OTP code is ${otp}`,
    };

    const info = await transport.sendMail(message);
    console.log("OTP email sent:", info.response);
  } catch (err) {
    console.log("Failed to send OTP email:", err);
  }
}

/* ================= VERIFY USER EMAIL ================= */
export async function verifyUserEmail(req, res) {
  try {
    const { email, otp } = req.body;

    if (!email || !otp)
      return res.status(400).json({ message: "Email and OTP are required" });

    const otpRecord = await Otp.findOne({ email }).sort({ date: -1 });

    if (!otpRecord) return res.status(400).json({ message: "OTP is invalid or expired" });

    if (otpRecord.otp != otp) return res.status(400).json({ message: "OTP is invalid" });

    await User.findOneAndUpdate({ email }, { emailVerified: true });
    await Otp.deleteOne({ _id: otpRecord._id });

    res.status(200).json({ message: "User email verified successfully" });
  } catch (err) {
    console.log("Email verification error:", err);
    res.status(500).json({ message: "Email verification failed", error: err.message });
  }
}

/* ================= DELETE USER ================= */
export async function deleteUserByEmail(req, res) {
  if (!isAdminValid(req)) return res.status(403).json({ message: "Forbidden" });

  try {
    const email = req.params.email;
    await User.findOneAndDelete({ email });
    res.json({ message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "User delete failed", error: err.message });
  }
}

/* ================= DISABLE/ENABLE USER ================= */
export async function disableUser(req, res) {
  if (!isAdminValid(req)) return res.status(403).json({ message: "Forbidden" });

  try {
    const userId = req.params.userId;
    const { disabled } = req.body;

    await User.findOneAndUpdate({ _id: userId }, { disabled });
    res.json({ message: "User disabled/enabled successfully" });
  } catch (err) {
    res.status(500).json({ message: "User disable/enable failed", error: err.message });
  }
}

/* ================= CHANGE USER TYPE ================= */
export async function changeUserType(req, res) {
  if (!isAdminValid(req)) return res.status(403).json({ message: "Forbidden" });

  try {
    const userId = req.params.userId;
    const { type } = req.body;

    await User.findOneAndUpdate({ _id: userId }, { type });
    res.json({ message: "User type updated successfully" });
  } catch (err) {
    res.status(500).json({ message: "User type update failed", error: err.message });
  }
}

/* ================= GET ALL USERS (PAGINATION) ================= */
export async function getAllUsers(req, res) {
  if (!isAdminValid(req)) {
    return res.status(403).json({ message: "Forbidden" });
  }

  try {
    // Use POST body if available, fallback to query params
    const page = parseInt(req.body.page || req.query.page) || 1;
    const limit = parseInt(req.body.limit || req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const totalUsers = await User.countDocuments();

    const users = await User.find()
      .select("-password")
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    res.json({
      message: "Users found",
      currentPage: page,
      pageSize: limit,
      totalUsers,
      totalPages: Math.ceil(totalUsers / limit),
      users
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to retrieve users", error: err.message });
  }
}
