import { BadgeCheck } from "lucide-react";

export default function VBadge() {
  return (
    <span className="inline-flex items-center gap-1 text-xs font-semibold text-teal-700 bg-teal-50 ring-1 ring-teal-200/70 px-2 py-0.5 rounded-full">
      <BadgeCheck className="w-3 h-3" />
      Verified
    </span>
  );
}
