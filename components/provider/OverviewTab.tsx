"use client";

import { Wallet, TrendingUp, Briefcase, CheckCircle, ShieldAlert } from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart as RechartsPie, Pie, Cell,
} from "recharts";
import Card from "@/components/ui/Card";
import { useMyBookings } from "@/lib/queries/bookings";
import { useWallet, useTransactions } from "@/lib/queries/wallet";
import { useMyVerification } from "@/lib/queries/verifications";
import { useMyServices } from "@/lib/queries/providers";
import { useMySchedule } from "@/lib/queries/availability";

const PIE_COLORS = ["#0D9488", "#10B981", "#3B82F6", "#8B5CF6", "#94A3B8"];

export default function OverviewTab() {
  const { data: wallet } = useWallet();
  const { data: txns = [] } = useTransactions();
  const { data: bookingsData } = useMyBookings();
  const { data: verification } = useMyVerification();
  const { data: myServices } = useMyServices();
  const { data: schedule } = useMySchedule();
  const bookings = bookingsData?.items ?? [];

  // Things that silently stop a provider from receiving any bookings.
  const noServices = myServices?.length === 0;
  const noAvailability = schedule?.rules.length === 0;

  const now = new Date();
  const credits = txns.filter((t) => t.type === "CREDIT");
  const creditsAsc = [...credits].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  );
  const monthEarnings = credits
    .filter((t) => new Date(t.createdAt).getMonth() === now.getMonth())
    .reduce((s, t) => s + t.amount, 0);
  const completed = bookings.filter((b) => b.status === "COMPLETED").length;
  const completionRate = bookings.length ? Math.round((completed / bookings.length) * 100) : 0;

  const kpis = [
    { l: "Balance", v: `$${(wallet?.balance ?? 0).toLocaleString()}`, Icon: Wallet },
    { l: "This Month", v: `$${monthEarnings.toLocaleString()}`, Icon: TrendingUp },
    { l: "Total Jobs", v: String(bookings.length), Icon: Briefcase },
    { l: "Completion", v: `${completionRate}%`, Icon: CheckCircle },
  ];

  // Earnings series: bucket the provider's CREDIT transactions by day.
  const byDay = new Map<string, { earn: number; jobs: number }>();
  creditsAsc.forEach((t) => {
    const k = new Date(t.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric" });
    const cur = byDay.get(k) ?? { earn: 0, jobs: 0 };
    cur.earn += t.amount;
    cur.jobs += 1;
    byDay.set(k, cur);
  });
  const series = [...byDay.entries()].map(([w, v]) => ({ w, earn: Math.round(v.earn), jobs: v.jobs }));

  // Booking types by service name.
  const typeMap = new Map<string, number>();
  bookings.forEach((b) => {
    const n = b.service?.name ?? "Other";
    typeMap.set(n, (typeMap.get(n) ?? 0) + 1);
  });
  const pieData = [...typeMap.entries()].map(([name, value], i) => ({ name, value, color: PIE_COLORS[i % PIE_COLORS.length] }));

  return (
    <div className="space-y-5">
      {/* Blockers first — these stop bookings entirely. */}
      {noServices && (
        <Card className="p-4 flex items-start gap-3 ring-1 ring-rose-200 bg-rose-50">
          <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <div className="font-bold text-sm text-rose-900">You have no services listed</div>
            <p className="text-xs text-rose-800 mt-0.5">
              Clients can&apos;t find or book you until you add at least one service. Open the <strong>Services</strong> tab to add one — it takes a minute.
            </p>
          </div>
        </Card>
      )}

      {noAvailability && (
        <Card className="p-4 flex items-start gap-3 ring-1 ring-rose-200 bg-rose-50">
          <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <div className="font-bold text-sm text-rose-900">No working hours set</div>
            <p className="text-xs text-rose-800 mt-0.5">
              Every date will show as fully booked until you set your weekly hours in the <strong>Availability</strong> tab.
            </p>
          </div>
        </Card>
      )}

      {/* Nudge providers who skipped verification during signup. */}
      {!verification && (
        <Card className="p-4 flex items-start gap-3 ring-1 ring-amber-200 bg-amber-50">
          <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <div className="font-bold text-sm text-amber-900">Get verified to win more work</div>
            <p className="text-xs text-amber-800 mt-0.5">
              Upload your ID and insurance in the <strong>Verification</strong> tab — verified pros get a badge and rank higher in search.
            </p>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {kpis.map(({ l, v, Icon }) => (
          <Card key={l} className="p-5">
            <Icon className="w-4 h-4 text-teal-500 mb-2" />
            <div className="text-2xl font-extrabold text-slate-900">{v}</div>
            <div className="text-xs text-slate-400 mt-0.5">{l}</div>
          </Card>
        ))}
      </div>

      <Card className="p-6">
        <div className="flex items-center justify-between mb-5"><h3 className="font-extrabold text-slate-900">Earnings</h3><span className="text-xs font-bold text-teal-600 bg-teal-50 px-2.5 py-1 rounded-full">By day</span></div>
        {series.length === 0 ? (
          <p className="text-sm text-slate-400 py-8 text-center">No earnings yet — complete a paid job to see your earnings here.</p>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={series} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <defs><linearGradient id="eg" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#0D9488" stopOpacity={0.15} /><stop offset="95%" stopColor="#0D9488" stopOpacity={0} /></linearGradient></defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="w" tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}`} />
              <Tooltip contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }} formatter={(v: number) => [`$${v}`, "Earnings"]} />
              <Area type="monotone" dataKey="earn" stroke="#0D9488" strokeWidth={2.5} fill="url(#eg)" dot={{ fill: "#0D9488", strokeWidth: 2, r: 4, stroke: "white" }} />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </Card>

      <Card className="p-6">
        <h3 className="font-extrabold text-slate-900 mb-4">Booking types</h3>
        {pieData.length === 0 ? (
          <p className="text-sm text-slate-400 py-8 text-center">No bookings yet.</p>
        ) : (
          <>
            <ResponsiveContainer width="100%" height={160}>
              <RechartsPie>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
                  {pieData.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Pie>
                <Tooltip formatter={(v: number, n: string) => [`${v}`, n]} contentStyle={{ borderRadius: "12px", border: "none" }} />
              </RechartsPie>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 gap-1 mt-2">
              {pieData.map((d) => <div key={d.name} className="flex items-center gap-1.5 text-xs text-slate-600"><div className="w-2.5 h-2.5 rounded-sm" style={{ background: d.color }} />{d.name}</div>)}
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
