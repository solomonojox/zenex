"use client";

import { Clock, Repeat } from "lucide-react";
import type { Provider } from "@/lib/types";

export default function ServiceStep({
  provider, selected, onSelect, recurring, onToggleRecurring,
}: {
  provider: Provider;
  selected: number;
  onSelect: (i: number) => void;
  recurring: boolean;
  onToggleRecurring: () => void;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3 bg-white rounded-2xl p-4 ring-1 ring-black/[0.06] mb-5">
        <img src={provider.image} alt={provider.name} className="w-12 h-12 rounded-xl object-cover" />
        <div>
          <div className="font-bold text-slate-900">{provider.name}</div>
          <div className="text-xs text-slate-500 flex items-center gap-1">★ {provider.rating} · {provider.completions} jobs · {provider.location}</div>
        </div>
      </div>
      {provider.services.map((s, i) => (
        <div
          key={i}
          onClick={() => onSelect(i)}
          className={`bg-white rounded-2xl p-5 ring-1 cursor-pointer transition-all ${i === selected ? "ring-teal-400 shadow-sm" : "ring-black/[0.06] hover:ring-teal-200"}`}
        >
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-bold text-slate-900">{s.name}</h4>
                {i === selected && <span className="bg-teal-100 text-teal-700 text-[10px] font-black px-2 py-0.5 rounded-full">Selected</span>}
              </div>
              <p className="text-xs text-slate-500 mt-1">{s.desc}</p>
              <span className="text-xs text-slate-400 mt-1.5 flex items-center gap-1"><Clock className="w-3 h-3" />{s.duration}</span>
            </div>
            <div className="font-extrabold text-slate-900 text-xl">${s.price}</div>
          </div>
        </div>
      ))}
      <div className="bg-violet-50 ring-1 ring-violet-100 rounded-2xl p-4 flex items-center gap-3">
        <Repeat className="w-5 h-5 text-violet-600 shrink-0" />
        <div className="flex-1"><div className="font-bold text-sm text-slate-900">Make it recurring</div><div className="text-xs text-slate-500">Save 15% on bi-weekly or weekly plans</div></div>
        <button onClick={onToggleRecurring} className={`relative rounded-full transition-colors ${recurring ? "bg-violet-500" : "bg-slate-200"}`} style={{ width: "40px", height: "22px" }}>
          <div className="absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all" style={{ left: recurring ? "22px" : "2px" }} />
        </button>
      </div>
    </div>
  );
}
