import Link from "next/link";
import { Home, Briefcase, ArrowRight } from "lucide-react";

export default function DualCTA() {
  return (
    <section className="pb-16 max-w-7xl mx-auto px-4 sm:px-6">
      <div className="grid sm:grid-cols-2 gap-5">
        <div className="relative overflow-hidden bg-gradient-to-br from-teal-600 to-teal-700 rounded-3xl p-8 shadow-xl shadow-teal-200">
          <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-white/10 rounded-full" />
          <div className="relative">
            <Home className="w-8 h-8 text-teal-200 mb-3" />
            <h3 className="text-2xl font-extrabold text-white mb-2">Need your space cleaned?</h3>
            <p className="text-teal-100 text-sm mb-5" style={{ fontFamily: "'Inter', sans-serif" }}>Find a vetted cleaner near you. First booking 10% off with code <span className="font-bold text-white">SPARK10</span>.</p>
            <Link href="/search" className="inline-flex items-center gap-2 bg-white text-teal-700 font-bold px-6 py-3 rounded-xl hover:bg-teal-50 transition-colors text-sm shadow-sm">
              Book a Cleaner <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
        <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-8 shadow-xl">
          <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-white/5 rounded-full" />
          <div className="relative">
            <Briefcase className="w-8 h-8 text-slate-400 mb-3" />
            <h3 className="text-2xl font-extrabold text-white mb-2">Are you a cleaning pro?</h3>
            <p className="text-slate-400 text-sm mb-5" style={{ fontFamily: "'Inter', sans-serif" }}>Join 4,200+ professionals earning on their schedule. Average $1,400/week.</p>
            <Link href="/auth" className="inline-flex items-center gap-2 bg-teal-500 hover:bg-teal-400 text-white font-bold px-6 py-3 rounded-xl transition-colors text-sm shadow-sm">
              Become a Pro <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
