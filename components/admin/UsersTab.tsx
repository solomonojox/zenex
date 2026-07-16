"use client";

import { Search } from "lucide-react";
import Card from "@/components/ui/Card";
import StatusPill from "@/components/ui/StatusPill";
import { ADMIN_USERS } from "@/lib/data";

const COLUMNS = ["User", "Role", "Status", "Joined", "Bookings", "Actions"];

export default function UsersTab() {
  return (
    <Card className="overflow-hidden">
      <div className="p-5 border-b border-slate-100 flex items-center gap-3">
        <div className="flex-1 flex items-center gap-2 bg-slate-50 rounded-xl px-3 py-2.5 ring-1 ring-slate-100"><Search className="w-4 h-4 text-slate-400" /><input placeholder="Search users…" className="bg-transparent text-sm outline-none w-full text-slate-700" /></div>
        <select className="bg-white ring-1 ring-slate-200 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-700 outline-none">
          <option>All roles</option><option>Client</option><option>Provider</option>
        </select>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-slate-100 bg-slate-50/50">{COLUMNS.map((h) => <th key={h} className="text-left px-5 py-3 text-xs font-black text-slate-500 uppercase tracking-wide whitespace-nowrap">{h}</th>)}</tr></thead>
          <tbody>
            {ADMIN_USERS.map((u) => (
              <tr key={u.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                <td className="px-5 py-4"><div className="font-bold text-slate-900">{u.name}</div><div className="text-xs text-slate-400">{u.email}</div></td>
                <td className="px-5 py-4"><span className={`text-xs font-bold px-2.5 py-1 rounded-full ${u.role === "provider" ? "bg-blue-50 text-blue-700" : "bg-slate-100 text-slate-600"}`}>{u.role}</span></td>
                <td className="px-5 py-4"><StatusPill s={u.status} /></td>
                <td className="px-5 py-4 text-slate-500 text-xs whitespace-nowrap">{u.joined}</td>
                <td className="px-5 py-4 font-bold text-slate-900">{u.bookings}</td>
                <td className="px-5 py-4">
                  <div className="flex gap-1.5">
                    <button className="px-2.5 py-1 bg-slate-100 hover:bg-teal-50 hover:text-teal-700 text-slate-600 rounded-lg text-xs font-bold transition-colors">View</button>
                    {u.status === "active"
                      ? <button className="px-2.5 py-1 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-lg text-xs font-bold transition-colors">Suspend</button>
                      : <button className="px-2.5 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg text-xs font-bold transition-colors">Restore</button>}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
