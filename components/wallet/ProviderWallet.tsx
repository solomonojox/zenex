"use client";

import { RefreshCw, Banknote, CreditCard, CheckCircle2, AlertCircle } from "lucide-react";
import Card from "@/components/ui/Card";
import StatusPill from "@/components/ui/StatusPill";
import {
  useWallet,
  usePayouts,
  useRequestPayout,
  useConnectStatus,
  useConnectOnboarding,
} from "@/lib/queries/wallet";

function fmtDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
  } catch {
    return "";
  }
}

export default function ProviderWallet() {
  const { data: wallet } = useWallet();
  const { data: payouts = [], isLoading } = usePayouts();
  const payout = useRequestPayout();
  const { data: connect } = useConnectStatus();
  const onboarding = useConnectOnboarding();
  const balance = wallet?.balance ?? 0;

  const startOnboarding = () => {
    const returnUrl =
      typeof window !== "undefined" ? `${window.location.origin}/wallet` : "";
    onboarding.mutate(returnUrl, {
      onSuccess: (res) => {
        if (res.url) window.location.href = res.url;
      },
    });
  };

  return (
    <div className="space-y-5">
      <div className="bg-gradient-to-br from-teal-700 to-emerald-700 rounded-3xl p-6 text-white shadow-xl shadow-teal-200/40">
        <div className="text-xs font-bold text-teal-200 uppercase tracking-widest mb-1">Available Balance</div>
        <div className="text-4xl font-extrabold mb-1">${balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
        <div className="text-teal-100 text-sm">{payouts.length} payouts · {wallet?.currency ?? "CAD"}</div>
        <div className="flex gap-3 mt-5">
          <button
            onClick={() => payout.mutate()}
            disabled={payout.isPending || balance <= 0}
            className="flex-1 bg-white/20 hover:bg-white/30 disabled:opacity-50 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-3.5 h-3.5" />{payout.isPending ? "Processing…" : "Request Payout"}
          </button>
        </div>
        {payout.isError && <p className="text-xs text-rose-100 mt-3">{(payout.error as Error).message}</p>}
        {payout.isSuccess && <p className="text-xs text-teal-100 mt-3">Payout requested ✓</p>}
      </div>

      {/* Stripe Connect — required before real payouts can be sent. */}
      <Card className="p-5">
        <h3 className="font-bold text-slate-900 mb-3 flex items-center gap-2"><CreditCard className="w-4 h-4 text-teal-600" />Payout account</h3>
        {connect?.mode === "demo" ? (
          <div className="flex items-start gap-3 p-3.5 rounded-xl bg-amber-50 ring-1 ring-amber-200">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-sm text-amber-800">Demo mode</div>
              <p className="text-xs text-amber-700 mt-0.5">Payouts are simulated. Add Stripe keys to the API to enable real bank transfers.</p>
            </div>
          </div>
        ) : connect?.payoutsEnabled ? (
          <div className="flex items-center gap-3 p-3.5 rounded-xl bg-emerald-50 ring-1 ring-emerald-200">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <div className="flex-1">
              <div className="font-bold text-sm text-emerald-800">Connected</div>
              <p className="text-xs text-emerald-700">Your Stripe account is verified and can receive payouts.</p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-slate-600">
              {connect?.connected
                ? "Your payout setup is incomplete — finish verification to receive money."
                : "Connect a payout account to receive your earnings."}
            </p>
            {!!connect?.requirements?.length && (
              <ul className="text-xs text-slate-500 list-disc pl-5 space-y-0.5">
                {connect.requirements.slice(0, 5).map((r) => <li key={r}>{r.replace(/_/g, " ")}</li>)}
              </ul>
            )}
            <button onClick={startOnboarding} disabled={onboarding.isPending} className="bg-slate-900 hover:bg-slate-800 disabled:opacity-60 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-colors">
              {onboarding.isPending ? "Opening Stripe…" : connect?.connected ? "Finish verification" : "Connect payout account"}
            </button>
            {onboarding.isError && <p className="text-xs text-red-600">{(onboarding.error as Error).message}</p>}
          </div>
        )}
      </Card>

      <Card className="p-5">
        <div className="flex items-center justify-between mb-4"><h3 className="font-bold text-slate-900">Payout History</h3><button className="text-xs font-bold text-teal-600">T4 Slip ›</button></div>
        {isLoading ? (
          <div className="space-y-2">{Array.from({ length: 2 }).map((_, i) => <div key={i} className="h-12 rounded-xl bg-slate-100 animate-pulse" />)}</div>
        ) : payouts.length === 0 ? (
          <p className="text-sm text-slate-400 py-6 text-center">No payouts yet — request one when you have a balance.</p>
        ) : (
          <div className="space-y-2">
            {payouts.map((p) => (
              <div key={p.id} className="flex items-center gap-3 py-3 border-b border-slate-50 last:border-0">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${p.status === "PENDING" ? "bg-amber-50 text-amber-600" : "bg-emerald-50 text-emerald-600"}`}><Banknote className="w-4 h-4" /></div>
                <div className="flex-1"><div className="font-semibold text-sm text-slate-900">{p.jobsCount} jobs · {fmtDate(p.createdAt)}</div><div className="text-xs text-slate-400">{p.reference}</div></div>
                <div className="text-right"><div className="font-extrabold text-sm text-slate-900">${p.amount.toLocaleString()}</div><StatusPill s={p.status.toLowerCase()} /></div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
