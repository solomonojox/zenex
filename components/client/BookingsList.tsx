"use client";

import { useState } from "react";
import Link from "next/link";
import { Calendar, Clock, MessageSquare, Star, X } from "lucide-react";
import Card from "@/components/ui/Card";
import StatusPill from "@/components/ui/StatusPill";
import { useMyBookings, useCancelBooking } from "@/lib/queries/bookings";
import { useCreateReview } from "@/lib/queries/reviews";

function fmtDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
  } catch {
    return "";
  }
}

export default function BookingsList() {
  const { data, isLoading } = useMyBookings();
  const cancel = useCancelBooking();
  const createReview = useCreateReview();
  const bookings = data?.items ?? [];

  const [reviewingId, setReviewingId] = useState<string | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  const openReview = (id: string) => {
    setReviewingId(id);
    setRating(5);
    setComment("");
  };

  const submitReview = (bookingId: string) => {
    createReview.mutate(
      { bookingId, rating, comment: comment.trim() || undefined },
      { onSuccess: () => setReviewingId(null) },
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-3 mb-7">
        {Array.from({ length: 2 }).map((_, i) => <div key={i} className="h-20 rounded-2xl bg-slate-100 animate-pulse" />)}
      </div>
    );
  }

  if (bookings.length === 0) {
    return (
      <Card className="p-6 text-center text-sm text-slate-400 mb-7">
        No bookings yet. <Link href="/search" className="text-teal-600 font-bold">Find a cleaner →</Link>
      </Card>
    );
  }

  return (
    <div className="space-y-3 mb-7">
      {bookings.map((b) => {
        const providerName = b.provider?.user
          ? `${b.provider.user.firstName} ${b.provider.user.lastName}`
          : b.provider?.title ?? "Provider";
        const img =
          b.provider?.imageUrl ||
          `https://ui-avatars.com/api/?name=${encodeURIComponent(providerName)}&background=0D9488&color=fff`;
        const canCancel = !["COMPLETED", "CANCELLED"].includes(b.status);
        const canReview = b.status === "COMPLETED" && !b.review;

        return (
          <Card key={b.id} className="p-4">
            <div className="flex items-center gap-4">
              <img src={img} alt={providerName} className="w-12 h-12 rounded-xl object-cover shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap"><span className="font-bold text-sm text-slate-900">{b.service?.name ?? "Cleaning"}</span><StatusPill s={b.status.toLowerCase()} /></div>
                <div className="text-xs text-slate-500 mt-0.5">with {providerName}</div>
                <div className="flex items-center gap-3 mt-1 text-xs text-slate-400"><span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{fmtDate(b.scheduledFor)}</span>{b.timeSlot && <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{b.timeSlot}</span>}</div>
              </div>
              <div className="text-right shrink-0">
                <div className="font-extrabold text-slate-900">${b.totalPrice}</div>
                <div className="flex gap-1.5 mt-2 justify-end items-center">
                  <Link href="/messages" className="p-1.5 rounded-lg hover:bg-teal-50 text-slate-400 hover:text-teal-600 transition-colors"><MessageSquare className="w-3.5 h-3.5" /></Link>
                  {b.review && (
                    <span className="flex items-center gap-0.5 text-xs font-bold text-amber-500"><Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />{b.review.rating}</span>
                  )}
                  {canReview && (
                    <button onClick={() => openReview(b.id)} className="px-2.5 py-1 bg-teal-50 text-teal-700 hover:bg-teal-100 rounded-lg text-xs font-bold transition-colors">Review</button>
                  )}
                  {canCancel && (
                    <button onClick={() => cancel.mutate(b.id)} disabled={cancel.isPending} className="px-2.5 py-1 bg-rose-50 text-rose-600 hover:bg-rose-100 disabled:opacity-50 rounded-lg text-xs font-bold transition-colors">Cancel</button>
                  )}
                </div>
              </div>
            </div>

            {reviewingId === b.id && (
              <div className="mt-3 pt-3 border-t border-slate-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-700">Rate {providerName}</span>
                  <button onClick={() => setReviewingId(null)} className="text-slate-400 hover:text-slate-600"><X className="w-4 h-4" /></button>
                </div>
                <div className="flex gap-1 mb-2">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button key={n} onClick={() => setRating(n)} aria-label={`${n} star`}>
                      <Star className={`w-6 h-6 transition-colors ${n <= rating ? "fill-amber-400 text-amber-400" : "text-slate-300 hover:text-amber-300"}`} />
                    </button>
                  ))}
                </div>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={2}
                  placeholder="Share your experience (optional)"
                  className="w-full bg-slate-50 ring-1 ring-slate-200 focus:ring-teal-400 rounded-xl px-3 py-2 text-sm outline-none transition-all text-slate-800"
                />
                {createReview.isError && <p className="text-xs text-red-600 mt-1">{(createReview.error as Error).message}</p>}
                <button
                  onClick={() => submitReview(b.id)}
                  disabled={createReview.isPending}
                  className="mt-2 bg-teal-600 hover:bg-teal-700 disabled:opacity-60 text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors"
                >
                  {createReview.isPending ? "Submitting…" : "Submit review"}
                </button>
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
}
