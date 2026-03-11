import { Response } from "express";
import { Attempt } from "../models/attempt.model.js";
import { Exam } from "../models/exam.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { AuthRequest } from "../middlewares/auth.middleware.js";

const startAttempt = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { examId } = req.body;

  // 1. Check if exam exists
  const exam = await Exam.findById(examId);
  if (!exam) {
    throw new ApiError(404, "Exam not found");
  }

  // 2. Handle existing attempts (The Resume Logic & Time Check)
  const existingAttempt = await Attempt.findOne({
    examId,
    studentId: req.user?._id,
  });

  if (existingAttempt) {
    if (existingAttempt.status === "started") {
      // --- NEW STRICT TIME CHECK ---
      const attemptStartTime = new Date(existingAttempt.createdAt).getTime();
      const currentTime = new Date().getTime();
      const elapsedMinutes = (currentTime - attemptStartTime) / (1000 * 60);

      // If they exceeded the time limit (plus a tiny 1-minute grace period for loading)
      if (elapsedMinutes > exam.timeLimit + 1) {
        // Auto-close the exam in the database
        existingAttempt.status = "submitted";
        existingAttempt.endTime = new Date();
        await existingAttempt.save();

        throw new ApiError(
          400,
          "Exam time has expired. Your session has been locked.",
        );
      }

      // If they are still within the time limit, let them resume
      return res
        .status(200)
        .json(
          new ApiResponse(200, existingAttempt, "Resuming your exam session"),
        );
    }

    // If they already submitted or got flagged, block them
    throw new ApiError(
      400,
      "You have already completed or been locked out of this exam",
    );
  }

  // 3. Initialize a new attempt
  const attempt = await Attempt.create({
    examId,
    studentId: req.user?._id,
    status: "started",
  });

  return res
    .status(201)
    .json(new ApiResponse(201, attempt, "Exam attempt started"));
});

const saveAnswer = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { attemptId } = req.params;
  const { questionId, selectedOption } = req.body;

  if (!questionId || !selectedOption) {
    throw new ApiError(400, "Question ID and selected option are required");
  }

  const attempt = await Attempt.findOne({
    _id: attemptId,
    studentId: req.user?._id,
  });

  if (!attempt) throw new ApiError(404, "Attempt not found");

  // 1. Block if it's completely submitted
  if (attempt.status === "submitted") {
    throw new ApiError(
      400,
      "Cannot save answers. This exam is already submitted.",
    );
  }

  // 2. NEW: Fetch Exam and enforce the strict Time Check
  const exam = await Exam.findById(attempt.examId);
  if (!exam) throw new ApiError(404, "Associated exam not found");

  const rawCreatedAt = attempt.get("createdAt");
  const attemptStartTime = new Date(rawCreatedAt).getTime();
  const currentTime = new Date().getTime();
  const elapsedMinutes = (currentTime - attemptStartTime) / (1000 * 60);

  if (elapsedMinutes > exam.timeLimit + 1) {
    // If they ran out of time, lock the exam down permanently
    attempt.status = attempt.status === "flagged" ? "flagged" : "submitted";
    attempt.endTime = new Date();
    await attempt.save();

    throw new ApiError(
      400,
      "Time has expired! No further answers can be saved.",
    );
  }

  // 3. Update or Add the answer
  const existingAnswerIndex = attempt.answers.findIndex(
    (ans) => ans.questionId === questionId,
  );

  if (existingAnswerIndex !== -1) {
    attempt.answers[existingAnswerIndex].selectedOption = selectedOption;
  } else {
    attempt.answers.push({ questionId, selectedOption });
  }

  await attempt.save();

  return res
    .status(200)
    .json(new ApiResponse(200, attempt.answers, "Answer saved successfully"));
});

const submitAttempt = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { attemptId } = req.params;

  const attempt = await Attempt.findOne({
    _id: attemptId,
    studentId: req.user?._id,
  });

  if (!attempt) throw new ApiError(404, "Attempt not found");

  // 1. Prevent double-submissions, but ALLOW "flagged" cheaters to submit
  if (attempt.status === "submitted") {
    throw new ApiError(400, "This exam has already been submitted");
  }

  const exam = await Exam.findById(attempt.examId);
  if (!exam) throw new ApiError(404, "Associated exam not found");

  // 2. The Auto-Grader Logic
  let calculatedScore = 0;

  attempt.answers.forEach((studentAnswer) => {
    const actualQuestion = exam.questions.find(
      (q) => q._id?.toString() === studentAnswer.questionId.toString(),
    );

    if (
      actualQuestion &&
      actualQuestion.correctAnswer === studentAnswer.selectedOption
    ) {
      calculatedScore += actualQuestion.marks;
    }
  });

  // 3. Finalize the Attempt
  attempt.score = calculatedScore;

  // CRITICAL: If they were flagged, keep them flagged! Otherwise, mark submitted.
  attempt.status = attempt.status === "flagged" ? "flagged" : "submitted";
  attempt.endTime = new Date();

  await attempt.save();

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { score: calculatedScore, status: attempt.status },
        `Exam submitted! Your score: ${calculatedScore}`,
      ),
    );
});

const updateTelemetry = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { attemptId } = req.params;

    // 1. Find the Attempt
    const attempt = await Attempt.findOne({
      _id: attemptId,
      studentId: req.user?._id,
    });

    if (!attempt) {
      throw new ApiError(404, "Attempt not found");
    }

    // Don't log tab switches if the exam is already over
    if (attempt.status === "submitted") {
      throw new ApiError(400, "Exam already submitted");
    }

    // 2. Increment the warning count
    attempt.tabSwitchCount += 1;

    // 3. The "ProctoGuard" Rule: Flag if they tab out 3 times
    const MAX_WARNINGS = 3;

    if (attempt.tabSwitchCount >= MAX_WARNINGS) {
      attempt.status = "flagged";
    }

    await attempt.save();

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { tabSwitchCount: attempt.tabSwitchCount, status: attempt.status },
          attempt.status === "flagged"
            ? "Exam flagged for suspicious activity!"
            : "Warning recorded. Please stay on the exam tab.",
        ),
      );
  },
);

export { startAttempt, saveAnswer, submitAttempt, updateTelemetry };
