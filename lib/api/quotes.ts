import axios from "@/utils/tokenAxios";
import type { ApiBooking, BookingExtraInput } from "@/lib/api/bookings";

export interface PricedOption {
  key: string;
  label: string;
  description?: string | null;
  popular: boolean;
  subtotal: number;
  taxAmount: number;
  taxLabel: string;
  total: number;
  durationMins: number;
}

export interface MatchedProvider {
  id: string;
  name: string;
  rating: number;
  reviewsCount: number;
  verified: boolean;
  imageUrl?: string | null;
  location: string;
}

export interface InstantSlot {
  start: string;
  label: string;
  /** How many cleaners are free at this time. */
  count: number;
}

export interface PropertySize {
  bedrooms: number;
  bathrooms: number;
  location?: string;
}

export const quotesApi = {
  /** Prices for every service type at this property size. */
  instant: async (params: PropertySize): Promise<PricedOption[]> =>
    (await axios.get("/quotes/instant", { params })).data,

  /** Openings merged across all cleaners for a given day. */
  slots: async (
    params: PropertySize & { key: string; date: string },
  ): Promise<{ quote: PricedOption; slots: InstantSlot[] }> =>
    (await axios.get("/quotes/instant/slots", { params })).data,

  book: async (dto: {
    key: string;
    bedrooms: number;
    bathrooms: number;
    scheduledFor: string;
    address: string;
    notes?: string;
    location?: string;
    providerId?: string;
    extras?: BookingExtraInput[];
  }): Promise<{
    booking: ApiBooking;
    matchedProvider: MatchedProvider;
    quote: PricedOption;
  }> => (await axios.post("/quotes/instant/book", dto)).data,
};
