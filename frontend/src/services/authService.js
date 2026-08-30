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

  register: async (userData) => {
    return apiRequest("/auth/register", {
      method: "POST",
      body: userData,
      requiresAuth: false,
    });
  },

  getCurrentUser: async () => {
    return apiRequest("/auth/me", {
      method: "GET",
      requiresAuth: true,
    });
  },
};
