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
  totalPrice: number;
  scheduledFor: string;
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

export interface BookingList {
  items: ApiBooking[];
  meta: { page: number; limit: number; total: number; pages: number };
}

export const bookingsApi = {
  create: async (dto: CreateBookingInput): Promise<ApiBooking> =>
    (await axios.post("/bookings", dto)).data,

  list: async (params?: { status?: string }): Promise<BookingList> =>
    (await axios.get("/bookings", { params })).data,

  get: async (id: string): Promise<ApiBooking> =>
    (await axios.get(`/bookings/${id}`)).data,

  cancel: async (id: string): Promise<ApiBooking> =>
    (await axios.patch(`/bookings/${id}/cancel`)).data,

  updateStatus: async (id: string, status: string): Promise<ApiBooking> =>
    (await axios.patch(`/bookings/${id}/status`, { status })).data,
};
