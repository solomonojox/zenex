"use client";

import { useQuery } from "@tanstack/react-query";
import { reviewsApi } from "@/lib/api/reviews";

export const reviewKeys = {
  byProvider: (providerId: string) => ["reviews", providerId] as const,
};

export function useProviderReviews(providerId: string) {
  return useQuery({
    queryKey: reviewKeys.byProvider(providerId),
    queryFn: () => reviewsApi.listByProvider(providerId),
    enabled: !!providerId,
  });
}
