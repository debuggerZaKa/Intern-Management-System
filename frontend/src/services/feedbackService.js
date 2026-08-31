import { apiRequest } from "../api/apiRequest";

export const feedbackService = {
  getReportFeedback: async (reportId) => {
    return apiRequest(`/feedback/report/${reportId}`);
  },
  getMentorFeedbacks: async (mentorId = null) => {
    const query = mentorId ? `?mentor_id=${mentorId}` : "";
    return apiRequest(`/feedback/mentor${query}`);
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
