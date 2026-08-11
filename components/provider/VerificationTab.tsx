"use client";

import { useState } from "react";
import {
  FileText,
  CheckCircle2,
  Clock,
  XCircle,
  ShieldCheck,
  AlertTriangle,
} from "lucide-react";
import Card from "@/components/ui/Card";
import DocumentUploader, {
  type StagedDoc,
} from "@/components/verification/DocumentUploader";
import {
  useMyVerification,
  useSubmitVerification,
} from "@/lib/queries/verifications";

const STATUS_UI: Record<string, { I: typeof Clock; c: string; label: string }> = {
  SUBMITTED: { I: Clock, c: "text-amber-700 bg-amber-50 ring-amber-200", label: "Under review" },
  IN_REVIEW: { I: Clock, c: "text-amber-700 bg-amber-50 ring-amber-200", label: "In review" },
  APPROVED: { I: CheckCircle2, c: "text-emerald-700 bg-emerald-50 ring-emerald-200", label: "Verified" },
  REJECTED: { I: XCircle, c: "text-rose-700 bg-rose-50 ring-rose-200", label: "Rejected" },
};

const DAY = 24 * 60 * 60 * 1000;

export default function VerificationTab() {
  const { data: existing, isLoading } = useMyVerification();
  const submit = useSubmitVerification();

  const [staged, setStaged] = useState<StagedDoc[]>([]);
  const [city, setCity] = useState("");

  const onSubmit = () => {
    submit.mutate(
      {
        city: city.trim() || undefined,
        documents: staged.map(({ type, url, expiresAt }) => ({ type, url, expiresAt })),
      },
      { onSuccess: () => setStaged([]) },
    );
  };

  if (isLoading) return <div className="h-56 rounded-2xl bg-slate-100 animate-pulse" />;

  const status = existing?.status ? STATUS_UI[existing.status] : null;
  const hasExpired = existing?.documents?.some(
    (d) => d.expiresAt && new Date(d.expiresAt) < new Date(),
  );

  return (
    <div className="space-y-4">
      {existing && status && (
        <Card className="p-5">
          <div className={`flex items-start gap-3 p-3.5 rounded-xl ring-1 ${status.c}`}>
            <status.I className="w-5 h-5 shrink-0 mt-0.5" />
            <div className="flex-1">
              <div className="font-bold text-sm">Verification: {status.label}</div>
              <p className="text-xs mt-0.5 opacity-90">
                Submitted {new Date(existing.submittedAt).toLocaleDateString()}
                {existing.reviewNote ? ` · ${existing.reviewNote}` : ""}
              </p>
            </div>
          </div>

          {existing.documents.length > 0 && (
            <div className="mt-4 space-y-2">
              {existing.documents.map((d) => {
                const expired = d.expiresAt && new Date(d.expiresAt) < new Date();
                const soon =
                  d.expiresAt &&
                  !expired &&
                  new Date(d.expiresAt).getTime() - Date.now() < 30 * DAY;
                return (
                  <div key={d.id} className="flex items-center gap-2.5 text-sm">
                    <FileText className="w-4 h-4 text-slate-400 shrink-0" />
                    <span className="font-semibold text-slate-700">{d.type}</span>
                    {d.expiresAt && (
                      <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${expired ? "bg-rose-50 text-rose-700" : soon ? "bg-amber-50 text-amber-700" : "bg-slate-100 text-slate-500"}`}>
                        {expired ? "Expired" : "Expires"} {new Date(d.expiresAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                );
              })}
              {hasExpired && (
                <div className="flex items-start gap-2 text-xs text-rose-700 bg-rose-50 ring-1 ring-rose-200 rounded-lg p-2.5 mt-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>A document has expired — upload a current one to stay verified.</span>
                </div>
              )}
            </div>
          )}
        </Card>
      )}

      <Card className="p-6">
        <h3 className="font-extrabold text-slate-900 mb-1 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-teal-600" />
          {existing ? "Submit updated documents" : "Get verified"}
        </h3>
        <p className="text-xs text-slate-500 mb-5">
          Verified pros get a badge, rank higher in search, and win more bookings.
        </p>

        <div className="mb-4">
          <label className="text-xs font-bold text-slate-700 mb-1.5 block">City</label>
          <input
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="Toronto, ON"
            className="bg-slate-50 ring-1 ring-slate-200 focus:ring-teal-400 rounded-lg px-3 py-2 text-sm outline-none text-slate-800 w-full max-w-xs"
          />
        </div>

        <DocumentUploader staged={staged} onChange={setStaged} />

        {submit.isError && (
          <p className="text-xs text-red-600 mt-3">{(submit.error as Error).message}</p>
        )}
        {submit.isSuccess && (
          <p className="text-xs text-emerald-600 font-semibold mt-3">Submitted for review ✓</p>
        )}

        <button
          onClick={onSubmit}
          disabled={staged.length === 0 || submit.isPending}
          className="mt-5 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-colors"
        >
          {submit.isPending
            ? "Submitting…"
            : `Submit ${staged.length || ""} document${staged.length === 1 ? "" : "s"}`}
        </button>
      </Card>
    </div>
  );
}
