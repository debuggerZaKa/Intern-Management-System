import { apiRequest } from "../api/apiRequest";

export const mentorService = {
  // Get active or alumni assigned interns (pass { status_filter: 'active' | 'alumni' | 'all' })
  getAssignedInterns: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/mentors/interns${query ? `?${query}` : ""}`);
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

  // Get all available interns with assignment status
  getAvailableInterns: async () => {
    return apiRequest("/mentors/available-interns");
  },

  // Send mentorship request to an intern
  sendMentorshipRequest: async (internId, notes = "") => {
    return apiRequest("/mentors/requests", {
      method: "POST",
      body: { intern_id: internId, notes },
    });
  },

  // Get mentorship requests sent by current mentor
  getSentRequests: async () => {
    return apiRequest("/mentors/requests");
  },

  // Cancel a pending mentorship request
  cancelRequest: async (requestId) => {
    return apiRequest(`/mentors/requests/${requestId}`, {
      method: "DELETE",
    });
  },
};

