import { Languages, Sparkles } from "lucide-react";

const FOOTER_COLS: { t: string; l: string[] }[] = [
  { t: "Services", l: ["Home Cleaning", "Office Cleaning", "Deep Cleaning", "Move In/Out", "Recurring Plans", "Post-Reno"] },
  { t: "Company", l: ["About Us", "Careers", "Blog", "Press", "Partnerships"] },
  { t: "Support", l: ["Help Center", "Safety", "Contact Us", "Trust & Safety", "Accessibility"] },
];

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-10">
          <div className="col-span-2">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center"><Sparkles className="w-3.5 h-3.5 text-white" /></div>
              <span className="font-extrabold text-white text-base" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Zenex</span>
            </div>
            <p className="text-sm leading-relaxed mb-4 max-w-xs" style={{ fontFamily: "'Inter', sans-serif" }}>Canada's trusted marketplace for professional cleaning services — from coast to coast.</p>
            <div className="flex items-center gap-2">
              <span className="text-xs bg-teal-900/50 text-teal-400 px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5"><Languages className="w-3 h-3" />EN</span>
              <span className="text-xs bg-slate-800 text-slate-400 px-3 py-1.5 rounded-lg font-bold">FR</span>
            </div>
          </div>
          {FOOTER_COLS.map((col) => (
            <div key={col.t}>
              <div className="font-bold text-white text-sm mb-3">{col.t}</div>
              <ul className="space-y-2">{col.l.map((l) => <li key={l}><a href="#" className="text-sm hover:text-teal-400 transition-colors" style={{ fontFamily: "'Inter', sans-serif" }}>{l}</a></li>)}</ul>
            </div>
          ))}
        </div>
        <div className="border-t border-slate-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs" style={{ fontFamily: "'Inter', sans-serif" }}>
          <span>© 2025 Zenex Inc. All rights reserved. 🍁 Proudly Canadian.</span>
          <div className="flex items-center gap-4">{["Privacy", "Terms", "Cookies", "Sitemap"].map((l) => <a key={l} href="#" className="hover:text-teal-400 transition-colors">{l}</a>)}</div>
        </div>
      </div>
    </footer>
  );
}
