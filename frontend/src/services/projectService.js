import { apiRequest } from "../api/apiRequest";

export const projectService = {
  getProjects: async (params = {}) => {
    const searchParams = new URLSearchParams();
    if (params.internship_id) searchParams.append("internship_id", params.internship_id);
    const query = searchParams.toString();
    return apiRequest(`/projects${query ? `?${query}` : ""}`);
  },

  getProjectById: async (projectId) => {
    return apiRequest(`/projects/${projectId}`);
  },

  createProject: async (projectData) => {
    return apiRequest("/projects", {
      method: "POST",
      body: projectData,
    });
  },

  updateProject: async (projectId, projectData) => {
    return apiRequest(`/projects/${projectId}`, {
      method: "PUT",
      body: projectData,
    });
  },

  deleteProject: async (projectId) => {
    return apiRequest(`/projects/${projectId}`, {
      method: "DELETE",
    });
  },
};
