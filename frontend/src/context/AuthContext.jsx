import React, { createContext, useState, useEffect } from "react";
import { authService } from "../services/authService";
import { saveToken, getToken, removeToken } from "../utils/tokenStorage";

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  const loadCurrentUser = async () => {
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
  };

  useEffect(() => {
    loadCurrentUser();
  }, []);

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

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        authLoading,
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
