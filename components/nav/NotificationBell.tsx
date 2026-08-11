"use client";

import { useEffect, useRef, useState } from "react";
import { Bell } from "lucide-react";
import {
  useNotifications,
  useUnreadCount,
  useMarkRead,
  useMarkAllRead,
} from "@/lib/queries/notifications";
import { notificationIcon, timeAgo } from "@/lib/utils/notifications";

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const { data: unread } = useUnreadCount();
  const { data: items = [], isLoading } = useNotifications(open);
  const markRead = useMarkRead();
  const markAllRead = useMarkAllRead();

  const count = unread?.count ?? 0;

  // Close when clicking outside the dropdown.
  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Notifications"
        className="relative p-2 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors"
      >
        <Bell className="w-5 h-5" />
        {count > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-teal-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-white">
            {count > 9 ? "9+" : count}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl ring-1 ring-black/[0.06] overflow-hidden z-50">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
            <span className="font-bold text-sm text-slate-900">Notifications</span>
            {count > 0 && (
              <button
                onClick={() => markAllRead.mutate()}
                className="text-xs font-bold text-teal-600 hover:text-teal-700"
              >
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {isLoading ? (
              <div className="p-4 space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-10 rounded-lg bg-slate-100 animate-pulse" />
                ))}
              </div>
            ) : items.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-8">
                You&apos;re all caught up.
              </p>
            ) : (
              items.map((n) => {
                const { I, c } = notificationIcon(n.type);
                return (
                  <button
                    key={n.id}
                    onClick={() => !n.read && markRead.mutate(n.id)}
                    className={`w-full flex items-start gap-3 px-4 py-3 text-left border-b border-slate-50 last:border-0 transition-colors hover:bg-slate-50 ${n.read ? "" : "bg-teal-50/40"}`}
                  >
                    <I className={`w-4 h-4 shrink-0 mt-0.5 ${c}`} />
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs leading-snug ${n.read ? "text-slate-600" : "text-slate-900 font-semibold"}`}>
                        {n.title}
                      </p>
                      {n.body && <p className="text-xs text-slate-400 truncate mt-0.5">{n.body}</p>}
                      <span className="text-[10px] text-slate-400">{timeAgo(n.createdAt)}</span>
                    </div>
                    {!n.read && <span className="w-2 h-2 rounded-full bg-teal-500 shrink-0 mt-1.5" />}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
