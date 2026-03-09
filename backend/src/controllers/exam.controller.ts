import { Response } from "express";
import { Exam } from "../models/exam.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { AuthRequest } from "../middlewares/auth.middleware.js";
import { generateInviteCode } from "../utils/generateInviteCode.js";

const createExam = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { title, description, timeLimit, passingScore, questions } = req.body;

  // 1. Authorization Check
  if (req.user?.role !== "educator") {
    throw new ApiError(403, "Only educators can create exams");
  }

  // 2. Validation
  if ([title, description].some((field) => field?.trim() === "")) {
    throw new ApiError(400, "Title and description are required");
  }

  // 3. Generate Unique Invite Code
  let inviteCode = generateInviteCode();
  let codeExists = await Exam.findOne({ inviteCode });

  // Simple collision check
  while (codeExists) {
    inviteCode = generateInviteCode();
    codeExists = await Exam.findOne({ inviteCode });
  }

  // 4. Create Exam
  const exam = await Exam.create({
    title,
    description,
    timeLimit,
    passingScore,
    questions,
    creator: req.user._id,
    inviteCode,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, exam, "Exam created successfully"));
});

// 2. Get all exams created by the logged-in educator
const getAllExamsByEducator = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const exams = await Exam.find({ creator: req.user?._id }).sort(
      "-createdAt",
    );

    return res
      .status(200)
      .json(new ApiResponse(200, exams, "Exams fetched successfully"));
  },
);

// 3. Get a single exam by its ID
const getExamDetails = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { examId } = req.params;

  const exam = await Exam.findById(examId);

  if (!exam) {
    throw new ApiError(404, "Exam not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, exam, "Exam details fetched successfully"));
});

const joinExam = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { inviteCode } = req.body;

  // 1. Basic Validation
  if (!inviteCode) {
    throw new ApiError(400, "Invite code is required");
  }

  // 2. Find the Exam
  const exam = await Exam.findOne({
    inviteCode: inviteCode.toUpperCase(),
    isActive: true,
  }).select("-questions.correctAnswer"); // CRITICAL: Hide answers from students!

  if (!exam) {
    throw new ApiError(404, "Invalid or inactive invite code");
  }

  // 3. Return Exam Details (Timer, Title, Questions without answers)
  return res
    .status(200)
    .json(new ApiResponse(200, exam, "Exam joined successfully. Good luck!"));
});

export { createExam, getAllExamsByEducator, getExamDetails, joinExam };
