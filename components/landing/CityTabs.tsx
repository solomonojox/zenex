"use client";

import Link from "next/link";
import { usePublicStats } from "@/lib/queries/stats";

/**
 * Cities Zenex actually covers, derived from where the providers are.
 *
 * This used to render a static CITIES list from lib/data, and the tabs were
 * pure decoration — clicking one changed a local `activeCity` index and
 * nothing else. Selecting "Vancouver" and seeing no change is worse than not
 * offering the choice. Each city is now a real link into a filtered search.
 */
export default function CityTabs() {
  const { data: stats, isLoading } = usePublicStats();
  const cities = stats?.cities ?? [];

  // No roster, nothing to advertise.
  if (!isLoading && cities.length === 0) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-14">
      <div className="text-center mb-6">
        <div className="text-teal-600 text-xs font-black tracking-widest uppercase mb-1">
          {cities.length > 0
            ? `Serving ${cities.length} ${cities.length === 1 ? "city" : "cities"}`
            : "Coverage"}
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Find cleaners in your city
        </h2>
      </div>

      {isLoading ? (
        <div className="flex gap-2 justify-center flex-wrap">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-10 w-28 rounded-xl bg-slate-100 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="flex gap-2 overflow-x-auto pb-2 justify-center flex-wrap">
          {cities.map((c) => (
            <Link
              key={c.name}
              href={`/search?location=${encodeURIComponent(c.name)}`}
              className="px-4 py-2 rounded-xl text-sm font-bold border bg-white border-slate-200 text-slate-600 hover:border-teal-300 hover:text-teal-700 transition-colors whitespace-nowrap"
            >
              {c.name}
              <span className="ml-1.5 text-xs font-semibold text-slate-400">
                {c.providers}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
