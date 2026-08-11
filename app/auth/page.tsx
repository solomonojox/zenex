"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import RoleSelect from "@/components/auth/RoleSelect";
import LoginForm from "@/components/auth/LoginForm";
import SignupForm from "@/components/auth/SignupForm";
import ForgotPasswordForm from "@/components/auth/ForgotPasswordForm";
import type { Role } from "@/components/auth/types";

// Auth flow is a single route (/auth) with `mode` and `role` query params so
// each step is a shareable URL, while the multi-step provider "wizard" stays
// as in-component state (steps within a form aren't really separate pages).
function AuthContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const mode = searchParams.get("mode") ?? "role";
  const role = (searchParams.get("role") as Role | null) ?? null;

  return (
    <>
      {mode === "login" && <LoginForm />}
      {mode === "forgot" && <ForgotPasswordForm />}
      {mode === "signup" && role && <SignupForm role={role} />}
      {(mode === "role" || (mode === "signup" && !role)) && (
        <RoleSelect onSelect={(r) => router.push(`/auth?mode=signup&role=${r}`)} />
      )}
    </>
  );
}

export default function AuthPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFB] flex items-center justify-center p-4" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <Suspense fallback={null}>
        <AuthContent />
      </Suspense>
    </div>
  );
}
