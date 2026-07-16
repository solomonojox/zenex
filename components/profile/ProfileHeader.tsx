import Link from "next/link";
import { ChevronLeft, MapPin, Star, CheckCircle, Award, Bolt, Brain, MessageSquare, Heart } from "lucide-react";
import type { Provider } from "@/lib/types";
import VBadge from "@/components/ui/VBadge";

export default function ProfileHeader({ p }: { p: Provider }) {
  return (
    <>
      <div className="h-40 bg-gradient-to-br from-[#0A3D38] to-teal-700 relative">
        <Link href="/search" className="absolute top-4 left-4 sm:left-6 bg-white/20 backdrop-blur text-white rounded-full p-2 hover:bg-white/30 transition-colors">
          <ChevronLeft className="w-5 h-5" />
        </Link>
      </div>
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="relative -mt-16 mb-6 flex flex-col sm:flex-row sm:items-end gap-4">
          <div className="w-28 h-28 rounded-2xl overflow-hidden ring-4 ring-white shadow-xl shrink-0">
            <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
          </div>
          <div className="flex-1 pb-2 mt-7">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h1 className="text-2xl font-extrabold md:text-white text-gray-900">{p.name}</h1>
              {p.verified && <VBadge />}
              {p.elite && <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 ring-1 ring-amber-200 text-xs font-bold px-2.5 py-1 rounded-full"><Award className="w-3 h-3" />Top Pro</span>}
              {p.instant && <span className="inline-flex items-center gap-1 bg-teal-50 text-teal-700 ring-1 ring-teal-200 text-xs font-bold px-2.5 py-1 rounded-full"><Bolt className="w-3 h-3" />Instant Book</span>}
            </div>
            <p className="text-slate-600 text-sm">{p.title}</p>
            <div className="flex flex-wrap items-center gap-4 mt-2 text-sm">
              <span className="flex items-center gap-1 text-slate-600"><MapPin className="w-3.5 h-3.5 text-teal-500" />{p.location}</span>
              <span className="flex items-center gap-1 text-slate-600"><Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />{p.rating} <span className="text-slate-400">({p.reviews})</span></span>
              <span className="flex items-center gap-1 text-slate-600"><CheckCircle className="w-3.5 h-3.5 text-emerald-500" />{p.completions} jobs</span>
              <span className="text-violet-600 font-bold flex items-center gap-1 text-xs"><Brain className="w-3 h-3" />{p.ai_match}% match for you</span>
            </div>
          </div>
          <div className="flex gap-2 pb-1 shrink-0">
            <Link href={`/messages?thread=${p.id}`} className="p-3 rounded-xl ring-1 ring-slate-200 hover:bg-teal-50 hover:ring-teal-300 text-slate-600 hover:text-teal-700 transition-colors"><MessageSquare className="w-5 h-5" /></Link>
            <button className="p-3 rounded-xl ring-1 ring-slate-200 hover:bg-rose-50 hover:ring-rose-200 text-slate-400 hover:text-rose-500 transition-colors"><Heart className="w-5 h-5" /></button>
          </div>
        </div>
      </div>
    </>
  );
}
