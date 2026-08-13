import Link from "next/link";
import { MapPin, Bolt } from "lucide-react";
import type { Provider } from "@/lib/types";
import Stars from "@/components/ui/Stars";
import VBadge from "@/components/ui/VBadge";

export default function ProviderListItem({ p }: { p: Provider }) {
  return (
    <Link href={`/providers/${p.id}`} className="w-full bg-white rounded-2xl ring-1 ring-black/[0.06] p-4 flex items-center gap-4 hover:shadow-md transition-shadow text-left">
      <img src={p.image} alt={p.name} className="w-20 h-20 rounded-xl object-cover shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-bold text-slate-900">{p.name}</span>
          {p.verified && <VBadge />}
          {p.elite && <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full ring-1 ring-amber-200">Top Pro</span>}
          {p.instant && <span className="text-xs font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full ring-1 ring-teal-200 flex items-center gap-1"><Bolt className="w-2.5 h-2.5" />Instant</span>}
        </div>
        <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-1"><MapPin className="w-3 h-3" />{p.location}</div>
        <div className="flex items-center gap-2 mt-1.5">
          <Stars r={p.rating} /><span className="text-xs font-semibold text-slate-700">{p.rating} ({p.reviews})</span>
          {p.completions > 0 && (
            <>
              <span className="text-slate-300">·</span>
              <span className="text-xs text-slate-500">{p.completions} jobs</span>
            </>
          )}
        </div>
      </div>
      <div className="text-right shrink-0">
        <div className="font-extrabold text-slate-900 text-lg">${p.price}<span className="text-xs font-normal text-slate-400">/hr</span></div>
        {/* responseTime was a seeded string, never measured from real replies. */}
        <span className="inline-block mt-2 px-4 py-2 bg-teal-600 text-white text-xs font-bold rounded-xl hover:bg-teal-700 transition-colors">View</span>
      </div>
    </Link>
  );
}
