import express from "express";
import {
  createFeedback,
  getAllFeedbacks,
  getMyFeedbacks,
  deleteFeedback,
  updateFeedbackStatus
} from "../controllers/feedbackController.js";
import { protect } from "../middleware/authMiddleware.js";

const feedbackRouter = express.Router();

// Customer routes (requires login)
feedbackRouter.post("/", protect, createFeedback);
feedbackRouter.get("/my", protect, getMyFeedbacks);

// Admin routes (requires login + admin)
feedbackRouter.get("/", protect, getAllFeedbacks);
feedbackRouter.delete("/:id", protect, deleteFeedback);
feedbackRouter.put("/:id/status", protect, updateFeedbackStatus);

export default feedbackRouter;
