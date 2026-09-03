import { apiRequest } from "../api/apiRequest";

export const userService = {
  getUsers: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/users${query ? `?${query}` : ""}`);
  },
  getUserById: async (userId) => {
    return apiRequest(`/users/${userId}`);
  },
  updateUserRole: async (userId, roleId) => {
    return apiRequest(`/users/${userId}/role`, {
      method: "PUT",
      body: { role_id: roleId },
    });
  },
  updateUserStatus: async (userId, status) => {
    return apiRequest(`/users/${userId}/status`, {
      method: "PUT",
      body: { status },
    });
  },
  deleteUser: async (userId) => {
    return apiRequest(`/users/${userId}`, {
      method: "DELETE",
    });
  },
  updateMyProfile: async (profileData) => {
    return apiRequest("/users/profile/me", {
      method: "PUT",
      body: profileData,
    });
  },
  uploadAvatar: async (userId, file) => {
    const formData = new FormData();
    formData.append("file", file);
    return apiRequest(`/users/${userId}/avatar`, {
      method: "POST",
      body: formData,
      isFormData: true,
    });
  },
  uploadMyAvatar: async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    return apiRequest("/users/profile/me/avatar", {
      method: "POST",
      body: formData,
      isFormData: true,
    });
  },
};
