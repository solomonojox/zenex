import axios from "@/utils/tokenAxios";

export type NotificationType =
  | "booking"
  | "payment"
  | "message"
  | "review"
  | "verification"
  | "info";

export interface AppNotification {
  id: string;
  title: string;
  body?: string | null;
  type: NotificationType;
  read: boolean;
  createdAt: string;
}

export const notificationsApi = {
  list: async (): Promise<AppNotification[]> =>
    (await axios.get("/notifications")).data,

  unreadCount: async (): Promise<{ count: number }> =>
    (await axios.get("/notifications/unread-count")).data,

  markRead: async (id: string) =>
    (await axios.patch(`/notifications/${id}/read`)).data,

  markAllRead: async () => (await axios.patch("/notifications/read-all")).data,
};
