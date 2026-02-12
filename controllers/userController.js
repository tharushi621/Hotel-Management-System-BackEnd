import User from "../models/user.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import dotenv from "dotenv";

dotenv.config();

/* ================= CREATE USER ================= */
export function postUsers(req, res) {
  const user = req.body;
  const password = req.body.password;

  if (!password) {
    return res.status(400).json({
      message: "Password is required",
    });
  }

  const saltRounds = 10;

  bcrypt.hash(password, saltRounds)
    .then((passwordHash) => {
      user.password = passwordHash;

      const newUser = new User(user);

      return newUser.save();
    })
    .then(() => {
      res.status(201).json({
        message: "User created successfully",
      });
    })
    .catch((error) => {
      console.log(error);
      res.status(500).json({
        message: "User creation failed",
      });
    });
}

/* ================= LOGIN USER ================= */
export function loginUser(req, res) {
  const credentials = req.body;

  if (!credentials.email || !credentials.password) {
    return res.status(400).json({
      message: "Email and password required",
    });
  }

  User.findOne({ email: credentials.email })
    .then((user) => {
      if (!user) {
        return res.status(404).json({
          message: "User not found",
        });
      }

      bcrypt.compare(credentials.password, user.password)
        .then((isPasswordValid) => {
          if (!isPasswordValid) {
            return res.status(403).json({
              message: "Incorrect password",
            });
          }

          const payload = {
            id: user._id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            type: user.type,
          };

          const token = jwt.sign(payload, process.env.JWT_KEY, {
            expiresIn: "48h",
          });

          res.json({
            message: "Login successful",
            user: user,
            token: token,
          });
        })
        .catch((error) => {
          console.log(error);
          res.status(500).json({
            message: "Password check failed",
          });
        });
    })
    .catch((error) => {
      console.log(error);
      res.status(500).json({
        message: "Login failed",
      });
    });
}

/* ================= ROLE CHECKS ================= */
export function isAdminValid(req) {
  if (!req.user) return false;
  if (req.user.type !== "admin") return false;
  return true;
}

export function isCustomerValid(req) {
  if (!req.user) return false;
  if (req.user.type !== "customer") return false;
  return true;
}

/* ================= GET USER ================= */
export function getUser(req, res) {
  if (!req.user) {
    return res.status(404).json({
      message: "User not found",
    });
  }

  res.status(200).json({
    message: "User found",
    user: req.user,
  });
}
