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

// Response interceptor:
//  - unwraps the API's { success, data } envelope so callers get `res.data`
//    as the actual payload
//  - normalizes error messages (the API returns { statusCode, message, ... },
//    where message may be a string or an array of validation strings)
axiosInstance.interceptors.response.use(
  (response) => {
    const body = response.data;
    if (body && typeof body === "object" && "success" in body && "data" in body) {
      response.data = body.data;
    }
    return response;
  },
  (error) => {
    const apiMessage = error?.response?.data?.message;
    const message = Array.isArray(apiMessage)
      ? apiMessage.join(", ")
      : apiMessage || error?.message || "Request failed";
    error.message = message;
    return Promise.reject(error);
  },
);

export default axiosInstance;
