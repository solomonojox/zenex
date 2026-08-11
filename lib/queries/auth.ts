"use client";

import { useMutation } from "@tanstack/react-query";
import { authApi, LoginInput, RegisterInput } from "@/lib/api/auth";
import { useAuth } from "@/context/auth/useAuth";

/** Login mutation — on success, stores the token via AuthProvider. */
export function useLogin() {
  const { login } = useAuth();
  return useMutation({
    mutationFn: (dto: LoginInput) => authApi.login(dto),
    onSuccess: (tokens) => login(tokens.accessToken, tokens.refreshToken),
  });
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: (email: string) => authApi.forgotPassword(email),
  });
}

export function useResetPassword() {
  return useMutation({
    mutationFn: ({ token, password }: { token: string; password: string }) =>
      authApi.resetPassword(token, password),
  });
}

/** Register mutation — on success, logs the new user in. */
export function useRegister() {
  const { login } = useAuth();
  return useMutation({
    mutationFn: (dto: RegisterInput) => authApi.register(dto),
    onSuccess: (tokens) => login(tokens.accessToken, tokens.refreshToken),
  });
}
