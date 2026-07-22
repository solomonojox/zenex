import axios from "axios";
import { ApiUrl } from "@/config/apiConfig";

// Create the axios instance
const axiosInstance = axios.create({
  baseURL: ApiUrl,
  headers: {
    Accept: "*/*",
    "Content-Type": "application/json",
  },
});

// Add a request interceptor to safely access sessionStorage in the browser
axiosInstance.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("zenexUserToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Extract subdomain (tenant)
    const host = window.location.hostname;
    const parts = host.split(".");
    let tenant: string | null = null;

    if (parts.length > 1) {
      tenant = parts[0]; // e.g. "demo"
    }

    if (tenant) {
      config.headers["x-Tenant"] = tenant;
    }
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default axiosInstance;
