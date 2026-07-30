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

export const subscriptionsApi = {
  plans: async (): Promise<ApiPlan[]> =>
    (await axios.get("/subscription-plans")).data,

  mine: async (): Promise<ApiSubscription[]> =>
    (await axios.get("/subscriptions/me")).data,

  subscribe: async (planId: string): Promise<ApiSubscription> =>
    (await axios.post("/subscriptions", { planId })).data,

  cancel: async (id: string): Promise<ApiSubscription> =>
    (await axios.patch(`/subscriptions/${id}/cancel`)).data,
};
