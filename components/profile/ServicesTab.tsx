"use client";

import { Check, Clock } from "lucide-react";
import type { Service } from "@/lib/types";

export default function ServicesTab({ services, selected, onSelect }: { services: Service[]; selected: number; onSelect: (i: number) => void }) {
  if (services.length === 0) {
    return <p className="text-sm text-slate-500">This pro hasn't listed itemized services yet — message them for a custom quote.</p>;
  }
  return (
    <div className="space-y-3">
      {services.map((s, i) => (
        <div
          key={i}
          onClick={() => onSelect(i)}
          className={`bg-white rounded-2xl p-5 ring-1 cursor-pointer transition-all ${selected === i ? "ring-teal-400 shadow-sm shadow-teal-100" : "ring-black/[0.06] hover:ring-teal-200"}`}
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2"><h4 className="font-bold text-slate-900">{s.name}</h4>{selected === i && <Check className="w-4 h-4 text-teal-500" />}</div>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed" style={{ fontFamily: "'Inter', sans-serif" }}>{s.desc}</p>
              <span className="text-xs text-slate-400 mt-2 flex items-center gap-1"><Clock className="w-3 h-3" />{s.duration}</span>
            </div>
            <div className="text-right shrink-0"><div className="font-extrabold text-xl text-slate-900">${s.price}</div><div className="text-xs text-slate-400">from</div></div>
          </div>
        </div>
      ))}
    </div>
  );
}
