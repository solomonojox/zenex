import { Calendar, DollarSign, Heart, Star } from "lucide-react";
import Card from "@/components/ui/Card";

const STATS = [
  { l: "Total Bookings", v: "23", Icon: Calendar, c: "teal" },
  { l: "Total Spent", v: "$2,840", Icon: DollarSign, c: "emerald" },
  { l: "Favourite Pros", v: "4", Icon: Heart, c: "rose" },
  { l: "Avg Rating Given", v: "4.9 ★", Icon: Star, c: "amber" },
];

export default function StatsGrid() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-7">
      {STATS.map(({ l, v, Icon, c }) => (
        <Card key={l} className="p-4">
          <div className={`w-8 h-8 rounded-lg bg-${c}-50 text-${c}-600 flex items-center justify-center mb-3`}><Icon className="w-4 h-4" /></div>
          <div className="text-xl font-extrabold text-slate-900">{v}</div>
          <div className="text-xs text-slate-400 mt-0.5">{l}</div>
        </Card>
      ))}
    </div>
  );
}
