import { apiRequest } from "../api/apiRequest";

export const feedbackService = {
  getReportFeedback: async (reportId) => {
    return apiRequest(`/feedback/report/${reportId}`);
  },
  submitFeedback: async (reportId, feedbackData) => {
    return apiRequest(`/feedback/report/${reportId}`, {
      method: "POST",
      body: feedbackData,
    });
  },
  updateFeedback: async (feedbackId, feedbackData) => {
    return apiRequest(`/feedback/${feedbackId}`, {
      method: "PUT",
      body: feedbackData,
    });
  },
};
