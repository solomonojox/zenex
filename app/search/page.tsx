"use client";

import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Brain } from "lucide-react";
import { PROVIDERS } from "@/lib/data";
import ProviderCard from "@/components/ui/ProviderCard";
import ProviderListItem from "@/components/search/ProviderListItem";
import SearchFilters, { type SearchFilterState } from "@/components/search/SearchFilters";

function SearchContent() {
  const searchParams = useSearchParams();
  const plan = searchParams.get("plan");

  const [filters, setFilters] = useState<SearchFilterState>({ sort: "Top Rated", tags: [], layout: "grid", minRating: 0 });
  const filtered = useMemo(() => PROVIDERS.filter((p) => p.rating >= filters.minRating), [filters.minRating]);

  return (
    <>
      <SearchFilters value={filters} onChange={setFilters} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-7">
        {plan && (
          <div className="bg-teal-50 ring-1 ring-teal-100 rounded-2xl p-4 mb-6 text-sm text-teal-800 font-semibold">
            Choose a pro to start your <span className="font-black">{plan}</span> plan.
          </div>
        )}

        <div className="bg-gradient-to-r from-violet-50 to-indigo-50 ring-1 ring-violet-100 rounded-2xl p-4 flex items-center gap-4 mb-6">
          <div className="w-9 h-9 rounded-xl bg-violet-100 text-violet-600 flex items-center justify-center shrink-0"><Brain className="w-5 h-5" /></div>
          <div className="flex-1"><div className="font-bold text-sm text-slate-900">AI matched {filtered.length} cleaners to your profile</div><div className="text-xs text-slate-500" style={{ fontFamily: "'Inter', sans-serif" }}>Based on your home type, past bookings, and preferences</div></div>
          <button className="text-xs font-bold text-violet-600 hover:text-violet-700 shrink-0">Refine ›</button>
        </div>

        <div className="flex items-center justify-between mb-5">
          <h2 className="font-bold text-slate-800">{filtered.length} cleaners near Toronto, ON</h2>
          <span className="text-xs text-slate-400">Prices per hour · taxes extra</span>
        </div>

        {filters.layout === "grid" ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {filtered.map((p) => <ProviderCard key={p.id} p={p} />)}
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {filtered.map((p) => <ProviderListItem key={p.id} p={p} />)}
          </div>
        )}
      </div>
    </>
  );
}

export default function SearchPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFB]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <Suspense fallback={null}>
        <SearchContent />
      </Suspense>
      <div className="h-24" />
    </div>
  );
}
