"use client";

import Link from "next/link";
import { Repeat } from "lucide-react";
import Card from "@/components/ui/Card";
import StatusPill from "@/components/ui/StatusPill";
import { useMySubscriptions, useCancelSubscription } from "@/lib/queries/subscriptions";

function fmtDate(iso?: string | null) {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
  } catch {
    return "";
  }
}

export default function SubscriptionsList() {
  const { data: subs = [], isLoading } = useMySubscriptions();
  const cancel = useCancelSubscription();

  if (isLoading) {
    return <div className="space-y-3 mb-7">{Array.from({ length: 1 }).map((_, i) => <div key={i} className="h-20 rounded-2xl bg-slate-100 animate-pulse" />)}</div>;
  }

  if (subs.length === 0) {
    return (
      <Card className="p-6 text-center text-sm text-slate-400 mb-7">
        No active plan.{" "}
        <Link href="/#plans" className="text-teal-600 font-bold">Browse subscription plans →</Link>
      </Card>
    );
  }

  return (
    <div className="space-y-3 mb-7">
      {subs.map((s) => (
        <Card key={s.id} className="p-4 flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0"><Repeat className="w-5 h-5" /></div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap"><span className="font-bold text-sm text-slate-900">{s.plan?.name ?? "Plan"}</span><StatusPill s={s.status.toLowerCase()} /></div>
            <div className="text-xs text-slate-500 mt-0.5">{s.plan?.frequency}{s.plan ? ` · $${s.plan.price}/mo` : ""}</div>
            {s.renewsAt && s.status === "ACTIVE" && <div className="text-xs text-slate-400 mt-0.5">Renews {fmtDate(s.renewsAt)}</div>}
          </div>
          {s.status === "ACTIVE" && (
            <button
              onClick={() => cancel.mutate(s.id)}
              disabled={cancel.isPending}
              className="shrink-0 px-3 py-1.5 bg-rose-50 text-rose-600 hover:bg-rose-100 disabled:opacity-50 text-xs font-bold rounded-lg transition-colors"
            >
              Cancel
            </button>
          )}
        </Card>
      ))}
    </div>
  );
}
