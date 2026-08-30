import { useAuth } from "./useAuth";

export const usePermission = () => {
  const { user } = useAuth();

  const hasPermission = (permission) => {
    if (!user) return false;

    // Admin bypass
    if (user.role?.name === "admin") return true;

    if (!user.permissions || !Array.isArray(user.permissions)) return false;

    return user.permissions.includes(permission);
  };

  const hasAnyPermission = (permissions = []) => {
    return permissions.some((perm) => hasPermission(perm));
  };

  const hasAllPermissions = (permissions = []) => {
    return permissions.every((perm) => hasPermission(perm));
  };

  return {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    role: user?.role?.name || null,
    isAdmin: user?.role?.name === "admin",
    isMentor: user?.role?.name === "mentor",
    isIntern: user?.role?.name === "intern",
  };
};
