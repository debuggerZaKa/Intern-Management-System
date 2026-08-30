import { API_BASE_URL } from "./apiConfig";
import { getToken, removeToken } from "../utils/tokenStorage";

export const apiRequest = async (endpoint, options = {}) => {
  const {
    method = "GET",
    body,
    isFormData = false,
    headers = {},
    requiresAuth = true,
  } = options;

  const url = `${API_BASE_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;

  const requestHeaders = { ...headers };

  if (!isFormData) {
    requestHeaders["Content-Type"] = "application/json";
  }

  if (requiresAuth) {
    const token = getToken();
    if (token) {
      requestHeaders["Authorization"] = `Bearer ${token}`;
    }
  }

  const config = {
    method,
    headers: requestHeaders,
  };

  if (body) {
    config.body = isFormData ? body : JSON.stringify(body);
  }

  try {
    const response = await fetch(url, config);

    // 401 Unauthorized: Session expired or invalid token
    if (response.status === 401) {
      removeToken();
      if (window.location.pathname !== "/login" && window.location.pathname !== "/register") {
        window.location.href = "/login";
      }
      throw new Error("Invalid credentials or session expired. Please log in.");
    }

    // 403 Forbidden: User remains logged in but permission is denied
    if (response.status === 403) {
      const errorData = await response.json().catch(() => ({}));
      const detailMsg = typeof errorData.detail === "string" ? errorData.detail : "Access denied: Insufficient permissions.";
      throw new Error(detailMsg);
    }

    // 204 No Content
    if (response.status === 204) {
      return null;
    }

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      let errMsg = `Request failed with status ${response.status}`;
      if (data?.detail) {
        if (typeof data.detail === "string") {
          errMsg = data.detail;
        } else if (Array.isArray(data.detail)) {
          errMsg = data.detail.map((e) => e.msg || JSON.stringify(e)).join(", ");
        } else {
          errMsg = JSON.stringify(data.detail);
        }
      }
      throw new Error(errMsg);
    }

    return data;
  } catch (error) {
    console.error(`[API Error] ${method} ${endpoint}:`, error);
    throw error;
  }
};
