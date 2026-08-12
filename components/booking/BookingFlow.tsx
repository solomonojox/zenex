"use client";

import { Suspense, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, ArrowRight } from "lucide-react";
import type { Provider } from "@/lib/types";
import { EXTRAS_LIST } from "@/lib/data";
import { useAuth } from "@/context/auth/useAuth";
import { useCreateBooking, useCheckout, useQuote } from "@/lib/queries/bookings";
import { formatBookingDateTime, formatBookingTime } from "@/lib/utils/datetime";
import ProgressSteps from "./ProgressSteps";
import ServiceStep from "./ServiceStep";
import DateTimeStep from "./DateTimeStep";
import ExtrasStep from "./ExtrasStep";
import PaymentStep from "./PaymentStep";
import ConfirmedStep from "./ConfirmedStep";
import StripeCardForm from "./StripeCardForm";

// useSearchParams() requires a Suspense boundary for static generation, so
// the actual logic lives in BookingFlowInner and this wrapper just supplies it.
export default function BookingFlow({ provider }: { provider: Provider }) {
  return (
    <Suspense fallback={null}>
      <BookingFlowInner provider={provider} />
    </Suspense>
  );
}

/** Tomorrow as YYYY-MM-DD — the first bookable day. */
function defaultDate() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

const DEFAULT_DURATION_MINS = 120;

/**
 * Job length in minutes from a provider's free-text duration label.
 * Providers type these by hand, so handle both units and ranges:
 *   "2–3 hrs" → 120 · "90 mins" → 90 · "1.5 hours" → 90 · "" → 120
 * Assuming hours unconditionally would turn "90 mins" into 90 hours and
 * silently leave the client with no bookable slots.
 */
function durationFromLabel(label?: string): number {
  if (!label) return DEFAULT_DURATION_MINS;

  const match = label.match(/(\d+(?:\.\d+)?)/);
  if (!match) return DEFAULT_DURATION_MINS;

  const value = parseFloat(match[1]);
  if (!Number.isFinite(value) || value <= 0) return DEFAULT_DURATION_MINS;

  const isMinutes = /\bmin/i.test(label);
  const mins = Math.round(isMinutes ? value : value * 60);

  // Guard against typos producing absurd bookings.
  if (mins < 15 || mins > 12 * 60) return DEFAULT_DURATION_MINS;
  return mins;
}

function BookingFlowInner({ provider }: { provider: Provider }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated } = useAuth();
  const initialService = Number(searchParams.get("service") ?? 0) || 0;

  const [step, setStep] = useState(0);
  const [selSvc, setSelSvc] = useState(Math.min(initialService, Math.max(provider.services.length - 1, 0)));
  const [date, setDate] = useState(defaultDate());
  const [slot, setSlot] = useState<string | null>(null);
  const [extras, setExtras] = useState<string[]>([]);
  const [recurring, setRecurring] = useState(false);
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bookingRef, setBookingRef] = useState<string | null>(null);
  const [charged, setCharged] = useState(0);
  // Set when the API returns a live PaymentIntent — triggers the card form.
  const [clientSecret, setClientSecret] = useState<string | null>(null);

  const { mutateAsync: createBooking } = useCreateBooking();
  const { mutateAsync: checkout } = useCheckout();

  const service = provider.services[selSvc] ?? provider.services[0];
  const durationMins = durationFromLabel(service?.duration);
  const extrasTotal = extras.reduce((a, e) => a + (EXTRAS_LIST.find((x) => x.name === e)?.price ?? 0), 0);

  // Authoritative price (incl. Canadian sales tax) comes from the API.
  const extrasPayload = useMemo(
    () =>
      extras.map((name) => ({
        name,
        price: EXTRAS_LIST.find((x) => x.name === name)?.price ?? 0,
      })),
    [extras],
  );
  const { data: quote } = useQuote(provider.id, service?.id, extrasPayload);
  const total = quote?.total ?? (service?.price ?? 0) + extrasTotal;

  const toggleExtra = (name: string) => setExtras((e) => (e.includes(name) ? e.filter((x) => x !== name) : [...e, name]));

  const goBack = () => {
    if (step === 0) router.push(`/providers/${provider.id}`);
    else setStep((s) => s - 1);
  };

  const slotLabel = slot ? formatBookingDateTime(slot) : "";

  const confirmAndPay = async () => {
    if (!isAuthenticated) {
      router.push("/auth?mode=login");
      return;
    }
    if (!slot) {
      setError("Please choose a time slot.");
      setStep(1);
      return;
    }
    if (address.trim().length < 6) {
      setError("Please enter the service address so your pro can find you.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const booking = await createBooking({
        providerId: provider.id,
        serviceId: service.id,
        scheduledFor: slot,
        durationMins,
        timeSlot: formatBookingTime(slot),
        address: address.trim(),
        notes: notes.trim() || undefined,
        extras: extrasPayload,
      });
      setBookingRef(booking.reference);
      setCharged(booking.totalPrice);

      const result = await checkout(booking.id);
      if (result.mode === "live" && result.clientSecret) {
        // Live Stripe: collect the card, then finish on success.
        setClientSecret(result.clientSecret);
      } else {
        setStep(4); // demo mode settles immediately
      }
    } catch (e) {
      setError((e as Error).message || "Could not complete your booking.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!service) {
    return <p className="text-sm text-slate-500">This provider doesn&apos;t have any bookable services yet.</p>;
  }

  const canContinue = step !== 1 || !!slot;

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      <button onClick={goBack} className="flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-teal-700 mb-6 transition-colors">
        <ChevronLeft className="w-4 h-4" />{step === 0 ? "Back to Profile" : "Previous"}
      </button>

      <ProgressSteps step={step} />

      {step === 0 && (
        <ServiceStep provider={provider} selected={selSvc} onSelect={setSelSvc} recurring={recurring} onToggleRecurring={() => setRecurring((r) => !r)} />
      )}
      {step === 1 && (
        <DateTimeStep
          providerId={provider.id}
          durationMins={durationMins}
          date={date}
          onDate={(d) => { setDate(d); setSlot(null); }}
          slot={slot}
          onSlot={setSlot}
        />
      )}
      {step === 2 && <ExtrasStep extras={extras} onToggle={toggleExtra} />}
      {step === 3 && (
        <PaymentStep
          service={service}
          extras={extras}
          quote={quote}
          address={address}
          onAddress={setAddress}
          notes={notes}
          onNotes={setNotes}
        >
          {clientSecret && (
            <StripeCardForm
              clientSecret={clientSecret}
              onPaid={() => setStep(4)}
              onError={(msg) => setError(msg)}
            />
          )}
        </PaymentStep>
      )}
      {step === 4 && (
        <ConfirmedStep provider={provider} service={service} total={charged || total} reference={bookingRef ?? ""} when={slotLabel} />
      )}

      {step === 3 && slot && (
        <p className="text-xs text-slate-500 text-center mt-4">Scheduled for <strong className="text-slate-700">{slotLabel}</strong></p>
      )}
      {error && step < 4 && (
        <p className="text-sm text-red-600 font-semibold mt-4 text-center">{error}</p>
      )}

      {/* Once the card form is showing, Stripe's own button completes payment. */}
      {step < 4 && !clientSecret && (
        <button
          onClick={step === 3 ? confirmAndPay : () => setStep((s) => s + 1)}
          disabled={submitting || !canContinue}
          className="w-full mt-6 bg-teal-600 hover:bg-teal-700 disabled:opacity-60 text-white font-extrabold py-4 rounded-xl transition-colors shadow-sm shadow-teal-200 text-sm"
        >
          {step === 3 ? (submitting ? "Processing payment…" : `Confirm & Pay $${total.toFixed(2)}`) : "Continue"} <ArrowRight className="inline w-4 h-4 ml-1" />
        </button>
      )}
      {step === 1 && !slot && (
        <p className="text-xs text-slate-400 text-center mt-3">Select a time to continue.</p>
      )}
      {step === 3 && !isAuthenticated && (
        <p className="text-xs text-slate-400 text-center mt-3">You&apos;ll be asked to sign in to complete the booking.</p>
      )}
    </div>
  );
}
