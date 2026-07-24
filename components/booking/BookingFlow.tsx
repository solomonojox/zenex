"use client";

import { Suspense, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, ArrowRight } from "lucide-react";
import type { Provider } from "@/lib/types";
import { EXTRAS_LIST } from "@/lib/data";
import { useAuth } from "@/context/auth/useAuth";
import { useCreateBooking, useCheckout } from "@/lib/queries/bookings";
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

// Build an ISO timestamp for the chosen day (this month, or next month if past).
function buildScheduledFor(day: number): string {
  const now = new Date();
  let d = new Date(now.getFullYear(), now.getMonth(), day, 9, 0, 0);
  if (d.getTime() < now.getTime()) {
    d = new Date(now.getFullYear(), now.getMonth() + 1, day, 9, 0, 0);
  }
  return d.toISOString();
}

function BookingFlowInner({ provider }: { provider: Provider }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated } = useAuth();
  const initialService = Number(searchParams.get("service") ?? 0) || 0;

  const [step, setStep] = useState(0);
  const [selSvc, setSelSvc] = useState(Math.min(initialService, Math.max(provider.services.length - 1, 0)));
  const [date, setDate] = useState(new Date().getDate() + 1);
  const [time, setTime] = useState("9:00 AM");
  const [extras, setExtras] = useState<string[]>([]);
  const [recurring, setRecurring] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bookingRef, setBookingRef] = useState<string | null>(null);
  const [charged, setCharged] = useState(0);

  const { mutateAsync: createBooking } = useCreateBooking();
  const { mutateAsync: checkout } = useCheckout();

  const service = provider.services[selSvc] ?? provider.services[0];
  const extrasTotal = extras.reduce((a, e) => a + (EXTRAS_LIST.find((x) => x.name === e)?.price ?? 0), 0);
  // Charge = service + extras (matches the backend; platform fee is provider-side).
  const total = useMemo(() => (service?.price ?? 0) + extrasTotal, [service, extrasTotal]);

  const toggleExtra = (name: string) => setExtras((e) => (e.includes(name) ? e.filter((x) => x !== name) : [...e, name]));

  const goBack = () => {
    if (step === 0) router.push(`/providers/${provider.id}`);
    else setStep((s) => s - 1);
  };

  const confirmAndPay = async () => {
    if (!isAuthenticated) {
      router.push("/auth?mode=login");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const extrasPayload = extras.map((name) => ({
        name,
        price: EXTRAS_LIST.find((x) => x.name === name)?.price ?? 0,
      }));
      const booking = await createBooking({
        providerId: provider.id,
        serviceId: service.id,
        scheduledFor: buildScheduledFor(date),
        timeSlot: time,
        extras: extrasPayload,
      });
      await checkout(booking.id);
      setBookingRef(booking.reference);
      setCharged(booking.totalPrice);
      setStep(4);
    } catch (e) {
      setError((e as Error).message || "Could not complete your booking.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!service) {
    return <p className="text-sm text-slate-500">This provider doesn&apos;t have any bookable services yet.</p>;
  }

  const whenLabel = `${new Date(buildScheduledFor(date)).toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })} · ${time}`;

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
      {step === 4 && (
        <ConfirmedStep provider={provider} service={service} total={charged || total} reference={bookingRef ?? ""} when={whenLabel} />
      )}

      {step === 3 && error && (
        <p className="text-sm text-red-600 font-semibold mt-4 text-center">{error}</p>
      )}

      {step < 4 && (
        <button
          onClick={step === 3 ? confirmAndPay : () => setStep((s) => s + 1)}
          disabled={submitting}
          className="w-full mt-6 bg-teal-600 hover:bg-teal-700 disabled:opacity-60 text-white font-extrabold py-4 rounded-xl transition-colors shadow-sm shadow-teal-200 text-sm"
        >
          {step === 3 ? (submitting ? "Processing payment…" : `Confirm & Pay $${total}`) : "Continue"} <ArrowRight className="inline w-4 h-4 ml-1" />
        </button>
      )}
      {step === 3 && !isAuthenticated && (
        <p className="text-xs text-slate-400 text-center mt-3">You&apos;ll be asked to sign in to complete the booking.</p>
      )}
    </div>
  );
}
