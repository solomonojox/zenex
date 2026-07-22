import { Search, Calendar, CheckCircle } from "lucide-react";

const STEPS = [
  { n: "01", Icon: Search, t: "Search & compare", d: "Browse vetted cleaners in your city. Filter by rating, price, and service type." },
  { n: "02", Icon: Calendar, t: "Book instantly", d: "Select date, time, extras, and confirm in under 3 minutes with secure payment." },
  { n: "03", Icon: CheckCircle, t: "Enjoy a clean home", d: "Your pro arrives on time. Rate and review after. Set up recurring cleans easily." },
];

export default function HowItWorks() {
  return (
    <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6">
      <div className="text-center mb-12">
        <div className="text-teal-600 text-xs font-black tracking-widest uppercase mb-2">Simple process</div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Book in 3 easy steps</h2>
      </div>
      <div className="grid sm:grid-cols-3 gap-10 relative">
        {/* <div className="hidden sm:block absolute top-10 left-[calc(33%+32px)] right-[calc(33%+32px)] h-px bg-gradient-to-r from-teal-200 to-teal-200 via-teal-100" /> */}
        {STEPS.map(({ n, Icon, t, d }) => (
          <div key={n} className="flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center shadow-lg shadow-teal-200 mb-4">
              <Icon className="w-7 h-7 text-white" />
            </div>
            <div className="text-xs font-black text-teal-400 tracking-widest mb-2">{n}</div>
            <h3 className="font-extrabold text-lg text-slate-900 mb-2">{t}</h3>
            <p className="text-sm text-slate-500 leading-relaxed max-w-[220px]" style={{ fontFamily: "'Inter', sans-serif" }}>{d}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
