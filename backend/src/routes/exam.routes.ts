import { Router } from "express";
import {
  createExam,
  getAllExamsByEducator,
  getExamDetails,
  joinExam,
} from "../controllers/exam.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// Secure all exam routes with JWT
router.use(verifyJWT);

router.route("/create-exam").post(createExam);
router.route("/my-exams").get(getAllExamsByEducator);
router.route("/:examId").get(getExamDetails);

// New Student route
router.route("/join").post(joinExam);

export default router;
