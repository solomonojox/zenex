"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { walletApi } from "@/lib/api/wallet";
import { paymentsApi } from "@/lib/api/payments";
import { bookingKeys } from "@/lib/queries/bookings";

export const walletKeys = {
  wallet: ["wallet"] as const,
  transactions: ["wallet", "transactions"] as const,
  payouts: ["wallet", "payouts"] as const,
};

export function useWallet(enabled = true) {
  return useQuery({ queryKey: walletKeys.wallet, queryFn: walletApi.get, enabled });
}

export function useTransactions(enabled = true) {
  return useQuery({
    queryKey: walletKeys.transactions,
    queryFn: walletApi.transactions,
    enabled,
  });
}

export function usePayouts(enabled = true) {
  return useQuery({
    queryKey: walletKeys.payouts,
    queryFn: walletApi.payouts,
    enabled,
  });
}

export function useConnectStatus(enabled = true) {
  return useQuery({
    queryKey: ["payments", "connect", "status"],
    queryFn: paymentsApi.connectStatus,
    enabled,
  });
}

export function useConnectOnboarding() {
  return useMutation({
    mutationFn: (returnUrl: string) => paymentsApi.connectOnboarding(returnUrl),
  });
}

export function useRequestPayout() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => paymentsApi.payout(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: walletKeys.wallet });
      qc.invalidateQueries({ queryKey: walletKeys.transactions });
      qc.invalidateQueries({ queryKey: walletKeys.payouts });
      qc.invalidateQueries({ queryKey: bookingKeys.all });
    },
  });
}
