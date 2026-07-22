import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { SERVICE_CATS } from "@/lib/data";

export default function ServiceCategories() {
  return (
    <section className="py-10 max-w-7xl mx-auto px-4 sm:px-6">
      <div className="flex items-end justify-between mb-6">
        <h2 className="text-xl font-extrabold text-slate-900">What do you need?</h2>
        <Link href="/search" className="flex items-center gap-1 text-sm font-bold text-teal-600 hover:text-teal-700"><span>All services</span><ChevronRight className="w-4 h-4" /></Link>
      </div>
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
        {SERVICE_CATS.map(({ Icon, label, sub, c }) => (
          <Link
            key={label}
            href="/search"
            className={`flex flex-col items-center gap-2.5 p-4 rounded-2xl bg-white ring-1 ring-${c}-100 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200`}
          >
            <div className={`w-10 h-10 rounded-xl bg-${c}-50 text-${c}-600 flex items-center justify-center`}><Icon className="w-5 h-5" /></div>
            <div className="text-center"><div className="font-bold text-xs text-slate-900">{label}</div><div className="text-[10px] text-slate-400 mt-0.5">{sub}</div></div>
          </Link>
        ))}
      </div>
    </section>
  );
}
