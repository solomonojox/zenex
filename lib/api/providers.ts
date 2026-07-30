import axios from "@/utils/tokenAxios";
import type { Provider } from "@/lib/types";

export interface ApiService {
  id: string;
  name: string;
  description?: string | null;
  duration?: string | null;
  price: number;
}

export interface ApiProvider {
  id: string;
  title: string;
  location: string;
  bio?: string | null;
  imageUrl?: string | null;
  hourlyRate: number;
  rating: number;
  reviewsCount: number;
  completions: number;
  responseTime?: string | null;
  languages: string[];
  tags: string[];
  verified: boolean;
  elite: boolean;
  instant: boolean;
  aiMatch: number;
  user?: { firstName: string; lastName: string };
  services?: ApiService[];
}

export interface ProviderQuery {
  q?: string;
  location?: string;
  verified?: string;
  instant?: string;
  sort?: string;
  page?: number;
  limit?: number;
}

export interface Paginated<T> {
  items: T[];
  meta: { page: number; limit: number; total: number; pages: number };
}

// Seeded providers have no image; generate a stable initials avatar.
function avatar(name: string) {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(
    name,
  )}&background=0D9488&color=fff&size=400&bold=true`;
}

/** Map the API's ProviderProfile shape onto the UI's Provider type. */
export function mapProvider(api: ApiProvider): Provider {
  const name = api.user
    ? `${api.user.firstName} ${api.user.lastName}`.trim()
    : api.title;
  return {
    id: api.id,
    name: name || api.title,
    title: api.title,
    location: api.location,
    rating: api.rating,
    reviews: api.reviewsCount,
    price: api.hourlyRate,
    verified: api.verified,
    elite: api.elite,
    instant: api.instant,
    tags: api.tags ?? [],
    image: api.imageUrl || avatar(name || api.title),
    completions: api.completions,
    responseTime: api.responseTime || "",
    languages: api.languages ?? [],
    bio: api.bio || "",
    services: (api.services ?? []).map((s) => ({
      id: s.id,
      name: s.name,
      duration: s.duration || "",
      price: s.price,
      desc: s.description || "",
    })),
    ai_match: api.aiMatch,
  };
}

export interface UpdateProviderInput {
  title?: string;
  location?: string;
  bio?: string;
  hourlyRate?: number;
  minBookingHrs?: number;
  maxRadiusKm?: number;
  languages?: string[];
  tags?: string[];
}

export const providersApi = {
  list: async (params: ProviderQuery = {}): Promise<Paginated<Provider>> => {
    const { data } = await axios.get("/providers", { params });
    return { items: (data.items ?? []).map(mapProvider), meta: data.meta };
  },
  get: async (id: string): Promise<Provider> =>
    mapProvider((await axios.get(`/providers/${id}`)).data),
  updateMine: async (dto: UpdateProviderInput) =>
    (await axios.patch("/providers/me/profile", dto)).data,
};
