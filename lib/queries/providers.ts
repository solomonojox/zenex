"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { providersApi, ProviderQuery, UpdateProviderInput } from "@/lib/api/providers";
import { userKeys } from "@/lib/queries/users";

export const providerKeys = {
  all: ["providers"] as const,
  list: (params: ProviderQuery) => ["providers", "list", params] as const,
  detail: (id: string) => ["providers", "detail", id] as const,
};

export function useProviders(params: ProviderQuery = {}) {
  return useQuery({
    queryKey: providerKeys.list(params),
    queryFn: () => providersApi.list(params),
  });
}

export function useProvider(id: string) {
  return useQuery({
    queryKey: providerKeys.detail(id),
    queryFn: () => providersApi.get(id),
    enabled: !!id,
  });
}

export function useUpdateMyProvider() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: UpdateProviderInput) => providersApi.updateMine(dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: userKeys.me });
      qc.invalidateQueries({ queryKey: providerKeys.all });
    },
  });
}
