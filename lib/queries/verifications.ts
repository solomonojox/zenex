"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { verificationsApi } from "@/lib/api/verifications";

export const verificationKeys = {
  queue: (status?: string) => ["verifications", "queue", status ?? "pending"] as const,
};

export function useVerificationQueue(status?: string) {
  return useQuery({
    queryKey: verificationKeys.queue(status),
    queryFn: () => verificationsApi.queue(status),
  });
}

export function useReviewVerification() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status, note }: { id: string; status: string; note?: string }) =>
      verificationsApi.review(id, status, note),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["verifications"] }),
  });
}
