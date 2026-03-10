// src/types/api.types.ts

// This matches the ApiResponse class you built in your Express backend
export interface ApiResponse<T = unknown> {
  statusCode: number;
  data: T;
  message: string;
  success: boolean;
}

// This matches the ApiError class
export interface ApiErrorResponse {
  statusCode: number;
  message: string;
  success: boolean;
  errors?: unknown[];
}
