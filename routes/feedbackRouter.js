import express from "express";
import { createFeedback,getAllFeedbacks,getMyFeedbacks,deleteFeedback,updateFeedbackStatus } from "../controllers/feedbackController.js";

const feedbackRouter = express.Router();

feedbackRouter.post("/", createFeedback);
feedbackRouter.get("/", getAllFeedbacks);
feedbackRouter.get("/my", getMyFeedbacks);
feedbackRouter.delete("/:id", deleteFeedback);
feedbackRouter.put("/:id/status", updateFeedbackStatus);

export default feedbackRouter;
