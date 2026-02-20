import User from "../models/user.js";
import Otp from "../models/otp.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import nodemailer from "nodemailer";

dotenv.config();

//Send OTP email
export async function sendOtpEmail(email, otp) {
  if (!email) {
    console.log("No email provided, skipping OTP email");
    return;
  }

  console.log("Attempting to send OTP email to:", email);
  console.log("Using EMAIL:", process.env.EMAIL);
  console.log("EMAIL_PASS set:", !!process.env.EMAIL_PASS);

  const transport = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL,
      pass: process.env.EMAIL_PASS,
    },
  });

  const message = {
    from: `"Leonine Villa" <${process.env.EMAIL}>`,
    to: email,
    subject: "Your Leonine Villa Verification Code",
    html: `
      <div style="font-family: Georgia, serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #f7e8c8; border: 1px solid #d4b888;">
        <h2 style="color: #2c1810; text-align: center; font-size: 1.4rem;">Leonine Villa Natura Resort</h2>
        <hr style="border-color: #b8860b; margin: 16px 0;" />
        <p style="color: #5a3e2b; font-style: italic;">Dear Esteemed Guest,</p>
        <p style="color: #2c1810;">Your verification code is:</p>
        <div style="text-align: center; margin: 24px 0;">
          <span style="font-size: 2.5rem; font-weight: bold; color: #8b1a1a; letter-spacing: 0.4em;">${otp}</span>
        </div>
        <p style="color: #5a3e2b; font-size: 0.85rem;">This code is valid for a limited time. Do not share it with anyone.</p>
        <hr style="border-color: #b8860b; margin: 16px 0;" />
        <p style="color: #8b6030; font-size: 0.75rem; text-align: center;">Leonine Villa Natura Resort · Sri Lanka</p>
      </div>
    `,
  };

  const info = await transport.sendMail(message);
  console.log("OTP email sent successfully:", info.response);
}

//Post User
export async function postUsers(req, res) {
  try {
    const { firstName, lastName, email, password, phone, whatsApp, type } =
      req.body;

    if (!firstName || !lastName || !email || !password || !phone || !whatsApp) {
      return res.status(400).json({
        message:
          "All fields are required: firstName, lastName, email, password, phone, whatsApp",
      });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters." });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res
        .status(409)
        .json({ message: "This email is already registered." });
    }

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    const newUser = new User({
      firstName,
      lastName,
      email,
      password: passwordHash,
      phone,
      whatsApp,
      type: type || "user",
      disabled: false,
      emailVerified: false,
    });

    await newUser.save();

    const otp = Math.floor(1000 + Math.random() * 9000);
    const newOtp = new Otp({ email, otp });
    await newOtp.save();

    // Await email so errors are visible in logs
    try {
      await sendOtpEmail(email, otp);
    } catch (emailErr) {
      console.error("OTP email failed:", emailErr.message);
    }

    res
      .status(201)
      .json({ message: "User created successfully, OTP sent to email" });
  } catch (error) {
    console.error("Error creating user:", error);
    if (error.code === 11000) {
      return res
        .status(409)
        .json({ message: "This email is already registered." });
    }
    res
      .status(500)
      .json({ message: "User creation failed", error: error.message });
  }
}

//Login user
export async function loginUser(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ message: "Email and password required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.disabled)
      return res
        .status(403)
        .json({ message: "This account has been disabled." });

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid)
      return res.status(403).json({ message: "Incorrect password" });

    if (!user.emailVerified) {
      return res.status(403).json({
        message:
          "Your email is not yet verified. Please confirm your OTP before signing in.",
      });
    }

    const payload = {
      id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      type: user.type,
    };

    const token = jwt.sign(payload, process.env.JWT_KEY, { expiresIn: "48h" });

    const { password: _pw, ...safeUser } = user.toObject();
    res.json({ message: "Login successful", user: safeUser, token });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Login failed", error: error.message });
  }
}

//Role check
export function isAdminValid(req) {
  return !!(req.user && req.user.type === "admin");
}
export function isCustomerValid(req) {
  return !!(
    req.user &&
    (req.user.type === "customer" || req.user.type === "user")
  );
}

//Get current user
export function getUser(req, res) {
  if (!req.user) return res.status(404).json({ message: "User not found" });
  res.status(200).json({ message: "User found", user: req.user });
}

//Verify user email
export async function verifyUserEmail(req, res) {
  try {
    const { email, otp } = req.body;

    if (!email || !otp)
      return res.status(400).json({ message: "Email and OTP are required" });

    const otpRecord = await Otp.findOne({ email }).sort({ createdAt: -1 });

    if (!otpRecord)
      return res.status(400).json({ message: "OTP is invalid or expired" });

    if (otpRecord.otp != otp)
      return res.status(400).json({ message: "OTP is invalid" });

    await User.findOneAndUpdate({ email }, { emailVerified: true });
    await Otp.deleteOne({ _id: otpRecord._id });

    res.status(200).json({ message: "User email verified successfully" });
  } catch (err) {
    console.error("Email verification error:", err);
    res
      .status(500)
      .json({ message: "Email verification failed", error: err.message });
  }
}

//Resend OTP
export async function resendOtp(req, res) {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.emailVerified) {
      return res.status(400).json({ message: "Email is already verified." });
    }

    await Otp.deleteMany({ email });

    const otp = Math.floor(1000 + Math.random() * 9000);
    const newOtp = new Otp({ email, otp });
    await newOtp.save();

    await sendOtpEmail(email, otp);

    res.status(200).json({ message: "OTP resent successfully" });
  } catch (err) {
    console.error("Resend OTP error:", err);
    res
      .status(500)
      .json({ message: "Failed to resend OTP", error: err.message });
  }
}

//Disable/enable user
export async function disableUser(req, res) {
  if (!isAdminValid(req)) return res.status(403).json({ message: "Forbidden" });

  try {
    const { userId } = req.params;
    const { disabled } = req.body;
    await User.findOneAndUpdate({ _id: userId }, { disabled });
    res.json({ message: "User disabled/enabled successfully" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "User disable/enable failed", error: err.message });
  }
}

//Change the user type
export async function changeUserType(req, res) {
  if (!isAdminValid(req)) return res.status(403).json({ message: "Forbidden" });

  try {
    const { userId } = req.params;
    const { type } = req.body;
    await User.findOneAndUpdate({ _id: userId }, { type });
    res.json({ message: "User type updated successfully" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "User type update failed", error: err.message });
  }
}

// Get all users (Pagination) - Admin only
export async function getAllUsers(req, res) {
  if (!isAdminValid(req)) {
    return res
      .status(403)
      .json({ message: "Forbidden: admin access required" });
  }

  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
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
      users,
    });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to retrieve users", error: err.message });
  }
}

//Delete user by ID
export async function deleteUserById(req, res) {
  if (!isAdminValid(req))
    return res
      .status(403)
      .json({ message: "Forbidden: admin access required" });

  try {
    const userId = req.params.id;
    const deleted = await User.findByIdAndDelete(userId);
    if (!deleted) return res.status(404).json({ message: "User not found" });
    res.json({ message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "User delete failed", error: err.message });
  }
}

// Temporary test route helper — call via GET /api/users/test-email
export async function testEmail(req, res) {
  try {
    await sendOtpEmail(process.env.EMAIL, 9999);
    res.json({ message: "Test email sent successfully to " + process.env.EMAIL });
  } catch (err) {
    res.status(500).json({ message: "Test email failed", error: err.message });
  }
}