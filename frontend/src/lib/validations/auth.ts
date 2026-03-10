// src/lib/validations/auth.ts
import { z } from "zod";

// -----------------------------------------------------------------------------
// 1. Login Schema (Student & Educator)
// -----------------------------------------------------------------------------
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, { message: "Email is required" })
    .pipe(z.email({ message: "Please enter a valid email address" })),
  password: z.string().min(1, { message: "Password is required" }),
  // FIX: Changed 'required_error' to 'message' for Zod enum
  role: z.enum(["student", "educator"], {
    message: "Please select your login role",
  }),
});

export type LoginInput = z.infer<typeof loginSchema>;

// -----------------------------------------------------------------------------
// 2. Registration Schema (Student & Educator)
// -----------------------------------------------------------------------------
export const registerSchema = z
  .object({
    username: z
      .string()
      .min(3, { message: "Username must be at least 3 characters" })
      .max(20, { message: "Username cannot exceed 20 characters" })
      .regex(/^[a-zA-Z0-9_]+$/, {
        message: "Username can only contain letters, numbers, and underscores",
      }),
    fullName: z
      .string()
      .min(2, { message: "Full name must be at least 2 characters long" }),
    email: z
      .string()
      .min(1, { message: "Email is required" })
      .pipe(z.email({ message: "Please enter a valid email address" })),
    // FIX: Changed 'required_error' to 'message' for Zod enum
    role: z.enum(["student", "educator"], {
      message: "Please select a role",
    }),
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
