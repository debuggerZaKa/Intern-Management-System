import { apiRequest } from "../api/apiRequest";

export const authService = {
  login: async (email, password) => {
    return apiRequest("/auth/login", {
      method: "POST",
      body: {
        email: email.trim(),
        password: password,
      },
      requiresAuth: false,
    });
  },

  // Direct registration endpoint
  register: async (userData) => {
    return apiRequest("/auth/register", {
      method: "POST",
      body: userData,
      requiresAuth: false,
    });
  },

  // Self-signup request (pending admin approval)
  requestSignup: async (signupData) => {
    return apiRequest("/signup", {
      method: "POST",
      body: signupData,
      requiresAuth: false,
    });
  },

  getCurrentUser: async () => {
    return apiRequest("/auth/me", {
      method: "GET",
      requiresAuth: true,
    });
  },

  forgotPassword: async (email) => {
    return apiRequest("/auth/forgot-password", {
      method: "POST",
      body: { email: email.trim() },
      requiresAuth: false,
    });
  },

  resetPassword: async (token, newPassword) => {
    return apiRequest("/auth/reset-password", {
      method: "POST",
      body: { token, new_password: newPassword },
      requiresAuth: false,
    });
  },

  changePassword: async (oldPassword, newPassword) => {
    return apiRequest("/auth/change-password", {
      method: "PUT",
      body: { old_password: oldPassword, new_password: newPassword },
      requiresAuth: true,
    });
  },
};
