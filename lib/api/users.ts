import axios from "@/utils/tokenAxios";

export const usersApi = {
  me: async () => (await axios.get("/users/me")).data,
};
