"use client";

import Link from "next/link";
import { Sparkles, Home, Briefcase } from "lucide-react";
import type { Role } from "./types";

export default function RoleSelect({ onSelect }: { onSelect: (role: Role) => void }) {
  return (
    <div className="w-full max-w-md">
      <div className="text-center mb-8">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-teal-200">
          <Sparkles className="w-6 h-6 text-white" />
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900">Join Zenex</h1>
        <p className="text-slate-500 text-sm mt-1" style={{ fontFamily: "'Inter', sans-serif" }}>I want to…</p>
      </div>
      <div className="grid grid-cols-2 gap-4 mb-6">
        {[
          { r: "client" as const, Icon: Home, t: "Find a Cleaner", d: "Book trusted pros for my home or office" },
          { r: "provider" as const, Icon: Briefcase, t: "Offer Services", d: "Earn money with my cleaning skills" },
        ].map(({ r, Icon, t, d }) => (
          <button
            key={r}
            onClick={() => onSelect(r)}
            className="flex flex-col items-center gap-3 p-6 bg-white rounded-2xl ring-1 ring-black/[0.06] shadow-sm hover:ring-teal-400 hover:shadow-md transition-all text-center"
          >
            <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center"><Icon className="w-6 h-6" /></div>
            <div><div className="font-bold text-slate-900 text-sm">{t}</div><div className="text-xs text-slate-500 mt-1" style={{ fontFamily: "'Inter', sans-serif" }}>{d}</div></div>
          </button>
        ))}
      </div>
      <p className="text-center text-xs text-slate-500" style={{ fontFamily: "'Inter', sans-serif" }}>
        Already have an account? <Link href="/auth?mode=login" className="text-teal-600 font-bold hover:text-teal-700">Sign in</Link>
      </p>
    </div>
  );
}
