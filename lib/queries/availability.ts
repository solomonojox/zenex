"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { availabilityApi, AvailabilityRule } from "@/lib/api/availability";

export const availabilityKeys = {
  slots: (providerId: string, date: string, duration?: number) =>
    ["availability", "slots", providerId, date, duration ?? 120] as const,
  schedule: (providerId: string) =>
    ["availability", "schedule", providerId] as const,
  mine: ["availability", "me"] as const,
};

/** Public: a provider's published weekly hours. */
export function useProviderSchedule(providerId: string) {
  return useQuery({
    queryKey: availabilityKeys.schedule(providerId),
    queryFn: () => availabilityApi.providerSchedule(providerId),
    enabled: !!providerId,
  });
}

export function useSlots(
  providerId: string,
  date: string,
  durationMins?: number,
) {
  return useQuery({
    queryKey: availabilityKeys.slots(providerId, date, durationMins),
    queryFn: () => availabilityApi.slots(providerId, date, durationMins),
    enabled: !!providerId && !!date,
  });
}

export function useMySchedule(enabled = true) {
  return useQuery({
    queryKey: availabilityKeys.mine,
    queryFn: availabilityApi.mySchedule,
    enabled,
  });
}

export function useSetMySchedule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (rules: AvailabilityRule[]) =>
      availabilityApi.setMySchedule(rules),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["availability"] }),
  });
}

export function useAddTimeOff() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: { startsAt: string; endsAt: string; reason?: string }) =>
      availabilityApi.addTimeOff(dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["availability"] }),
  });
}

export function useRemoveTimeOff() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => availabilityApi.removeTimeOff(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["availability"] }),
  });
}
