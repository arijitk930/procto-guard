// src/api/auth.api.ts
import { apiClient } from "../lib/axios";
import { ApiResponse } from "../types/api.types";
import { RegisterInput, LoginInput } from "../lib/validations/auth";

// 1. Updated to match your exact Mongoose Schema
export interface User {
  _id: string;
  fullName: string;
  username: string;
  email: string;
  role: "educator" | "student";
}

export const authApi = {
  register: async (
    data: RegisterInput,
  ): Promise<ApiResponse<{ user: User }>> => {
    // We strip out confirmPassword, but keep fullName, username, email, password, AND role
    const { confirmPassword, ...payload } = data;
    return apiClient.post("/auth/register", payload);
  },

  login: async (data: LoginInput): Promise<ApiResponse<{ user: User }>> => {
    // Data now naturally includes email, password, AND role from the login form
    return apiClient.post("/auth/login", data);
  },

  logout: async (): Promise<ApiResponse<null>> => {
    return apiClient.post("/auth/logout");
  },

  getCurrentUser: async (): Promise<ApiResponse<{ user: User }>> => {
    return apiClient.get("/users/current-user");
  },
};
