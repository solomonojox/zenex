import {
  Bell,
  Calendar,
  CreditCard,
  MessageSquare,
  Star,
  ShieldCheck,
  Info,
} from "lucide-react";
import type { NotificationType } from "@/lib/api/notifications";

/** Icon + colour per notification type — shared by the bell and the panel. */
export const NOTIFICATION_ICONS: Record<
  NotificationType,
  { I: typeof Bell; c: string }
> = {
  booking: { I: Calendar, c: "text-teal-500" },
  payment: { I: CreditCard, c: "text-emerald-500" },
  message: { I: MessageSquare, c: "text-blue-500" },
  review: { I: Star, c: "text-amber-500" },
  verification: { I: ShieldCheck, c: "text-violet-500" },
  info: { I: Info, c: "text-slate-400" },
};

export function notificationIcon(type: NotificationType) {
  return NOTIFICATION_ICONS[type] ?? NOTIFICATION_ICONS.info;
}

/** Compact relative time, e.g. "5m ago". */
export function timeAgo(iso: string): string {
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}
