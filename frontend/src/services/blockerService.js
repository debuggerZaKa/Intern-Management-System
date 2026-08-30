import { apiRequest } from "../api/apiRequest";

export const blockerService = {
  getBlockers: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/blockers${query ? `?${query}` : ""}`);
  },
  createBlocker: async (blockerData) => {
    return apiRequest("/blockers", {
      method: "POST",
      body: blockerData,
    });
  },
  updateBlocker: async (blockerId, blockerData) => {
    return apiRequest(`/blockers/${blockerId}`, {
      method: "PUT",
      body: blockerData,
    });
  },
};
