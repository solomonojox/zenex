import axios from "@/utils/tokenAxios";

export interface VerificationDoc {
  id: string;
  type: string;
  url: string;
}

export interface VerificationRequestItem {
  id: string;
  status: string;
  city?: string | null;
  submittedAt: string;
  documents: VerificationDoc[];
  provider?: { user?: { firstName: string; lastName: string } };
}

export const verificationsApi = {
  queue: async (status?: string): Promise<VerificationRequestItem[]> =>
    (await axios.get("/verifications", { params: status ? { status } : undefined })).data,

  review: async (id: string, status: string, note?: string) =>
    (await axios.patch(`/verifications/${id}/review`, { status, note })).data,
};
