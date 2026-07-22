import Link from "next/link";
import { Brain } from "lucide-react";

export default function AIMatchBanner() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 mb-10">
      <div className="bg-gradient-to-r from-violet-600 via-violet-700 to-indigo-700 rounded-3xl p-6 flex flex-col sm:flex-row items-center gap-5 shadow-xl">
        <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center shrink-0"><Brain className="w-6 h-6 text-white" /></div>
        <div className="flex-1 text-center sm:text-left">
          <div className="font-extrabold text-white text-lg">AI-Powered Matching</div>
          <p className="text-violet-200 text-sm mt-0.5" style={{ fontFamily: "'Inter', sans-serif" }}>Our AI matches you with the best cleaner based on your home type, budget, past preferences, and availability.</p>
        </div>
        <Link href="/search" className="shrink-0 bg-white text-violet-700 font-bold px-5 py-2.5 rounded-xl hover:bg-violet-50 transition-colors text-sm whitespace-nowrap">
          Get My Match
        </Link>
      </div>
    </div>
  );
}
