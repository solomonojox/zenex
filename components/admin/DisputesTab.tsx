"use client";

import { AlertTriangle } from "lucide-react";
import Card from "@/components/ui/Card";
import { useDisputes, useResolveDispute } from "@/lib/queries/admin";

const PRIORITY_ICON_STYLES: Record<string, string> = {
  high: "bg-rose-100 text-rose-600",
  medium: "bg-amber-100 text-amber-600",
  low: "bg-slate-100 text-slate-500",
};

const PRIORITY_BADGE_STYLES: Record<string, string> = {
  high: "bg-rose-100 text-rose-700",
  medium: "bg-amber-100 text-amber-700",
  low: "bg-slate-100 text-slate-600",
};

function fmtDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" });
  } catch {
    return "";
  }
}

export default function DisputesTab() {
  const { data: disputes = [], isLoading } = useDisputes("OPEN");
  const resolve = useResolveDispute();

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2"><span className="font-extrabold text-slate-900">Open Disputes</span><span className="bg-rose-100 text-rose-700 text-xs font-black px-2.5 py-1 rounded-full">{disputes.length} open</span></div>

      {isLoading && Array.from({ length: 2 }).map((_, i) => <div key={i} className="h-24 rounded-2xl bg-slate-100 animate-pulse" />)}

      {!isLoading && disputes.length === 0 && (
        <Card className="p-6 text-center text-sm text-slate-400">No open disputes. 🎉</Card>
      )}

      {disputes.map((d) => {
        const priority = d.priority.toLowerCase();
        return (
          <Card key={d.id} className="p-5">
            <div className="flex items-start gap-4">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${PRIORITY_ICON_STYLES[priority] ?? PRIORITY_ICON_STYLES.low}`}><AlertTriangle className="w-4 h-4" /></div>
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-1"><span className="font-bold text-slate-900">{d.reference}</span><span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase ${PRIORITY_BADGE_STYLES[priority] ?? PRIORITY_BADGE_STYLES.low}`}>{priority}</span></div>
                <div className="text-sm text-slate-700 mb-1">{d.issue}</div>
                <div className="text-xs text-slate-400">Client: {d.clientName} · Provider: {d.providerName} · {fmtDate(d.createdAt)}</div>
              </div>
              <div className="flex gap-2 shrink-0">
                <button onClick={() => resolve.mutate({ id: d.id, status: "ESCALATED" })} disabled={resolve.isPending} className="px-3 py-2 bg-amber-50 text-amber-700 text-xs font-bold rounded-xl hover:bg-amber-100 disabled:opacity-50 transition-colors">Escalate</button>
                <button onClick={() => resolve.mutate({ id: d.id, status: "RESOLVED" })} disabled={resolve.isPending} className="px-3 py-2 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-xl hover:bg-emerald-100 disabled:opacity-50 transition-colors">Resolve</button>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
