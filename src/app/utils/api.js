import axios from "axios";
import { refreshAccessToken } from "./auth";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL 
  ? `${process.env.NEXT_PUBLIC_API_URL}/api`
  : "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

// Interceptor to refresh token if access token expires
api.interceptors.request.use(async (config) => {
  let token = localStorage.getItem("authToken");

  if (!token) {
    token = await refreshAccessToken();
  }

  if (token) {
    config.headers["Authorization"] = `Bearer ${token}`;
  }

  return config;
}, (error) => {
  return Promise.reject(error);
});

export default api;