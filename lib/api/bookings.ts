import axios from "@/utils/tokenAxios";

export interface BookingExtraInput {
  name: string;
  price: number;
}

export interface CreateBookingInput {
  providerId: string;
  serviceId?: string;
  scheduledFor: string; // ISO date
  timeSlot?: string;
  hours?: number;
  /** Job length in minutes — drives availability conflict checks. */
  durationMins?: number;
  address?: string;
  notes?: string;
  extras?: BookingExtraInput[];
}

export interface ApiBooking {
  id: string;
  reference: string;
  providerId: string;
  status: string;
  basePrice: number;
  extrasTotal: number;
  taxAmount?: number;
  taxLabel?: string | null;
  totalPrice: number;
  scheduledFor: string;
  durationMins?: number;
  timeSlot?: string | null;
  address?: string | null;
  provider?: {
    title: string;
    imageUrl?: string | null;
    user?: { firstName: string; lastName: string };
  };
  client?: {
    user?: { firstName: string; lastName: string };
  };
  service?: { name: string } | null;
  extras?: { id: string; name: string; price: number }[];
  review?: { id: string; rating: number } | null;
}

export interface Quote {
  basePrice: number;
  extrasTotal: number;
  subtotal: number;
  taxAmount: number;
  taxRate: number;
  taxLabel: string;
  province: string;
  total: number;
}

export interface BookingList {
  items: ApiBooking[];
  meta: { page: number; limit: number; total: number; pages: number };
}

export const bookingsApi = {
  create: async (dto: CreateBookingInput): Promise<ApiBooking> =>
    (await axios.post("/bookings", dto)).data,

  quote: async (dto: {
    providerId: string;
    serviceId?: string;
    extras?: BookingExtraInput[];
  }): Promise<Quote> => (await axios.post("/bookings/quote", dto)).data,

  list: async (params?: { status?: string }): Promise<BookingList> =>
    (await axios.get("/bookings", { params })).data,

  get: async (id: string): Promise<ApiBooking> =>
    (await axios.get(`/bookings/${id}`)).data,

  cancel: async (
    id: string,
  ): Promise<
    ApiBooking & {
      refund?: { refundAmount: number; percent: number } | null;
    }
  > => (await axios.patch(`/bookings/${id}/cancel`)).data,

  updateStatus: async (id: string, status: string): Promise<ApiBooking> =>
    (await axios.patch(`/bookings/${id}/status`, { status })).data,
};
