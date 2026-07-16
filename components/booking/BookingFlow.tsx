"use client";

import { Suspense, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, ArrowRight } from "lucide-react";
import type { Provider } from "@/lib/types";
import { EXTRAS_LIST } from "@/lib/data";
import ProgressSteps from "./ProgressSteps";
import ServiceStep from "./ServiceStep";
import DateTimeStep from "./DateTimeStep";
import ExtrasStep from "./ExtrasStep";
import PaymentStep from "./PaymentStep";
import ConfirmedStep from "./ConfirmedStep";

// useSearchParams() requires a Suspense boundary for static generation, so
// the actual logic lives in BookingFlowInner and this wrapper just supplies it.
export default function BookingFlow({ provider }: { provider: Provider }) {
  return (
    <Suspense fallback={null}>
      <BookingFlowInner provider={provider} />
    </Suspense>
  );
}

function BookingFlowInner({ provider }: { provider: Provider }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialService = Number(searchParams.get("service") ?? 0) || 0;

  const [step, setStep] = useState(0);
  const [selSvc, setSelSvc] = useState(Math.min(initialService, Math.max(provider.services.length - 1, 0)));
  const [date, setDate] = useState(4);
  const [time, setTime] = useState("9:00 AM");
  const [extras, setExtras] = useState<string[]>([]);
  const [recurring, setRecurring] = useState(false);

  const service = provider.services[selSvc] ?? provider.services[0];
  const extrasTotal = extras.reduce((a, e) => a + (EXTRAS_LIST.find((x) => x.name === e)?.price ?? 0), 0);
  const total = useMemo(() => Math.round(((service?.price ?? 0) + extrasTotal) * 1.2), [service, extrasTotal]);

  const toggleExtra = (name: string) => setExtras((e) => (e.includes(name) ? e.filter((x) => x !== name) : [...e, name]));

  const goBack = () => {
    if (step === 0) router.push(`/providers/${provider.id}`);
    else setStep((s) => s - 1);
  };

  if (!service) {
    return <p className="text-sm text-slate-500">This provider doesn't have any bookable services yet.</p>;
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      <button onClick={goBack} className="flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-teal-700 mb-6 transition-colors">
        <ChevronLeft className="w-4 h-4" />{step === 0 ? "Back to Profile" : "Previous"}
      </button>

      <ProgressSteps step={step} />

      {step === 0 && (
        <ServiceStep provider={provider} selected={selSvc} onSelect={setSelSvc} recurring={recurring} onToggleRecurring={() => setRecurring((r) => !r)} />
      )}
      {step === 1 && <DateTimeStep date={date} onDate={setDate} time={time} onTime={setTime} />}
      {step === 2 && <ExtrasStep extras={extras} onToggle={toggleExtra} />}
      {step === 3 && <PaymentStep service={service} extras={extras} total={total} />}
      {step === 4 && <ConfirmedStep provider={provider} service={service} total={total} />}

      {step < 4 && (
        <button onClick={() => setStep((s) => s + 1)} className="w-full mt-8 bg-teal-600 hover:bg-teal-700 text-white font-extrabold py-4 rounded-xl transition-colors shadow-sm shadow-teal-200 text-sm">
          {step === 3 ? `Confirm & Pay $${total}` : "Continue"} <ArrowRight className="inline w-4 h-4 ml-1" />
        </button>
      )}
    </div>
  );
}
