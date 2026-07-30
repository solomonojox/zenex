import axios from "@/utils/tokenAxios";

export interface ApiWallet {
  id: string;
  balance: number;
  currency: string;
}

export interface ApiTransaction {
  id: string;
  reference: string;
  description: string;
  amount: number;
  type: "CREDIT" | "DEBIT";
  status: string;
  createdAt: string;
}

export interface ApiPayout {
  id: string;
  reference: string;
  amount: number;
  jobsCount: number;
  status: string;
  createdAt: string;
  paidAt?: string | null;
}

export const walletApi = {
  get: async (): Promise<ApiWallet> => (await axios.get("/wallet")).data,
  transactions: async (): Promise<ApiTransaction[]> =>
    (await axios.get("/wallet/transactions")).data,
  payouts: async (): Promise<ApiPayout[]> =>
    (await axios.get("/wallet/payouts")).data,
};
