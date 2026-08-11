import Link from "next/link";
import { AlertTriangle, ChevronLeft } from "lucide-react";

export interface LegalSection {
  heading: string;
  body: string[];
}

/**
 * Shared shell for the policy pages. The draft banner is deliberate — these
 * are working drafts, not lawyer-reviewed documents.
 */
export default function LegalPage({
  title,
  updated,
  intro,
  sections,
}: {
  title: string;
  updated: string;
  intro: string;
  sections: LegalSection[];
}) {
  return (
    <div className="min-h-screen bg-[#F8FAFB]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
        <Link href="/" className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-teal-700 mb-6 transition-colors">
          <ChevronLeft className="w-4 h-4" />Back to Zenex
        </Link>

        <h1 className="text-3xl font-extrabold text-slate-900 mb-1">{title}</h1>
        <p className="text-xs text-slate-400 mb-6">Last updated {updated}</p>

        <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-50 ring-1 ring-amber-200 mb-8">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <p className="text-xs text-amber-800 leading-relaxed">
            <strong>Draft — not yet legally reviewed.</strong> This document is a
            working template covering how Zenex intends to operate. It must be
            reviewed by a qualified Canadian lawyer before the platform accepts
            real customers or processes real payments.
          </p>
        </div>

        <p className="text-slate-600 text-sm leading-relaxed mb-8" style={{ fontFamily: "'Inter', sans-serif" }}>
          {intro}
        </p>

        <div className="space-y-7">
          {sections.map((s) => (
            <section key={s.heading}>
              <h2 className="font-extrabold text-slate-900 mb-2">{s.heading}</h2>
              {s.body.map((p, i) => (
                <p key={i} className="text-sm text-slate-600 leading-relaxed mb-2" style={{ fontFamily: "'Inter', sans-serif" }}>
                  {p}
                </p>
              ))}
            </section>
          ))}
        </div>

        <div className="mt-10 pt-6 border-t border-slate-200 text-xs text-slate-400">
          Questions? Contact <span className="font-semibold text-slate-600">privacy@zenex.ca</span>
        </div>
      </div>
    </div>
  );
}
