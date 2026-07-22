import Link from "next/link";
import { MapPin, Calendar, Clock, MessageSquare, Banknote, ChevronRight } from "lucide-react";
import Card from "@/components/ui/Card";
import { UPCOMING_JOBS } from "@/lib/data";

export default function JobsTab() {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-2"><h2 className="font-extrabold text-slate-900 text-lg">Upcoming Jobs</h2><span className="text-xs font-bold bg-teal-50 text-teal-700 px-2.5 py-1 rounded-full">{UPCOMING_JOBS.length} this week</span></div>
      {UPCOMING_JOBS.map((j, i) => (
        <Card key={i} className="p-5">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-400 to-emerald-400 flex items-center justify-center text-white text-xs font-bold shrink-0">{j.av}</div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2"><span className="font-bold text-slate-900">{j.client}</span><span className="text-xs bg-teal-50 text-teal-700 px-2 py-0.5 rounded-full font-bold">{j.svc}</span></div>
              <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-1"><MapPin className="w-3 h-3" />{j.addr}</div>
              <div className="flex items-center gap-4 mt-1.5 text-xs text-slate-400"><span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{j.date}</span><span className="flex items-center gap-1"><Clock className="w-3 h-3" />{j.time} · {j.hrs}h</span></div>
            </div>
            <div className="text-right shrink-0">
              <div className="font-extrabold text-slate-900 text-lg">${j.pay}</div>
              <div className="flex gap-1.5 mt-2 justify-end">
                <Link href="/messages" className="px-2.5 py-1.5 ring-1 ring-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50"><MessageSquare className="w-3 h-3" /></Link>
                <button className="px-3 py-1.5 bg-teal-600 rounded-lg text-xs font-bold text-white hover:bg-teal-700 transition-colors">Accept</button>
              </div>
            </div>
          </div>
        </Card>
      ))}
      <Link href="/wallet" className="w-full bg-white rounded-2xl p-4 ring-1 ring-black/[0.06] flex items-center gap-3 hover:shadow-md transition-shadow text-left mt-2">
        <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0"><Banknote className="w-5 h-5" /></div>
        <div><div className="font-bold text-sm text-slate-900">Payout Dashboard</div><div className="text-xs text-slate-500">View earnings & request payout</div></div>
        <ChevronRight className="w-4 h-4 text-slate-300 ml-auto" />
      </Link>
    </div>
  );
}
