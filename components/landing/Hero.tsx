"use client";

import { useState } from "react";
import Link from "next/link";
import { MapPin, Sparkles, Search, CheckCircle, Leaf, BadgeCheck, Flame } from "lucide-react";
import Stars from "@/components/ui/Stars";
import { usePublicStats } from "@/lib/queries/stats";
import { useProviders } from "@/lib/queries/providers";

const SERVICE_OPTIONS = ["Standard Clean", "Deep Clean", "Move In/Out", "Office Clean", "Recurring Plan", "Post-Reno"];

export default function Hero() {
  const [city, setCity] = useState("Toronto, ON");
  const [svc, setSvc] = useState("");
  const { data: stats } = usePublicStats();
  // Highest-rated bookable pro, for the card over the photo.
  const { data: topRated } = useProviders({ sort: "rating", limit: 1 });
  const featured = topRated?.items?.[0];

  // Only claim what the database can back. Each entry is dropped when there is
  // no real number behind it yet, so an early-stage roster shows two honest
  // figures rather than three invented ones.
  const headlineStats: [string, string][] = [];
  if (stats?.providers) {
    headlineStats.push([String(stats.providers), stats.providers === 1 ? "Active pro" : "Active pros"]);
  }
  if (stats?.averageRating != null) {
    headlineStats.push([`${stats.averageRating.toFixed(2)} ★`, "Average rating"]);
  }
  if (stats?.completedBookings) {
    headlineStats.push([String(stats.completedBookings), "Cleans completed"]);
  }

  const trustPoints = [
    "All pros ID-checked before they can take work",
    ...(stats?.verifiedProviders
      ? [`${stats.verifiedProviders} verified ${stats.verifiedProviders === 1 ? "pro" : "pros"}`]
      : []),
    ...(stats?.reviewsCount
      ? [`${stats.reviewsCount} verified ${stats.reviewsCount === 1 ? "review" : "reviews"}`]
      : []),
  ];

  return (
    <section className="relative overflow-hidden bg-[#082F2B]">
      <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,.2) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.2) 1px, transparent 1px)", backgroundSize: "48px 48px" }} />
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-teal-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-500/15 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 pt-16 pb-0">
        <div className="grid lg:grid-cols-5 gap-10 items-end">
          <div className="lg:col-span-3 pb-16 lg:pb-24">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur text-white/90 text-xs font-bold px-4 py-2 rounded-full mb-6 ring-1 ring-white/15">
              <Leaf className="w-3.5 h-3.5 text-emerald-400" /> Canada's Most Trusted Cleaning Marketplace
              <span className="bg-teal-400/20 text-teal-300 text-[10px] font-black px-1.5 py-0.5 rounded-full">NEW</span>
            </div>

            <h1 className="text-4xl sm:text-5xl xl:text-6xl font-extrabold text-white leading-[1.08] tracking-tight mb-5">
              Spotless homes.<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-300 to-emerald-300">Trusted pros.</span>
            </h1>
            <p className="text-base sm:text-lg text-white/65 leading-relaxed mb-8 max-w-lg" style={{ fontFamily: "'Inter', sans-serif" }}>
              Book vetted, insured cleaning professionals across Canada in under 3 minutes. One-time or recurring — always on your schedule.
            </p>

            <div className="bg-white rounded-2xl shadow-2xl p-2 flex flex-col sm:flex-row gap-2">
              <div className="flex items-center gap-2 flex-1 px-3 py-2.5 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
                <MapPin className="w-4 h-4 text-teal-500 shrink-0" />
                <input value={city} onChange={(e) => setCity(e.target.value)} className="bg-transparent text-sm font-semibold text-slate-800 placeholder:text-slate-400 outline-none w-full" placeholder="City or postal code" />
              </div>
              <div className="flex items-center gap-2 flex-1 px-3 py-2.5 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
                <Sparkles className="w-4 h-4 text-teal-500 shrink-0" />
                <select value={svc} onChange={(e) => setSvc(e.target.value)} className="bg-transparent text-sm font-semibold text-slate-800 outline-none w-full appearance-none cursor-pointer">
                  <option value="">Service type…</option>
                  {SERVICE_OPTIONS.map((s) => <option key={s}>{s}</option>)}
                </select>
              </div>
              <Link href="/search" className="flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-500 text-white font-bold px-6 py-3 rounded-xl transition-colors shadow-sm whitespace-nowrap text-sm">
                <Search className="w-4 h-4" /> Find Cleaners
              </Link>
            </div>

            <div className="flex flex-wrap gap-x-5 gap-y-2 mt-5">
              {trustPoints.map((t) => (
                <span key={t} className="flex items-center gap-1.5 text-white/60 text-xs font-medium" style={{ fontFamily: "'Inter', sans-serif" }}>
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />{t}
                </span>
              ))}
            </div>

            {/* Counted from the database, not written into the markup. A claim
                a visitor can check against the roster has to match it. Stats
                with nothing behind them yet are dropped rather than shown as
                zero — "0 bookings" is worse than saying nothing. */}
            {headlineStats.length > 0 && (
              <div className="grid grid-cols-3 gap-4 mt-10 max-w-sm">
                {headlineStats.map(([n, l]) => (
                  <div key={l}>
                    <div className="text-2xl font-extrabold text-white">{n}</div>
                    <div className="text-xs text-white/50 mt-0.5" style={{ fontFamily: "'Inter', sans-serif" }}>{l}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="hidden lg:flex lg:col-span-2 flex-col gap-4 pb-8 items-end">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl h-[400px] w-full bg-teal-900">
              <img src="https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=700&h=500&fit=crop&auto=format" alt="Professional cleaner" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#082F2B]/60 to-transparent" />
              {/* A real top-rated pro, linked to their real profile. This card
                  used to hard-code "Maria Santos · 4.97 (312)" over a stock
                  photo — a fake listing on the first screen a visitor sees. */}
              {featured && (
                <Link
                  href={`/providers/${featured.id}`}
                  className="absolute bottom-5 left-5 bg-white/95 backdrop-blur rounded-2xl p-3.5 shadow-xl w-52 hover:bg-white transition-colors"
                >
                  <div className="flex items-center gap-2.5 mb-2">
                    <img src={featured.image} alt="" className="w-9 h-9 rounded-full object-cover ring-2 ring-teal-100" />
                    <div>
                      <div className="font-bold text-xs text-slate-900">{featured.name}</div>
                      <div className="text-[10px] text-slate-500">{featured.location}</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <Stars r={Math.round(featured.rating)} />
                    <span className="text-xs font-bold text-slate-900">
                      {featured.rating.toFixed(2)} ({featured.reviews})
                    </span>
                  </div>
                  {featured.verified && (
                    <div className="mt-2 pt-2 border-t border-slate-100">
                      <span className="text-[10px] font-bold text-teal-700 flex items-center gap-1"><BadgeCheck className="w-3 h-3" />Verified Pro</span>
                    </div>
                  )}
                </Link>
              )}
            </div>

            <div className="bg-rose-600 text-white rounded-2xl px-4 py-3 flex items-center gap-3 shadow-xl w-full">
              <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center shrink-0"><Flame className="w-4 h-4 text-white" /></div>
              <div className="flex-1"><div className="font-bold text-sm">Emergency Booking</div><div className="text-xs text-rose-200">Cleaners available now in your area</div></div>
              <Link href="/search" className="bg-white text-rose-600 text-xs font-black px-3 py-1.5 rounded-xl hover:bg-rose-50 transition-colors shrink-0">Book Now</Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
