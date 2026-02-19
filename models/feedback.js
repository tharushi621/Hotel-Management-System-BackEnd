import mongoose from "mongoose";

const feedbackSchema = mongoose.Schema({
  bookingId: {
    type: Number,
    required: true,
  },
  roomId: {
    type: Number,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  comment: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    default: "Visible",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Feedback = mongoose.model("Feedbacks", feedbackSchema);
export default Feedback;
