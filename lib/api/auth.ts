import axios from "@/utils/tokenAxios";

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: "CLIENT" | "PROVIDER";
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export const authApi = {
  login: async (dto: LoginInput): Promise<AuthTokens> =>
    (await axios.post("/auth/login", dto)).data,

  register: async (dto: RegisterInput): Promise<AuthTokens> =>
    (await axios.post("/auth/register", dto)).data,

  logout: async (): Promise<{ loggedOut: boolean }> =>
    (await axios.post("/auth/logout")).data,

  forgotPassword: async (email: string): Promise<{ message: string }> =>
    (await axios.post("/auth/forgot-password", { email })).data,

  resetPassword: async (
    token: string,
    password: string,
  ): Promise<{ message: string }> =>
    (await axios.post("/auth/reset-password", { token, password })).data,
};
