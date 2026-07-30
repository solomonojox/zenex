"use client";

import { User, UserCheck, Calendar, DollarSign, AlertTriangle, Activity } from "lucide-react";
import Card from "@/components/ui/Card";
import { useAdminOverview } from "@/lib/queries/admin";

// Static class map — Tailwind can't generate classes built from a variable.
const COLORS: Record<string, string> = {
  amber: "bg-amber-50 text-amber-600",
  rose: "bg-rose-50 text-rose-600",
  teal: "bg-teal-50 text-teal-600",
};

export default function OverviewTab() {
  const { data: o, isLoading } = useAdminOverview();

  const kpis = [
    { l: "Total Users", v: (o?.users ?? 0).toLocaleString(), Icon: User },
    { l: "Providers", v: (o?.providers ?? 0).toLocaleString(), Icon: UserCheck },
    { l: "Total Bookings", v: (o?.bookings ?? 0).toLocaleString(), Icon: Calendar },
    { l: "Platform Revenue", v: `$${(o?.platformRevenue ?? 0).toLocaleString()}`, Icon: DollarSign },
  ];

  const quick = [
    { l: "Pending verifications", v: String(o?.pendingVerifications ?? 0), Icon: UserCheck, c: "amber" },
    { l: "Open disputes", v: String(o?.openDisputes ?? 0), Icon: AlertTriangle, c: "rose" },
    { l: "Active subscriptions", v: String(o?.activeSubscriptions ?? 0), Icon: Activity, c: "teal" },
  ];

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {kpis.map(({ l, v, Icon }) => (
          <Card key={l} className="p-5">
            <div className="flex items-center justify-between mb-2"><Icon className="w-4 h-4 text-teal-500" /></div>
            <div className="text-2xl font-extrabold text-slate-900">{isLoading ? "…" : v}</div>
            <div className="text-xs text-slate-400 mt-0.5">{l}</div>
          </Card>
        ))}
      </div>
      <div className="grid sm:grid-cols-3 gap-4">
        {quick.map(({ l, v, Icon, c }) => (
          <Card key={l} className="p-4 flex items-center gap-4">
            <div className={`w-10 h-10 rounded-xl ${COLORS[c]} flex items-center justify-center shrink-0`}><Icon className="w-5 h-5" /></div>
            <div><div className="text-2xl font-extrabold text-slate-900">{isLoading ? "…" : v}</div><div className="text-xs text-slate-500">{l}</div></div>
          </Card>
        ))}
      </div>
      <Card className="p-5">
        <h3 className="font-bold text-slate-900 mb-3">Bookings by status</h3>
        <div className="flex flex-wrap gap-2">
          {o && Object.entries(o.bookingsByStatus).length > 0 ? (
            Object.entries(o.bookingsByStatus).map(([status, count]) => (
              <span key={status} className="text-xs font-semibold bg-slate-100 text-slate-600 px-3 py-1.5 rounded-full">
                {status.toLowerCase()}: <span className="font-extrabold text-slate-900">{count}</span>
              </span>
            ))
          ) : (
            <span className="text-sm text-slate-400">No bookings yet.</span>
          )}
        </div>
      </Card>
    </div>
  );
}
