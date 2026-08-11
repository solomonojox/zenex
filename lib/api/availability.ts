import axios from "@/utils/tokenAxios";

export interface Slot {
  start: string; // ISO
  label: string; // e.g. "9:00 AM"
}

export interface AvailabilityRule {
  id?: string;
  dayOfWeek: number; // 0 = Sunday … 6 = Saturday
  startMinute: number;
  endMinute: number;
}

export interface TimeOff {
  id: string;
  startsAt: string;
  endsAt: string;
  reason?: string | null;
}

export interface Schedule {
  rules: AvailabilityRule[];
  timeOff: TimeOff[];
}

export const availabilityApi = {
  slots: async (
    providerId: string,
    date: string,
    durationMins?: number,
  ): Promise<Slot[]> =>
    (
      await axios.get(`/availability/providers/${providerId}/slots`, {
        params: { date, durationMins },
      })
    ).data,

  providerSchedule: async (providerId: string): Promise<Schedule> =>
    (await axios.get(`/availability/providers/${providerId}/schedule`)).data,

  mySchedule: async (): Promise<Schedule> =>
    (await axios.get("/availability/me")).data,

  setMySchedule: async (rules: AvailabilityRule[]): Promise<Schedule> =>
    (await axios.put("/availability/me", { rules })).data,

  addTimeOff: async (dto: { startsAt: string; endsAt: string; reason?: string }) =>
    (await axios.post("/availability/me/time-off", dto)).data,

  removeTimeOff: async (id: string) =>
    (await axios.delete(`/availability/me/time-off/${id}`)).data,
};
