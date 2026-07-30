"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { reviewsApi, CreateReviewInput } from "@/lib/api/reviews";
import { bookingKeys } from "@/lib/queries/bookings";

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

export function useCreateReview() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateReviewInput) => reviewsApi.create(dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: bookingKeys.all });
      qc.invalidateQueries({ queryKey: ["reviews"] });
      qc.invalidateQueries({ queryKey: ["providers"] });
    },
  });
}
