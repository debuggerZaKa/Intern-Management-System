import { apiRequest } from "../api/apiRequest";

export const mentorService = {
  // Get active assigned interns
  getAssignedInterns: async () => {
    return apiRequest("/mentors/interns");
  },

  // Get details of specific assigned intern
  getAssignedInternDetails: async (internId) => {
    return apiRequest(`/mentors/interns/${internId}`);
  },

  // Get reports of assigned intern
  getAssignedInternReports: async (internId) => {
    return apiRequest(`/mentors/interns/${internId}/reports`);
  },

  // Get tasks of assigned intern
  getAssignedInternTasks: async (internId) => {
    return apiRequest(`/mentors/interns/${internId}/tasks`);
  },

  // Get blockers of assigned intern
  getAssignedInternBlockers: async (internId) => {
    return apiRequest(`/mentors/interns/${internId}/blockers`);
  },

  // Get interns needing urgent attention (critical blockers, risk flags)
  getInternsNeedingAttention: async () => {
    return apiRequest("/mentors/attention");
  },
};
