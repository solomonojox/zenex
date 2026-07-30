"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import Card from "@/components/ui/Card";
import StatusPill from "@/components/ui/StatusPill";
import { useAdminUsers, useSetUserStatus } from "@/lib/queries/admin";

const COLUMNS = ["User", "Role", "Status", "Joined", "Actions"];

function fmtDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
  } catch {
    return "";
  }
}

export default function UsersTab() {
  const [role, setRole] = useState<string>("");
  const { data, isLoading } = useAdminUsers(role ? { role } : undefined);
  const setStatus = useSetUserStatus();
  const users = data?.items ?? [];

  return (
    <Card className="overflow-hidden">
      <div className="p-5 border-b border-slate-100 flex items-center gap-3">
        <div className="flex-1 flex items-center gap-2 bg-slate-50 rounded-xl px-3 py-2.5 ring-1 ring-slate-100"><Search className="w-4 h-4 text-slate-400" /><input placeholder="Search users…" className="bg-transparent text-sm outline-none w-full text-slate-700" /></div>
        <select value={role} onChange={(e) => setRole(e.target.value)} className="bg-white ring-1 ring-slate-200 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-700 outline-none cursor-pointer">
          <option value="">All roles</option>
          <option value="CLIENT">Client</option>
          <option value="PROVIDER">Provider</option>
          <option value="ADMIN">Admin</option>
        </select>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-slate-100 bg-slate-50/50">{COLUMNS.map((h) => <th key={h} className="text-left px-5 py-3 text-xs font-black text-slate-500 uppercase tracking-wide whitespace-nowrap">{h}</th>)}</tr></thead>
          <tbody>
            {isLoading && (
              <tr><td colSpan={COLUMNS.length} className="px-5 py-8 text-center text-slate-400">Loading users…</td></tr>
            )}
            {!isLoading && users.length === 0 && (
              <tr><td colSpan={COLUMNS.length} className="px-5 py-8 text-center text-slate-400">No users found.</td></tr>
            )}
            {users.map((u) => (
              <tr key={u.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                <td className="px-5 py-4"><div className="font-bold text-slate-900">{u.firstName} {u.lastName}</div><div className="text-xs text-slate-400">{u.email}</div></td>
                <td className="px-5 py-4"><span className={`text-xs font-bold px-2.5 py-1 rounded-full ${u.role === "PROVIDER" ? "bg-blue-50 text-blue-700" : u.role === "ADMIN" ? "bg-violet-50 text-violet-700" : "bg-slate-100 text-slate-600"}`}>{u.role.toLowerCase()}</span></td>
                <td className="px-5 py-4"><StatusPill s={u.isActive ? "active" : "suspended"} /></td>
                <td className="px-5 py-4 text-slate-500 text-xs whitespace-nowrap">{fmtDate(u.createdAt)}</td>
                <td className="px-5 py-4">
                  <div className="flex gap-1.5">
                    {u.isActive ? (
                      <button onClick={() => setStatus.mutate({ id: u.id, active: false })} disabled={setStatus.isPending} className="px-2.5 py-1 bg-rose-50 text-rose-600 hover:bg-rose-100 disabled:opacity-50 rounded-lg text-xs font-bold transition-colors">Suspend</button>
                    ) : (
                      <button onClick={() => setStatus.mutate({ id: u.id, active: true })} disabled={setStatus.isPending} className="px-2.5 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 disabled:opacity-50 rounded-lg text-xs font-bold transition-colors">Restore</button>
                    )}
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
