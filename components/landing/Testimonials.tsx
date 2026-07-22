import Card from "@/components/ui/Card";
import Stars from "@/components/ui/Stars";
import { TESTIMONIALS } from "@/lib/data";

export default function Testimonials() {
  return (
    <section className="py-14 max-w-7xl mx-auto px-4 sm:px-6">
      <div className="text-center mb-10">
        <div className="text-teal-600 text-xs font-black tracking-widest uppercase mb-2">Social proof</div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Trusted by thousands across Canada</h2>
      </div>
      <div className="grid sm:grid-cols-3 gap-5">
        {TESTIMONIALS.map((t) => (
          <Card key={t.name} className="p-6">
            <Stars r={t.rating} size="md" />
            <p className="text-slate-700 text-sm leading-relaxed mt-4 mb-5" style={{ fontFamily: "'Inter', sans-serif" }}>&quot;{t.text}&quot;</p>
            <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-teal-400 to-emerald-400 flex items-center justify-center text-white text-xs font-bold shrink-0">{t.ini}</div>
              <div><div className="font-bold text-sm text-slate-900">{t.name}</div><div className="text-xs text-slate-400">{t.loc} · {t.svc}</div></div>
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
}
