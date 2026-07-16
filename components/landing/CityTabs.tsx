"use client";

import { useState } from "react";
import { CITIES } from "@/lib/data";

export default function CityTabs() {
  const [activeCity, setActiveCity] = useState(0);
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-14">
      <div className="text-center mb-6">
        <div className="text-teal-600 text-xs font-black tracking-widest uppercase mb-1">Available across Canada</div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Find cleaners in your city</h2>
      </div>
      <div className="flex gap-2 overflow-x-auto pb-2 justify-center flex-wrap">
        {CITIES.map((c, i) => (
          <button
            key={c}
            onClick={() => setActiveCity(i)}
            className={`px-4 py-2 rounded-xl text-sm font-bold border transition-colors whitespace-nowrap ${
              activeCity === i ? "bg-teal-600 text-white border-teal-600" : "bg-white border-slate-200 text-slate-600 hover:border-teal-300 hover:text-teal-700"
            }`}
          >
            {c}
          </button>
        ))}
      </div>
    </div>
  );
}
