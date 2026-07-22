import { User, UserCheck, Calendar, DollarSign, AlertTriangle, Activity } from "lucide-react";
import Card from "@/components/ui/Card";

const KPIS = [
  { l: "Total Users", v: "14,820", c: "+340", Icon: User },
  { l: "Active Providers", v: "4,214", c: "+18", Icon: UserCheck },
  { l: "Bookings Today", v: "1,038", c: "+4.2%", Icon: Calendar },
  { l: "Platform Revenue", v: "$142K", c: "This month", Icon: DollarSign },
];

const QUICK_STATS = [
  { l: "Pending verifications", v: "12", Icon: UserCheck, c: "amber" },
  { l: "Open disputes", v: "3", Icon: AlertTriangle, c: "rose" },
  { l: "New signups today", v: "47", Icon: Activity, c: "teal" },
];

export default function OverviewTab() {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {KPIS.map(({ l, v, c, Icon }) => (
          <Card key={l} className="p-5">
            <div className="flex items-center justify-between mb-2"><Icon className="w-4 h-4 text-teal-500" /><span className="text-xs font-bold text-emerald-600">{c}</span></div>
            <div className="text-2xl font-extrabold text-slate-900">{v}</div>
            <div className="text-xs text-slate-400 mt-0.5">{l}</div>
          </Card>
        ))}
      </div>
      <div className="grid sm:grid-cols-3 gap-4">
        {QUICK_STATS.map(({ l, v, Icon, c }) => (
          <Card key={l} className="p-4 flex items-center gap-4">
            <div className={`w-10 h-10 rounded-xl bg-${c}-50 text-${c}-600 flex items-center justify-center shrink-0`}><Icon className="w-5 h-5" /></div>
            <div><div className="text-2xl font-extrabold text-slate-900">{v}</div><div className="text-xs text-slate-500">{l}</div></div>
          </Card>
        ))}
      </div>
    </div>
  );
}
