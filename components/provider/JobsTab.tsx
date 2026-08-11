"use client";

import Link from "next/link";
import { MapPin, Calendar, Clock, MessageSquare, Banknote, ChevronRight } from "lucide-react";
import Card from "@/components/ui/Card";
import StatusPill from "@/components/ui/StatusPill";
import { useMyBookings, useUpdateBookingStatus } from "@/lib/queries/bookings";
import { formatBookingDate as fmtDate } from "@/lib/utils/datetime";

const NEXT_ACTION: Record<string, { label: string; status: string } | undefined> = {
  PENDING: { label: "Accept", status: "CONFIRMED" },
  CONFIRMED: { label: "Start", status: "IN_PROGRESS" },
  IN_PROGRESS: { label: "Complete", status: "COMPLETED" },
};

function initials(name: string) {
  return name.split(" ").map((w) => w[0]).filter(Boolean).join("").slice(0, 2).toUpperCase();
}

export default function JobsTab() {
  const { data, isLoading } = useMyBookings();
  const update = useUpdateBookingStatus();
  const jobs = (data?.items ?? []).filter((j) => j.status !== "CANCELLED");

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-2">
        <h2 className="font-extrabold text-slate-900 text-lg">Jobs</h2>
        <span className="text-xs font-bold bg-teal-50 text-teal-700 px-2.5 py-1 rounded-full">{jobs.length} total</span>
      </div>

      {isLoading && Array.from({ length: 2 }).map((_, i) => <div key={i} className="h-24 rounded-2xl bg-slate-100 animate-pulse" />)}

      {!isLoading && jobs.length === 0 && (
        <Card className="p-6 text-center text-sm text-slate-400">No jobs yet — they&apos;ll appear here once clients book you.</Card>
      )}

      {jobs.map((j) => {
        const client = j.client?.user ? `${j.client.user.firstName} ${j.client.user.lastName}` : "Client";
        const action = NEXT_ACTION[j.status];
        return (
          <Card key={j.id} className="p-5">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-400 to-emerald-400 flex items-center justify-center text-white text-xs font-bold shrink-0">{initials(client)}</div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2"><span className="font-bold text-slate-900">{client}</span><span className="text-xs bg-teal-50 text-teal-700 px-2 py-0.5 rounded-full font-bold">{j.service?.name ?? "Cleaning"}</span><StatusPill s={j.status.toLowerCase()} /></div>
                <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-1"><MapPin className="w-3 h-3" />{j.address || "Address shared after confirmation"}</div>
                <div className="flex items-center gap-4 mt-1.5 text-xs text-slate-400"><span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{fmtDate(j.scheduledFor)}</span>{j.timeSlot && <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{j.timeSlot}</span>}</div>
              </div>
              <div className="text-right shrink-0">
                <div className="font-extrabold text-slate-900 text-lg">${j.totalPrice}</div>
                <div className="flex gap-1.5 mt-2 justify-end items-center">
                  <Link href="/messages" className="px-2.5 py-1.5 ring-1 ring-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50"><MessageSquare className="w-3 h-3" /></Link>
                  {action && (
                    <button
                      onClick={() => update.mutate({ id: j.id, status: action.status })}
                      disabled={update.isPending}
                      className="px-3 py-1.5 bg-teal-600 rounded-lg text-xs font-bold text-white hover:bg-teal-700 disabled:opacity-60 transition-colors"
                    >
                      {action.label}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </Card>
        );
      })}

      <Link href="/wallet" className="w-full bg-white rounded-2xl p-4 ring-1 ring-black/[0.06] flex items-center gap-3 hover:shadow-md transition-shadow text-left mt-2">
        <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0"><Banknote className="w-5 h-5" /></div>
        <div><div className="font-bold text-sm text-slate-900">Payout Dashboard</div><div className="text-xs text-slate-500">View earnings & request payout</div></div>
        <ChevronRight className="w-4 h-4 text-slate-300 ml-auto" />
      </Link>
    </div>
  );
}
