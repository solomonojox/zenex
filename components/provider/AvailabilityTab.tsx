"use client";

import { useEffect, useState } from "react";
import { CalendarOff, Plus, Trash2 } from "lucide-react";
import Card from "@/components/ui/Card";
import {
  useMySchedule,
  useSetMySchedule,
  useAddTimeOff,
  useRemoveTimeOff,
} from "@/lib/queries/availability";
import { formatBookingShort, localInputToUtcIso } from "@/lib/utils/datetime";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

/** 00:00 → 23:30 in 30-minute steps. */
const TIME_OPTIONS = Array.from({ length: 48 }, (_, i) => i * 30);

function label(mins: number) {
  const h24 = Math.floor(mins / 60);
  const m = mins % 60;
  const suffix = h24 >= 12 ? "PM" : "AM";
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  return `${h12}:${String(m).padStart(2, "0")} ${suffix}`;
}

interface DayState {
  enabled: boolean;
  startMinute: number;
  endMinute: number;
}

const DEFAULT_DAY: DayState = { enabled: false, startMinute: 8 * 60, endMinute: 18 * 60 };

export default function AvailabilityTab() {
  const { data: schedule, isLoading } = useMySchedule();
  const save = useSetMySchedule();
  const addTimeOff = useAddTimeOff();
  const removeTimeOff = useRemoveTimeOff();

  const [days, setDays] = useState<DayState[]>(() => DAYS.map(() => ({ ...DEFAULT_DAY })));
  const [saved, setSaved] = useState(false);
  const [offStart, setOffStart] = useState("");
  const [offEnd, setOffEnd] = useState("");
  const [offReason, setOffReason] = useState("");

  useEffect(() => {
    if (!schedule) return;
    const next = DAYS.map(() => ({ ...DEFAULT_DAY }));
    schedule.rules.forEach((r) => {
      next[r.dayOfWeek] = {
        enabled: true,
        startMinute: r.startMinute,
        endMinute: r.endMinute,
      };
    });
    setDays(next);
  }, [schedule]);

  const update = (i: number, patch: Partial<DayState>) =>
    setDays((d) => d.map((v, idx) => (idx === i ? { ...v, ...patch } : v)));

  const onSave = () => {
    const rules = days
      .map((d, dayOfWeek) => ({ ...d, dayOfWeek }))
      .filter((d) => d.enabled && d.endMinute > d.startMinute)
      .map(({ dayOfWeek, startMinute, endMinute }) => ({ dayOfWeek, startMinute, endMinute }));
    save.mutate(rules, {
      onSuccess: () => { setSaved(true); setTimeout(() => setSaved(false), 2500); },
    });
  };

  const onAddTimeOff = () => {
    if (!offStart || !offEnd) return;
    addTimeOff.mutate(
      {
        // Interpreted as UTC so it lines up with how slots are anchored.
        startsAt: localInputToUtcIso(offStart),
        endsAt: localInputToUtcIso(offEnd),
        reason: offReason.trim() || undefined,
      },
      { onSuccess: () => { setOffStart(""); setOffEnd(""); setOffReason(""); } },
    );
  };

  const select = "bg-slate-50 ring-1 ring-slate-200 focus:ring-teal-400 rounded-lg px-2 py-1.5 text-sm outline-none text-slate-800";

  if (isLoading) {
    return <div className="h-64 rounded-2xl bg-slate-100 animate-pulse" />;
  }

  return (
    <div className="space-y-4">
      <Card className="p-6">
        <h3 className="font-extrabold text-slate-900 mb-1">Weekly availability</h3>
        <p className="text-xs text-slate-500 mb-5">Clients can only book inside these hours.</p>

        <div className="space-y-2">
          {days.map((d, i) => (
            <div key={DAYS[i]} className={`flex flex-wrap items-center gap-3 p-3 rounded-xl transition-colors ${d.enabled ? "bg-teal-50/50 ring-1 ring-teal-100" : "bg-slate-50 ring-1 ring-slate-100"}`}>
              <label className="flex items-center gap-2 w-32 shrink-0 cursor-pointer">
                <input type="checkbox" checked={d.enabled} onChange={(e) => update(i, { enabled: e.target.checked })} className="accent-teal-600 w-4 h-4" />
                <span className="font-bold text-sm text-slate-800">{DAYS[i]}</span>
              </label>
              {d.enabled ? (
                <div className="flex items-center gap-2">
                  <select value={d.startMinute} onChange={(e) => update(i, { startMinute: Number(e.target.value) })} className={select}>
                    {TIME_OPTIONS.map((t) => <option key={t} value={t}>{label(t)}</option>)}
                  </select>
                  <span className="text-slate-400 text-sm">to</span>
                  <select value={d.endMinute} onChange={(e) => update(i, { endMinute: Number(e.target.value) })} className={select}>
                    {TIME_OPTIONS.map((t) => <option key={t} value={t}>{label(t)}</option>)}
                  </select>
                  {d.endMinute <= d.startMinute && <span className="text-xs text-red-600 font-semibold">End must be after start</span>}
                </div>
              ) : (
                <span className="text-xs text-slate-400">Unavailable</span>
              )}
            </div>
          ))}
        </div>

        <div className="flex items-center gap-3 mt-5">
          <button onClick={onSave} disabled={save.isPending} className="bg-teal-600 hover:bg-teal-700 disabled:opacity-60 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-colors">
            {save.isPending ? "Saving…" : "Save schedule"}
          </button>
          {saved && <span className="text-sm text-emerald-600 font-semibold">Saved ✓</span>}
          {save.isError && <span className="text-sm text-red-600 font-semibold">{(save.error as Error).message}</span>}
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="font-extrabold text-slate-900 mb-1 flex items-center gap-2"><CalendarOff className="w-4 h-4 text-teal-600" />Time off</h3>
        <p className="text-xs text-slate-500 mb-4">Block dates you&apos;re away — these hide from client booking.</p>

        <div className="flex flex-wrap items-end gap-2 mb-4">
          <div>
            <label className="text-xs font-bold text-slate-700 mb-1 block">From</label>
            <input type="datetime-local" value={offStart} onChange={(e) => setOffStart(e.target.value)} className={select} />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-700 mb-1 block">To</label>
            <input type="datetime-local" value={offEnd} onChange={(e) => setOffEnd(e.target.value)} className={select} />
          </div>
          <div className="flex-1 min-w-[140px]">
            <label className="text-xs font-bold text-slate-700 mb-1 block">Reason (optional)</label>
            <input value={offReason} onChange={(e) => setOffReason(e.target.value)} placeholder="Vacation" className={`${select} w-full`} />
          </div>
          <button onClick={onAddTimeOff} disabled={!offStart || !offEnd || addTimeOff.isPending} className="flex items-center gap-1 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors">
            <Plus className="w-3.5 h-3.5" />Add
          </button>
        </div>
        {addTimeOff.isError && <p className="text-xs text-red-600 mb-3">{(addTimeOff.error as Error).message}</p>}

        {schedule?.timeOff.length ? (
          <div className="space-y-2">
            {schedule.timeOff.map((t) => (
              <div key={t.id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 ring-1 ring-slate-100">
                <div className="flex-1 text-sm">
                  <div className="font-semibold text-slate-800">
                    {formatBookingShort(t.startsAt)} → {formatBookingShort(t.endsAt)}
                  </div>
                  {t.reason && <div className="text-xs text-slate-400">{t.reason}</div>}
                </div>
                <button onClick={() => removeTimeOff.mutate(t.id)} disabled={removeTimeOff.isPending} className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"><Trash2 className="w-4 h-4" /></button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-400">No time off scheduled.</p>
        )}
      </Card>
    </div>
  );
}
