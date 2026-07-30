"use client";

import { CheckCircle } from "lucide-react";
import Card from "@/components/ui/Card";
import { useMyBookings } from "@/lib/queries/bookings";

// Note: the API has no dedicated notifications endpoint yet, so this derives
// lightweight activity from the client's recent bookings.
export default function NotificationsPanel() {
  const { data } = useMyBookings();
  const recent = (data?.items ?? []).slice(0, 4);

  return (
    <Card className="p-5">
      <h3 className="font-bold text-slate-900 mb-4">Recent activity</h3>
      {recent.length === 0 ? (
        <p className="text-xs text-slate-400">No activity yet.</p>
      ) : (
        <div className="space-y-3.5">
          {recent.map((b) => {
            const provider = b.provider?.user
              ? `${b.provider.user.firstName} ${b.provider.user.lastName}`
              : "your pro";
            return (
              <div key={b.id} className="flex items-start gap-2.5">
                <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-slate-700 leading-snug">
                    Booking {b.reference} · {b.status.toLowerCase()} with {provider}
                  </p>
                  <span className="text-xs text-slate-400">{b.service?.name ?? "Cleaning"}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}
