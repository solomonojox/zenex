"use client";

import { useState } from "react";
import { MapPin } from "lucide-react";

const ALL_TAGS = ["Deep Clean", "Recurring", "Eco-Friendly", "Move-In/Out", "Office", "Pet-Friendly", "Bilingual", "Instant Book"];
const SORT_OPTIONS = ["Top Rated", "Lowest Price", "Instant Book", "Nearest"];

export interface SearchFilterState {
  sort: string;
  tags: string[];
  layout: "grid" | "list";
  minRating: number;
}

export default function SearchFilters({ value, onChange }: { value: SearchFilterState; onChange: (v: SearchFilterState) => void }) {
  const [location, setLocation] = useState("Toronto, ON");

  const toggleTag = (t: string) => {
    onChange({ ...value, tags: value.tags.includes(t) ? value.tags.filter((x) => x !== t) : [...value.tags, t] });
  };

  return (
    <div className="bg-white border-b border-slate-100 sticky top-16 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-2 bg-slate-50 rounded-xl px-3 py-2.5 flex-1 min-w-[160px] max-w-xs ring-1 ring-slate-200 focus-within:ring-teal-400 transition-all">
          <MapPin className="w-3.5 h-3.5 text-teal-500 shrink-0" />
          <input value={location} onChange={(e) => setLocation(e.target.value)} className="bg-transparent text-sm font-medium outline-none w-full text-slate-800" />
        </div>
        <select value={value.sort} onChange={(e) => onChange({ ...value, sort: e.target.value })} className="bg-white ring-1 ring-slate-200 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-700 outline-none cursor-pointer hover:ring-teal-300 transition-colors">
          {SORT_OPTIONS.map((s) => <option key={s}>{s}</option>)}
        </select>
        {[["≥ 4.5 ★", 4.5], ["≥ 4.0 ★", 4.0]].map(([l, v]) => (
          <button
            key={String(l)}
            onClick={() => onChange({ ...value, minRating: value.minRating === Number(v) ? 0 : Number(v) })}
            className={`px-3 py-2 rounded-xl text-xs font-bold border transition-colors ${value.minRating === Number(v) ? "bg-teal-600 text-white border-teal-600" : "bg-white border-slate-200 text-slate-600 hover:border-teal-300"}`}
          >
            {l}
          </button>
        ))}
        <div className="flex items-center gap-1 ml-auto">
          {(["grid", "list"] as const).map((v) => (
            <button key={v} onClick={() => onChange({ ...value, layout: v })} className={`p-2 rounded-lg transition-colors ${value.layout === v ? "bg-teal-100 text-teal-700" : "text-slate-400 hover:bg-slate-100"}`}>
              {v === "grid"
                ? <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 16 16"><rect x="0" y="0" width="7" height="7" rx="1" /><rect x="9" y="0" width="7" height="7" rx="1" /><rect x="0" y="9" width="7" height="7" rx="1" /><rect x="9" y="9" width="7" height="7" rx="1" /></svg>
                : <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 16 16"><rect x="0" y="1" width="16" height="2" rx="1" /><rect x="0" y="7" width="16" height="2" rx="1" /><rect x="0" y="13" width="16" height="2" rx="1" /></svg>}
            </button>
          ))}
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-3 flex gap-2 overflow-x-auto">
        {ALL_TAGS.map((t) => (
          <button
            key={t}
            onClick={() => toggleTag(t)}
            className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-bold border transition-colors ${value.tags.includes(t) ? "bg-teal-600 text-white border-teal-600" : "bg-white border-slate-200 text-slate-600 hover:border-teal-300"}`}
          >
            {t}
          </button>
        ))}
      </div>
    </div>
  );
}
