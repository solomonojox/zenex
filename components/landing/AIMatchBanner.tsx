import Link from "next/link";
import { Zap } from "lucide-react";

/**
 * Describes the instant-quote and auto-matching feature that actually exists.
 *
 * The previous copy said "AI-Powered Matching — our AI matches you with the
 * best cleaner based on your home type, budget, past preferences, and
 * availability." There is no AI and no preference model; `aiMatch` is a fixed
 * number in the seed, identical for every visitor, and a signed-out stranger
 * was being told the results drew on their history.
 *
 * What Zenex genuinely does is worth saying plainly: price from the size of
 * the property, then assign a verified pro who is provably free for the whole
 * slot — checked against their published hours, existing bookings and time
 * off. That is a real feature and a better promise than a vague one.
 */
export default function AIMatchBanner() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 mb-10">
      <div className="bg-gradient-to-r from-violet-600 via-violet-700 to-indigo-700 rounded-3xl p-6 flex flex-col sm:flex-row items-center gap-5 shadow-xl">
        <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
          <Zap className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1 text-center sm:text-left">
          <div className="font-extrabold text-white text-lg">Instant quote, matched pro</div>
          <p className="text-violet-200 text-sm mt-0.5" style={{ fontFamily: "'Inter', sans-serif" }}>
            Tell us the size of your place and pick a time. We price it up front
            and assign a verified cleaner who is genuinely free for that slot —
            no messaging back and forth.
          </p>
        </div>
        <Link
          href="/book"
          className="shrink-0 bg-white text-violet-700 font-bold px-5 py-2.5 rounded-xl hover:bg-violet-50 transition-colors text-sm whitespace-nowrap"
        >
          Get a price
        </Link>
      </div>
    </div>
  );
}
