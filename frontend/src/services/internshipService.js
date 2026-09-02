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
  approveCertificate: async (internshipId) => {
    return apiRequest(`/evaluations/internship/${internshipId}/approve-certificate`, {
      method: "POST",
    });
  },
  issueCertificate: async (internshipId) => {
    return apiRequest(`/evaluations/internship/${internshipId}/issue-certificate`, {
      method: "POST",
    });
  },
};

