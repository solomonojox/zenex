"use client";

/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useCallback } from "react";
import { jwtDecode } from "jwt-decode";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { AuthContext } from "./auth-context";
import { UserData, AuthContextType } from "./auth-types";
import axiosInstance, { TOKEN_KEY, REFRESH_KEY } from "@/utils/tokenAxios";

// The Zenex API issues plain JWT claims (not the old .NET-style claim URIs).
interface JwtClaims {
  sub: string;
  email: string;
  role: string;
  tenantId: string;
  exp?: number;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<UserData | null>(null);
  const [companyLogo, setCompanyLogo] = useState("");
  const [authLoading, setAuthLoading] = useState(true);
  const [ready, setReady] = useState(false);
  const router = useRouter();
  const queryClient = useQueryClient();

  // Populate minimal user state from the token's claims (instant, no request).
  const applyToken = useCallback((token: string) => {
    const c = jwtDecode<JwtClaims>(token);
    setUser({
      id: c.sub,
      email: c.email,
      role: c.role,
      tenantId: c.tenantId,
      firstName: "",
      lastName: "",
      accountType: "",
      userName: "",
    });
    setIsAuthenticated(true);
  }, []);

  // Enrich with the full profile (names, etc.) from the API.
  const fetchMe = useCallback(async () => {
    try {
      const { data } = await axiosInstance.get("/users/me");
      setUser((prev) =>
        prev
          ? {
              ...prev,
              firstName: data.firstName ?? prev.firstName,
              lastName: data.lastName ?? prev.lastName,
              email: data.email ?? prev.email,
              role: data.role ?? prev.role,
              accountType: data.accountType ?? "",
              userName: data.userName ?? "",
            }
          : prev,
      );
    } catch {
      // Non-fatal: token still valid for auth state even if /me fails.
    }
  }, []);

  // Initialize from any stored token on load.
  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    const storedLogo = localStorage.getItem("companyLogo");
    if (token) {
      try {
        const c = jwtDecode<JwtClaims>(token);
        const expired = !!c.exp && c.exp * 1000 < Date.now();
        const hasRefresh = !!localStorage.getItem(REFRESH_KEY);

        if (expired && !hasRefresh) {
          // Nothing to renew with — treat as signed out.
          localStorage.removeItem(TOKEN_KEY);
        } else {
          // If the access token is stale but a refresh token exists, restore
          // the session optimistically; the axios interceptor swaps in a new
          // access token on the first 401 (fetchMe below triggers it).
          applyToken(token);
          setCompanyLogo(storedLogo || "");
          fetchMe();
        }
      } catch {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(REFRESH_KEY);
      }
    }
    setAuthLoading(false);
  }, [applyToken, fetchMe]);

  const login = useCallback(
    (token: string, refreshToken?: string) => {
      localStorage.setItem(TOKEN_KEY, token);
      // Stored so the axios interceptor can silently refresh expired sessions.
      if (refreshToken) localStorage.setItem(REFRESH_KEY, refreshToken);
      // Drop any previous user's cached queries so the new user never sees them.
      queryClient.clear();
      applyToken(token);
      fetchMe();
    },
    [applyToken, fetchMe, queryClient],
  );

  const logout = useCallback(() => {
    // Revoke server-side refresh tokens too, so the session can't be resumed.
    // Fire-and-forget: local sign-out must succeed even if the call fails.
    axiosInstance.post("/auth/logout").catch(() => undefined);

    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_KEY);
    setUser(null);
    setIsAuthenticated(false);
    queryClient.clear();
    router.replace("/auth?mode=login");
  }, [router, queryClient]);

  const contextValue: AuthContextType = {
    isAuthenticated,
    companyLogo,
    user,
    authLoading,
    login,
    logout,
    setReady,
    ready,
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
}
