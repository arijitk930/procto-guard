// src/lib/axios.ts

import axios from "axios";

const baseURL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export const apiClient = axios.create({
  baseURL,
  // THIS IS CRITICAL: It tells Axios to send the httpOnly cookies with every request
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Response Interceptor for global error handling
apiClient.interceptors.response.use(
  (response) => {
    // If the request succeeds, just return the data inside the response
    return response.data;
  },
  (error) => {
    // If the backend throws an ApiError (like 401 Unauthorized or 400 Bad Request)
    const customError =
      error.response?.data?.message || "An unexpected error occurred";

    // Future update: If error is 401 (Unauthorized), we can automatically trigger a logout here
    if (error.response?.status === 401) {
      console.warn("Session expired or unauthorized");
      // window.location.href = '/login'; // Optional: auto-redirect
    }

    return Promise.reject(new Error(customError));
  },
);
