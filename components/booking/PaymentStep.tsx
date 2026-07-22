"use client";

import { Plus, Check, ShieldCheck } from "lucide-react";
import Card from "@/components/ui/Card";
import { EXTRAS_LIST } from "@/lib/data";
import type { Service } from "@/lib/types";

export default function PaymentStep({
  service, extras, total,
}: { service: Service; extras: string[]; total: number }) {
  return (
    <div className="space-y-4">
      <Card className="p-5">
        <h3 className="font-bold text-slate-900 mb-4">Payment method</h3>
        {[{ l: "Visa ···· 4242", e: "💳", s: true }, { l: "Mastercard ···· 8888", e: "💳", s: false }].map((pm) => (
          <div key={pm.l} className={`flex items-center gap-3 p-3.5 rounded-xl mb-2 ring-1 cursor-pointer transition-colors ${pm.s ? "ring-teal-400 bg-teal-50" : "ring-slate-200 hover:ring-teal-200"}`}>
            <span className="text-xl">{pm.e}</span><span className="text-sm font-semibold text-slate-800 flex-1">{pm.l}</span>{pm.s && <Check className="w-4 h-4 text-teal-600" />}
          </div>
        ))}
        <button className="flex items-center gap-2 text-teal-600 text-sm font-bold mt-3 hover:text-teal-700 transition-colors"><Plus className="w-4 h-4" />Add card</button>
      </Card>
      <Card className="p-5">
        <h3 className="font-bold text-slate-900 mb-3">Order summary</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between text-slate-600"><span>{service.name}</span><span>${service.price}</span></div>
          {extras.map((e) => <div key={e} className="flex justify-between text-slate-600"><span>{e}</span><span>+${EXTRAS_LIST.find((x) => x.name === e)?.price}</span></div>)}
          <div className="flex justify-between text-slate-600"><span>Platform fee (7%)</span><span>${Math.round(total / 1.2 * 0.07)}</span></div>
          <div className="flex justify-between text-slate-600"><span>HST (13%)</span><span>${Math.round(total / 1.2 * 0.13)}</span></div>
          <div className="flex justify-between font-extrabold text-slate-900 pt-2 border-t border-slate-100 text-base"><span>Total charged</span><span>${total}</span></div>
        </div>
      </Card>
      <div className="flex items-center gap-2.5 p-4 bg-emerald-50 rounded-xl ring-1 ring-emerald-100">
        <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
        <p className="text-xs text-emerald-700 font-semibold">Protected by Zenex Guarantee. Not satisfied? We'll send another pro free.</p>
      </div>
    </div>
  );
}
