import Link from "next/link";
import { Calendar, Clock, MessageSquare, MoreVertical } from "lucide-react";
import Card from "@/components/ui/Card";
import StatusPill from "@/components/ui/StatusPill";
import { BOOKINGS } from "@/lib/data";

export default function BookingsList() {
  return (
    <div className="space-y-3 mb-7">
      {BOOKINGS.map((b) => (
        <Card key={b.id} className="p-4 flex items-center gap-4">
          <img src={b.img} alt={b.provider} className="w-12 h-12 rounded-xl object-cover shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap"><span className="font-bold text-sm text-slate-900">{b.service}</span><StatusPill s={b.status} /></div>
            <div className="text-xs text-slate-500 mt-0.5">with {b.provider}</div>
            <div className="flex items-center gap-3 mt-1 text-xs text-slate-400"><span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{b.date}</span><span className="flex items-center gap-1"><Clock className="w-3 h-3" />{b.time}</span></div>
          </div>
          <div className="text-right shrink-0">
            <div className="font-extrabold text-slate-900">${b.price}</div>
            <div className="flex gap-1 mt-2 justify-end">
              <Link href="/messages" className="p-1.5 rounded-lg hover:bg-teal-50 text-slate-400 hover:text-teal-600 transition-colors"><MessageSquare className="w-3.5 h-3.5" /></Link>
              <button className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors"><MoreVertical className="w-3.5 h-3.5" /></button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
