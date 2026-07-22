import Link from "next/link";
import { CheckCircle } from "lucide-react";
import { SUBSCRIPTIONS } from "@/lib/data";

export default function SubscriptionPlans() {
  return (
    <section className="py-12 bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-10">
          <div className="text-teal-600 text-xs font-black tracking-widest uppercase mb-2">Save more, stress less</div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Subscription cleaning plans</h2>
          <p className="text-slate-500 text-sm mt-2" style={{ fontFamily: "'Inter', sans-serif" }}>Set-and-forget recurring cleans. Cancel anytime.</p>
        </div>
        <div className="grid sm:grid-cols-3 gap-5">
          {SUBSCRIPTIONS.map((plan) => (
            <div key={plan.name} className={`relative rounded-3xl p-6 ${plan.popular ? "bg-gradient-to-b from-teal-600 to-teal-700 text-white shadow-2xl shadow-teal-200 ring-0" : "bg-white ring-1 ring-black/[0.06] shadow-sm"}`}>
              {plan.popular && <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-400 text-amber-900 text-xs font-black px-4 py-1 rounded-full">Most Popular</div>}
              <div className={`text-xs font-black tracking-widest uppercase mb-1 ${plan.popular ? "text-teal-200" : "text-teal-600"}`}>{plan.freq}</div>
              <div className={`text-3xl font-extrabold mb-1 ${plan.popular ? "text-white" : "text-slate-900"}`}>${plan.price}<span className={`text-base font-normal ${plan.popular ? "text-teal-200" : "text-slate-400"}`}>/mo</span></div>
              <div className={`text-xs mb-5 font-bold ${plan.popular ? "text-teal-200" : "text-emerald-600"}`}>Save up to {plan.saves}%</div>
              <ul className="space-y-2.5 mb-6">
                {plan.features.map((f) => (
                  <li key={f} className={`flex items-start gap-2 text-sm ${plan.popular ? "text-teal-100" : "text-slate-600"}`} style={{ fontFamily: "'Inter', sans-serif" }}>
                    <CheckCircle className={`w-4 h-4 shrink-0 mt-0.5 ${plan.popular ? "text-teal-300" : "text-teal-500"}`} />{f}
                  </li>
                ))}
              </ul>
              {/* Plans aren't tied to a specific pro yet, so we route to Search
                  (with the chosen plan as a query param) rather than a
                  provider-specific /booking/[providerId] route. */}
              <Link
                href={`/search?plan=${encodeURIComponent(plan.name)}`}
                className={`block text-center w-full py-3 rounded-xl font-bold text-sm transition-colors ${plan.popular ? "bg-white text-teal-700 hover:bg-teal-50" : "bg-teal-600 text-white hover:bg-teal-700 shadow-sm shadow-teal-200"}`}
              >
                Get {plan.name}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
