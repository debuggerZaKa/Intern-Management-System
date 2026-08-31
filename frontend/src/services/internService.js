import { apiRequest } from "../api/apiRequest";

export const internService = {
  // Get complete intern dashboard metrics
  getDashboard: async () => {
    return apiRequest("/interns/dashboard");
  },

  // Profile endpoints
  getProfile: async () => {
    return apiRequest("/interns/me/profile");
  },

  updateProfile: async (profileData) => {
    return apiRequest("/interns/me/profile", {
      method: "PUT",
      body: profileData,
    });
  },

  // Active internship
  getInternship: async () => {
    return apiRequest("/interns/me/internship");
  },

  // Own tasks
  getTasks: async () => {
    return apiRequest("/interns/me/tasks");
  },

  // Own weekly reports
  getReports: async () => {
    return apiRequest("/interns/me/reports");
  },

  // Own blockers
  getBlockers: async () => {
    return apiRequest("/interns/me/blockers");
  },

  // AI insights
  getAIInsights: async () => {
    return apiRequest("/interns/me/ai-insights");
  },
};
