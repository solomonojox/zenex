"use client";

import Link from "next/link";
import { Home, Briefcase, ArrowRight } from "lucide-react";
import { usePublicStats } from "@/lib/queries/stats";

export default function DualCTA() {
  const { data: stats } = usePublicStats();

  // "Join 4,200+ professionals... Average $1,400/week" was invented, and the
  // earnings figure in particular is the kind of claim someone quits a job
  // over. Zenex does not track weekly earnings, so it cannot be stated at all.
  const clientPitch = stats?.cities?.length
    ? `Find a vetted cleaner near you — now serving ${stats.cities
        .slice(0, 3)
        .map((c) => c.name)
        .join(", ")}${stats.cities.length > 3 ? " and more" : ""}.`
    : "Find a vetted, insured cleaner near you and book in under three minutes.";

  const providerPitch = stats?.providers
    ? `Join ${stats.providers} ${stats.providers === 1 ? "pro" : "pros"} on Zenex. Set your own hours and rates — we handle booking, payment and receipts.`
    : "Set your own hours and your own rates. We handle booking, payment and receipts.";

  return (
    <section className="pb-16 max-w-7xl mx-auto px-4 sm:px-6">
      <div className="grid sm:grid-cols-2 gap-5">
        <div className="relative overflow-hidden bg-gradient-to-br from-teal-600 to-teal-700 rounded-3xl p-8 shadow-xl shadow-teal-200">
          <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-white/10 rounded-full" />
          <div className="relative">
            <Home className="w-8 h-8 text-teal-200 mb-3" />
            <h3 className="text-2xl font-extrabold text-white mb-2">Need your space cleaned?</h3>
            {/* The old copy promised "10% off with code SPARK10". There is no
                promo-code system anywhere in the schema or the payment path,
                so anyone who tried it was charged full price. Removed rather
                than left as a promise the product cannot keep. */}
            <p className="text-teal-100 text-sm mb-5" style={{ fontFamily: "'Inter', sans-serif" }}>
              {clientPitch}
            </p>
            <Link href="/search" className="inline-flex items-center gap-2 bg-white text-teal-700 font-bold px-6 py-3 rounded-xl hover:bg-teal-50 transition-colors text-sm shadow-sm">
              Book a Cleaner <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
        <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-8 shadow-xl">
          <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-white/5 rounded-full" />
          <div className="relative">
            <Briefcase className="w-8 h-8 text-slate-400 mb-3" />
            <h3 className="text-2xl font-extrabold text-white mb-2">Are you a cleaning pro?</h3>
            <p className="text-slate-400 text-sm mb-5" style={{ fontFamily: "'Inter', sans-serif" }}>{providerPitch}</p>
            <Link href="/auth" className="inline-flex items-center gap-2 bg-teal-500 hover:bg-teal-400 text-white font-bold px-6 py-3 rounded-xl transition-colors text-sm shadow-sm">
              Become a Pro <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
