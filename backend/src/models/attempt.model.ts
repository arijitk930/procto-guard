import mongoose, { Schema, Document, Types } from "mongoose";

export interface IAttempt extends Document {
  examId: Types.ObjectId;
  studentId: Types.ObjectId;
  answers: {
    questionId: string;
    selectedOption: string;
  }[];
  score: number;
  status: "started" | "submitted" | "flagged";
  tabSwitchCount: number; // For proctoring
  startTime: Date;
  endTime?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const attemptSchema = new Schema<IAttempt>(
  {
    examId: { type: Schema.Types.ObjectId, ref: "Exam", required: true },
    studentId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    answers: [
      {
        questionId: { type: String, required: true },
        selectedOption: { type: String, required: true },
      },
    ],
    score: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["started", "submitted", "flagged"],
      default: "started",
    },
    tabSwitchCount: { type: Number, default: 0 },
    startTime: { type: Date, default: Date.now },
    endTime: { type: Date },
  },
  { timestamps: true },
);

export const Attempt = mongoose.model<IAttempt>("Attempt", attemptSchema);
