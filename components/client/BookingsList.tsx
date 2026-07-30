"use client";

import Link from "next/link";
import { Calendar, Clock, MessageSquare, MoreVertical } from "lucide-react";
import Card from "@/components/ui/Card";
import StatusPill from "@/components/ui/StatusPill";
import { useMyBookings } from "@/lib/queries/bookings";

function fmtDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  } catch {
    return "";
  }
}

export default function BookingsList() {
  const { data, isLoading } = useMyBookings();
  const bookings = data?.items ?? [];

  if (isLoading) {
    return (
      <div className="space-y-3 mb-7">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="h-20 rounded-2xl bg-slate-100 animate-pulse" />
        ))}
      </div>
    );
  }

  if (bookings.length === 0) {
    return (
      <Card className="p-6 text-center text-sm text-slate-400 mb-7">
        No bookings yet.{" "}
        <Link href="/search" className="text-teal-600 font-bold">Find a cleaner →</Link>
      </Card>
    );
  }

  return (
    <div className="space-y-3 mb-7">
      {bookings.map((b) => {
        const providerName = b.provider?.user
          ? `${b.provider.user.firstName} ${b.provider.user.lastName}`
          : b.provider?.title ?? "Provider";
        const img =
          b.provider?.imageUrl ||
          `https://ui-avatars.com/api/?name=${encodeURIComponent(providerName)}&background=0D9488&color=fff`;
        return (
          <Card key={b.id} className="p-4 flex items-center gap-4">
            <img src={img} alt={providerName} className="w-12 h-12 rounded-xl object-cover shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap"><span className="font-bold text-sm text-slate-900">{b.service?.name ?? "Cleaning"}</span><StatusPill s={b.status.toLowerCase()} /></div>
              <div className="text-xs text-slate-500 mt-0.5">with {providerName}</div>
              <div className="flex items-center gap-3 mt-1 text-xs text-slate-400"><span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{fmtDate(b.scheduledFor)}</span>{b.timeSlot && <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{b.timeSlot}</span>}</div>
            </div>
            <div className="text-right shrink-0">
              <div className="font-extrabold text-slate-900">${b.totalPrice}</div>
              <div className="flex gap-1 mt-2 justify-end">
                <Link href="/messages" className="p-1.5 rounded-lg hover:bg-teal-50 text-slate-400 hover:text-teal-600 transition-colors"><MessageSquare className="w-3.5 h-3.5" /></Link>
                <button className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors"><MoreVertical className="w-3.5 h-3.5" /></button>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
