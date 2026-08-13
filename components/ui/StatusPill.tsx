const STATUS_STYLES: Record<string, string> = {
  confirmed: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  completed: "bg-slate-100 text-slate-500 ring-slate-200",
  pending: "bg-amber-50 text-amber-700 ring-amber-200",
  active: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  suspended: "bg-red-50 text-red-600 ring-red-200",
  // A paused subscription means a payment failed — amber, not green, and
  // distinct from "pending" which means nothing has been charged yet.
  paused: "bg-amber-50 text-amber-800 ring-amber-300",
  cancelled: "bg-slate-100 text-slate-500 ring-slate-200",
  paid: "bg-teal-50 text-teal-700 ring-teal-200",
  refunded: "bg-violet-50 text-violet-700 ring-violet-200",
};

export default function StatusPill({ s }: { s: string }) {
  const style = STATUS_STYLES[s] ?? STATUS_STYLES.pending;
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ring-1 ${style}`}>
      {s.charAt(0).toUpperCase() + s.slice(1)}
    </span>
  );
}
