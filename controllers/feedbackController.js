import Feedback from "../models/feedback.js";
import Booking from "../models/booking.js";
import { isCustomerValid } from "./userController.js";

//Create Feedback (Customer)
export async function createFeedback(req, res) {
  try {
    if (!req.user)
      return res.status(401).json({ message: "Unauthorized: Please login" });
    if (!isCustomerValid(req))
      return res.status(403).json({ message: "Forbidden" });

    const { bookingId, rating, comment } = req.body;

    const booking = await Booking.findOne({
      bookingId,
      email: req.user.email,
    });

    if (!booking) {
      return res
        .status(404)
        .json({ message: "Booking not found or not authorized" });
    }

    const existingFeedback = await Feedback.findOne({ bookingId });
    if (existingFeedback) {
      return res
        .status(400)
        .json({ message: "Feedback already submitted for this booking" });
    }

    const newFeedback = new Feedback({
      bookingId,
      roomId: booking.roomId,
      email: req.user.email,
      rating,
      comment,
    });

    const result = await newFeedback.save();
    return res
      .status(201)
      .json({ message: "Feedback submitted successfully", result });
  } catch (err) {
    return res.status(500).json({
      message: "Failed to submit feedback",
      error: err.message || err,
    });
  }
}

//Get PUBLIC visible feedbacks
export async function getPublicFeedbacks(req, res) {
  try {
    const feedbacks = await Feedback.find({ status: "Visible" })
      .select("comment rating email status createdAt")
      .sort({ createdAt: -1 })
      .limit(20);
    return res
      .status(200)
      .json({ message: "Public Feedbacks", result: feedbacks });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Failed to get feedbacks", error: err.message || err });
  }
}

//Get all feedback (Admin)
export async function getAllFeedbacks(req, res) {
  try {
    if (!req.user)
      return res.status(401).json({ message: "Unauthorized: Please login" });
    if (req.user.type !== "admin")
      return res.status(403).json({ message: "Forbidden" });

    const feedbacks = await Feedback.find();
    return res
      .status(200)
      .json({ message: "All Feedbacks", result: feedbacks });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Failed to get feedbacks", error: err.message || err });
  }
}

//Get my feedbacks (Customer)
export async function getMyFeedbacks(req, res) {
  try {
    if (!req.user)
      return res.status(401).json({ message: "Unauthorized: Please login" });
    if (!isCustomerValid(req))
      return res.status(403).json({ message: "Forbidden" });

    const feedbacks = await Feedback.find({ email: req.user.email });
    return res.status(200).json({ message: "My Feedbacks", result: feedbacks });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Failed to get feedbacks", error: err.message || err });
  }
}

//Delete feedback (Admin)
export async function deleteFeedback(req, res) {
  try {
    if (!req.user)
      return res.status(401).json({ message: "Unauthorized: Please login" });
    if (req.user.type !== "admin")
      return res.status(403).json({ message: "Forbidden" });

    const deleted = await Feedback.findByIdAndDelete(req.params.id);
    if (!deleted)
      return res.status(404).json({ message: "Feedback not found" });

    return res
      .status(200)
      .json({ message: "Feedback deleted successfully", result: deleted });
  } catch (err) {
    return res.status(500).json({
      message: "Failed to delete feedback",
      error: err.message || err,
    });
  }
}

//Update feedback status (Admin)
export async function updateFeedbackStatus(req, res) {
  try {
    if (!req.user)
      return res.status(401).json({ message: "Unauthorized: Please login" });
    if (req.user.type !== "admin")
      return res.status(403).json({ message: "Forbidden" });

    const { status } = req.body;
    const updated = await Feedback.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true },
    );
    return res
      .status(200)
      .json({ message: "Feedback status updated", result: updated });
  } catch (err) {
    return res.status(500).json({
      message: "Failed to update feedback",
      error: err.message || err,
    });
  }
}
