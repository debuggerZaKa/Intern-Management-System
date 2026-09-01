import { apiRequest } from "../api/apiRequest";

export const evaluationService = {
  getInternshipEvaluation: async (internshipId) => {
    try {
      return await apiRequest(`/evaluations/internship/${internshipId}`);
    } catch (e) {
      return null;
    }
  },
  submitEvaluation: async (internshipId, evaluationData) => {
    return apiRequest(`/evaluations/internship/${internshipId}`, {
      method: "POST",
      body: evaluationData,
    });
  },
  updateEvaluation: async (evaluationId, evaluationData) => {
    return apiRequest(`/evaluations/${evaluationId}`, {
      method: "PUT",
      body: evaluationData,
    });
  },
};
