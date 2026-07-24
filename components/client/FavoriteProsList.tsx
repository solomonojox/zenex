"use client";

import Link from "next/link";
import { Star } from "lucide-react";
import { useFavorites } from "@/lib/queries/favorites";

export default function FavoriteProsList() {
  const { data: favorites = [], isLoading } = useFavorites();

  if (isLoading) {
    return (
      <div className="grid sm:grid-cols-2 gap-3">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="h-20 rounded-2xl bg-slate-100 animate-pulse" />
        ))}
      </div>
    );
  }

  if (favorites.length === 0) {
    return (
      <p className="text-sm text-slate-400">
        No favourites yet — tap the heart on a provider to save them.
      </p>
    );
  }

  return (
    <div className="grid sm:grid-cols-2 gap-3">
      {favorites.map(({ id, provider: p }) => (
        <Link key={id} href={`/providers/${p.id}`} className="bg-white rounded-2xl p-4 ring-1 ring-black/[0.06] flex items-center gap-3 hover:shadow-md transition-shadow text-left">
          <img src={p.image} alt={p.name} className="w-12 h-12 rounded-xl object-cover shrink-0" />
          <div className="flex-1 min-w-0"><div className="font-bold text-sm text-slate-900 truncate">{p.name}</div><div className="flex items-center gap-1 text-xs mt-0.5"><Star className="w-3 h-3 fill-amber-400 text-amber-400" />{p.rating} · ${p.price}/hr</div></div>
          <span className="shrink-0 px-3 py-1.5 bg-teal-50 text-teal-700 text-xs font-bold rounded-lg hover:bg-teal-100 transition-colors">Book</span>
        </Link>
      ))}
    </div>
  );
}
