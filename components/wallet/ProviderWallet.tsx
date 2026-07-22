import { RefreshCw, Settings, Banknote, Check } from "lucide-react";
import Card from "@/components/ui/Card";
import StatusPill from "@/components/ui/StatusPill";
import { PROV_PAYOUTS } from "@/lib/data";

export default function ProviderWallet() {
  return (
    <div className="space-y-5">
      <div className="bg-gradient-to-br from-teal-700 to-emerald-700 rounded-3xl p-6 text-white shadow-xl shadow-teal-200/40">
        <div className="text-xs font-bold text-teal-200 uppercase tracking-widest mb-1">Available Balance</div>
        <div className="text-4xl font-extrabold mb-1">$1,404.00</div>
        <div className="text-teal-100 text-sm">Payout on July 8, 2025 · Interac e-Transfer</div>
        <div className="flex gap-3 mt-5">
          <button className="flex-1 bg-white/20 hover:bg-white/30 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2"><RefreshCw className="w-3.5 h-3.5" />Request Early Payout</button>
          <button className="flex-1 bg-white text-teal-700 text-xs font-bold px-4 py-2.5 rounded-xl hover:bg-teal-50 transition-colors flex items-center justify-center gap-2"><Settings className="w-3.5 h-3.5" />Payout Settings</button>
        </div>
      </div>

      <Card className="p-5">
        <h3 className="font-bold text-slate-900 mb-4">Payout Method</h3>
        <div className="flex items-center gap-3 p-3.5 rounded-xl ring-1 ring-teal-300 bg-teal-50">
          <div className="w-10 h-10 rounded-xl bg-teal-100 flex items-center justify-center shrink-0"><Banknote className="w-5 h-5 text-teal-700" /></div>
          <div className="flex-1"><div className="font-bold text-sm text-slate-900">Interac e-Transfer</div><div className="text-xs text-slate-500">maria.santos@email.com · Processed weekly</div></div>
          <Check className="w-4 h-4 text-teal-600" />
        </div>
      </Card>

      <Card className="p-5">
        <div className="flex items-center justify-between mb-4"><h3 className="font-bold text-slate-900">Payout History</h3><button className="text-xs font-bold text-teal-600">T4 Slip ›</button></div>
        <div className="space-y-2">
          {PROV_PAYOUTS.map((p) => (
            <div key={p.ref} className="flex items-center gap-3 py-3 border-b border-slate-50 last:border-0">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${p.status === "pending" ? "bg-amber-50 text-amber-600" : "bg-emerald-50 text-emerald-600"}`}><Banknote className="w-4 h-4" /></div>
              <div className="flex-1"><div className="font-semibold text-sm text-slate-900">{p.jobs} jobs · {p.date}</div><div className="text-xs text-slate-400">{p.ref}</div></div>
              <div className="text-right"><div className="font-extrabold text-sm text-slate-900">${p.amount.toLocaleString()}</div><StatusPill s={p.status} /></div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
