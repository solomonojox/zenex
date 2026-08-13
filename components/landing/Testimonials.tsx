"use client";

import Card from "@/components/ui/Card";
import Stars from "@/components/ui/Stars";
import { usePublicStats } from "@/lib/queries/stats";

/**
 * Real reviews, pulled from the database.
 *
 * This section used to render three invented testimonials under the heading
 * "Trusted by thousands across Canada". Every review here is attached to a
 * completed booking, and the heading now states the actual review count — a
 * number a visitor could verify by opening any profile.
 *
 * Reviewers are shown as first name plus last initial: they agreed to review a
 * cleaner, not to have their full name on the marketing page.
 */
export default function Testimonials() {
  const { data: stats, isLoading } = usePublicStats();
  const testimonials = stats?.testimonials ?? [];

  // Nothing to show yet — better an absent section than an empty one, or
  // worse, filler pretending to be customers.
  if (!isLoading && testimonials.length === 0) return null;

  const count = stats?.reviewsCount ?? 0;
  const average = stats?.averageRating;

  return (
    <section className="py-14 max-w-7xl mx-auto px-4 sm:px-6">
      <div className="text-center mb-10">
        <div className="text-teal-600 text-xs font-black tracking-widest uppercase mb-2">
          What clients say
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
          {count > 0 ? (
            <>
              {count} verified {count === 1 ? "review" : "reviews"}
              {average != null && (
                <span className="text-slate-400 font-bold"> · {average.toFixed(2)} ★ average</span>
              )}
            </>
          ) : (
            "What clients say"
          )}
        </h2>
      </div>

      {isLoading ? (
        <div className="grid sm:grid-cols-3 gap-5">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-48 rounded-2xl bg-slate-100 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid sm:grid-cols-3 gap-5">
          {testimonials.slice(0, 3).map((t, i) => (
            <Card key={`${t.name}-${i}`} className="p-6">
              <Stars r={t.rating} size="md" />
              <p
                className="text-slate-700 text-sm leading-relaxed mt-4 mb-5"
                style={{ fontFamily: "'Inter', sans-serif" }}
              >
                &quot;{t.comment}&quot;
              </p>
              <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-teal-400 to-emerald-400 flex items-center justify-center text-white text-xs font-bold shrink-0">
                  {t.initials}
                </div>
                <div>
                  <div className="font-bold text-sm text-slate-900">{t.name}</div>
                  <div className="text-xs text-slate-400">
                    {[t.location, t.service].filter(Boolean).join(" · ")}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </section>
  );
}
