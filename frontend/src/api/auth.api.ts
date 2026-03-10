// src/api/auth.api.ts
import { apiClient } from "../lib/axios";
import { ApiResponse } from "../types/api.types";
import { RegisterInput, LoginInput } from "../lib/validations/auth";

// Define what the user object looks like when it comes back from the backend
export interface User {
  _id: string;
  name: string;
  email: string;
  role: "educator" | "student";
  institution?: string;
}

// Group all authentication-related API calls into one clean object
export const authApi = {
  register: async (
    data: RegisterInput,
  ): Promise<ApiResponse<{ user: User }>> => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { confirmPassword, ...payload } = data;
    return apiClient.post("/auth/register", payload); // Points to auth.routes.js
  },

  login: async (data: LoginInput): Promise<ApiResponse<{ user: User }>> => {
    return apiClient.post("/auth/login", data); // Points to auth.routes.js
  },

  logout: async (): Promise<ApiResponse<null>> => {
    return apiClient.post("/auth/logout"); // Points to auth.routes.js
  },

  getCurrentUser: async (): Promise<ApiResponse<{ user: User }>> => {
    return apiClient.get("/users/current-user"); // Points to user.routes.js
  },
};
