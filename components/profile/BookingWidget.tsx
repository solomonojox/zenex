"use client";

import Link from "next/link";
import { Star, ShieldCheck } from "lucide-react";
import type { Provider } from "@/lib/types";
import Card from "@/components/ui/Card";
import { useQuote } from "@/lib/queries/bookings";

export default function BookingWidget({ p, selected }: { p: Provider; selected: number }) {
  const svc = p.services[selected];
  const { data: quote } = useQuote(p.id, svc?.id, []);

  const money = (n: number) =>
    n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const price = svc?.price ?? p.price;

  return (
    <div className="lg:sticky lg:top-28 self-start">
      <Card className="p-6 shadow-lg">
        <div className="flex items-center justify-between mb-5">
          <div><span className="text-2xl font-extrabold text-slate-900">${money(price)}</span><span className="text-slate-400 text-sm ml-1">starting</span></div>
          <div className="flex items-center gap-1"><Star className="w-4 h-4 fill-amber-400 text-amber-400" /><span className="font-bold text-sm">{p.rating}</span></div>
        </div>

        <div className="space-y-2 mb-4">
          <div className="rounded-xl bg-slate-50 ring-1 ring-slate-100 px-3 py-2.5">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Service</div>
            <div className="text-sm font-bold text-slate-900">{svc?.name ?? "Standard Clean"}</div>
          </div>
          {svc?.duration && (
            <div className="rounded-xl bg-slate-50 ring-1 ring-slate-100 px-3 py-2.5">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Duration</div>
              <div className="text-sm font-bold text-slate-900">{svc.duration}</div>
            </div>
          )}
        </div>

        <div className="border-t border-slate-100 pt-4 mb-4 space-y-2 text-sm">
          <div className="flex justify-between text-slate-600"><span>Service</span><span>${money(quote?.subtotal ?? price)}</span></div>
          {quote && (
            <div className="flex justify-between text-slate-600"><span>{quote.taxLabel}</span><span>${money(quote.taxAmount)}</span></div>
          )}
          <div className="flex justify-between font-extrabold text-slate-900 pt-2 border-t border-slate-100 text-base">
            <span>Total</span><span>${money(quote?.total ?? price)}</span>
          </div>
        </div>

        <Link
          href={`/booking/${p.id}?service=${selected}`}
          className="block text-center w-full bg-teal-600 hover:bg-teal-700 text-white font-extrabold py-3.5 rounded-xl transition-colors shadow-sm shadow-teal-200 text-sm"
        >
          Check availability
        </Link>
        <p className="text-center text-xs text-slate-400 mt-3" style={{ fontFamily: "'Inter', sans-serif" }}>Pick a time on the next step · Free cancellation</p>
        <div className="flex items-center gap-2 mt-4 p-3 bg-emerald-50 rounded-xl">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="text-xs text-emerald-700 font-semibold">Zenex Satisfaction Guarantee</span>
        </div>
      </Card>
    </div>
  );
}
