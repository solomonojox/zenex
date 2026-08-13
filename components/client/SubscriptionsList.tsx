"use client";

import Link from "next/link";
import { AlertTriangle, Repeat, Clock } from "lucide-react";
import Card from "@/components/ui/Card";
import StatusPill from "@/components/ui/StatusPill";
import { formatBookingDate } from "@/lib/utils/datetime";
import {
  useMySubscriptions,
  useCancelSubscription,
} from "@/lib/queries/subscriptions";

/**
 * A subscriber's view of their plan.
 *
 * Previously this showed only the plan name, price and renewal date — nothing
 * about what the plan was actually giving them. Now that a plan grants cleans
 * and a discount, those have to be visible: a customer paying $219 a month
 * needs to see how many cleans are left, and needs to be told plainly when a
 * failed payment has paused the benefits they are still expecting.
 */
export default function SubscriptionsList() {
  const { data: subs = [], isLoading } = useMySubscriptions();
  const cancel = useCancelSubscription();

  if (isLoading) {
    return (
      <div className="space-y-3 mb-7">
        <div className="h-24 rounded-2xl bg-slate-100 animate-pulse" />
      </div>
    );
  }

  // A cancelled plan is history, not a current arrangement.
  const visible = subs.filter((s) => s.status !== "CANCELLED");

  if (visible.length === 0) {
    return (
      <Card className="p-6 text-center text-sm text-slate-400 mb-7">
        No active plan.{" "}
        <Link href="/#plans" className="text-teal-600 font-bold">
          Browse subscription plans →
        </Link>
      </Card>
    );
  }

  return (
    <div className="space-y-3 mb-7">
      {visible.map((s) => {
        const isActive = s.status === "ACTIVE";
        const isPaused = s.status === "PAUSED";
        const isPending = s.status === "PENDING";
        const included = s.plan?.includedCleans ?? 0;
        const left = s.cleansRemaining ?? 0;

        return (
          <Card key={s.id} className="p-4">
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
                <Repeat className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-sm text-slate-900">
                    {s.plan?.name ?? "Plan"}
                  </span>
                  <StatusPill s={s.status.toLowerCase()} />
                </div>
                <div className="text-xs text-slate-500 mt-0.5">
                  {s.plan?.frequency}
                  {s.plan ? ` · $${s.plan.price}/mo` : ""}
                </div>
                {s.renewsAt && isActive && (
                  <div className="text-xs text-slate-400 mt-0.5">
                    Renews {formatBookingDate(s.renewsAt)}
                  </div>
                )}
              </div>
              {(isActive || isPaused) && (
                <button
                  onClick={() => cancel.mutate(s.id)}
                  disabled={cancel.isPending}
                  className="shrink-0 px-3 py-1.5 bg-rose-50 text-rose-600 hover:bg-rose-100 disabled:opacity-50 text-xs font-bold rounded-lg transition-colors"
                >
                  {cancel.isPending ? "Cancelling…" : "Cancel"}
                </button>
              )}
            </div>

            {/* What the plan is actually delivering right now. */}
            {isActive && included > 0 && (
              <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-2">
                  <div className="text-xs text-slate-400">Cleans left</div>
                  <div className="text-sm font-extrabold text-teal-700">
                    {left} <span className="text-slate-400 font-bold">of {included}</span>
                  </div>
                </div>
                {!!s.plan?.extrasDiscountPercent && (
                  <div className="text-xs text-slate-500">
                    {s.plan.extrasDiscountPercent}% off extras applied automatically
                  </div>
                )}
                {left === 0 && (
                  <div className="text-xs text-slate-400">
                    Used up — resets on {formatBookingDate(s.renewsAt ?? "")}
                  </div>
                )}
              </div>
            )}

            {isPaused && (
              <div className="mt-3 pt-3 border-t border-slate-100 flex items-start gap-2 text-xs">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                <span className="text-amber-800">
                  We couldn&apos;t take your last payment, so this plan is paused
                  and your included cleans are on hold. Bookings already
                  confirmed still go ahead. Updating your card restarts it.
                </span>
              </div>
            )}

            {isPending && (
              <div className="mt-3 pt-3 border-t border-slate-100 flex items-start gap-2 text-xs">
                <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                <span className="text-slate-500">
                  Waiting on payment. Nothing has been charged and the plan
                  gives no benefits until it clears.
                </span>
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
}
