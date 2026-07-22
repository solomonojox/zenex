"use client";

import { useState } from "react";
import Link from "next/link";
import { MapPin, Heart, Award, Bolt, Brain } from "lucide-react";
import type { Provider } from "@/lib/types";
import Stars from "./Stars";

export default function ProviderCard({ p }: { p: Provider }) {
  const [liked, setLiked] = useState(false);
  return (
    <Link
      href={`/providers/${p.id}`}
      className="block bg-white rounded-2xl shadow-sm ring-1 ring-black/[0.06] overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer group"
    >
      <div className="relative h-48 bg-teal-50 overflow-hidden">
        <img src={p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setLiked(!liked);
          }}
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur flex items-center justify-center hover:bg-white transition-colors shadow-sm"
        >
          <Heart className={`w-4 h-4 ${liked ? "fill-rose-500 text-rose-500" : "text-slate-400"}`} />
        </button>
        <div className="absolute bottom-3 left-3 flex gap-1.5">
          {p.elite && (
            <span className="bg-amber-400 text-amber-900 text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1">
              <Award className="w-2.5 h-2.5" />Top Pro
            </span>
          )}
          {p.instant && (
            <span className="bg-teal-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1">
              <Bolt className="w-2.5 h-2.5" />Instant
            </span>
          )}
        </div>
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-1.5">
          <div>
            <div className="font-bold text-[15px] text-slate-900 leading-tight">{p.name}</div>
            <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-1"><MapPin className="w-3 h-3" />{p.location}</div>
          </div>
          <div className="text-right shrink-0"><span className="text-slate-900 font-extrabold">${p.price}</span><span className="text-slate-400 text-xs">/hr</span></div>
        </div>
        <div className="flex items-center gap-2 mb-3">
          <Stars r={p.rating} /><span className="text-xs font-bold text-slate-800">{p.rating}</span><span className="text-xs text-slate-400">({p.reviews})</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex flex-wrap gap-1">{p.tags.slice(0, 2).map((t) => <span key={t} className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{t}</span>)}</div>
          <div className="flex items-center gap-1 text-xs font-bold text-violet-600 bg-violet-50 px-2 py-0.5 rounded-full"><Brain className="w-3 h-3" />{p.ai_match}% match</div>
        </div>
      </div>
    </Link>
  );
}
