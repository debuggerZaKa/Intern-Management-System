import { apiRequest } from "../api/apiRequest";

export const reportService = {
  getReports: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/reports${query ? `?${query}` : ""}`);
  },
  getReportById: async (reportId) => {
    return apiRequest(`/reports/${reportId}`);
  },
  submitReport: async (reportData) => {
    return apiRequest("/reports", {
      method: "POST",
      body: reportData,
    });
  },
  updateReport: async (reportId, reportData) => {
    return apiRequest(`/reports/${reportId}`, {
      method: "PUT",
      body: reportData,
    });
  },
};
