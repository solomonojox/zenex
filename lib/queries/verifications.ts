"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { verificationsApi, SubmitDocInput } from "@/lib/api/verifications";

export const verificationKeys = {
  queue: (status?: string) => ["verifications", "queue", status ?? "pending"] as const,
  mine: ["verifications", "me"] as const,
};

export function useVerificationQueue(status?: string) {
  return useQuery({
    queryKey: verificationKeys.queue(status),
    queryFn: () => verificationsApi.queue(status),
  });
}

/** The signed-in provider's latest verification request. */
export function useMyVerification(enabled = true) {
  return useQuery({
    queryKey: verificationKeys.mine,
    queryFn: verificationsApi.mine,
    enabled,
  });
}

export function useUploadDocument() {
  return useMutation({
    mutationFn: ({ type, file }: { type: string; file: File }) =>
      verificationsApi.uploadDocument(type, file),
  });
}

export function useSubmitVerification() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: { city?: string; documents: SubmitDocInput[] }) =>
      verificationsApi.submit(dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["verifications"] }),
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
