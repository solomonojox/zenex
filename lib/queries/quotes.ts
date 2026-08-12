"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { quotesApi, PropertySize } from "@/lib/api/quotes";
import { bookingKeys } from "@/lib/queries/bookings";

export const quoteKeys = {
  instant: (p: PropertySize) => ["quotes", "instant", p] as const,
  slots: (p: PropertySize & { key: string; date: string }) =>
    ["quotes", "slots", p] as const,
};

export function useInstantQuote(params: PropertySize, enabled = true) {
  return useQuery({
    queryKey: quoteKeys.instant(params),
    queryFn: () => quotesApi.instant(params),
    enabled,
  });
}

export function useInstantSlots(
  params: PropertySize & { key: string; date: string },
  enabled = true,
) {
  return useQuery({
    queryKey: quoteKeys.slots(params),
    queryFn: () => quotesApi.slots(params),
    enabled: enabled && !!params.key && !!params.date,
  });
}

export function useInstantBook() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: quotesApi.book,
    onSuccess: () => qc.invalidateQueries({ queryKey: bookingKeys.all }),
  });
}
