"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { bookingsApi, CreateBookingInput, BookingExtraInput } from "@/lib/api/bookings";
import { paymentsApi } from "@/lib/api/payments";

export const bookingKeys = {
  all: ["bookings"] as const,
  list: (status?: string) => ["bookings", "list", status ?? "all"] as const,
};

export function useMyBookings(status?: string) {
  return useQuery({
    queryKey: bookingKeys.list(status),
    queryFn: () => bookingsApi.list(status ? { status } : undefined),
  });
}

/** Live price preview including sales tax. */
export function useQuote(
  providerId: string,
  serviceId: string | undefined,
  extras: BookingExtraInput[],
) {
  return useQuery({
    queryKey: ["bookings", "quote", providerId, serviceId, extras],
    queryFn: () => bookingsApi.quote({ providerId, serviceId, extras }),
    enabled: !!providerId,
  });
}

export function useCreateBooking() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateBookingInput) => bookingsApi.create(dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: bookingKeys.all }),
  });
}

export function useCheckout() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (bookingId: string) => paymentsApi.checkout(bookingId),
    onSuccess: () => qc.invalidateQueries({ queryKey: bookingKeys.all }),
  });
}

export function useCancelBooking() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => bookingsApi.cancel(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: bookingKeys.all }),
  });
}

export function useUpdateBookingStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      bookingsApi.updateStatus(id, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: bookingKeys.all }),
  });
}
