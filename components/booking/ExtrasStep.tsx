"use client";

import { Check } from "lucide-react";
import { EXTRAS_LIST } from "@/lib/data";

export default function ExtrasStep({ extras, onToggle }: { extras: string[]; onToggle: (name: string) => void }) {
  return (
    <div className="space-y-3">
      <p className="text-sm text-slate-500 mb-4" style={{ fontFamily: "'Inter', sans-serif" }}>Optional add-ons — billed once:</p>
      {EXTRAS_LIST.map(({ name, price, Icon }) => (
        <div
          key={name}
          onClick={() => onToggle(name)}
          className={`bg-white rounded-2xl p-4 ring-1 cursor-pointer flex items-center gap-4 transition-all ${extras.includes(name) ? "ring-teal-400" : "ring-black/[0.06] hover:ring-teal-200"}`}
        >
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${extras.includes(name) ? "bg-teal-500 text-white" : "bg-teal-50 text-teal-600"}`}><Icon className="w-5 h-5" /></div>
          <div className="flex-1"><div className="font-bold text-sm text-slate-900">{name}</div></div>
          <span className="font-bold text-slate-900 text-sm">+${price}</span>
          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${extras.includes(name) ? "border-teal-500 bg-teal-500" : "border-slate-300"}`}>
            {extras.includes(name) && <Check className="w-3 h-3 text-white" />}
          </div>
        </div>
      ))}
    </div>
  );
}
