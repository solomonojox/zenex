import axios from "@/utils/tokenAxios";

export interface ApiThread {
  id: string;
  clientId: string;
  providerId: string;
  lastPreview?: string | null;
  lastMessageAt: string;
  counterpart?: { id: string; name: string; image?: string | null } | null;
}

export interface ApiMessage {
  id: string;
  threadId: string;
  senderId: string;
  body: string;
  readAt?: string | null;
  createdAt: string;
}

export const messagesApi = {
  threads: async (): Promise<ApiThread[]> =>
    (await axios.get("/messages/threads")).data,

  messages: async (threadId: string): Promise<ApiMessage[]> =>
    (await axios.get(`/messages/threads/${threadId}`)).data,

  send: async (threadId: string, body: string): Promise<ApiMessage> =>
    (await axios.post(`/messages/threads/${threadId}/messages`, { body })).data,

  createThread: async (counterpartId: string): Promise<ApiThread> =>
    (await axios.post("/messages/threads", { counterpartId })).data,
};
