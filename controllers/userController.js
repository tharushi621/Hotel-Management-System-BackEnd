import User from "../models/user.js";
import Otp from "../models/otp.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import { Resend } from "resend"; // ⏸ EMAIL DISABLED — uncomment when ready

dotenv.config();

// ═══════════════════════════════════════════════════════════════════════
// EMAIL — currently disabled
// To re-enable: uncomment the Resend import above and the sendEmail
// function below, then uncomment the email calls in postUsers,
// resendOtp, and sendBookingConfirmationEmail
// ═══════════════════════════════════════════════════════════════════════

const resend = new Resend(process.env.RESEND_API_KEY);

async function sendEmail({ to, subject, html }) {
  if (!process.env.RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY is missing from environment variables");
  }
  const { data, error } = await resend.emails.send({
    from: "Leonine Villa <onboarding@resend.dev>",
    to,
    subject,
    html,
  });
  if (error) {
    console.error("Resend error:", error);
    throw new Error(error.message);
  }
  console.log(`✅ Email sent via Resend | to: ${to} | id: ${data.id}`);
  return data;
}

// ─── OTP Email Template ───────────────────────────────────────────────────────
export async function sendOtpEmail(toEmail, otp) {
  if (!toEmail) return;
  console.log(`📧 [EMAIL DISABLED] Would send OTP to: ${toEmail} | OTP: ${otp}`);

  // ⏸ EMAIL DISABLED — uncomment below when ready
  await sendEmail({
    to: toEmail,
    subject: "Your Leonine Villa Verification Code",
    html: `
      <div style="font-family:Georgia,serif;max-width:480px;margin:0 auto;padding:36px;
                  background:#f7e8c8;border:1px solid #d4b888;border-radius:4px;">
        <div style="text-align:center;margin-bottom:12px;">
          <h2 style="color:#2c1810;font-size:1.4rem;margin:0;letter-spacing:0.05em;">
            Leonine Villa Natura Resort
          </h2>
          <p style="color:#8b6030;font-style:italic;font-size:0.8rem;margin:4px 0 0;">
            Kandy, Sri Lanka
          </p>
        </div>
        <hr style="border:none;border-top:1px solid #b8860b;margin:16px 0;" />
        <p style="color:#5a3e2b;font-style:italic;margin-bottom:10px;">Dear Esteemed Guest,</p>
        <p style="color:#2c1810;margin-bottom:22px;line-height:1.6;">
          A verification seal has been prepared for your inscription at Leonine Villa.
          Please enter the code below to confirm your identity:
        </p>
        <div style="text-align:center;margin:28px 0;">
          <div style="display:inline-block;background:#2c1810;color:#f4e4c1;
                      font-size:2.8rem;font-weight:bold;letter-spacing:0.6em;
                      padding:20px 44px;border-radius:4px;
                      font-family:'Courier New',Courier,monospace;">
            ${otp}
          </div>
        </div>
        <p style="color:#5a3e2b;font-size:0.85rem;line-height:1.65;text-align:center;">
          This code is valid for <strong>10 minutes</strong>.<br/>
          Do not share it with anyone.
        </p>
        <hr style="border:none;border-top:1px solid #b8860b;margin:20px 0 14px;" />
        <p style="color:#8b6030;font-size:0.7rem;text-align:center;margin:0;">
          Leonine Villa Natura Resort &middot; Kandy, Sri Lanka<br/>
          If you did not request this code, please ignore this email.
        </p>
      </div>
    `,
  });
}

// ─── Booking Confirmation Email Template ──────────────────────────────────────
export async function sendBookingConfirmationEmail(toEmail, booking) {
  if (!toEmail) return;

  const { bookingId, roomId, start, end, notes, status } = booking;
  const fmt = (d) =>
    new Date(d).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

  console.log(`📧 [EMAIL DISABLED] Would send booking confirmation to: ${toEmail}`);

  // ⏸ EMAIL DISABLED — uncomment below when ready
  await sendEmail({
    to: toEmail,
    subject: `Your Leonine Villa Reservation — Ref. #${bookingId}`,
    html: `
      <div style="font-family:Georgia,serif;max-width:540px;margin:0 auto;padding:40px;
                  background:#f7e8c8;border:1px solid #d4b888;border-radius:4px;">
        <div style="text-align:center;margin-bottom:12px;">
          <h2 style="color:#2c1810;font-size:1.5rem;letter-spacing:0.05em;margin:0;">
            Leonine Villa Natura Resort
          </h2>
          <p style="color:#8b6030;font-style:italic;font-size:0.82rem;margin:4px 0 0;">
            Kandy, Sri Lanka
          </p>
        </div>
        <hr style="border:none;border-top:1px solid #b8860b;margin:16px 0;" />
        <p style="color:#5a3e2b;font-style:italic;margin-bottom:8px;">Dear Esteemed Guest,</p>
        <p style="color:#2c1810;line-height:1.75;margin-bottom:24px;">
          We are delighted to confirm that your reservation has been duly received at the estate.
          Our butler shall correspond with you shortly to finalise all arrangements.
        </p>
        <table style="width:100%;border-collapse:collapse;margin-bottom:24px;font-size:0.9rem;">
          <tr style="background:#e8d090;">
            <td colspan="2" style="padding:10px 16px;color:#2c1810;font-weight:bold;
                font-size:0.75rem;letter-spacing:0.14em;text-transform:uppercase;">
              Reservation Details
            </td>
          </tr>
          <tr style="border-bottom:1px solid #d4b88844;">
            <td style="padding:10px 16px;color:#8b6030;font-style:italic;width:42%;">
              Booking Reference
            </td>
            <td style="padding:10px 16px;color:#2c1810;font-weight:bold;">#${bookingId}</td>
          </tr>
          <tr style="border-bottom:1px solid #d4b88844;background:#f9f0d844;">
            <td style="padding:10px 16px;color:#8b6030;font-style:italic;">Room Assigned</td>
            <td style="padding:10px 16px;color:#2c1810;">${roomId}</td>
          </tr>
          <tr style="border-bottom:1px solid #d4b88844;">
            <td style="padding:10px 16px;color:#8b6030;font-style:italic;">Arrival</td>
            <td style="padding:10px 16px;color:#2c1810;">${fmt(start)}</td>
          </tr>
          <tr style="border-bottom:1px solid #d4b88844;background:#f9f0d844;">
            <td style="padding:10px 16px;color:#8b6030;font-style:italic;">Departure</td>
            <td style="padding:10px 16px;color:#2c1810;">${fmt(end)}</td>
          </tr>
          <tr style="border-bottom:1px solid #d4b88844;">
            <td style="padding:10px 16px;color:#8b6030;font-style:italic;">Status</td>
            <td style="padding:10px 16px;color:#b8860b;font-weight:bold;">${status || "Pending"}</td>
          </tr>
          ${notes ? `
          <tr style="background:#f9f0d844;">
            <td style="padding:10px 16px;color:#8b6030;font-style:italic;">Notes</td>
            <td style="padding:10px 16px;color:#2c1810;">${notes}</td>
          </tr>` : ""}
        </table>
        <div style="background:#f0e4c0;border-left:3px solid #b8860b;
                    padding:14px 18px;margin-bottom:24px;border-radius:2px;">
          <p style="color:#5a3e2b;font-style:italic;font-size:0.83rem;line-height:1.75;margin:0;">
            ✦ &nbsp;A deposit of <strong>30%</strong> will be requested upon confirmation.<br/>
            ✦ &nbsp;Full cancellation is permitted up to <strong>7 days</strong> prior to arrival.
          </p>
        </div>
        <p style="color:#5a3e2b;font-style:italic;line-height:1.75;margin-bottom:4px;">
          Yours faithfully,
        </p>
        <p style="color:#2c1810;font-weight:bold;margin:0;">The Estate of Leonine Villa</p>
        <hr style="border:none;border-top:1px solid #b8860b;margin:22px 0 14px;" />
        <p style="color:#8b6030;font-size:0.7rem;text-align:center;margin:0;">
          Leonine Villa Natura Resort &middot; Kandy, Sri Lanka<br/>
          This is an automated confirmation. Please do not reply to this email.
        </p>
      </div>
    `,
  });
}

// ─── Register User ────────────────────────────────────────────────────────────
export async function postUsers(req, res) {
  try {
    const { firstName, lastName, email, password, phone, whatsApp, type } = req.body;

    if (!firstName || !lastName || !email || !password || !phone || !whatsApp) {
      return res.status(400).json({ message: "All fields are required." });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters." });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ message: "This email is already registered." });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const newUser = new User({
      firstName, lastName, email,
      password: passwordHash,
      phone, whatsApp,
      type: type || "user",
      disabled: false,
      emailVerified: false,
    });
    await newUser.save();

    // ✅ OTP is saved to DB — user can verify by checking MongoDB or Render logs
    await Otp.deleteMany({ email });
    const otp = Math.floor(1000 + Math.random() * 9000);
    await new Otp({ email, otp }).save();
    console.log(`🔑 OTP saved for ${email}: ${otp}`); // check Render logs for OTP

    res.status(201).json({ message: "User created successfully, OTP sent to email" });

    // ⏸ EMAIL DISABLED — uncomment when ready
    // sendOtpEmail(email, otp).catch((err) => {
    //   console.error(`❌ OTP email failed for ${email}:`, err.message);
    // });

  } catch (error) {
    console.error("Register error:", error);
    if (error.code === 11000) {
      return res.status(409).json({ message: "This email is already registered." });
    }
    res.status(500).json({ message: "User creation failed", error: error.message });
  }
}

// ─── Login User ───────────────────────────────────────────────────────────────
export async function loginUser(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: "Email and password required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.disabled)
      return res.status(403).json({ message: "This account has been disabled." });

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid)
      return res.status(403).json({ message: "Incorrect password" });

    if (!user.emailVerified) {
      return res.status(403).json({
        message: "Your email is not yet verified. Please confirm your OTP before signing in.",
      });
    }

    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        type: user.type,
      },
      process.env.JWT_KEY,
      { expiresIn: "48h" }
    );

    const { password: _pw, ...safeUser } = user.toObject();
    res.json({ message: "Login successful", user: safeUser, token });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Login failed", error: error.message });
  }
}

// ─── Role helpers ─────────────────────────────────────────────────────────────
export function isAdminValid(req) {
  return !!(req.user && req.user.type === "admin");
}
export function isCustomerValid(req) {
  return !!(req.user && (req.user.type === "customer" || req.user.type === "user"));
}

// ─── Get current user ─────────────────────────────────────────────────────────
export function getUser(req, res) {
  if (!req.user) return res.status(404).json({ message: "User not found" });
  res.status(200).json({ message: "User found", user: req.user });
}

//  ─── Verify Email (OTP check) ─────────────────────────────────────────────────
export async function verifyUserEmail(req, res) {
  try {
    const { email, otp } = req.body;
    if (!email || !otp)
      return res.status(400).json({ message: "Email and OTP are required" });

    const otpRecord = await Otp.findOne({ email }).sort({ createdAt: -1 });
    if (!otpRecord)
      return res.status(400).json({ message: "OTP is invalid or expired" });

    if (String(otpRecord.otp) !== String(otp))
      return res.status(400).json({ message: "OTP is invalid" });

    await User.findOneAndUpdate({ email }, { emailVerified: true });
    await Otp.deleteOne({ _id: otpRecord._id });

    res.status(200).json({ message: "User email verified successfully" });
  } catch (err) {
    console.error("Verify email error:", err);
    res.status(500).json({ message: "Email verification failed", error: err.message });
  }
}

// // ─── Resend OTP ───────────────────────────────────────────────────────────────
export async function resendOtp(req, res) {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.emailVerified)
      return res.status(400).json({ message: "Email is already verified." });

    await Otp.deleteMany({ email });
    const otp = Math.floor(1000 + Math.random() * 9000);
    await new Otp({ email, otp }).save();
    console.log(`🔑 OTP resaved for ${email}: ${otp}`); // check Render logs for OTP

    res.status(200).json({ message: "OTP resent successfully" });

    // ⏸ EMAIL DISABLED — uncomment when ready
    sendOtpEmail(email, otp).catch((err) => {
      console.error(`❌ Resend OTP email failed for ${email}:`, err.message);
    });

  } catch (err) {
    console.error("Resend OTP error:", err);
    res.status(500).json({ message: "Failed to resend OTP", error: err.message });
  }
}

// ─── Disable / Enable User ────────────────────────────────────────────────────
export async function disableUser(req, res) {
  if (!isAdminValid(req)) return res.status(403).json({ message: "Forbidden" });
  try {
    await User.findOneAndUpdate({ _id: req.params.userId }, { disabled: req.body.disabled });
    res.json({ message: "User disabled/enabled successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed", error: err.message });
  }
}

// ─── Change User Type ─────────────────────────────────────────────────────────
export async function changeUserType(req, res) {
  if (!isAdminValid(req)) return res.status(403).json({ message: "Forbidden" });
  try {
    await User.findOneAndUpdate({ _id: req.params.userId }, { type: req.body.type });
    res.json({ message: "User type updated successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed", error: err.message });
  }
}

// ─── Get All Users (Admin, paginated) ────────────────────────────────────────
export async function getAllUsers(req, res) {
  if (!isAdminValid(req))
    return res.status(403).json({ message: "Forbidden: admin access required" });
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
    res.status(500).json({ message: "Failed to retrieve users", error: err.message });
  }
}

// ─── Delete User ──────────────────────────────────────────────────────────────
export async function deleteUserById(req, res) {
  if (!isAdminValid(req))
    return res.status(403).json({ message: "Forbidden: admin access required" });
  try {
    const deleted = await User.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "User not found" });
    res.json({ message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed", error: err.message });
  }
}

// ─── Test Email Route — GET /api/users/test-email ─────────────────────────────
export async function testEmail(req, res) {
  res.json({
    message: "⏸ Email is currently disabled. Uncomment email code in userController.js to enable.",
  });
}