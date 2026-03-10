import * as z from "zod";

export const questionSchema = z.object({
  questionText: z.string().min(5, "Question is too short"),
  options: z.array(z.string().min(1, "Option cannot be empty")).length(4),
  correctAnswer: z.string().min(1, "Select the correct answer"),
  marks: z.number().min(1, "Minimum 1 mark per question"),
});

export const examSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().optional(),
  timeLimit: z.number().min(1, "Time limit must be at least 1 minute"),
  passingScore: z.number().min(1, "Passing score must be at least 1"),
  questions: z.array(questionSchema).min(1, "Add at least one question"),
});

export type ExamFormValues = z.infer<typeof examSchema>;
