"use client";

import Card from "@/components/ui/Card";
import { useNotifications, useMarkAllRead } from "@/lib/queries/notifications";
import { notificationIcon, timeAgo } from "@/lib/utils/notifications";

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
            const { I, c } = notificationIcon(n.type);
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
