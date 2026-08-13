"use client";

import { Globe, Star, CheckCircle, CalendarDays } from "lucide-react";
import type { Provider } from "@/lib/types";
import Card from "@/components/ui/Card";
import { useProviderSchedule } from "@/lib/queries/availability";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function timeLabel(mins: number) {
  const h24 = Math.floor(mins / 60);
  const m = mins % 60;
  const suffix = h24 >= 12 ? "PM" : "AM";
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  return `${h12}:${String(m).padStart(2, "0")} ${suffix}`;
}

export default function AboutTab({ p }: { p: Provider }) {
  const { data: schedule, isLoading } = useProviderSchedule(p.id);
  const byDay = new Map((schedule?.rules ?? []).map((r) => [r.dayOfWeek, r]));

  return (
    <div className="space-y-5">
      <Card className="p-6">
        <h3 className="font-bold text-slate-900 mb-3">About {p.name.split(" ")[0]}</h3>
        <p className="text-slate-600 text-sm leading-relaxed mb-5" style={{ fontFamily: "'Inter', sans-serif" }}>{p.bio}</p>
        <div className="grid grid-cols-2 gap-4">
          {[
            // "Response time" removed — it was a seeded string, not measured
            // from how quickly this person actually replies.
            { I: Globe, l: "Languages", v: p.languages.join(", ") || "—" },
            { I: CheckCircle, l: "Jobs completed", v: p.completions.toLocaleString() },
            { I: CalendarDays, l: "Reviews", v: String(p.reviews) },
            { I: Star, l: "Rating", v: p.reviews > 0 ? `${p.rating.toFixed(2)} ★` : "No reviews yet" },
          ].map(({ I, l, v }) => (
            <div key={l} className="flex items-start gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center shrink-0"><I className="w-4 h-4 text-teal-600" /></div>
              <div><div className="text-xs text-slate-400">{l}</div><div className="text-sm font-bold text-slate-900">{v}</div></div>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-5">
        <h3 className="font-bold text-slate-900 mb-4">Weekly availability</h3>
        {isLoading ? (
          <div className="space-y-2">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-7 rounded-lg bg-slate-100 animate-pulse" />)}</div>
        ) : (schedule?.rules?.length ?? 0) === 0 ? (
          <p className="text-sm text-slate-400">This pro hasn&apos;t published their hours yet — message them to arrange a time.</p>
        ) : (
          <div className="space-y-1.5">
            {DAYS.map((name, i) => {
              const rule = byDay.get(i);
              return (
                <div key={name} className="flex items-center justify-between text-sm py-1.5 border-b border-slate-50 last:border-0">
                  <span className="text-slate-600">{name}</span>
                  {rule ? (
                    <span className="font-semibold text-slate-900">{timeLabel(rule.startMinute)} – {timeLabel(rule.endMinute)}</span>
                  ) : (
                    <span className="text-slate-300">Unavailable</span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
