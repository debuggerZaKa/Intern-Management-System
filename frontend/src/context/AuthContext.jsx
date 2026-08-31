import React, { createContext, useState, useEffect, useCallback } from "react";
import { authService } from "../services/authService";
import { saveToken, getToken, removeToken } from "../utils/tokenStorage";

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  const loadCurrentUser = useCallback(async () => {
    const token = getToken();
    if (!token) {
      setUser(null);
      setAuthLoading(false);
      return;
    }

    try {
      setAuthLoading(true);
      const userData = await authService.getCurrentUser();
      setUser(userData);
    } catch (err) {
      console.warn("Session check failed or expired token:", err);
      removeToken();
      setUser(null);
    } finally {
      setAuthLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCurrentUser();
  }, [loadCurrentUser]);

  const login = async (email, password) => {
    try {
      setAuthLoading(true);
      const data = await authService.login(email, password);
      if (data && data.access_token) {
        saveToken(data.access_token);
        const currentUser = await authService.getCurrentUser();
        setUser(currentUser);
        return currentUser;
      }
      throw new Error("No access token returned by server.");
    } catch (error) {
      throw error;
    } finally {
      setAuthLoading(false);
    }
  };

  const logout = () => {
    removeToken();
    setUser(null);
    window.location.href = "/login";
  };

  const roleName = user?.role?.name || "";
  const isAdmin = roleName === "admin";
  const isMentor = roleName === "mentor";
  const isIntern = roleName === "intern";

  const hasRole = (allowedRoles = []) => {
    if (!user || !user.role) return false;
    if (Array.isArray(allowedRoles)) {
      return allowedRoles.includes(user.role.name);
    }
    return user.role.name === allowedRoles;
  };

  const hasPermission = (permissionName) => {
    if (!user) return false;
    if (isAdmin) return true;
    if (!user.permissions) return false;
    return user.permissions.includes(permissionName);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        authLoading,
        roleName,
        isAdmin,
        isMentor,
        isIntern,
        hasRole,
        hasPermission,
        login,
        logout,
        loadCurrentUser,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
