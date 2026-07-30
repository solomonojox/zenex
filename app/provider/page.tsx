"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, Settings } from "lucide-react";
import { useAuth } from "@/context/auth/useAuth";
import { useMe } from "@/lib/queries/users";
import OverviewTab from "@/components/provider/OverviewTab";
import JobsTab from "@/components/provider/JobsTab";
import ProfileTab from "@/components/provider/ProfileTab";

type TabKey = "overview" | "jobs" | "profile";

export default function ProviderDashboardPage() {
  const router = useRouter();
  const { isAuthenticated, authLoading, user } = useAuth();
  const { data: me } = useMe(isAuthenticated);
  const [tab, setTab] = useState<TabKey>("overview");

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      router.replace("/auth?mode=login");
    } else if (user?.role && user.role !== "PROVIDER" && user.role !== "ADMIN") {
      router.replace("/client");
    }
  }, [authLoading, isAuthenticated, user, router]);

  const pp = me?.providerProfile;
  const name = me ? `${me.firstName} ${me.lastName}`.trim() : "Provider";
  const image =
    pp?.imageUrl ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0D9488&color=fff`;

  return (
    <div className="min-h-screen bg-[#F8FAFB]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              <img src={image} alt={name} className="w-12 h-12 rounded-xl object-cover ring-2 ring-teal-100" />
              <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-400 rounded-full ring-2 ring-white" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-slate-900">{name}</h1>
              <div className="text-xs text-slate-500 flex items-center gap-2">★ {(pp?.rating ?? 0).toFixed(2)} · {(pp?.location || "").split(",")[0]} · <span className="text-emerald-600 font-bold">Online</span></div>
            </div>
          </div>
          <div className="flex gap-2">
            <button className="relative p-2.5 rounded-xl ring-1 ring-slate-200 bg-white text-slate-500"><Bell className="w-5 h-5" /><span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full" /></button>
            <button className="p-2.5 rounded-xl ring-1 ring-slate-200 bg-white text-slate-500"><Settings className="w-5 h-5" /></button>
          </div>
        </div>

        <div className="flex gap-1 bg-slate-100 rounded-xl p-1 w-fit mb-6">
          {(["overview", "jobs", "profile"] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)} className={`px-5 py-2 rounded-lg text-sm font-bold capitalize transition-colors ${tab === t ? "bg-white text-teal-700 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>
              {t}
            </button>
          ))}
        </div>

        {tab === "overview" && <OverviewTab />}
        {tab === "jobs" && <JobsTab />}
        {tab === "profile" && <ProfileTab />}
      </div>
      <div className="h-24" />
    </div>
  );
}
