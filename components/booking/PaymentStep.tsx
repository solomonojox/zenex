"use client";

import { ShieldCheck } from "lucide-react";
import Card from "@/components/ui/Card";
import { EXTRAS_LIST } from "@/lib/data";
import type { Service } from "@/lib/types";
import type { Quote } from "@/lib/api/bookings";

export default function PaymentStep({
  service,
  extras,
  quote,
  children,
}: {
  service: Service;
  extras: string[];
  quote?: Quote;
  /** Card entry (Stripe Elements) is injected here in live mode. */
  children?: React.ReactNode;
}) {
  const money = (n: number) =>
    n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div className="space-y-4">
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
