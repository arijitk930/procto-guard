import mongoose, { Schema, Document } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

// 1. The TypeScript Interface (The Contract)
export interface IUser extends Document {
  username: string;
  email: string;
  fullName: string;
  password?: string;
  role: "student" | "educator";

  // B2B SaaS Monetization Fields
  isPremium: boolean;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  stripeSubscriptionStatus?:
    | "active"
    | "past_due"
    | "canceled"
    | "unpaid"
    | "incomplete";

  refreshToken?: string;

  // Custom Methods
  isPasswordCorrect(password: string): Promise<boolean>;
  generateAccessToken(): string;
  generateRefreshToken(): string;
}

// 2. The Mongoose Schema
const userSchema = new Schema<IUser>(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    fullName: { type: String, required: true, trim: true, index: true },
    password: { type: String, required: [true, "Password is required"] },
    role: { type: String, enum: ["student", "educator"], default: "student" },

    isPremium: { type: Boolean, default: false },
    stripeCustomerId: { type: String },
    stripeSubscriptionId: { type: String },
    stripeSubscriptionStatus: {
      type: String,
      enum: ["active", "past_due", "canceled", "unpaid", "incomplete"],
    },

    refreshToken: { type: String },
  },
  { timestamps: true },
);

// Hash password before saving
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password as string, 10);
});

// Compare hashed password
userSchema.methods.isPasswordCorrect = async function (password: string) {
  return await bcrypt.compare(password, this.password as string);
};

// Generate Access Token
userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      username: this.username,
      role: this.role,
      isPremium: this.isPremium,
    },
    process.env.ACCESS_TOKEN_SECRET as string,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY as any },
  );
};

// Generate Refresh Token
userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    { _id: this._id },
    process.env.REFRESH_TOKEN_SECRET as string,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRY as any },
  );
};

export const User = mongoose.model<IUser>("User", userSchema);
