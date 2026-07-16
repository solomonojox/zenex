import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { PROVIDERS } from "@/lib/data";
import ProviderCard from "@/components/ui/ProviderCard";

export default function FeaturedProviders() {
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
          {PROVIDERS.map((p) => <ProviderCard key={p.id} p={p} />)}
        </div>
      </div>
    </section>
  );
}
