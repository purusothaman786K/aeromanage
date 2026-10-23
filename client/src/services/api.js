import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "https://aeromanage-purushoth-api.onrender.com/api";

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Attach the JWT to every request, if we have one
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("aeromanage_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// If the token is invalid/expired, bounce back to login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("aeromanage_token");
      localStorage.removeItem("aeromanage_user");
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;
