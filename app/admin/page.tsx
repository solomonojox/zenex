"use client";

import { useState } from "react";
import { ShieldCheck } from "lucide-react";
import OverviewTab from "@/components/admin/OverviewTab";
import UsersTab from "@/components/admin/UsersTab";
import VerifyTab from "@/components/admin/VerifyTab";
import DisputesTab from "@/components/admin/DisputesTab";

type TabKey = "overview" | "users" | "verify" | "disputes";

export default function AdminPage() {
  const [adminTab, setAdminTab] = useState<TabKey>("overview");

  return (
    <div className="min-h-screen bg-[#F8FAFB]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-9 h-9 rounded-xl bg-slate-900 flex items-center justify-center"><ShieldCheck className="w-5 h-5 text-teal-400" /></div>
          <div><h1 className="text-xl font-extrabold text-slate-900">Admin Panel</h1><p className="text-xs text-slate-500">Zenex Operations · Internal</p></div>
          <span className="ml-auto bg-rose-100 text-rose-700 text-xs font-black px-3 py-1.5 rounded-full ring-1 ring-rose-200">Staff Only</span>
        </div>

        <div className="flex gap-1 bg-slate-100 rounded-xl p-1 mb-6 overflow-x-auto">
          {(["overview", "users", "verify", "disputes"] as const).map((t) => (
            <button key={t} onClick={() => setAdminTab(t)} className={`px-5 py-2 rounded-lg text-sm font-bold capitalize whitespace-nowrap transition-colors ${adminTab === t ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>
              {t}
            </button>
          ))}
        </div>

        {adminTab === "overview" && <OverviewTab />}
        {adminTab === "users" && <UsersTab />}
        {adminTab === "verify" && <VerifyTab />}
        {adminTab === "disputes" && <DisputesTab />}
      </div>
      <div className="h-24" />
    </div>
  );
}
