"use client";

import Card from "@/components/ui/Card";
import { useSlots } from "@/lib/queries/availability";

/** Next N calendar days, as YYYY-MM-DD plus display parts. */
function upcomingDays(count: number) {
  const out: { value: string; weekday: string; day: number; month: string }[] = [];
  const today = new Date();
  for (let i = 1; i <= count; i++) {
    const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() + i);
    const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    out.push({
      value,
      weekday: d.toLocaleDateString(undefined, { weekday: "short" }),
      day: d.getDate(),
      month: d.toLocaleDateString(undefined, { month: "short" }),
    });
  }
  return out;
}

export default function DateTimeStep({
  providerId,
  durationMins,
  date,
  onDate,
  slot,
  onSlot,
}: {
  providerId: string;
  durationMins: number;
  date: string;
  onDate: (d: string) => void;
  slot: string | null;
  onSlot: (isoStart: string) => void;
}) {
  const days = upcomingDays(14);
  const { data: slots = [], isLoading, isError } = useSlots(providerId, date, durationMins);

  return (
    <div className="space-y-4">
      <Card className="p-5">
        <h3 className="font-bold text-slate-900 mb-4">Pick a date</h3>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {days.map((d) => {
            const active = d.value === date;
            return (
              <button
                key={d.value}
                onClick={() => onDate(d.value)}
                className={`shrink-0 w-16 py-3 rounded-xl text-center transition-colors ${active ? "bg-teal-600 text-white shadow-sm" : "bg-slate-50 ring-1 ring-slate-200 text-slate-700 hover:ring-teal-300"}`}
              >
                <div className={`text-[10px] font-bold uppercase ${active ? "text-teal-100" : "text-slate-400"}`}>{d.weekday}</div>
                <div className="text-lg font-extrabold leading-tight">{d.day}</div>
                <div className={`text-[10px] ${active ? "text-teal-100" : "text-slate-400"}`}>{d.month}</div>
              </button>
            );
          })}
        </div>
      </Card>

      <Card className="p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-slate-900">Available times</h3>
          <span className="text-xs text-slate-400">{Math.round(durationMins / 60 * 10) / 10}h job</span>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-4 gap-2">
            {Array.from({ length: 8 }).map((_, i) => <div key={i} className="h-10 rounded-xl bg-slate-100 animate-pulse" />)}
          </div>
        ) : isError ? (
          <p className="text-sm text-red-500 py-6 text-center">Couldn&apos;t load availability.</p>
        ) : slots.length === 0 ? (
          <p className="text-sm text-slate-400 py-6 text-center">
            No openings on this day — try another date.
          </p>
        ) : (
          <div className="grid grid-cols-4 gap-2">
            {slots.map((s) => (
              <button
                key={s.start}
                onClick={() => onSlot(s.start)}
                className={`py-2.5 rounded-xl text-xs font-bold transition-colors ${s.start === slot ? "bg-teal-600 text-white" : "bg-slate-50 ring-1 ring-slate-200 text-slate-700 hover:ring-teal-300 hover:text-teal-700"}`}
              >
                {s.label}
              </button>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
