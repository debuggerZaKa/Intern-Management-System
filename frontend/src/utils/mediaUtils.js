import { API_BASE_URL } from "../api/apiConfig";

export const getBackendBaseUrl = () => {
  return API_BASE_URL.replace(/\/api\/v1\/?$/, "");
};

export const getMediaUrl = (path) => {
  if (!path) return null;
  if (path.startsWith("http://") || path.startsWith("https://") || path.startsWith("blob:") || path.startsWith("data:")) {
    return path;
  }
  const baseUrl = getBackendBaseUrl();
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${baseUrl}${cleanPath}`;
};
