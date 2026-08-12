"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BedDouble, Bath, MapPin, ArrowRight, Zap } from "lucide-react";
import { useInstantQuote } from "@/lib/queries/quotes";

const COUNTS = [1, 2, 3, 4, 5];

/**
 * "Price in 60 seconds" — the primary conversion path. The customer gives
 * property size, sees exact prices, and books without browsing cleaners.
 */
export default function InstantQuote() {
  const router = useRouter();
  const [bedrooms, setBedrooms] = useState(2);
  const [bathrooms, setBathrooms] = useState(1);
  const [location, setLocation] = useState("Toronto, ON");

  const { data: options = [], isLoading, isError } = useInstantQuote({
    bedrooms,
    bathrooms,
    location,
  });

  const go = (key: string) => {
    const params = new URLSearchParams({
      key,
      bedrooms: String(bedrooms),
      bathrooms: String(bathrooms),
      location,
    });
    router.push(`/book?${params.toString()}`);
  };

  const Counter = ({
    label,
    Icon,
    value,
    onChange,
    min = 1,
  }: {
    label: string;
    Icon: typeof BedDouble;
    value: number;
    onChange: (n: number) => void;
    min?: number;
  }) => (
    <div>
      <label className="text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
        <Icon className="w-3.5 h-3.5 text-teal-600" />{label}
      </label>
      <div className="flex gap-1.5">
        {COUNTS.filter((n) => n >= min).map((n) => (
          <button
            key={n}
            onClick={() => onChange(n)}
            className={`w-10 h-10 rounded-xl text-sm font-bold transition-colors ${value === n ? "bg-teal-600 text-white shadow-sm" : "bg-white ring-1 ring-slate-200 text-slate-700 hover:ring-teal-300"}`}
          >
            {n}{n === 5 ? "+" : ""}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <section className="py-12 bg-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-1.5 text-teal-700 bg-teal-50 ring-1 ring-teal-100 text-xs font-black tracking-wide uppercase px-3 py-1 rounded-full mb-3">
            <Zap className="w-3 h-3" />Instant price
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            See your price in 60 seconds
          </h2>
          <p className="text-slate-500 text-sm mt-2" style={{ fontFamily: "'Inter', sans-serif" }}>
            Tell us about your home. No browsing, no quotes to chase — we match you with a vetted pro.
          </p>
        </div>

        <div className="bg-slate-50 ring-1 ring-slate-200 rounded-3xl p-5 sm:p-6 mb-6">
          <div className="flex flex-wrap gap-6">
            <Counter label="Bedrooms" Icon={BedDouble} value={bedrooms} onChange={setBedrooms} min={1} />
            <Counter label="Bathrooms" Icon={Bath} value={bathrooms} onChange={setBathrooms} min={1} />
            <div className="flex-1 min-w-[180px]">
              <label className="text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-teal-600" />Location
              </label>
              <input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Toronto, ON"
                className="w-full bg-white ring-1 ring-slate-200 focus:ring-teal-400 rounded-xl px-3.5 py-2.5 text-sm outline-none transition-all text-slate-800 h-10"
              />
            </div>
          </div>
        </div>

        {isError ? (
          <p className="text-center text-sm text-slate-400">
            Pricing isn&apos;t available right now — you can still{" "}
            <button onClick={() => router.push("/search")} className="text-teal-600 font-bold">browse cleaners</button>.
          </p>
        ) : isLoading ? (
          <div className="grid sm:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-44 rounded-2xl bg-slate-100 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid sm:grid-cols-3 gap-4">
            {options.map((o) => (
              <button
                key={o.key}
                onClick={() => go(o.key)}
                className={`text-left rounded-2xl p-5 transition-all hover:-translate-y-0.5 ${o.popular ? "bg-gradient-to-b from-teal-600 to-teal-700 text-white shadow-xl shadow-teal-200" : "bg-white ring-1 ring-slate-200 hover:ring-teal-300 shadow-sm"}`}
              >
                {o.popular && (
                  <div className="inline-block bg-amber-400 text-amber-900 text-[10px] font-black px-2.5 py-0.5 rounded-full mb-2">
                    Most booked
                  </div>
                )}
                <div className={`font-extrabold ${o.popular ? "text-white" : "text-slate-900"}`}>{o.label}</div>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className={`text-3xl font-extrabold ${o.popular ? "text-white" : "text-slate-900"}`}>
                    ${o.total.toFixed(0)}
                  </span>
                  <span className={`text-xs ${o.popular ? "text-teal-200" : "text-slate-400"}`}>
                    incl. tax
                  </span>
                </div>
                <div className={`text-xs mt-1 ${o.popular ? "text-teal-200" : "text-slate-500"}`}>
                  about {Math.round((o.durationMins / 60) * 10) / 10} hrs
                </div>
                {o.description && (
                  <p className={`text-xs mt-3 leading-relaxed ${o.popular ? "text-teal-100" : "text-slate-500"}`} style={{ fontFamily: "'Inter', sans-serif" }}>
                    {o.description}
                  </p>
                )}
                <div className={`flex items-center gap-1 text-xs font-bold mt-4 ${o.popular ? "text-white" : "text-teal-600"}`}>
                  Choose a time <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
