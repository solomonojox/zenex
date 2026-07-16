"use client";

import { TrendingUp } from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart as RechartsPie, Pie, Cell,
} from "recharts";
import Card from "@/components/ui/Card";
import { EARNINGS_DATA, PIE_DATA } from "@/lib/data";

const KPIS = [
  { l: "This Week", v: "$1,560", c: "+12%", up: true },
  { l: "This Month", v: "$6,060", c: "+8%", up: true },
  { l: "Completion", v: "98.2%", c: "+0.4%", up: true },
  { l: "Response Rate", v: "96%", c: "-1%", up: false },
];

export default function OverviewTab() {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {KPIS.map(({ l, v, c, up }) => (
          <Card key={l} className="p-5">
            <div className="flex items-center justify-between mb-2"><TrendingUp className="w-4 h-4 text-teal-500" /><span className={`text-xs font-bold ${up ? "text-emerald-600" : "text-rose-500"}`}>{c}</span></div>
            <div className="text-2xl font-extrabold text-slate-900">{v}</div>
            <div className="text-xs text-slate-400 mt-0.5">{l}</div>
          </Card>
        ))}
      </div>
      <Card className="p-6">
        <div className="flex items-center justify-between mb-5"><h3 className="font-extrabold text-slate-900">Earnings — Jun / Jul 2025</h3><span className="text-xs font-bold text-teal-600 bg-teal-50 px-2.5 py-1 rounded-full">Weekly</span></div>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={EARNINGS_DATA} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
            <defs><linearGradient id="eg" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#0D9488" stopOpacity={0.15} /><stop offset="95%" stopColor="#0D9488" stopOpacity={0} /></linearGradient></defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
            <XAxis dataKey="w" tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}`} />
            <Tooltip contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)", fontFamily: "'Plus Jakarta Sans',sans-serif" }} formatter={(v: number) => [`$${v}`, "Earnings"]} />
            <Area type="monotone" dataKey="earn" stroke="#0D9488" strokeWidth={2.5} fill="url(#eg)" dot={{ fill: "#0D9488", strokeWidth: 2, r: 4, stroke: "white" }} />
          </AreaChart>
        </ResponsiveContainer>
      </Card>
      <div className="grid sm:grid-cols-2 gap-5">
        <Card className="p-6">
          <h3 className="font-extrabold text-slate-900 mb-4">Jobs per week</h3>
          <ResponsiveContainer width="100%" height={140}>
            <BarChart data={EARNINGS_DATA} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="w" tick={{ fontSize: 10, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }} />
              <Bar dataKey="jobs" fill="#10B981" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
        <Card className="p-6">
          <h3 className="font-extrabold text-slate-900 mb-4">Booking types</h3>
          <ResponsiveContainer width="100%" height={140}>
            <RechartsPie>
              <Pie data={PIE_DATA} cx="50%" cy="50%" innerRadius={40} outerRadius={65} paddingAngle={3} dataKey="value">
                {PIE_DATA.map((e, i) => <Cell key={i} fill={e.color} />)}
              </Pie>
              <Tooltip formatter={(v: number, n: string) => [`${v}%`, n]} contentStyle={{ borderRadius: "12px", border: "none" }} />
            </RechartsPie>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-1 mt-1">
            {PIE_DATA.map((d) => <div key={d.name} className="flex items-center gap-1.5 text-xs text-slate-600"><div className="w-2.5 h-2.5 rounded-sm" style={{ background: d.color }} />{d.name}</div>)}
          </div>
        </Card>
      </div>
    </div>
  );
}
