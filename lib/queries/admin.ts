"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "@/lib/api/admin";

export const adminKeys = {
  overview: ["admin", "overview"] as const,
  users: (params: object) => ["admin", "users", params] as const,
  disputes: (status?: string) => ["admin", "disputes", status ?? "all"] as const,
};

export function useAdminOverview(enabled = true) {
  return useQuery({ queryKey: adminKeys.overview, queryFn: adminApi.overview, enabled });
}

export function useAdminUsers(params?: { role?: string; status?: string }) {
  return useQuery({
    queryKey: adminKeys.users(params ?? {}),
    queryFn: () => adminApi.users(params),
  });
}

export function useSetUserStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) =>
      adminApi.setUserStatus(id, active),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "users"] }),
  });
}

export function useDisputes(status?: string) {
  return useQuery({
    queryKey: adminKeys.disputes(status),
    queryFn: () => adminApi.disputes(status),
  });
}

export function useResolveDispute() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      adminApi.resolveDispute(id, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "disputes"] }),
  });
}
