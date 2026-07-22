import { Shield, BadgeCheck, Clock, Globe, Award } from "lucide-react";

const ITEMS = [
  { Icon: Shield, t: "Fully insured & bonded" },
  { Icon: BadgeCheck, t: "Background-checked" },
  { Icon: Clock, t: "Book in 3 minutes" },
  { Icon: Globe, t: "English & French" },
  { Icon: Award, t: "Satisfaction guarantee" },
];

export default function TrustBar() {
  return (
    <div className="bg-white border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex flex-wrap items-center justify-center gap-x-8 gap-y-2">
        {ITEMS.map(({ Icon, t }) => (
          <div key={t} className="flex items-center gap-2 text-slate-600 text-xs font-semibold"><Icon className="w-3.5 h-3.5 text-teal-500" />{t}</div>
        ))}
      </div>
    </div>
  );
}
