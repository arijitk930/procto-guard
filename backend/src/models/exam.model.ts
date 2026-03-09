import mongoose, { Schema, Document, Types } from "mongoose";

// 1. Interface for the embedded Question array
export interface IQuestion {
  _id?: Types.ObjectId | string;
  questionText: string;
  options: string[];
  correctAnswer: string;
  marks: number;
}

// 2. Interface for the Exam itself
export interface IExam extends Document {
  title: string;
  description?: string;
  creator: Types.ObjectId;
  inviteCode: string;
  timeLimit: number;
  passingScore: number;
  questions: IQuestion[];
  isActive: boolean;
}

// 3. The Mongoose Schemas
const questionSchema = new Schema<IQuestion>({
  questionText: { type: String, required: true },
  options: [{ type: String, required: true }],
  correctAnswer: { type: String, required: true },
  marks: { type: Number, default: 1 },
});

const examSchema = new Schema<IExam>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    creator: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    inviteCode: { type: String, required: true, unique: true, index: true },
    timeLimit: { type: Number, required: true },
    passingScore: { type: Number, required: true },
    questions: [questionSchema],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export const Exam = mongoose.model<IExam>("Exam", examSchema);
