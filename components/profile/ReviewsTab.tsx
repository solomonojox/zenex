"use client";

import type { Provider } from "@/lib/types";
import Card from "@/components/ui/Card";
import Stars from "@/components/ui/Stars";
import { useProviderReviews } from "@/lib/queries/reviews";

function initials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .filter(Boolean)
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      month: "long",
      year: "numeric",
    });
  } catch {
    return "";
  }
}

export default function ReviewsTab({ p }: { p: Provider }) {
  const { data: reviews = [], isLoading } = useProviderReviews(p.id);

  const total = reviews.length;
  const stars = [5, 4, 3, 2, 1];
  const breakdown = stars.map((star) => ({
    star,
    pct: total
      ? Math.round(
          (reviews.filter((r) => r.rating === star).length / total) * 100,
        )
      : 0,
  }));
  const avg = total
    ? reviews.reduce((s, r) => s + r.rating, 0) / total
    : p.rating;

  return (
    <div className="space-y-4">
      <Card className="p-6 flex gap-8 items-center">
        <div className="text-center">
          <div className="text-5xl font-extrabold text-slate-900">{avg.toFixed(2)}</div>
          <Stars r={avg} size="md" />
          <div className="text-xs text-slate-400 mt-1">{total || p.reviews} reviews</div>
        </div>
        <div className="flex-1 space-y-2">
          {breakdown.map(({ star, pct }) => (
            <div key={star} className="flex items-center gap-3 text-xs">
              <span className="text-slate-500 w-10 shrink-0">{star} ★</span>
              <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden"><div className="h-full bg-amber-400 rounded-full" style={{ width: `${pct}%` }} /></div>
              <span className="text-slate-400 w-6 text-right">{pct}%</span>
            </div>
          ))}
        </div>
      </Card>

      {isLoading && <p className="text-sm text-slate-400">Loading reviews…</p>}

      {!isLoading && total === 0 && (
        <Card className="p-6 text-center text-sm text-slate-400">
          No reviews yet — clients can leave one after a completed booking.
        </Card>
      )}

      {reviews.map((r) => {
        const name = r.client?.user
          ? `${r.client.user.firstName} ${r.client.user.lastName}`.trim()
          : "Client";
        return (
          <Card key={r.id} className="p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-teal-400 to-emerald-400 flex items-center justify-center text-white text-xs font-bold shrink-0">{initials(name)}</div>
              <div><div className="font-bold text-sm text-slate-900">{name}</div><div className="flex items-center gap-2"><Stars r={r.rating} /><span className="text-xs text-slate-400">{formatDate(r.createdAt)}</span></div></div>
            </div>
            {r.comment && <p className="text-slate-600 text-sm" style={{ fontFamily: "'Inter', sans-serif" }}>{r.comment}</p>}
          </Card>
        );
      })}
    </div>
  );
}
