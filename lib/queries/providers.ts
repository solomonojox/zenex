"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  providersApi,
  ProviderQuery,
  UpdateProviderInput,
  ServiceInput,
} from "@/lib/api/providers";
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

export const myServiceKeys = ["providers", "me", "services"] as const;

export function useMyServices(enabled = true) {
  return useQuery({
    queryKey: myServiceKeys,
    queryFn: providersApi.listMyServices,
    enabled,
  });
}

/** Any service change also affects public listings, so refresh those too. */
function useServiceMutation<TArgs>(fn: (args: TArgs) => Promise<unknown>) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: myServiceKeys });
      qc.invalidateQueries({ queryKey: providerKeys.all });
      qc.invalidateQueries({ queryKey: userKeys.me });
    },
  });
}

export function useCreateMyService() {
  return useServiceMutation((dto: ServiceInput) =>
    providersApi.createMyService(dto),
  );
}

export function useUpdateMyService() {
  return useServiceMutation(
    ({ id, dto }: { id: string; dto: Partial<ServiceInput> }) =>
      providersApi.updateMyService(id, dto),
  );
}

export function useDeleteMyService() {
  return useServiceMutation((id: string) => providersApi.deleteMyService(id));
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
