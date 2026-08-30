import { apiRequest } from "../api/apiRequest";

export const taskService = {
  getTasks: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/tasks${query ? `?${query}` : ""}`);
  },
  getTaskById: async (taskId) => {
    return apiRequest(`/tasks/${taskId}`);
  },
  createTask: async (taskData) => {
    return apiRequest("/tasks", {
      method: "POST",
      body: taskData,
    });
  },
  updateTask: async (taskId, taskData) => {
    return apiRequest(`/tasks/${taskId}`, {
      method: "PUT",
      body: taskData,
    });
  },
  deleteTask: async (taskId) => {
    return apiRequest(`/tasks/${taskId}`, {
      method: "DELETE",
    });
  },
};
