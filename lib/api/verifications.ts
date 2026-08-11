import axios from "@/utils/tokenAxios";

export interface VerificationDoc {
  id: string;
  type: string;
  url: string;
  expiresAt?: string | null;
}

export interface VerificationRequestItem {
  id: string;
  status: string;
  city?: string | null;
  submittedAt: string;
  reviewNote?: string | null;
  documents: VerificationDoc[];
  provider?: { user?: { firstName: string; lastName: string } };
}

export interface UploadedDoc {
  type: string;
  path: string;
  signedUrl: string;
}

export interface SubmitDocInput {
  type: string;
  url: string;
  expiresAt?: string;
}

export const verificationsApi = {
  queue: async (status?: string): Promise<VerificationRequestItem[]> =>
    (await axios.get("/verifications", { params: status ? { status } : undefined })).data,

  review: async (id: string, status: string, note?: string) =>
    (await axios.patch(`/verifications/${id}/review`, { status, note })).data,

  /** My latest verification request (provider). */
  mine: async (): Promise<VerificationRequestItem | null> =>
    (await axios.get("/verifications/me")).data,

  /** Upload one document file to Supabase Storage. */
  uploadDocument: async (type: string, file: File): Promise<UploadedDoc> => {
    const form = new FormData();
    form.append("type", type);
    form.append("file", file);
    return (
      await axios.post("/verifications/documents", form, {
        headers: { "Content-Type": "multipart/form-data" },
      })
    ).data;
  },

  submit: async (dto: { city?: string; documents: SubmitDocInput[] }) =>
    (await axios.post("/verifications", dto)).data,
};
