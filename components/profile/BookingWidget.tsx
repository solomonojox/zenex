"use client";

import Link from "next/link";
import { Star, ShieldCheck } from "lucide-react";
import type { Provider } from "@/lib/types";
import Card from "@/components/ui/Card";

export default function BookingWidget({ p, selected }: { p: Provider; selected: number }) {
  const svc = p.services[selected];
  const price = svc?.price ?? 90;

  return (
    <div className="lg:sticky lg:top-28 self-start">
      <Card className="p-6 shadow-lg">
        <div className="flex items-center justify-between mb-5">
          <div><span className="text-2xl font-extrabold text-slate-900">${price}</span><span className="text-slate-400 text-sm ml-1">starting</span></div>
          <div className="flex items-center gap-1"><Star className="w-4 h-4 fill-amber-400 text-amber-400" /><span className="font-bold text-sm">{p.rating}</span></div>
        </div>
        <div className="space-y-2 mb-4">
          <div className="rounded-xl bg-slate-50 ring-1 ring-slate-100 px-3 py-2.5"><div className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Service</div><div className="text-sm font-bold text-slate-900">{svc?.name ?? "Standard Clean"}</div></div>
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-xl bg-slate-50 ring-1 ring-slate-100 px-3 py-2.5"><div className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Date</div><div className="text-sm font-bold text-slate-900">Jul 4, 2025</div></div>
            <div className="rounded-xl bg-slate-50 ring-1 ring-slate-100 px-3 py-2.5"><div className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Time</div><div className="text-sm font-bold text-slate-900">9:00 AM</div></div>
          </div>
        </div>
        <div className="border-t border-slate-100 pt-4 mb-4 space-y-2 text-sm">
          <div className="flex justify-between text-slate-600"><span>Service fee</span><span>${price}</span></div>
          <div className="flex justify-between text-slate-600"><span>Platform fee (7%)</span><span>${Math.round(price * 0.07)}</span></div>
          <div className="flex justify-between text-slate-600"><span>HST (13%)</span><span>${Math.round(price * 0.13)}</span></div>
          <div className="flex justify-between font-extrabold text-slate-900 pt-2 border-t border-slate-100 text-base"><span>Total</span><span>${Math.round(price * 1.2)}</span></div>
        </div>
        <Link
          href={`/booking/${p.id}?service=${selected}`}
          className="block text-center w-full bg-teal-600 hover:bg-teal-700 text-white font-extrabold py-3.5 rounded-xl transition-colors shadow-sm shadow-teal-200 text-sm"
        >
          Book Now
        </Link>
        <p className="text-center text-xs text-slate-400 mt-3" style={{ fontFamily: "'Inter', sans-serif" }}>No charge until confirmed · Free cancellation 24h before</p>
        <div className="flex items-center gap-2 mt-4 p-3 bg-emerald-50 rounded-xl">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="text-xs text-emerald-700 font-semibold">Zenex Satisfaction Guarantee</span>
        </div>
      </Card>
    </div>
  );
}
