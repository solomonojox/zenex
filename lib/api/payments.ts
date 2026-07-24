import axios from "@/utils/tokenAxios";

export interface CheckoutResult {
  mode: "demo" | "live";
  paid?: boolean;
  amount: number;
  platformFee: number;
  providerEarning: number;
  clientSecret?: string;
  bookingId?: string;
}

export const paymentsApi = {
  checkout: async (bookingId: string): Promise<CheckoutResult> =>
    (await axios.post(`/payments/bookings/${bookingId}/checkout`)).data,

  payout: async (): Promise<unknown> =>
    (await axios.post(`/payments/payouts`)).data,
};
