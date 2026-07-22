"use client";

/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import { AuthContext } from "./auth-context";
import { UserData, AuthContextType } from "./auth-types";
import { useRouter } from "next/navigation";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<UserData | null>(null);
  const [companyLogo, setCompanyLogo] = useState("");
  const [authLoading, setAuthLoading] = useState(true); // ✅ ADD THIS
  const [ready, setReady] = useState(false);

  const router = useRouter();

  // 🔹 Initialize auth from localStorage
  useEffect(() => {
    const token = localStorage.getItem("zenexUserToken");
    const storedCompanyLogo = localStorage.getItem("companyLogo");

    if (token) {
      try {
        const decoded = jwtDecode<Partial<any>>(token);

        setUser({
          id: decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"] || "",
          firstName: decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname"],
          lastName: decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/surname"],
          email: decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"] || "",
          role: decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] || "",
          accountType: decoded.accountType,
          userName: decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"],
        });

        setCompanyLogo(storedCompanyLogo || "");
        setIsAuthenticated(true);
      } catch (error) {
        console.error("Error decoding token:", error);
        localStorage.removeItem("zenexUserToken");
        setUser(null);
        setIsAuthenticated(false);
      }
    }

    // ✅ AUTH CHECK FINISHED
    setAuthLoading(false);
  }, []);

  // 🔹 Token expiry check
  useEffect(() => {
    const token = localStorage.getItem("zenexUserToken");
    if (!token) return;

    const decoded = jwtDecode<Partial<any>>(token);

    if (decoded.exp && decoded.exp * 1000 < Date.now()) {
      logout();
    }
  }, []);

  const login = (token: string) => {
    localStorage.setItem("zenexUserToken", token);
    const storedCompanyLogo = localStorage.getItem("companyLogo");

    const decoded = jwtDecode<Partial<any>>(token);

    setUser({
      id: decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"] || "",
      firstName: decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname"],
      lastName: decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/surname"],
      email: decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"] || "",
      role: decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] || "",
      accountType: decoded.accountType,
      userName: decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"],
    });

    setCompanyLogo(storedCompanyLogo || "");
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem("zenexUserToken");
    setUser(null);
    setIsAuthenticated(false);
    router.replace("/login");
  };

  const contextValue: AuthContextType = {
    isAuthenticated,
    companyLogo,
    user,
    authLoading, // ✅ EXPOSE THIS
    login,
    logout,
    setReady,
    ready
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}