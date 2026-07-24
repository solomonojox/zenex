import axios from "@/utils/tokenAxios";
import { ApiProvider, mapProvider } from "@/lib/api/providers";
import type { Provider } from "@/lib/types";

interface ApiFavorite {
  id: string;
  providerId: string;
  provider: ApiProvider;
}

export interface Favorite {
  id: string;
  provider: Provider;
}

export const favoritesApi = {
  list: async (): Promise<Favorite[]> => {
    const data = (await axios.get("/favorites")).data as ApiFavorite[];
    return data.map((f) => ({ id: f.id, provider: mapProvider(f.provider) }));
  },
  add: async (providerId: string) =>
    (await axios.post("/favorites", { providerId })).data,
  remove: async (providerId: string) =>
    (await axios.delete(`/favorites/${providerId}`)).data,
};
