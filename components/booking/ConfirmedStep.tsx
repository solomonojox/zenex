"use client";

import Link from "next/link";
import { CheckCircle } from "lucide-react";
import Card from "@/components/ui/Card";
import type { Provider, Service } from "@/lib/types";

export default function ConfirmedStep({
  provider, service, total,
}: { provider: Provider; service: Service; total: number }) {
  return (
    <div className="text-center py-6">
      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-teal-400 to-emerald-400 flex items-center justify-center mx-auto mb-5 shadow-xl shadow-teal-200"><CheckCircle className="w-10 h-10 text-white" /></div>
      <h2 className="text-2xl font-extrabold text-slate-900 mb-2">Booking Confirmed!</h2>
      <p className="text-slate-500 text-sm mb-7" style={{ fontFamily: "'Inter', sans-serif" }}>
        {provider.name} · {service.name}<br /><strong className="text-slate-800">Friday, July 4 · 9:00 AM – 1:00 PM</strong>
      </p>
      <Card className="p-5 text-left mb-5">
        <div className="flex items-center gap-3 mb-4">
          <img src={provider.image} alt={provider.name} className="w-10 h-10 rounded-full object-cover" />
          <div><div className="font-bold text-sm text-slate-900">{provider.name}</div><div className="text-xs text-slate-500">Will arrive at 9:00 AM</div></div>
        </div>
        <div className="space-y-1.5 text-sm">
          <div className="flex justify-between text-slate-600"><span>Ref</span><span className="font-bold text-slate-900">BK-2841</span></div>
          <div className="flex justify-between text-slate-600"><span>Charged</span><span className="font-bold text-slate-900">${total}</span></div>
        </div>
      </Card>
      <div className="flex gap-3">
        <Link href={`/messages?thread=${provider.id}`} className="flex-1 py-3 rounded-xl ring-1 ring-slate-200 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors text-center">Message {provider.name.split(" ")[0]}</Link>
        <Link href="/client" className="flex-1 py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-sm font-bold transition-colors shadow-sm text-center">My Bookings</Link>
      </div>
    </div>
  );
}
