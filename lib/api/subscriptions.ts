import axios from "@/utils/tokenAxios";

export interface ApiPlan {
  id: string;
  name: string;
  frequency: string;
  price: number;
  savesPercent: number;
  features: string[];
  popular: boolean;
}

export interface ApiSubscription {
  id: string;
  planId: string;
  status: string;
  startedAt: string;
  renewsAt?: string | null;
  plan?: ApiPlan;
}

export interface SubscriptionQuote {
  plan: ApiPlan;
  subtotal: number;
  taxAmount: number;
  taxLabel: string;
  province: string;
  total: number;
  firstChargeOn: string;
  renewsAt: string;
  cancellationTerms: string;
}

/** Demo mode settles immediately; live mode hands off to Stripe Checkout. */
export interface SubscribeResult {
  mode: "demo" | "live";
  subscriptionId: string;
  checkoutUrl?: string | null;
  subscription?: ApiSubscription;
}

export const subscriptionsApi = {
  plans: async (): Promise<ApiPlan[]> =>
    (await axios.get("/subscription-plans")).data,

  mine: async (): Promise<ApiSubscription[]> =>
    (await axios.get("/subscriptions/me")).data,

  quote: async (planId: string): Promise<SubscriptionQuote> =>
    (await axios.get(`/subscriptions/quote/${planId}`)).data,

  subscribe: async (planId: string): Promise<SubscribeResult> =>
    // consent is always true here: the button that calls this is disabled
    // until the box is ticked, and the API rejects the request without it.
    (await axios.post("/subscriptions", { planId, consent: true })).data,

  cancel: async (id: string): Promise<ApiSubscription> =>
    (await axios.patch(`/subscriptions/${id}/cancel`)).data,
};
