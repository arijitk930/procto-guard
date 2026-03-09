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

  // 2. Prevent multiple attempts (Basic logic)
  const existingAttempt = await Attempt.findOne({
    examId,
    studentId: req.user?._id,
  });

  if (existingAttempt) {
    throw new ApiError(400, "You have already started or completed this exam");
  }

  // 3. Initialize the attempt
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

  // 1. Validate input
  if (!questionId || !selectedOption) {
    throw new ApiError(400, "Question ID and selected option are required");
  }

  // 2. Find the attempt and verify ownership
  const attempt = await Attempt.findOne({
    _id: attemptId,
    studentId: req.user?._id,
  });

  if (!attempt) {
    throw new ApiError(404, "Attempt not found");
  }

  // 3. Ensure the exam is still active
  if (attempt.status !== "started") {
    throw new ApiError(
      400,
      "Cannot save answers. This attempt is already submitted or flagged.",
    );
  }

  // 4. Update or Add the answer
  const existingAnswerIndex = attempt.answers.findIndex(
    (ans) => ans.questionId === questionId,
  );

  if (existingAnswerIndex !== -1) {
    // If they already answered this question, update their choice
    attempt.answers[existingAnswerIndex].selectedOption = selectedOption;
  } else {
    // If it's a new question, add it to the array
    attempt.answers.push({ questionId, selectedOption });
  }

  await attempt.save();

  return res
    .status(200)
    .json(new ApiResponse(200, attempt.answers, "Answer saved successfully"));
});

const submitAttempt = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { attemptId } = req.params;

  // 1. Find the Attempt
  const attempt = await Attempt.findOne({
    _id: attemptId,
    studentId: req.user?._id,
  });

  if (!attempt) {
    throw new ApiError(404, "Attempt not found");
  }

  // Prevent double-submissions
  if (attempt.status !== "started") {
    throw new ApiError(400, "This exam has already been submitted");
  }

  // 2. Fetch the original Exam to get the answer key
  const exam = await Exam.findById(attempt.examId);
  if (!exam) {
    throw new ApiError(404, "Associated exam not found");
  }

  // 3. The Auto-Grader Logic
  let calculatedScore = 0;

  // Loop through every answer the student saved
  attempt.answers.forEach((studentAnswer) => {
    // Find the matching question in the exam
    const actualQuestion = exam.questions.find(
      (q) => q._id?.toString() === studentAnswer.questionId.toString(),
    );

    // If the question exists and the answer matches exactly
    if (
      actualQuestion &&
      actualQuestion.correctAnswer === studentAnswer.selectedOption
    ) {
      calculatedScore += actualQuestion.marks; // Add the specific marks for this question
    }
  });

  // 4. Finalize the Attempt
  attempt.score = calculatedScore;
  attempt.status = "submitted";
  attempt.endTime = new Date(); // Logs exactly when they finished

  await attempt.save();

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        attempt,
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
