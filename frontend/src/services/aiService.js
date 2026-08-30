import { apiRequest } from "../api/apiRequest";

export const aiService = {
  summarizeReport: async (reportId) => {
    return apiRequest(`/ai/summarize-report/${reportId}`, {
      method: "POST",
    });
  },
  chat: async (query, internId = null) => {
    return apiRequest("/ai/chat", {
      method: "POST",
      body: { query, intern_id: internId },
    });
  },
  getFinalSummary: async (internshipId) => {
    return apiRequest(`/ai/final-summary/${internshipId}`, {
      method: "POST",
    });
  },
};
