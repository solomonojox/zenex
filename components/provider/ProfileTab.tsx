import { Camera } from "lucide-react";
import Card from "@/components/ui/Card";
import VBadge from "@/components/ui/VBadge";
import { PROVIDERS } from "@/lib/data";

export default function ProfileTab() {
  const p = PROVIDERS[0];
  const rows: [string, string][] = [
    ["Full name", p.name],
    ["Email", "maria.santos@email.com"],
    ["Phone", "+1 (416) 555-0182"],
    ["Location", p.location],
    ["Hourly rate", `$${p.price}/hr`],
    ["Languages", p.languages.join(", ")],
  ];

  return (
    <div className="space-y-4">
      <Card className="p-6">
        <div className="flex items-center gap-5 mb-5 pb-5 border-b border-slate-100">
          <div className="relative">
            <img src={p.image} alt={p.name} className="w-20 h-20 rounded-xl object-cover" />
            <button className="absolute bottom-0 right-0 bg-teal-600 text-white rounded-full p-1.5 shadow-sm"><Camera className="w-3 h-3" /></button>
          </div>
          <div>
            <h4 className="font-bold text-slate-900">{p.name}</h4>
            <p className="text-sm text-slate-500">{p.title}</p>
            <div className="flex gap-2 mt-2">
              <VBadge />
              <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-50 ring-1 ring-amber-200 px-2 py-0.5 rounded-full">Top Pro</span>
            </div>
          </div>
        </div>
        {rows.map(([l, v]) => (
          <div key={l} className="flex items-center justify-between py-3 border-b border-slate-50 last:border-0"><span className="text-sm text-slate-500">{l}</span><span className="text-sm font-semibold text-slate-900">{v}</span></div>
        ))}
      </Card>
      <Card className="p-6">
        <h3 className="font-bold text-slate-900 mb-4">Performance</h3>
        <div className="grid grid-cols-3 gap-4 text-center">
          {[["4.97/5", "Rating"], ["98.2%", "Completion"], ["< 1 hr", "Response"]].map(([v, l]) => (
            <div key={l}><div className="text-xl font-extrabold text-teal-600">{v}</div><div className="text-xs text-slate-400 mt-0.5">{l}</div></div>
          ))}
        </div>
      </Card>
    </div>
  );
}
