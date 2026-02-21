import User from "../models/user.js";
import Otp from "../models/otp.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import dotenv from "dotenv";

dotenv.config();
async function sendViaResend({ to, subject, html }) {
  const from = process.env.RESEND_FROM ?? "Leonine Villa <onboarding@resend.dev>";

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from, to, subject, html }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(`Resend error ${res.status}: ${JSON.stringify(data)}`);
  }
  console.log("✅ Email sent via Resend. ID:", data.id, "| to:", to);
  return data;
}

// ─── Send OTP email ───────────────────────────────────────────────────────────
export async function sendOtpEmail(email, otp) {
  if (!email) {
    console.log("No email provided, skipping OTP email");
    return;
  }

  console.log("Sending OTP email to:", email, "| OTP:", otp);

  await sendViaResend({
    to: email,
    subject: "Your Leonine Villa Verification Code",
    html: `
      <div style="font-family: Georgia, serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #f7e8c8; border: 1px solid #d4b888;">
        <h2 style="color: #2c1810; text-align: center; font-size: 1.4rem; margin-bottom: 4px;">Leonine Villa Natura Resort</h2>
        <p style="text-align: center; color: #8b6030; font-style: italic; font-size: 0.8rem; margin-top: 0;">Sri Lanka</p>
        <hr style="border-color: #b8860b; margin: 16px 0;" />
        <p style="color: #5a3e2b; font-style: italic;">Dear Esteemed Guest,</p>
        <p style="color: #2c1810;">Your email verification code is:</p>
        <div style="text-align: center; margin: 28px 0;">
          <div style="display: inline-block; background: #2c1810; color: #f4e4c1; font-size: 2.2rem; font-weight: bold; letter-spacing: 0.5em; padding: 16px 32px; border-radius: 4px;">
            ${otp}
          </div>
        </div>
        <p style="color: #5a3e2b; font-size: 0.85rem; line-height: 1.6;">
          This code is valid for <strong>10 minutes</strong>. Please do not share it with anyone.
        </p>
        <hr style="border-color: #b8860b; margin: 20px 0 14px;" />
        <p style="color: #8b6030; font-size: 0.72rem; text-align: center; margin: 0;">
          Leonine Villa Natura Resort · Kandy, Sri Lanka<br/>
          If you did not request this code, please ignore this email.
        </p>
      </div>
    `,
  });
}

// ─── Send booking confirmation email ─────────────────────────────────────────
export async function sendBookingConfirmationEmail(toEmail, booking) {
  if (!toEmail) {
    console.log("No email provided, skipping booking confirmation email");
    return;
  }

  const { bookingId, roomId, start, end, notes, status } = booking;

  const formatDate = (d) =>
    new Date(d).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

  console.log("Sending booking confirmation to:", toEmail);

  await sendViaResend({
    to: toEmail,
    subject: `Your Leonine Villa Reservation — Ref. #${bookingId}`,
    html: `
      <div style="font-family: Georgia, serif; max-width: 520px; margin: 0 auto; padding: 36px; background: #f7e8c8; border: 1px solid #d4b888;">
        <h2 style="color: #2c1810; text-align: center; font-size: 1.5rem; letter-spacing: 0.06em; margin-bottom: 4px;">
          Leonine Villa Natura Resort
        </h2>
        <p style="text-align: center; color: #8b6030; font-style: italic; font-size: 0.82rem; margin-top: 0;">
          Kandy, Sri Lanka
        </p>
        <hr style="border-color: #b8860b; margin: 16px 0;" />

        <p style="color: #5a3e2b; font-style: italic; margin-bottom: 6px;">Dear Esteemed Guest,</p>
        <p style="color: #2c1810; line-height: 1.75; margin-bottom: 20px;">
          We are delighted to confirm that your reservation has been duly received at the estate.
          Our team shall correspond with you shortly to finalise the arrangements.
          Below are the particulars of your reservation:
        </p>

        <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px; font-size: 0.9rem;">
          <tr style="background: #ecd9a8;">
            <td colspan="2" style="padding: 10px 14px; color: #2c1810; font-weight: bold; font-size: 0.78rem; letter-spacing: 0.1em; text-transform: uppercase;">
              Reservation Details
            </td>
          </tr>
          <tr style="border-bottom: 1px solid #d4b88855;">
            <td style="padding: 10px 14px; color: #8b6030; font-style: italic; width: 40%;">Booking Reference</td>
            <td style="padding: 10px 14px; color: #2c1810; font-weight: bold;">#${bookingId}</td>
          </tr>
          <tr style="border-bottom: 1px solid #d4b88855; background: #f9f0d844;">
            <td style="padding: 10px 14px; color: #8b6030; font-style: italic;">Room Assigned</td>
            <td style="padding: 10px 14px; color: #2c1810;">${roomId}</td>
          </tr>
          <tr style="border-bottom: 1px solid #d4b88855;">
            <td style="padding: 10px 14px; color: #8b6030; font-style: italic;">Arrival</td>
            <td style="padding: 10px 14px; color: #2c1810;">${formatDate(start)}</td>
          </tr>
          <tr style="border-bottom: 1px solid #d4b88855; background: #f9f0d844;">
            <td style="padding: 10px 14px; color: #8b6030; font-style: italic;">Departure</td>
            <td style="padding: 10px 14px; color: #2c1810;">${formatDate(end)}</td>
          </tr>
          <tr style="border-bottom: 1px solid #d4b88855;">
            <td style="padding: 10px 14px; color: #8b6030; font-style: italic;">Status</td>
            <td style="padding: 10px 14px; color: #b8860b; font-weight: bold;">${status || "Pending"}</td>
          </tr>
          ${
            notes
              ? `<tr style="background: #f9f0d844;">
                  <td style="padding: 10px 14px; color: #8b6030; font-style: italic;">Notes</td>
                  <td style="padding: 10px 14px; color: #2c1810;">${notes}</td>
                </tr>`
              : ""
          }
        </table>

        <div style="background: #ecd9a822; border-left: 3px solid #b8860b; padding: 14px 16px; margin-bottom: 20px;">
          <p style="color: #5a3e2b; font-style: italic; font-size: 0.82rem; line-height: 1.75; margin: 0;">
            A deposit of <strong>30%</strong> will be requested upon confirmation of your reservation.<br/>
            Full cancellation is permitted up to <strong>7 days</strong> prior to your arrival date.
          </p>
        </div>

        <p style="color: #5a3e2b; font-style: italic; line-height: 1.75;">
          We look forward to welcoming you to Leonine Villa with the warmest anticipation.
        </p>
        <p style="color: #5a3e2b; font-style: italic;">
          Yours faithfully,<br/>
          <strong style="color: #2c1810;">The Estate of Leonine Villa</strong>
        </p>

        <hr style="border-color: #b8860b; margin: 20px 0 14px;" />
        <p style="color: #8b6030; font-size: 0.72rem; text-align: center; margin: 0;">
          Leonine Villa Natura Resort · Kandy, Sri Lanka<br/>
          This is an automated confirmation. Please do not reply to this email.
        </p>
      </div>
    `,
  });

  console.log("Booking confirmation email sent to:", toEmail);
}

// ─── Post User (Register) ─────────────────────────────────────────────────────
// KEY FIX: respond to the client IMMEDIATELY after saving user + OTP to DB.
// Then send the email in the background (fire-and-forget) so the user isn't
// blocked waiting for the SMTP round-trip.
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

    // Generate and save OTP
    const otp = Math.floor(1000 + Math.random() * 9000);
    await Otp.deleteMany({ email }); // clear any old OTPs first
    const newOtp = new Otp({ email, otp });
    await newOtp.save();

    // ✅ Respond IMMEDIATELY — don't wait for email
    res.status(201).json({
      message: "User created successfully, OTP sent to email",
    });

    // ✅ Send email in background AFTER responding (fire-and-forget)
    sendOtpEmail(email, otp).catch((emailErr) => {
      console.error("Background OTP email failed for", email, ":", emailErr.message);
    });

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

// ─── Login user ───────────────────────────────────────────────────────────────
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

    // ✅ Block login if email not verified
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

// ─── Role check helpers ───────────────────────────────────────────────────────
export function isAdminValid(req) {
  return !!(req.user && req.user.type === "admin");
}
export function isCustomerValid(req) {
  return !!(
    req.user &&
    (req.user.type === "customer" || req.user.type === "user")
  );
}

// ─── Get current user ─────────────────────────────────────────────────────────
export function getUser(req, res) {
  if (!req.user) return res.status(404).json({ message: "User not found" });
  res.status(200).json({ message: "User found", user: req.user });
}

// ─── Verify user email ────────────────────────────────────────────────────────
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
    console.error("Email verification error:", err);
    res
      .status(500)
      .json({ message: "Email verification failed", error: err.message });
  }
}

// ─── Resend OTP ───────────────────────────────────────────────────────────────
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

    // ✅ Respond immediately, send email in background
    res.status(200).json({ message: "OTP resent successfully" });

    sendOtpEmail(email, otp).catch((err) => {
      console.error("Background resend OTP email failed for", email, ":", err.message);
    });

  } catch (err) {
    console.error("Resend OTP error:", err);
    res
      .status(500)
      .json({ message: "Failed to resend OTP", error: err.message });
  }
}

// ─── Disable / enable user ────────────────────────────────────────────────────
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

// ─── Change user type ─────────────────────────────────────────────────────────
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

// ─── Get all users (paginated, admin only) ────────────────────────────────────
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

// ─── Delete user by ID ────────────────────────────────────────────────────────
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

// ─── Test email helper ────────────────────────────────────────────────────────
export async function testEmail(req, res) {
  try {
    await sendOtpEmail(process.env.EMAIL ?? "tharurathnasekara2001@gmail.com", 1234);
    res.json({ message: "Test email sent successfully via Resend" });
  } catch (err) {
    console.error("Test email error:", err);
    res.status(500).json({ message: "Test email failed", error: err.message });
  }
}