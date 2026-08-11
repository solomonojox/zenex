"use client";

import { ShieldCheck, MapPin } from "lucide-react";
import Card from "@/components/ui/Card";
import { EXTRAS_LIST } from "@/lib/data";
import type { Service } from "@/lib/types";
import type { Quote } from "@/lib/api/bookings";

export default function PaymentStep({
  service,
  extras,
  quote,
  address,
  onAddress,
  notes,
  onNotes,
  children,
}: {
  service: Service;
  extras: string[];
  quote?: Quote;
  address: string;
  onAddress: (v: string) => void;
  notes: string;
  onNotes: (v: string) => void;
  /** Card entry (Stripe Elements) is injected here in live mode. */
  children?: React.ReactNode;
}) {
  const money = (n: number) =>
    n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div className="space-y-4">
      {/* The pro needs to know where to go — required before confirming. */}
      <Card className="p-5">
        <h3 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
          <MapPin className="w-4 h-4 text-teal-600" />Service address
        </h3>
        <input
          value={address}
          onChange={(e) => onAddress(e.target.value)}
          placeholder="42 Elm St, Unit 3, Toronto, ON M5V 2K4"
          className="w-full bg-slate-50 ring-1 ring-slate-200 focus:ring-teal-400 rounded-xl px-3.5 py-2.5 text-sm outline-none transition-all text-slate-800"
          style={{ fontFamily: "'Inter', sans-serif" }}
        />
        <label className="text-xs font-bold text-slate-700 mt-3 mb-1.5 block">
          Access notes <span className="font-normal text-slate-400">(optional)</span>
        </label>
        <textarea
          value={notes}
          onChange={(e) => onNotes(e.target.value)}
          rows={2}
          placeholder="Buzzer code, parking, pets, where to find keys…"
          className="w-full bg-slate-50 ring-1 ring-slate-200 focus:ring-teal-400 rounded-xl px-3.5 py-2.5 text-sm outline-none transition-all text-slate-800"
          style={{ fontFamily: "'Inter', sans-serif" }}
        />
      </Card>

      {children}

      <Card className="p-5">
        <h3 className="font-bold text-slate-900 mb-3">Order summary</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between text-slate-600"><span>{service.name}</span><span>${money(service.price)}</span></div>
          {extras.map((e) => (
            <div key={e} className="flex justify-between text-slate-600">
              <span>{e}</span>
              <span>+${money(EXTRAS_LIST.find((x) => x.name === e)?.price ?? 0)}</span>
            </div>
          ))}
          {quote && (
            <>
              <div className="flex justify-between text-slate-500 pt-2 border-t border-slate-100">
                <span>Subtotal</span><span>${money(quote.subtotal)}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>{quote.taxLabel}</span><span>${money(quote.taxAmount)}</span>
              </div>
            </>
          )}
          <div className="flex justify-between font-extrabold text-slate-900 pt-2 border-t border-slate-100 text-base">
            <span>Total charged</span>
            <span>${money(quote?.total ?? service.price)}</span>
          </div>
        </div>
        {quote && (
          <p className="text-xs text-slate-400 mt-3">
            Tax calculated for {quote.province}. Prices in CAD.
          </p>
        )}
      </Card>

      <div className="flex items-center gap-2.5 p-4 bg-emerald-50 rounded-xl ring-1 ring-emerald-100">
        <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
        <p className="text-xs text-emerald-700 font-semibold">Protected by Zenex Guarantee. Not satisfied? We&apos;ll send another pro free.</p>
      </div>
    </div>
  );
}
