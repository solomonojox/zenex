"use client";

import Link from "next/link";
import { ChevronRight, Home, Briefcase, Zap, Sparkles, Repeat, Package } from "lucide-react";
import { useProviders } from "@/lib/queries/providers";

/**
 * Service categories, with counts taken from the live roster.
 *
 * Two things were wrong here. The counts ("2,400+ pros", "890+ pros") were
 * invented and sat next to a roster in single figures. And the colours were
 * built with template literals — `ring-${c}-100`, `bg-${c}-50` — which Tailwind
 * cannot see when it scans the source, so those classes were never generated
 * and every tile rendered with no ring and no colour. Tailwind needs whole
 * class names present in the file, so they are written out in full below.
 */
const CATEGORIES = [
  { Icon: Home, label: "Home Clean", tag: "Standard Clean", ring: "ring-teal-100", chip: "bg-teal-50 text-teal-600" },
  { Icon: Briefcase, label: "Office", tag: "Office", ring: "ring-blue-100", chip: "bg-blue-50 text-blue-600" },
  { Icon: Zap, label: "Deep Clean", tag: "Deep Clean", ring: "ring-emerald-100", chip: "bg-emerald-50 text-emerald-600" },
  { Icon: Sparkles, label: "Move In/Out", tag: "Move-in/out", ring: "ring-violet-100", chip: "bg-violet-50 text-violet-600" },
  { Icon: Repeat, label: "Recurring", tag: "Recurring", ring: "ring-orange-100", chip: "bg-orange-50 text-orange-600" },
  { Icon: Package, label: "Post-Reno", tag: "Post-reno", ring: "ring-rose-100", chip: "bg-rose-50 text-rose-600" },
];

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");

export default function ServiceCategories() {
  // One fetch for the whole grid; counting client-side beats six requests.
  const { data } = useProviders({ limit: 100 });
  const providers = data?.items ?? [];

  const countFor = (tag: string) => {
    const t = norm(tag);
    return providers.filter((p) =>
      (p.tags ?? []).some((pt) => {
        const a = norm(pt);
        return a.includes(t) || t.includes(a);
      }),
    ).length;
  };

  return (
    <section className="py-10 max-w-7xl mx-auto px-4 sm:px-6">
      <div className="flex items-end justify-between mb-6">
        <h2 className="text-xl font-extrabold text-slate-900">What do you need?</h2>
        <Link href="/search" className="flex items-center gap-1 text-sm font-bold text-teal-600 hover:text-teal-700">
          <span>All services</span>
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
        {CATEGORIES.map(({ Icon, label, tag, ring, chip }) => {
          const n = countFor(tag);
          return (
            <Link
              key={label}
              // Every tile used to go to an unfiltered /search. Now it carries
              // the tag through, so the page you land on matches the one you
              // clicked.
              href={`/search?tag=${encodeURIComponent(tag)}`}
              className={`flex flex-col items-center gap-2.5 p-4 rounded-2xl bg-white ring-1 ${ring} hover:shadow-md hover:-translate-y-0.5 transition-all duration-200`}
            >
              <div className={`w-10 h-10 rounded-xl ${chip} flex items-center justify-center`}>
                <Icon className="w-5 h-5" />
              </div>
              <div className="text-center">
                <div className="font-bold text-xs text-slate-900">{label}</div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  {n > 0 ? `${n} ${n === 1 ? "pro" : "pros"}` : "Browse"}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
