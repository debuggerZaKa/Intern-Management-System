import { apiRequest } from "../api/apiRequest";

export const internshipService = {
  getInternships: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/internships${query ? `?${query}` : ""}`);
  },
  getActiveInternship: async () => {
    return apiRequest("/internships/active");
  },
  getInternshipById: async (internshipId) => {
    return apiRequest(`/internships/${internshipId}`);
  },
  createInternship: async (internshipData) => {
    return apiRequest("/internships", {
      method: "POST",
      body: internshipData,
    });
  },
  updateInternship: async (internshipId, internshipData) => {
    return apiRequest(`/internships/${internshipId}`, {
      method: "PUT",
      body: internshipData,
    });
  },
};
