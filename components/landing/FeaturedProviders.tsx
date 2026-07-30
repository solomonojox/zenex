"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import ProviderCard from "@/components/ui/ProviderCard";
import { useProviders } from "@/lib/queries/providers";

export default function FeaturedProviders() {
  const { data, isLoading, isError } = useProviders({ sort: "rating", limit: 4 });
  const providers = data?.items ?? [];

  return (
    <section className="py-10 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-end justify-between mb-6">
          <div>
            <div className="text-teal-600 text-xs font-black tracking-widest uppercase mb-1">Top rated</div>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Featured professionals</h2>
          </div>
          <Link href="/search" className="flex items-center gap-1 text-sm font-bold text-teal-600 hover:text-teal-700">See all <ChevronRight className="w-4 h-4" /></Link>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {isLoading
            ? Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-72 rounded-2xl bg-slate-100 animate-pulse" />
              ))
            : providers.map((p) => <ProviderCard key={p.id} p={p} />)}
        </div>
        {!isLoading && isError && (
          <p className="text-sm text-red-500 mt-4">Couldn&apos;t load providers — is the API running?</p>
        )}
        {!isLoading && !isError && providers.length === 0 && (
          <p className="text-sm text-slate-400 mt-4">No providers available yet.</p>
        )}
      </div>
    </section>
  );
}
