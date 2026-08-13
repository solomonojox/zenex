"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { MapPin } from "lucide-react";
import ProviderCard from "@/components/ui/ProviderCard";
import ProviderListItem from "@/components/search/ProviderListItem";
import SearchFilters, { type SearchFilterState } from "@/components/search/SearchFilters";
import { useProviders } from "@/lib/queries/providers";
import type { Provider } from "@/lib/types";

function SearchContent() {
  const searchParams = useSearchParams();
  const plan = searchParams.get("plan");

  // Seed the filters from the URL so the city tabs and service tiles on the
  // landing page actually land you on a filtered result set. Read once as the
  // initial state — after that the controls own it, or typing would be
  // overwritten on every render.
  const [filters, setFilters] = useState<SearchFilterState>(() => {
    const tag = searchParams.get("tag");
    return {
      sort: "Top Rated",
      tags: tag ? [tag] : [],
      layout: "grid",
      minRating: 0,
      location: searchParams.get("location") ?? "",
    };
  });

  // Map UI sort to the API's sort/filter params. "Instant Book" is a filter
  // rather than an ordering, so it falls through to the default sort.
  const SORT_PARAM: Record<string, string> = {
    "Lowest Price": "price",
    Nearest: "distance",
  };
  const sort = SORT_PARAM[filters.sort] ?? "rating";
  const instant = filters.sort === "Instant Book" ? "true" : undefined;

  // Distance is measured from the location box. Without one there is nothing
  // to be near, and the API would quietly fall back to rating — so say so
  // rather than letting the chip look like it did something.
  const needsLocation = filters.sort === "Nearest" && !filters.location.trim();

  const { data, isLoading, isError } = useProviders({
    sort,
    instant,
    location: filters.location || undefined,
    limit: 50,
  });

  // Client-side refinements (rating + tag chips) on top of the API results.
  // Tags are matched leniently (case/punctuation-insensitive) since the UI
  // chip labels don't exactly equal the stored tags; "Instant Book" maps to
  // the provider's instant flag.
  const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
  const matchesTags = (p: Provider) =>
    filters.tags.length === 0 ||
    filters.tags.some((t) => {
      if (t === "Instant Book") return p.instant;
      const b = norm(t);
      return p.tags.some((pt) => {
        const a = norm(pt);
        return a.includes(b) || b.includes(a);
      });
    });
  const filtered = (data?.items ?? []).filter(
    (p) => p.rating >= filters.minRating && matchesTags(p),
  );

  return (
    <>
      <SearchFilters value={filters} onChange={setFilters} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-7">
        {plan && (
          <div className="bg-teal-50 ring-1 ring-teal-100 rounded-2xl p-4 mb-6 text-sm text-teal-800 font-semibold">
            Choose a pro to start your <span className="font-black">{plan}</span> plan.
          </div>
        )}

        {needsLocation && (
          <div className="bg-amber-50 ring-1 ring-amber-200 rounded-2xl p-4 flex items-center gap-3 mb-6">
            <MapPin className="w-4 h-4 text-amber-600 shrink-0" />
            <p className="text-sm font-semibold text-amber-900">
              Enter a city above to sort by distance — showing top rated for now.
            </p>
          </div>
        )}

        <div className="flex items-center justify-between mb-5">
          <h2 className="font-bold text-slate-800">
            {isLoading ? "Loading cleaners…" : `${filtered.length} cleaners available`}
          </h2>
          <span className="text-xs text-slate-400">Prices per hour · taxes extra</span>
        </div>

        {isError ? (
          <div className="text-center py-16">
            <p className="font-semibold text-red-500">Couldn&apos;t load cleaners.</p>
            <p className="text-sm mt-1 text-slate-400">Make sure the API is running on port 4000, then reload.</p>
          </div>
        ) : isLoading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-72 rounded-2xl bg-slate-100 animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <p className="font-semibold text-slate-500">No cleaners match your filters.</p>
            <p className="text-sm mt-1">Try clearing tags or lowering the rating filter.</p>
          </div>
        ) : filters.layout === "grid" ? (
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
