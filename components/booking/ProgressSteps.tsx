import { Check } from "lucide-react";

const STEPS = ["Service", "Date & Time", "Extras", "Payment", "Confirmed"];

export default function ProgressSteps({ step }: { step: number }) {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-1 sm:gap-2 mb-3 justify-between">
        {STEPS.map((s, i) => (
          <div key={s} className={`flex items-center gap-1 text-[11px] font-bold ${i <= step ? "text-teal-600" : "text-slate-300"}`}>
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${i < step ? "bg-teal-500 text-white" : i === step ? "bg-teal-600 text-white" : "bg-slate-200 text-slate-400"}`}>
              {i < step ? <Check className="w-3 h-3" /> : i + 1}
            </div>
            <span className="hidden sm:block">{s}</span>
          </div>
        ))}
      </div>
      <div className="h-1.5 bg-slate-200 rounded-full">
        <div className="h-full bg-gradient-to-r from-teal-500 to-emerald-500 rounded-full transition-all duration-500" style={{ width: `${(step / (STEPS.length - 1)) * 100}%` }} />
      </div>
    </div>
  );
}
