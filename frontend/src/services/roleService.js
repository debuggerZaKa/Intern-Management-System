import { apiRequest } from "../api/apiRequest";

export const roleService = {
  getRoles: async () => {
    return apiRequest("/roles");
  },
  getRolePermissions: async (roleId) => {
    return apiRequest(`/roles/${roleId}/permissions`);
  },
};
