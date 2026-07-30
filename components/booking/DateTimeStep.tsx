"use client";

import Card from "@/components/ui/Card";

const TIME_SLOTS = ["8:00 AM", "9:00 AM", "10:00 AM", "11:00 AM", "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM"];

export default function DateTimeStep({
  date, onDate, time, onTime,
}: { date: number; onDate: (d: number) => void; time: string; onTime: (t: string) => void }) {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const monthLabel = now.toLocaleDateString(undefined, { month: "long", year: "numeric" });
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  return (
    <div className="space-y-4">
      <Card className="p-5">
        <h3 className="font-bold text-slate-900 mb-4">Pick a date · {monthLabel}</h3>
        <div className="grid grid-cols-7 gap-1 text-center text-xs mb-3">
          {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => <div key={i} className="font-bold text-slate-400 py-1">{d}</div>)}
          {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((d) => {
            const off = d <= now.getDate(); // only strictly-future days are bookable
            return (
              <button key={d} disabled={off} onClick={() => onDate(d)} className={`py-2 rounded-lg font-semibold transition-colors ${off ? "text-slate-200 cursor-not-allowed" : d === date ? "bg-teal-600 text-white shadow-sm" : "bg-teal-50 text-teal-700 hover:bg-teal-100"}`}>
                {d}
              </button>
            );
          })}
        </div>
      </Card>
      <Card className="p-5">
        <h3 className="font-bold text-slate-900 mb-4">Select time</h3>
        <div className="grid grid-cols-4 gap-2">
          {TIME_SLOTS.map((t) => (
            <button key={t} onClick={() => onTime(t)} className={`py-2.5 rounded-xl text-xs font-bold transition-colors ${t === time ? "bg-teal-600 text-white" : "bg-slate-50 ring-1 ring-slate-200 text-slate-700 hover:ring-teal-300 hover:text-teal-700"}`}>
              {t}
            </button>
          ))}
        </div>
      </Card>
    </div>
  );
}
