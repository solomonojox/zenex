"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ChevronLeft,
  CheckCircle,
  MapPin,
  Zap,
  ShieldCheck,
  Star,
} from "lucide-react";
import Card from "@/components/ui/Card";
import { useAuth } from "@/context/auth/useAuth";
import { useInstantSlots, useInstantBook } from "@/lib/queries/quotes";
import { formatBookingDateTime } from "@/lib/utils/datetime";
import type { MatchedProvider } from "@/lib/api/quotes";

/** Next N days as YYYY-MM-DD with display parts. */
function upcomingDays(count: number) {
  const out: { value: string; weekday: string; day: number; month: string }[] = [];
  const today = new Date();
  for (let i = 1; i <= count; i++) {
    const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() + i);
    out.push({
      value: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`,
      weekday: d.toLocaleDateString(undefined, { weekday: "short" }),
      day: d.getDate(),
      month: d.toLocaleDateString(undefined, { month: "short" }),
    });
  }
  return out;
}

function BookContent() {
  const router = useRouter();
  const params = useSearchParams();
  const { isAuthenticated } = useAuth();

  const key = params.get("key") ?? "standard";
  const bedrooms = Number(params.get("bedrooms") ?? 2);
  const bathrooms = Number(params.get("bathrooms") ?? 1);
  const location = params.get("location") ?? "";

  const days = upcomingDays(14);
  const [date, setDate] = useState(days[0].value);
  const [slot, setSlot] = useState<string | null>(null);
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState<{
    reference: string;
    provider: MatchedProvider;
    total: number;
    when: string;
  } | null>(null);

  const { data, isLoading } = useInstantSlots({
    key,
    bedrooms,
    bathrooms,
    location,
    date,
  });
  const book = useInstantBook();

  const quote = data?.quote;
  const slots = data?.slots ?? [];

  const submit = () => {
    setError(null);
    if (!isAuthenticated) {
      router.push("/auth?mode=login");
      return;
    }
    if (!slot) return setError("Choose a time.");
    if (address.trim().length < 6) {
      return setError("Enter the address so your cleaner can find you.");
    }

    book.mutate(
      {
        key,
        bedrooms,
        bathrooms,
        scheduledFor: slot,
        address: address.trim(),
        notes: notes.trim() || undefined,
        location: location || undefined,
      },
      {
        onSuccess: (res) =>
          setConfirmed({
            reference: res.booking.reference,
            provider: res.matchedProvider,
            total: res.booking.totalPrice,
            when: formatBookingDateTime(slot),
          }),
        onError: (e) => setError((e as Error).message),
      },
    );
  };

  if (confirmed) {
    return (
      <div className="max-w-lg mx-auto px-4 sm:px-6 py-12 text-center">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-teal-400 to-emerald-400 flex items-center justify-center mx-auto mb-5 shadow-xl shadow-teal-200">
          <CheckCircle className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900 mb-2">You&apos;re booked!</h1>
        <p className="text-sm text-slate-500 mb-6">{confirmed.when}</p>

        <Card className="p-5 text-left mb-5">
          <div className="flex items-center gap-3 mb-4">
            <img
              src={confirmed.provider.imageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(confirmed.provider.name)}&background=0D9488&color=fff`}
              alt={confirmed.provider.name}
              className="w-11 h-11 rounded-full object-cover"
            />
            <div className="flex-1">
              <div className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                {confirmed.provider.name}
                {confirmed.provider.verified && <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />}
              </div>
              <div className="text-xs text-slate-500 flex items-center gap-1">
                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                {confirmed.provider.rating.toFixed(2)} · {confirmed.provider.reviewsCount} reviews
              </div>
            </div>
          </div>
          <div className="space-y-1.5 text-sm">
            <div className="flex justify-between text-slate-600"><span>Reference</span><span className="font-bold text-slate-900">{confirmed.reference}</span></div>
            <div className="flex justify-between text-slate-600"><span>Total</span><span className="font-bold text-slate-900">${confirmed.total.toFixed(2)}</span></div>
          </div>
        </Card>

        <div className="flex gap-3">
          <Link href="/messages" className="flex-1 py-3 rounded-xl ring-1 ring-slate-200 text-sm font-bold text-slate-700 hover:bg-slate-50 text-center transition-colors">Message</Link>
          <Link href="/client" className="flex-1 py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-sm font-bold text-center transition-colors">My bookings</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      <Link href="/" className="flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-teal-700 mb-6 transition-colors">
        <ChevronLeft className="w-4 h-4" />Change property details
      </Link>

      {quote && (
        <Card className="p-5 mb-4 bg-gradient-to-r from-teal-600 to-teal-700 text-white ring-0">
          <div className="flex items-center gap-1.5 text-teal-200 text-xs font-black uppercase tracking-wide mb-1">
            <Zap className="w-3 h-3" />Instant booking
          </div>
          <div className="flex items-end justify-between gap-3">
            <div>
              <div className="font-extrabold text-lg">{quote.label}</div>
              <div className="text-teal-100 text-sm">
                {bedrooms} bed · {bathrooms} bath · about {Math.round((quote.durationMins / 60) * 10) / 10} hrs
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-extrabold">${quote.total.toFixed(2)}</div>
              <div className="text-teal-200 text-xs">incl. {quote.taxLabel}</div>
            </div>
          </div>
        </Card>
      )}

      <Card className="p-5 mb-4">
        <h3 className="font-bold text-slate-900 mb-4">Pick a date</h3>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {days.map((d) => {
            const active = d.value === date;
            return (
              <button
                key={d.value}
                onClick={() => { setDate(d.value); setSlot(null); }}
                className={`shrink-0 w-16 py-3 rounded-xl text-center transition-colors ${active ? "bg-teal-600 text-white shadow-sm" : "bg-slate-50 ring-1 ring-slate-200 text-slate-700 hover:ring-teal-300"}`}
              >
                <div className={`text-[10px] font-bold uppercase ${active ? "text-teal-100" : "text-slate-400"}`}>{d.weekday}</div>
                <div className="text-lg font-extrabold leading-tight">{d.day}</div>
                <div className={`text-[10px] ${active ? "text-teal-100" : "text-slate-400"}`}>{d.month}</div>
              </button>
            );
          })}
        </div>
      </Card>

      <Card className="p-5 mb-4">
        <h3 className="font-bold text-slate-900 mb-4">Available times</h3>
        {isLoading ? (
          <div className="grid grid-cols-4 gap-2">
            {Array.from({ length: 8 }).map((_, i) => <div key={i} className="h-10 rounded-xl bg-slate-100 animate-pulse" />)}
          </div>
        ) : slots.length === 0 ? (
          <p className="text-sm text-slate-400 py-6 text-center">
            No cleaners free on this day — try another date.
          </p>
        ) : (
          <div className="grid grid-cols-4 gap-2">
            {slots.map((s) => (
              <button
                key={s.start}
                onClick={() => setSlot(s.start)}
                title={`${s.count} cleaner${s.count === 1 ? "" : "s"} available`}
                className={`py-2.5 rounded-xl text-xs font-bold transition-colors ${s.start === slot ? "bg-teal-600 text-white" : "bg-slate-50 ring-1 ring-slate-200 text-slate-700 hover:ring-teal-300"}`}
              >
                {s.label}
              </button>
            ))}
          </div>
        )}
      </Card>

      <Card className="p-5 mb-4">
        <h3 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
          <MapPin className="w-4 h-4 text-teal-600" />Service address
        </h3>
        <input
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="42 Elm St, Unit 3, Toronto, ON"
          className="w-full bg-slate-50 ring-1 ring-slate-200 focus:ring-teal-400 rounded-xl px-3.5 py-2.5 text-sm outline-none text-slate-800"
        />
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          placeholder="Buzzer code, parking, pets… (optional)"
          className="w-full mt-2 bg-slate-50 ring-1 ring-slate-200 focus:ring-teal-400 rounded-xl px-3.5 py-2.5 text-sm outline-none text-slate-800"
        />
      </Card>

      {error && <p className="text-sm text-red-600 font-semibold text-center mb-3">{error}</p>}

      <button
        onClick={submit}
        disabled={book.isPending || !slot}
        className="w-full bg-teal-600 hover:bg-teal-700 disabled:opacity-60 text-white font-extrabold py-4 rounded-xl transition-colors shadow-sm shadow-teal-200 text-sm"
      >
        {book.isPending
          ? "Matching you with a cleaner…"
          : quote
            ? `Confirm & Pay $${quote.total.toFixed(2)}`
            : "Confirm"}
      </button>
      <p className="text-center text-xs text-slate-400 mt-3">
        We&apos;ll assign the best-rated cleaner available at your chosen time.
      </p>
    </div>
  );
}

export default function BookPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFB]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <Suspense fallback={null}>
        <BookContent />
      </Suspense>
      <div className="h-16" />
    </div>
  );
}
