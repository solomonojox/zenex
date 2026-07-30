"use client";

import { Search } from "lucide-react";
import type { ApiThread } from "@/lib/api/messages";

function avatar(name: string) {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0D9488&color=fff`;
}

function fmt(iso: string) {
  try {
    return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" });
  } catch {
    return "";
  }
}

export default function ThreadList({
  threads, activeId, onSelect, loading,
}: {
  threads: ApiThread[];
  activeId: string | null;
  onSelect: (id: string) => void;
  loading?: boolean;
}) {
  return (
    <div className="w-72 shrink-0 bg-white border-r border-slate-100 flex flex-col">
      <div className="p-4 border-b border-slate-100">
        <div className="flex items-center gap-2 bg-slate-50 rounded-xl px-3 py-2 ring-1 ring-slate-100"><Search className="w-4 h-4 text-slate-400 shrink-0" /><input placeholder="Search…" className="bg-transparent text-sm outline-none text-slate-700 w-full" /></div>
      </div>
      <div className="flex-1 overflow-y-auto">
        {loading && (
          <div className="p-4 space-y-3">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-12 rounded-xl bg-slate-100 animate-pulse" />)}</div>
        )}
        {!loading && threads.length === 0 && (
          <p className="text-sm text-slate-400 text-center p-6">No conversations yet.</p>
        )}
        {threads.map((t) => {
          const name = t.counterpart?.name ?? "Conversation";
          const img = t.counterpart?.image || avatar(name);
          return (
            <button key={t.id} onClick={() => onSelect(t.id)} className={`w-full flex items-center gap-3 p-4 text-left border-b border-slate-50 hover:bg-slate-50 transition-colors ${activeId === t.id ? "bg-teal-50 border-l-[3px] border-l-teal-500" : ""}`}>
              <img src={img} alt={name} className="w-11 h-11 rounded-full object-cover shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline"><span className="text-sm font-bold truncate text-slate-800">{name}</span><span className="text-xs text-slate-400 shrink-0 ml-1">{fmt(t.lastMessageAt)}</span></div>
                <p className="text-xs text-slate-400 truncate mt-0.5">{t.lastPreview || "No messages yet"}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
