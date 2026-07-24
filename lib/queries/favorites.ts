"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { favoritesApi } from "@/lib/api/favorites";

export const favoriteKeys = {
  all: ["favorites"] as const,
};

export function useFavorites(enabled = true) {
  return useQuery({
    queryKey: favoriteKeys.all,
    queryFn: favoritesApi.list,
    enabled,
  });
}

export function useAddFavorite() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (providerId: string) => favoritesApi.add(providerId),
    onSuccess: () => qc.invalidateQueries({ queryKey: favoriteKeys.all }),
  });
}

export function useRemoveFavorite() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (providerId: string) => favoritesApi.remove(providerId),
    onSuccess: () => qc.invalidateQueries({ queryKey: favoriteKeys.all }),
  });
}
