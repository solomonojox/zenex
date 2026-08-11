"use client";

import { useRef, useState } from "react";
import { FileText, Upload, Trash2, CheckCircle2 } from "lucide-react";
import { useUploadDocument } from "@/lib/queries/verifications";

export interface StagedDoc {
  type: string;
  /** Storage path returned by the upload endpoint. */
  url: string;
  expiresAt?: string;
  fileName: string;
}

export const DOC_TYPES = [
  {
    type: "ID",
    label: "Government ID",
    hint: "Driver's licence, passport, or provincial ID",
    required: true,
  },
  {
    type: "Insurance",
    label: "Insurance certificate",
    hint: "General liability coverage",
    required: true,
    needsExpiry: true,
  },
  {
    type: "Background check",
    label: "Background check",
    hint: "Police or third-party check",
  },
  {
    type: "Business Reg.",
    label: "Business registration",
    hint: "Only if you operate as a company",
  },
];

const ACCEPT = "image/png,image/jpeg,image/webp,application/pdf";
const MAX_BYTES = 10 * 1024 * 1024; // 10 MB

/**
 * Single source of truth for KYC document uploads — used by both the provider
 * signup wizard and the dashboard Verification tab so the two can't drift.
 * The parent owns the staged list and decides when to submit.
 */
export default function DocumentUploader({
  staged,
  onChange,
}: {
  staged: StagedDoc[];
  onChange: (docs: StagedDoc[]) => void;
}) {
  const upload = useUploadDocument();
  const fileRef = useRef<HTMLInputElement>(null);
  const [activeType, setActiveType] = useState<string | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);

  const pickFile = (type: string) => {
    setLocalError(null);
    setActiveType(type);
    fileRef.current?.click();
  };

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // let the same file be re-picked
    if (!file || !activeType) return;

    if (file.size > MAX_BYTES) {
      setLocalError("That file is larger than 10 MB — please upload a smaller one.");
      return;
    }

    upload.mutate(
      { type: activeType, file },
      {
        onSuccess: (res) => {
          onChange([
            ...staged.filter((d) => d.type !== activeType),
            { type: activeType, url: res.path, fileName: file.name },
          ]);
        },
      },
    );
  };

  const setExpiry = (type: string, value: string) =>
    onChange(
      staged.map((d) =>
        d.type === type ? { ...d, expiresAt: value || undefined } : d,
      ),
    );

  const remove = (type: string) => onChange(staged.filter((d) => d.type !== type));

  return (
    <div className="space-y-2.5">
      <input
        ref={fileRef}
        type="file"
        onChange={onFile}
        className="hidden"
        accept={ACCEPT}
      />

      {DOC_TYPES.map((dt) => {
        const done = staged.find((s) => s.type === dt.type);
        const busy = upload.isPending && activeType === dt.type;
        return (
          <div
            key={dt.type}
            className={`p-3.5 rounded-xl ring-1 transition-colors ${done ? "bg-teal-50/60 ring-teal-200" : "bg-slate-50 ring-slate-200"}`}
          >
            <div className="flex items-center gap-3 flex-wrap">
              {done ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 text-teal-600" />
              ) : (
                <FileText className="w-4 h-4 shrink-0 text-slate-400" />
              )}
              <div className="flex-1 min-w-[140px]">
                <div className="font-bold text-sm text-slate-800">
                  {dt.label}
                  {dt.required && !done && <span className="text-rose-500 ml-1">*</span>}
                </div>
                <div className="text-xs text-slate-500 truncate">
                  {done ? done.fileName : dt.hint}
                </div>
              </div>
              {done ? (
                <button
                  type="button"
                  onClick={() => remove(dt.type)}
                  aria-label={`Remove ${dt.label}`}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => pickFile(dt.type)}
                  disabled={busy}
                  className="flex items-center gap-1.5 bg-white ring-1 ring-slate-200 hover:ring-teal-300 text-slate-700 text-xs font-bold px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                >
                  <Upload className="w-3.5 h-3.5" />
                  {busy ? "Uploading…" : "Choose file"}
                </button>
              )}
            </div>

            {done && dt.needsExpiry && (
              <div className="mt-2.5 flex items-center gap-2">
                <label className="text-xs font-bold text-slate-600">Expires</label>
                <input
                  type="date"
                  value={done.expiresAt?.slice(0, 10) ?? ""}
                  onChange={(e) => setExpiry(dt.type, e.target.value)}
                  className="bg-white ring-1 ring-slate-200 focus:ring-teal-400 rounded-lg px-2.5 py-1.5 text-sm outline-none text-slate-800"
                />
              </div>
            )}
          </div>
        );
      })}

      {(localError || upload.isError) && (
        <p className="text-xs text-red-600 font-semibold">
          {localError ?? (upload.error as Error).message}
        </p>
      )}
      <p className="text-xs text-slate-400">
        PDF, PNG or JPG · up to 10 MB each. Stored securely and reviewed within 24 hours.
      </p>
    </div>
  );
}
