import type { Provider } from "@/lib/types";
import Card from "@/components/ui/Card";
import Stars from "@/components/ui/Stars";
import { TESTIMONIALS } from "@/lib/data";

export default function ReviewsTab({ p }: { p: Provider }) {
  const breakdown: [string, number][] = [["5", 78], ["4", 15], ["3", 5], ["2", 1], ["1", 1]];
  return (
    <div className="space-y-4">
      <Card className="p-6 flex gap-8 items-center">
        <div className="text-center"><div className="text-5xl font-extrabold text-slate-900">{p.rating}</div><Stars r={p.rating} size="md" /><div className="text-xs text-slate-400 mt-1">{p.reviews} reviews</div></div>
        <div className="flex-1 space-y-2">
          {breakdown.map(([l, pct]) => (
            <div key={l} className="flex items-center gap-3 text-xs">
              <span className="text-slate-500 w-10 shrink-0">{l} ★</span>
              <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden"><div className="h-full bg-amber-400 rounded-full" style={{ width: `${pct}%` }} /></div>
              <span className="text-slate-400 w-6 text-right">{pct}%</span>
            </div>
          ))}
        </div>
      </Card>
      {TESTIMONIALS.map((t) => (
        <Card key={t.name} className="p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-teal-400 to-emerald-400 flex items-center justify-center text-white text-xs font-bold shrink-0">{t.ini}</div>
            <div><div className="font-bold text-sm text-slate-900">{t.name}</div><div className="flex items-center gap-2"><Stars r={t.rating} /><span className="text-xs text-slate-400">June 2025</span></div></div>
          </div>
          <p className="text-slate-600 text-sm" style={{ fontFamily: "'Inter', sans-serif" }}>{t.text}</p>
        </Card>
      ))}
    </div>
  );
}
