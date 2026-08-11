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

export interface ConnectStatus {
  mode: "demo" | "live";
  connected: boolean;
  payoutsEnabled: boolean;
  detailsSubmitted: boolean;
  requirements?: string[];
}

export const paymentsApi = {
  checkout: async (bookingId: string): Promise<CheckoutResult> =>
    (await axios.post(`/payments/bookings/${bookingId}/checkout`)).data,

  payout: async (): Promise<unknown> =>
    (await axios.post(`/payments/payouts`)).data,

  connectStatus: async (): Promise<ConnectStatus> =>
    (await axios.get(`/payments/connect/status`)).data,

  connectOnboarding: async (
    returnUrl: string,
  ): Promise<{ mode: "demo" | "live"; url: string | null; message?: string }> =>
    (await axios.post(`/payments/connect/onboarding`, { returnUrl })).data,
};
