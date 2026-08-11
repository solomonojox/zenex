"use client";

import { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import Card from "@/components/ui/Card";

const PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "";

/** Loaded once at module level — Stripe recommends not re-creating this. */
const stripePromise = PUBLISHABLE_KEY ? loadStripe(PUBLISHABLE_KEY) : null;

function CardFields({
  onPaid,
  onError,
}: {
  onPaid: () => void;
  onError: (msg: string) => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [submitting, setSubmitting] = useState(false);

  const pay = async () => {
    if (!stripe || !elements) return;
    setSubmitting(true);
    const { error } = await stripe.confirmPayment({
      elements,
      redirect: "if_required",
    });
    setSubmitting(false);
    if (error) onError(error.message || "Card payment failed");
    else onPaid();
  };

  return (
    <div className="space-y-4">
      <PaymentElement />
      <button
        onClick={pay}
        disabled={!stripe || submitting}
        className="w-full bg-teal-600 hover:bg-teal-700 disabled:opacity-60 text-white font-extrabold py-3.5 rounded-xl transition-colors text-sm"
      >
        {submitting ? "Processing…" : "Pay now"}
      </button>
    </div>
  );
}

/**
 * Real card entry. Only rendered when the API returns a PaymentIntent
 * client secret (live mode); demo mode skips this entirely.
 */
export default function StripeCardForm({
  clientSecret,
  onPaid,
  onError,
}: {
  clientSecret: string;
  onPaid: () => void;
  onError: (msg: string) => void;
}) {
  if (!stripePromise) {
    return (
      <Card className="p-5">
        <p className="text-sm text-amber-700 bg-amber-50 ring-1 ring-amber-200 rounded-xl p-3">
          Card payment is unavailable — <code>NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY</code> is not set.
        </p>
      </Card>
    );
  }

  return (
    <Card className="p-5">
      <h3 className="font-bold text-slate-900 mb-4">Card details</h3>
      <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: "stripe" } }}>
        <CardFields onPaid={onPaid} onError={onError} />
      </Elements>
    </Card>
  );
}
