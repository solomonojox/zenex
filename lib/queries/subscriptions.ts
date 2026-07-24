"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { subscriptionsApi } from "@/lib/api/subscriptions";

export const subscriptionKeys = {
  plans: ["subscription-plans"] as const,
  mine: ["subscriptions", "me"] as const,
};

export function usePlans() {
  return useQuery({ queryKey: subscriptionKeys.plans, queryFn: subscriptionsApi.plans });
}

export function useMySubscriptions(enabled = true) {
  return useQuery({
    queryKey: subscriptionKeys.mine,
    queryFn: subscriptionsApi.mine,
    enabled,
  });
}

export function useSubscribe() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (planId: string) => subscriptionsApi.subscribe(planId),
    onSuccess: () => qc.invalidateQueries({ queryKey: subscriptionKeys.mine }),
  });
}

export function useCancelSubscription() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => subscriptionsApi.cancel(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: subscriptionKeys.mine }),
  });
}
