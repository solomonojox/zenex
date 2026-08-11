"use client";

import {
  Calendar,
  CreditCard,
  MessageSquare,
  Star,
  ShieldCheck,
  Info,
  Bell,
} from "lucide-react";
import Card from "@/components/ui/Card";
import type { NotificationType } from "@/lib/api/notifications";
import { useNotifications, useMarkAllRead } from "@/lib/queries/notifications";

const ICONS: Record<NotificationType, { I: typeof Bell; c: string }> = {
  booking: { I: Calendar, c: "text-teal-500" },
  payment: { I: CreditCard, c: "text-emerald-500" },
  message: { I: MessageSquare, c: "text-blue-500" },
  review: { I: Star, c: "text-amber-500" },
  verification: { I: ShieldCheck, c: "text-violet-500" },
  info: { I: Info, c: "text-slate-400" },
};

function timeAgo(iso: string) {
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function NotificationsPanel() {
  const { data: items = [], isLoading } = useNotifications();
  const markAllRead = useMarkAllRead();
  const recent = items.slice(0, 6);
  const hasUnread = items.some((n) => !n.read);

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-slate-900">Notifications</h3>
        {hasUnread && (
          <button onClick={() => markAllRead.mutate()} className="text-xs font-bold text-teal-600 hover:text-teal-700">
            Mark all read
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-8 rounded-lg bg-slate-100 animate-pulse" />)}
        </div>
      ) : recent.length === 0 ? (
        <p className="text-xs text-slate-400">Nothing yet — your booking updates will show up here.</p>
      ) : (
        <div className="space-y-3.5">
          {recent.map((n) => {
            const { I, c } = ICONS[n.type] ?? ICONS.info;
            return (
              <div key={n.id} className="flex items-start gap-2.5">
                <I className={`w-4 h-4 ${c} shrink-0 mt-0.5`} />
                <div className="min-w-0">
                  <p className={`text-xs leading-snug ${n.read ? "text-slate-600" : "text-slate-900 font-semibold"}`}>{n.title}</p>
                  <span className="text-xs text-slate-400">{timeAgo(n.createdAt)}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}
