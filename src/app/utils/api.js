import axios from "axios";
import { refreshAccessToken } from "./auth"; // Function to refresh token

const api = axios.create({
  baseURL: "http://localhost:5000/api",
  withCredentials: true, // Allows sending cookies (refresh token)
});

// Interceptor to refresh token if access token expires
api.interceptors.request.use(async (config) => {
  let token = localStorage.getItem("authToken");

  if (!token) {
    token = await refreshAccessToken(); // Try to refresh the token
  }

  if (token) {
    config.headers["Authorization"] = `Bearer ${token}`;
  }

  return config;
}, (error) => {
  return Promise.reject(error);
});

export default api;
