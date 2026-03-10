import { apiClient } from "@/lib/axios";
import { ExamFormValues } from "@/lib/validations/exam";

export const examApi = {
  createExam: async (data: ExamFormValues) => {
    const response = await apiClient.post("/exams/create-exam", data);
    return response.data;
  },
  getMyExams: async () => {
    const response = await apiClient.get("/exams/my-exams");
    return response.data;
  },
  // MAKE SURE THIS IS ADDED:
  joinExam: async (inviteCode: string) => {
    const response = await apiClient.post("/exams/join", { inviteCode });
    return response.data;
  },

  // NEW: Start the actual session in the DB
  startAttempt: async (examId: string) => {
    const response = await apiClient.post("/attempts/start", { examId });
    return response.data;
  },

  saveAnswer: async (
    attemptId: string,
    questionId: string,
    selectedOption: string,
  ) => {
    const response = await apiClient.post(
      `/attempts/${attemptId}/save-answer`,
      {
        questionId,
        selectedOption,
      },
    );
    return response.data;
  },

  updateTelemetry: async (attemptId: string) => {
    const response = await apiClient.patch(`/attempts/${attemptId}/telemetry`);
    return response.data;
  },

  submitAttempt: async (attemptId: string) => {
    const response = await apiClient.post(`/attempts/${attemptId}/submit`);
    return response.data;
  },
};
