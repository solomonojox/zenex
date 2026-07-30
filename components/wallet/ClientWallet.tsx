"use client";

import { CreditCard, FileText, ArrowDownLeft, ArrowUpRight } from "lucide-react";
import Card from "@/components/ui/Card";
import StatusPill from "@/components/ui/StatusPill";
import { useWallet, useTransactions } from "@/lib/queries/wallet";

function fmtDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
  } catch {
    return "";
  }
}

export default function ClientWallet() {
  const { data: wallet } = useWallet();
  const { data: txns = [], isLoading } = useTransactions();

  const spent = txns
    .filter((t) => t.type === "DEBIT")
    .reduce((s, t) => s + Math.abs(t.amount), 0);

  return (
    <div className="space-y-5">
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-6 text-white shadow-xl">
        <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Total Spent</div>
        <div className="text-4xl font-extrabold mb-1">${spent.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
        <div className="text-slate-400 text-sm">{txns.length} transactions · {wallet?.currency ?? "CAD"}</div>
        <div className="flex gap-3 mt-5">
          <button className="flex-1 bg-white/10 hover:bg-white/20 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2"><CreditCard className="w-3.5 h-3.5" />Manage Cards</button>
          <button className="flex-1 bg-teal-500 hover:bg-teal-400 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2"><FileText className="w-3.5 h-3.5" />Invoices</button>
        </div>
      </div>

      <Card className="p-5">
        <div className="flex items-center justify-between mb-4"><h3 className="font-bold text-slate-900">Transaction History</h3><button className="text-xs font-bold text-teal-600 hover:text-teal-700">Export CSV</button></div>
        {isLoading ? (
          <div className="space-y-2">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-12 rounded-xl bg-slate-100 animate-pulse" />)}</div>
        ) : txns.length === 0 ? (
          <p className="text-sm text-slate-400 py-6 text-center">No transactions yet.</p>
        ) : (
          <div className="space-y-2">
            {txns.map((tx) => (
              <div key={tx.id} className="flex items-center gap-3 py-3 border-b border-slate-50 last:border-0">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${tx.type === "CREDIT" ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-500"}`}>
                  {tx.type === "CREDIT" ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                </div>
                <div className="flex-1 min-w-0"><div className="font-semibold text-sm text-slate-900 truncate">{tx.description}</div><div className="text-xs text-slate-400">{fmtDate(tx.createdAt)} · {tx.reference}</div></div>
                <div className="text-right shrink-0">
                  <div className={`font-extrabold text-sm ${tx.type === "CREDIT" ? "text-emerald-600" : "text-slate-900"}`}>{tx.type === "CREDIT" ? "+" : "-"}${Math.abs(tx.amount).toLocaleString()}</div>
                  <StatusPill s={tx.status.toLowerCase()} />
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
