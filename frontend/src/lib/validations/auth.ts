// src/lib/validations/auth.ts
import { z } from "zod";

// -----------------------------------------------------------------------------
// 1. Educator Login Schema
// -----------------------------------------------------------------------------
export const loginSchema = z.object({
  // FIX: Using .pipe() to connect the string check to Zod 4's top-level z.email()
  email: z
    .string()
    .min(1, { message: "Email is required" })
    .pipe(z.email({ message: "Please enter a valid email address" })),
  password: z.string().min(1, { message: "Password is required" }),
});

export type LoginInput = z.infer<typeof loginSchema>;

// -----------------------------------------------------------------------------
// 2. Educator Registration Schema
// -----------------------------------------------------------------------------
export const registerSchema = z
  .object({
    name: z
      .string()
      .min(2, { message: "Name must be at least 2 characters long" })
      .max(50, { message: "Name cannot exceed 50 characters" }),
    // FIX: Applied the same pipe logic here
    email: z
      .string()
      .min(1, { message: "Email is required" })
      .pipe(z.email({ message: "Please enter a valid email address" })),
    institution: z
      .string()
      .min(2, { message: "Institution name is required for educators" }),
    password: z
      .string()
      .min(8, { message: "Password must be at least 8 characters long" })
      .regex(/[A-Z]/, {
        message: "Password must contain at least one uppercase letter",
      })
      .regex(/[0-9]/, { message: "Password must contain at least one number" }),
    confirmPassword: z
      .string()
      .min(1, { message: "Please confirm your password" }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export type RegisterInput = z.infer<typeof registerSchema>;
