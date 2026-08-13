"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle, Loader2, ShieldCheck } from "lucide-react";
import { toast } from "react-toastify";
import Card from "@/components/ui/Card";
import RouteGuard from "@/components/auth/RouteGuard";
import { formatBookingDate } from "@/lib/utils/datetime";
import {
  useSubscribe,
  useSubscriptionQuote,
} from "@/lib/queries/subscriptions";

/**
 * Subscription checkout.
 *
 * Recurring billing used to start from a single click on the landing page: no
 * total, no tax, no renewal date, no consent — and no charge either, which was
 * the larger problem. Everything a customer needs in order to agree is on this
 * page before the button does anything, and the button stays disabled until
 * they tick the box.
 */
function SubscribeContent() {
  const router = useRouter();
  const planId = useSearchParams().get("plan") ?? undefined;
  const { data: quote, isLoading, isError, error } = useSubscriptionQuote(planId);
  const subscribe = useSubscribe();
  const [consented, setConsented] = useState(false);

  if (!planId) {
    return (
      <Card className="p-8 text-center">
        <p className="font-semibold text-slate-700">No plan selected.</p>
        <Link href="/#plans" className="text-teal-600 font-bold text-sm mt-2 inline-block">
          Choose a plan
        </Link>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card className="p-8 flex items-center justify-center min-h-[240px]">
        <Loader2 className="w-6 h-6 text-teal-500 animate-spin" />
      </Card>
    );
  }

  if (isError || !quote) {
    return (
      <Card className="p-8 text-center">
        <p className="font-semibold text-red-600">
          {(error as Error)?.message || "Could not load this plan."}
        </p>
        <Link href="/#plans" className="text-teal-600 font-bold text-sm mt-2 inline-block">
          Back to plans
        </Link>
      </Card>
    );
  }

  const confirm = () => {
    subscribe.mutate(planId, {
      onSuccess: (res) => {
        // Live mode hands off to Stripe's hosted page; demo mode is already done.
        if (res.mode === "live" && res.checkoutUrl) {
          window.location.href = res.checkoutUrl;
          return;
        }
        toast.success(`${quote.plan.name} plan is active`);
        router.push("/client");
      },
      onError: (e) => toast.error((e as Error).message || "Could not start the plan"),
    });
  };

  return (
    <div className="grid lg:grid-cols-5 gap-6">
      <Card className="lg:col-span-3 p-7">
        <h1 className="text-xl font-extrabold text-slate-900">
          Confirm your {quote.plan.name} plan
        </h1>
        <p className="text-sm text-slate-500 mt-1" style={{ fontFamily: "'Inter', sans-serif" }}>
          {quote.plan.frequency} cleaning subscription
        </p>

        <ul className="space-y-2.5 mt-6">
          {quote.plan.features.map((f) => (
            <li key={f} className="flex items-start gap-2 text-sm text-slate-600">
              <CheckCircle className="w-4 h-4 text-teal-500 shrink-0 mt-0.5" />
              {f}
            </li>
          ))}
        </ul>

        {/* Stated in the customer's words, not buried in the terms page. */}
        <div className="mt-7 rounded-xl bg-slate-50 ring-1 ring-slate-200 p-4">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-800 mb-2">
            <ShieldCheck className="w-4 h-4 text-teal-600" />
            Before you agree
          </div>
          <ul className="text-xs text-slate-600 space-y-1.5" style={{ fontFamily: "'Inter', sans-serif" }}>
            <li>
              This is a recurring charge of <strong>${quote.total.toFixed(2)} CAD</strong>, billed monthly.
            </li>
            <li>
              First charge today. Renews on <strong>{formatBookingDate(quote.renewsAt)}</strong>.
            </li>
            <li>{quote.cancellationTerms}</li>
          </ul>
        </div>

        <label className="flex items-start gap-3 mt-5 cursor-pointer">
          <input
            type="checkbox"
            checked={consented}
            onChange={(e) => setConsented(e.target.checked)}
            className="mt-0.5 w-4 h-4 accent-teal-600 shrink-0"
          />
          <span className="text-sm text-slate-700">
            I agree to a recurring charge of ${quote.total.toFixed(2)} CAD per month
            until I cancel, and to the{" "}
            <Link href="/terms" className="text-teal-600 font-semibold underline">
              terms of service
            </Link>
            .
          </span>
        </label>
      </Card>

      <Card className="lg:col-span-2 p-7 h-fit">
        <h2 className="font-bold text-slate-900 mb-4">Summary</h2>
        <dl className="space-y-2.5 text-sm">
          <div className="flex justify-between">
            <dt className="text-slate-500">{quote.plan.name} plan</dt>
            <dd className="font-semibold text-slate-800">${quote.subtotal.toFixed(2)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-slate-500">{quote.taxLabel}</dt>
            <dd className="font-semibold text-slate-800">${quote.taxAmount.toFixed(2)}</dd>
          </div>
          <div className="flex justify-between pt-2.5 border-t border-slate-100">
            <dt className="font-bold text-slate-900">Total per month</dt>
            <dd className="font-extrabold text-slate-900">${quote.total.toFixed(2)} CAD</dd>
          </div>
        </dl>

        <button
          onClick={confirm}
          disabled={!consented || subscribe.isPending}
          className="w-full mt-6 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl transition-colors text-sm"
        >
          {subscribe.isPending ? "Starting…" : `Start ${quote.plan.name} plan`}
        </button>

        <Link
          href="/#plans"
          className="block text-center text-xs font-semibold text-slate-500 hover:text-slate-700 mt-3"
        >
          Choose a different plan
        </Link>
      </Card>
    </div>
  );
}

export default function SubscribePage() {
  return (
    <RouteGuard roles={["CLIENT"]}>
      <div className="min-h-screen bg-[#F8FAFB]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
          <Suspense fallback={null}>
            <SubscribeContent />
          </Suspense>
        </div>
      </div>
    </RouteGuard>
  );
}
