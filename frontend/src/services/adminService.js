import { apiRequest } from "../api/apiRequest";

export const adminService = {
  // System Analytics
  getAnalytics: async () => {
    return apiRequest("/admin/analytics");
  },

  // User Management
  getUsers: async (params = {}) => {
    const searchParams = new URLSearchParams();
    if (params.role_id) searchParams.append("role_id", params.role_id);
    if (params.status_filter) searchParams.append("status_filter", params.status_filter);
    const query = searchParams.toString();
    return apiRequest(`/admin/users${query ? `?${query}` : ""}`);
  },

  // Admin Direct User Creation (query params in FastAPI signature)
  createUserAccount: async (userData) => {
    const searchParams = new URLSearchParams();
    searchParams.append("email", userData.email);
    searchParams.append("password", userData.password);
    searchParams.append("full_name", userData.full_name);
    searchParams.append("role_name", userData.role_name);
    if (userData.department) searchParams.append("department", userData.department);
    if (userData.phone) searchParams.append("phone", userData.phone);
    if (userData.university) searchParams.append("university", userData.university);
    if (userData.degree) searchParams.append("degree", userData.degree);
    if (userData.semester) searchParams.append("semester", userData.semester);

    return apiRequest(`/admin/users/create?${searchParams.toString()}`, {
      method: "POST",
    });
  },

  // User Lifecycle Actions
  activateUser: async (userId) => {
    return apiRequest(`/admin/users/${userId}/activate`, {
      method: "PUT",
    });
  },

  deactivateUser: async (userId) => {
    return apiRequest(`/admin/users/${userId}/deactivate`, {
      method: "PUT",
    });
  },

  archiveUser: async (userId) => {
    return apiRequest(`/admin/users/${userId}/archive`, {
      method: "PUT",
    });
  },

  // Mentor Assignments
  assignMentor: async (internshipId, mentorId, notes = "") => {
    const searchParams = new URLSearchParams({
      internship_id: internshipId,
      mentor_id: mentorId,
    });
    if (notes) searchParams.append("notes", notes);

    return apiRequest(`/admin/assignments?${searchParams.toString()}`, {
      method: "POST",
    });
  },

  getAssignmentHistory: async (internshipId) => {
    return apiRequest(`/admin/assignments/history/${internshipId}`);
  },

  // Bulk Import
  bulkImportInterns: async (file) => {
    const formData = new FormData();
    formData.append("file", file);

    return apiRequest("/admin/bulk-import", {
      method: "POST",
      body: formData,
      isFormData: true,
    });
  },

  // Signup Requests Approval Workflow
  getSignupRequests: async (statusFilter = "pending") => {
    const query = statusFilter ? `?status_filter=${statusFilter}` : "";
    return apiRequest(`/admin/signup-requests${query}`);
  },

  approveSignupRequest: async (requestId, adminNotes = "") => {
    const query = adminNotes ? `?admin_notes=${encodeURIComponent(adminNotes)}` : "";
    return apiRequest(`/admin/signup-requests/${requestId}/approve${query}`, {
      method: "PUT",
    });
  },

  rejectSignupRequest: async (requestId, adminNotes = "") => {
    const query = adminNotes ? `?admin_notes=${encodeURIComponent(adminNotes)}` : "";
    return apiRequest(`/admin/signup-requests/${requestId}/reject${query}`, {
      method: "PUT",
    });
  },

  // Audit Logs
  getAuditLogs: async (limit = 100) => {
    return apiRequest(`/admin/audit-logs?limit=${limit}`);
  },
};
