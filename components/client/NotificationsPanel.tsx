import { CheckCircle, MessageSquare, Star } from "lucide-react";
import Card from "@/components/ui/Card";

const NOTIFICATIONS = [
  { I: CheckCircle, c: "text-emerald-500", t: "Booking BK-2841 confirmed by Maria Santos", s: "2m ago" },
  { I: MessageSquare, c: "text-teal-500", t: "New message from Maria Santos", s: "5m ago" },
  { I: Star, c: "text-amber-500", t: "Rate your June 23 cleaning with David Chen", s: "2d ago" },
];

export default function NotificationsPanel() {
  return (
    <Card className="p-5">
      <h3 className="font-bold text-slate-900 mb-4">Notifications</h3>
      <div className="space-y-3.5">
        {NOTIFICATIONS.map(({ I, c, t, s }) => (
          <div key={t} className="flex items-start gap-2.5"><I className={`w-4 h-4 ${c} shrink-0 mt-0.5`} /><div><p className="text-xs text-slate-700 leading-snug">{t}</p><span className="text-xs text-slate-400">{s}</span></div></div>
        ))}
      </div>
    </Card>
  );
}
