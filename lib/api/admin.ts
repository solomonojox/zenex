import axios from "@/utils/tokenAxios";

export interface AdminOverview {
  users: number;
  clients: number;
  providers: number;
  bookings: number;
  bookingsByStatus: Record<string, number>;
  grossBookingValue: number;
  grossPaid: number;
  platformRevenue: number;
  activeSubscriptions: number;
  pendingVerifications: number;
  openDisputes: number;
}

export interface AdminUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  isActive: boolean;
  createdAt: string;
}

export interface AdminUserList {
  items: AdminUser[];
  meta: { page: number; limit: number; total: number; pages: number };
}

export interface AdminDispute {
  id: string;
  reference: string;
  clientName: string;
  providerName: string;
  issue: string;
  priority: string;
  status: string;
  createdAt: string;
}

export const adminApi = {
  overview: async (): Promise<AdminOverview> =>
    (await axios.get("/admin/overview")).data,

  users: async (params?: {
    role?: string;
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<AdminUserList> => (await axios.get("/admin/users", { params })).data,

  setUserStatus: async (id: string, active: boolean) =>
    (await axios.patch(`/admin/users/${id}/status`, { active })).data,

  disputes: async (status?: string): Promise<AdminDispute[]> =>
    (await axios.get("/admin/disputes", { params: status ? { status } : undefined })).data,

  resolveDispute: async (id: string, status: string): Promise<AdminDispute> =>
    (await axios.patch(`/admin/disputes/${id}/resolve`, { status })).data,
};
