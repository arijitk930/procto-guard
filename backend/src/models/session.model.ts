import mongoose, { Schema, Document, Types } from "mongoose";

// 1. Interface for the embedded Answers array
export interface IResponse {
  questionId: Types.ObjectId;
  selectedOption: string;
  isCorrect: boolean;
}

// 2. Interface for the Session
export interface ISession extends Document {
  exam: Types.ObjectId;
  student: Types.ObjectId;
  ipAddress?: string;
  userAgent?: string;
  startTime: Date;
  endTime?: Date;
  score?: number;
  answers: IResponse[];
  status: "in-progress" | "completed" | "terminated";
}

// 3. The Mongoose Schemas
const responseSchema = new Schema<IResponse>({
  questionId: { type: Schema.Types.ObjectId, required: true },
  selectedOption: { type: String, required: true },
  isCorrect: { type: Boolean, required: true },
});

const sessionSchema = new Schema<ISession>(
  {
    exam: { type: Schema.Types.ObjectId, ref: "Exam", required: true },
    student: { type: Schema.Types.ObjectId, ref: "User", required: true },
    ipAddress: { type: String },
    userAgent: { type: String },
    startTime: { type: Date, default: Date.now },
    endTime: { type: Date },
    score: { type: Number, default: null },
    answers: [responseSchema],
    status: {
      type: String,
      enum: ["in-progress", "completed", "terminated"],
      default: "in-progress",
    },
  },
  { timestamps: true },
);

// Prevent a student from taking the exact same exam concurrently
sessionSchema.index({ exam: 1, student: 1 }, { unique: true });

export const Session = mongoose.model<ISession>("Session", sessionSchema);
