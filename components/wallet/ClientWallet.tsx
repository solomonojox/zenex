import { CreditCard, FileText, MoreVertical, ArrowDownLeft, ArrowUpRight } from "lucide-react";
import Card from "@/components/ui/Card";
import StatusPill from "@/components/ui/StatusPill";
import { TRANSACTIONS } from "@/lib/data";

const SAVED_CARDS = [
  { n: "Visa", last: "4242", exp: "04/27", def: true },
  { n: "Mastercard", last: "8888", exp: "11/26", def: false },
];

export default function ClientWallet() {
  return (
    <div className="space-y-5">
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-6 text-white shadow-xl">
        <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Total Spent · 2025</div>
        <div className="text-4xl font-extrabold mb-1">$2,840.00</div>
        <div className="text-slate-400 text-sm">23 bookings · Visa ···· 4242</div>
        <div className="flex gap-3 mt-5">
          <button className="flex-1 bg-white/10 hover:bg-white/20 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2"><CreditCard className="w-3.5 h-3.5" />Manage Cards</button>
          <button className="flex-1 bg-teal-500 hover:bg-teal-400 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2"><FileText className="w-3.5 h-3.5" />Invoices</button>
        </div>
      </div>

      <Card className="p-5">
        <h3 className="font-bold text-slate-900 mb-4">Saved Payment Methods</h3>
        <div className="space-y-3">
          {SAVED_CARDS.map((c) => (
            <div key={c.last} className={`flex items-center gap-3 p-3.5 rounded-xl ring-1 ${c.def ? "ring-teal-400 bg-teal-50" : "ring-slate-200"}`}>
              <div className="w-10 h-7 bg-slate-200 rounded-md flex items-center justify-center text-slate-600 font-black text-[10px] shrink-0">{c.n.slice(0, 2)}</div>
              <div className="flex-1"><div className="font-bold text-sm text-slate-900">{c.n} ···· {c.last}</div><div className="text-xs text-slate-400">Expires {c.exp}</div></div>
              {c.def && <span className="text-[10px] font-black bg-teal-100 text-teal-700 px-2 py-0.5 rounded-full">Default</span>}
              <button className="text-slate-300 hover:text-slate-500"><MoreVertical className="w-4 h-4" /></button>
            </div>
          ))}
          <button className="flex items-center gap-2 text-teal-600 text-sm font-bold hover:text-teal-700 transition-colors pt-1">+ Add payment method</button>
        </div>
      </Card>

      <Card className="p-5">
        <div className="flex items-center justify-between mb-4"><h3 className="font-bold text-slate-900">Transaction History</h3><button className="text-xs font-bold text-teal-600 hover:text-teal-700">Export CSV</button></div>
        <div className="space-y-2">
          {TRANSACTIONS.map((tx) => (
            <div key={tx.id} className="flex items-center gap-3 py-3 border-b border-slate-50 last:border-0">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${tx.type === "credit" ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-500"}`}>
                {tx.type === "credit" ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
              </div>
              <div className="flex-1 min-w-0"><div className="font-semibold text-sm text-slate-900 truncate">{tx.desc}</div><div className="text-xs text-slate-400">{tx.date} · {tx.id}</div></div>
              <div className="text-right shrink-0">
                <div className={`font-extrabold text-sm ${tx.type === "credit" ? "text-emerald-600" : "text-slate-900"}`}>{tx.type === "credit" ? "+" : "-"}${Math.abs(tx.amount)}</div>
                <StatusPill s={tx.status} />
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
