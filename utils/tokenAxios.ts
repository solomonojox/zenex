import axios, { AxiosError, AxiosRequestConfig } from "axios";
import { ApiUrl } from "@/config/apiConfig";
import { resolveTenant } from "@/lib/utils/tenant";

export const TOKEN_KEY = "zenexUserToken";
export const REFRESH_KEY = "zenexRefreshToken";

// Create the axios instance
const axiosInstance = axios.create({
  baseURL: ApiUrl,
  headers: {
    Accept: "*/*",
    "Content-Type": "application/json",
  },
});

// Attach the bearer token and tenant header on every request.
axiosInstance.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem(TOKEN_KEY);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      // Only send x-Tenant when the host genuinely identifies one. Sending a
      // wrong tenant is far worse than sending none: the API scopes every
      // query by it, so a bogus value returns empty lists rather than an
      // error, and the site looks like it has no data at all.
      const tenant = resolveTenant(
        window.location.hostname,
        process.env.NEXT_PUBLIC_TENANT,
      );
      if (tenant) {
        config.headers["x-Tenant"] = tenant;
      }
    }
    return config;
  },
  (error) => Promise.reject(error),
);

/**
 * Silent refresh: when a request 401s we swap the expired access token for a
 * fresh one and replay the original request. Concurrent 401s share a single
 * refresh call via `refreshPromise` so we never hammer the endpoint.
 */
let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  if (typeof window === "undefined") return null;
  const refreshToken = localStorage.getItem(REFRESH_KEY);
  if (!refreshToken) return null;

  try {
    // Bare axios (not the instance) to avoid recursing through interceptors.
    const res = await axios.post(`${ApiUrl}/auth/refresh`, { refreshToken });
    const payload = res.data?.data ?? res.data;
    const accessToken: string | undefined = payload?.accessToken;
    const newRefresh: string | undefined = payload?.refreshToken;
    if (!accessToken) return null;

    localStorage.setItem(TOKEN_KEY, accessToken);
    if (newRefresh) localStorage.setItem(REFRESH_KEY, newRefresh);
    return accessToken;
  } catch {
    return null;
  }
}

function forceLogout() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_KEY);
  // Don't bounce users who are already on a public/auth page.
  if (!window.location.pathname.startsWith("/auth")) {
    window.location.href = "/auth?mode=login";
  }
}

axiosInstance.interceptors.response.use(
  (response) => {
    // Unwrap the API's { success, data } envelope.
    const body = response.data;
    if (body && typeof body === "object" && "success" in body && "data" in body) {
      response.data = body.data;
    }
    return response;
  },
  async (error: AxiosError) => {
    const original = error.config as
      | (AxiosRequestConfig & { _retried?: boolean })
      | undefined;
    const status = error.response?.status;
    const url = original?.url ?? "";
    const isAuthRoute = url.includes("/auth/");

    if (status === 401 && original && !original._retried && !isAuthRoute) {
      original._retried = true;
      refreshPromise = refreshPromise ?? refreshAccessToken();
      const newToken = await refreshPromise;
      refreshPromise = null;

      if (newToken) {
        original.headers = {
          ...(original.headers ?? {}),
          Authorization: `Bearer ${newToken}`,
        };
        return axiosInstance(original);
      }
      forceLogout();
    }

    // Normalize error messages: the API returns { statusCode, message, ... }
    // where message may be a string or an array of validation strings.
    const apiMessage = (error.response?.data as { message?: unknown })?.message;
    const message = Array.isArray(apiMessage)
      ? apiMessage.join(", ")
      : (apiMessage as string) || error.message || "Request failed";
    error.message = message;
    return Promise.reject(error);
  },
);

export default axiosInstance;
