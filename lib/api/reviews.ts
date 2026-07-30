import axios from "@/utils/tokenAxios";

export interface ApiReview {
  id: string;
  rating: number;
  comment?: string | null;
  createdAt: string;
  client?: { user?: { firstName: string; lastName: string } };
}

export interface CreateReviewInput {
  bookingId: string;
  rating: number;
  comment?: string;
}

export const reviewsApi = {
  listByProvider: async (providerId: string): Promise<ApiReview[]> =>
    (await axios.get("/reviews", { params: { providerId } })).data,

  create: async (dto: CreateReviewInput): Promise<ApiReview> =>
    (await axios.post("/reviews", dto)).data,
};
