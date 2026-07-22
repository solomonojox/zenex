import { AlertTriangle } from "lucide-react";
import Card from "@/components/ui/Card";
import { DISPUTES } from "@/lib/data";

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

export default function DisputesTab() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2"><span className="font-extrabold text-slate-900">Open Disputes</span><span className="bg-rose-100 text-rose-700 text-xs font-black px-2.5 py-1 rounded-full">{DISPUTES.length} open</span></div>
      {DISPUTES.map((d) => (
        <Card key={d.id} className="p-5">
          <div className="flex items-start gap-4">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${PRIORITY_ICON_STYLES[d.priority]}`}><AlertTriangle className="w-4 h-4" /></div>
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-1"><span className="font-bold text-slate-900">{d.id}</span><span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase ${PRIORITY_BADGE_STYLES[d.priority]}`}>{d.priority}</span></div>
              <div className="text-sm text-slate-700 mb-1">{d.issue}</div>
              <div className="text-xs text-slate-400">Client: {d.client} · Provider: {d.provider} · {d.date}</div>
            </div>
            <div className="flex gap-2 shrink-0">
              <button className="px-3 py-2 bg-teal-50 text-teal-700 text-xs font-bold rounded-xl hover:bg-teal-100 transition-colors">Investigate</button>
              <button className="px-3 py-2 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-xl hover:bg-emerald-100 transition-colors">Resolve</button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
