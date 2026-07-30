"use client";

import { MapPin, FileText, Check } from "lucide-react";
import Card from "@/components/ui/Card";
import { useVerificationQueue, useReviewVerification } from "@/lib/queries/verifications";

function initials(name: string) {
  return name.split(" ").map((n) => n[0]).filter(Boolean).join("").slice(0, 2).toUpperCase();
}

function fmtDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" });
  } catch {
    return "";
  }
}

export default function VerifyTab() {
  const { data: queue = [], isLoading } = useVerificationQueue();
  const review = useReviewVerification();

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2"><span className="font-extrabold text-slate-900">Verification Queue</span><span className="bg-amber-100 text-amber-700 text-xs font-black px-2.5 py-1 rounded-full">{queue.length} pending</span></div>

      {isLoading && Array.from({ length: 2 }).map((_, i) => <div key={i} className="h-28 rounded-2xl bg-slate-100 animate-pulse" />)}

      {!isLoading && queue.length === 0 && (
        <Card className="p-6 text-center text-sm text-slate-400">No pending verification requests.</Card>
      )}

      {queue.map((v) => {
        const name = v.provider?.user ? `${v.provider.user.firstName} ${v.provider.user.lastName}` : "Provider";
        return (
          <Card key={v.id} className="p-5">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-400 to-emerald-400 flex items-center justify-center text-white text-xs font-bold shrink-0">{initials(name)}</div>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-slate-900">{name}</div>
                <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5"><MapPin className="w-3 h-3" />{v.city || "—"} · Submitted {fmtDate(v.submittedAt)}</div>
                <div className="flex flex-wrap gap-2 mt-3">
                  {v.documents.map((d) => (
                    <a key={d.id} href={d.url} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-xs bg-slate-100 hover:bg-slate-200 text-slate-600 px-2.5 py-1 rounded-full font-semibold transition-colors"><FileText className="w-3 h-3" />{d.type}</a>
                  ))}
                </div>
              </div>
              <div className="flex gap-2 shrink-0">
                <button onClick={() => review.mutate({ id: v.id, status: "REJECTED" })} disabled={review.isPending} className="px-3 py-2 bg-rose-50 text-rose-600 text-xs font-bold rounded-xl hover:bg-rose-100 disabled:opacity-50 transition-colors">Reject</button>
                <button onClick={() => review.mutate({ id: v.id, status: "APPROVED" })} disabled={review.isPending} className="px-3 py-2 bg-emerald-500 text-white text-xs font-bold rounded-xl hover:bg-emerald-600 disabled:opacity-50 transition-colors flex items-center gap-1"><Check className="w-3 h-3" />Approve</button>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
