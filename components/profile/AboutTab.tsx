import { Globe, Clock, CheckCircle, Calendar } from "lucide-react";
import type { Provider } from "@/lib/types";
import Card from "@/components/ui/Card";

export default function AboutTab({ p }: { p: Provider }) {
  const offDays = [6, 7, 13, 14, 20, 21, 27, 28];
  const bookedDays = [4, 11, 18];

  return (
    <div className="space-y-5">
      <Card className="p-6">
        <h3 className="font-bold text-slate-900 mb-3">About {p.name.split(" ")[0]}</h3>
        <p className="text-slate-600 text-sm leading-relaxed mb-5" style={{ fontFamily: "'Inter', sans-serif" }}>{p.bio}</p>
        <div className="grid grid-cols-2 gap-4">
          {[
            { I: Globe, l: "Languages", v: p.languages.join(", ") },
            { I: Clock, l: "Response time", v: p.responseTime },
            { I: CheckCircle, l: "Jobs completed", v: p.completions.toLocaleString() },
            { I: Calendar, l: "Member since", v: "March 2019" },
          ].map(({ I, l, v }) => (
            <div key={l} className="flex items-start gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center shrink-0"><I className="w-4 h-4 text-teal-600" /></div>
              <div><div className="text-xs text-slate-400">{l}</div><div className="text-sm font-bold text-slate-900">{v}</div></div>
            </div>
          ))}
        </div>
      </Card>
      <Card className="p-5">
        <h3 className="font-bold text-slate-900 mb-4">Availability · July 2025</h3>
        <div className="grid grid-cols-7 gap-1 text-center text-xs">
          {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => <div key={i} className="font-bold text-slate-400 py-1">{d}</div>)}
          {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => {
            const off = offDays.includes(d);
            const booked = bookedDays.includes(d);
            return (
              <button key={d} disabled={off || booked} className={`py-2 rounded-lg font-semibold transition-colors ${off ? "text-slate-200" : booked ? "bg-rose-50 text-rose-300 cursor-not-allowed" : "bg-teal-50 text-teal-700 hover:bg-teal-600 hover:text-white"}`}>
                {d}
              </button>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
