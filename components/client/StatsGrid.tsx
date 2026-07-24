"use client";

import { Calendar, DollarSign, Heart, CalendarClock } from "lucide-react";
import Card from "@/components/ui/Card";
import { useMyBookings } from "@/lib/queries/bookings";
import { useFavorites } from "@/lib/queries/favorites";

// Static class map — Tailwind can't generate classes built from a variable.
const COLORS: Record<string, string> = {
  teal: "bg-teal-50 text-teal-600",
  emerald: "bg-emerald-50 text-emerald-600",
  rose: "bg-rose-50 text-rose-600",
  amber: "bg-amber-50 text-amber-600",
};

export default function StatsGrid() {
  const { data: bookingsData } = useMyBookings();
  const { data: favorites } = useFavorites();

  const bookings = bookingsData?.items ?? [];
  const totalSpent = bookings.reduce((s, b) => s + (b.totalPrice || 0), 0);
  const thisMonth = bookings.filter(
    (b) => new Date(b.scheduledFor).getMonth() === new Date().getMonth(),
  ).length;

  const stats = [
    { l: "Total Bookings", v: String(bookings.length), Icon: Calendar, c: "teal" },
    { l: "Total Spent", v: `$${totalSpent.toLocaleString()}`, Icon: DollarSign, c: "emerald" },
    { l: "Favourite Pros", v: String(favorites?.length ?? 0), Icon: Heart, c: "rose" },
    { l: "This Month", v: String(thisMonth), Icon: CalendarClock, c: "amber" },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-7">
      {stats.map(({ l, v, Icon, c }) => (
        <Card key={l} className="p-4">
          <div className={`w-8 h-8 rounded-lg ${COLORS[c]} flex items-center justify-center mb-3`}><Icon className="w-4 h-4" /></div>
          <div className="text-xl font-extrabold text-slate-900">{v}</div>
          <div className="text-xs text-slate-400 mt-0.5">{l}</div>
        </Card>
      ))}
    </div>
  );
}
