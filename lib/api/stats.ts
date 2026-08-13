import axios from "@/utils/tokenAxios";

export interface PublicTestimonial {
  name: string;
  initials: string;
  location: string;
  service: string;
  rating: number;
  comment: string;
}

export interface PublicStats {
  providers: number;
  verifiedProviders: number;
  completedBookings: number;
  /** null when there are no reviews yet — do not render "0.0 ★". */
  averageRating: number | null;
  reviewsCount: number;
  cities: { name: string; providers: number }[];
  testimonials: PublicTestimonial[];
}

export const statsApi = {
  publicStats: async (): Promise<PublicStats> =>
    (await axios.get("/stats")).data,
};
