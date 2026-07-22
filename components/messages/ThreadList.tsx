"use client";

import { Search } from "lucide-react";
import type { MessageThread } from "@/lib/types";

export default function ThreadList({
  threads, activeId, onSelect,
}: { threads: MessageThread[]; activeId: number; onSelect: (id: number) => void }) {
  return (
    <div className="w-72 shrink-0 bg-white border-r border-slate-100 flex flex-col">
      <div className="p-4 border-b border-slate-100">
        <div className="flex items-center gap-2 bg-slate-50 rounded-xl px-3 py-2 ring-1 ring-slate-100"><Search className="w-4 h-4 text-slate-400 shrink-0" /><input placeholder="Search…" className="bg-transparent text-sm outline-none text-slate-700 w-full" /></div>
      </div>
      <div className="flex-1 overflow-y-auto">
        {threads.map((m) => (
          <button key={m.id} onClick={() => onSelect(m.id)} className={`w-full flex items-center gap-3 p-4 text-left border-b border-slate-50 hover:bg-slate-50 transition-colors ${activeId === m.id ? "bg-teal-50 border-l-[3px] border-l-teal-500" : ""}`}>
            <div className="relative shrink-0">
              <img src={m.img} alt={m.name} className="w-11 h-11 rounded-full object-cover" />
              {m.unread > 0 && <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-teal-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">{m.unread}</span>}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-baseline"><span className={`text-sm font-bold truncate ${m.unread ? "text-slate-900" : "text-slate-600"}`}>{m.name}</span><span className="text-xs text-slate-400 shrink-0 ml-1">{m.time}</span></div>
              <p className="text-xs text-slate-400 truncate mt-0.5">{m.preview}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
