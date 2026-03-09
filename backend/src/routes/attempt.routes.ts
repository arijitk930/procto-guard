import { Router } from "express";
import {
  saveAnswer,
  startAttempt,
  submitAttempt,
  updateTelemetry,
} from "../controllers/attempt.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// Secure all attempt routes with JWT
router.use(verifyJWT);

// Route to start an exam attempt
router.route("/start").post(startAttempt);
router.route("/:attemptId/answer").patch(saveAnswer);
router.route("/:attemptId/submit").post(submitAttempt);
router.route("/:attemptId/telemetry").patch(updateTelemetry);

export default router;
