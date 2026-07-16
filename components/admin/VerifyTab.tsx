import { MapPin, FileText, Check } from "lucide-react";
import Card from "@/components/ui/Card";
import { VERIFICATION_QUEUE } from "@/lib/data";

export default function VerifyTab() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2"><span className="font-extrabold text-slate-900">Verification Queue</span><span className="bg-amber-100 text-amber-700 text-xs font-black px-2.5 py-1 rounded-full">{VERIFICATION_QUEUE.length} pending</span></div>
      {VERIFICATION_QUEUE.map((v) => (
        <Card key={v.name} className="p-5">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-400 to-emerald-400 flex items-center justify-center text-white text-xs font-bold shrink-0">{v.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}</div>
            <div className="flex-1 min-w-0">
              <div className="font-bold text-slate-900">{v.name}</div>
              <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5"><MapPin className="w-3 h-3" />{v.city} · Submitted {v.submitted}</div>
              <div className="flex flex-wrap gap-2 mt-3">
                {v.docs.map((d) => <span key={d} className="flex items-center gap-1 text-xs bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full font-semibold"><FileText className="w-3 h-3" />{d}</span>)}
              </div>
            </div>
            <div className="flex gap-2 shrink-0">
              <button className="px-3 py-2 bg-slate-100 text-slate-600 text-xs font-bold rounded-xl hover:bg-slate-200 transition-colors">Review</button>
              <button className="px-3 py-2 bg-rose-50 text-rose-600 text-xs font-bold rounded-xl hover:bg-rose-100 transition-colors">Reject</button>
              <button className="px-3 py-2 bg-emerald-500 text-white text-xs font-bold rounded-xl hover:bg-emerald-600 transition-colors flex items-center gap-1"><Check className="w-3 h-3" />Approve</button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
