"use client";

import { useState } from "react";
import { Phone, MoreVertical, Paperclip, Send } from "lucide-react";
import type { ApiThread, ApiMessage } from "@/lib/api/messages";

function avatar(name: string) {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0D9488&color=fff`;
}

function fmtTime(iso: string) {
  try {
    return new Date(iso).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
  } catch {
    return "";
  }
}

export default function ChatWindow({
  thread, messages, myId, onSend, sending, loading,
}: {
  thread: ApiThread | null;
  messages: ApiMessage[];
  myId?: string;
  onSend: (text: string) => void;
  sending?: boolean;
  loading?: boolean;
}) {
  const [msg, setMsg] = useState("");

  const send = () => {
    if (!msg.trim()) return;
    onSend(msg.trim());
    setMsg("");
  };

  if (!thread) {
    return (
      <div className="flex-1 flex items-center justify-center text-slate-400 text-sm">
        Select a conversation to start messaging.
      </div>
    );
  }

  const name = thread.counterpart?.name ?? "Conversation";
  const img = thread.counterpart?.image || avatar(name);

  return (
    <div className="flex-1 flex flex-col min-w-0">
      <div className="bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3"><img src={img} alt={name} className="w-9 h-9 rounded-full object-cover" /><div><div className="font-bold text-sm text-slate-900">{name}</div><div className="text-xs text-emerald-500 font-semibold">Online</div></div></div>
        <div className="flex items-center gap-2"><button className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors"><Phone className="w-4 h-4" /></button><button className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors"><MoreVertical className="w-4 h-4" /></button></div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
        {loading ? (
          <div className="flex items-center justify-center h-full text-slate-400 text-sm">Loading…</div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-slate-400 text-sm">No messages yet. Say hello 👋</div>
        ) : (
          messages.map((m) => {
            const mine = m.senderId === myId;
            return (
              <div key={m.id} className={`flex gap-3 ${mine ? "flex-row-reverse" : ""}`}>
                {!mine && <img src={img} alt="" className="w-8 h-8 rounded-full object-cover shrink-0 mt-1" />}
                <div className={`max-w-xs lg:max-w-sm flex flex-col gap-1 ${mine ? "items-end" : "items-start"}`}>
                  <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${mine ? "bg-teal-600 text-white rounded-tr-sm" : "bg-white ring-1 ring-black/[0.06] text-slate-800 rounded-tl-sm shadow-sm"}`} style={{ fontFamily: "'Inter',sans-serif" }}>{m.body}</div>
                  <span className="text-xs text-slate-400">{fmtTime(m.createdAt)}</span>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="bg-white border-t border-slate-100 px-4 py-3 flex items-end gap-3 shrink-0">
        <button className="p-2.5 rounded-xl hover:bg-slate-100 text-slate-400 transition-colors shrink-0"><Paperclip className="w-5 h-5" /></button>
        <div className="flex-1 bg-slate-50 rounded-xl px-4 py-2.5 ring-1 ring-slate-200 focus-within:ring-teal-300 transition-all flex items-end gap-2">
          <textarea
            value={msg}
            onChange={(e) => setMsg(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
            placeholder="Type a message…"
            rows={1}
            className="flex-1 bg-transparent text-sm text-slate-800 outline-none resize-none placeholder:text-slate-400"
            style={{ fontFamily: "'Inter',sans-serif" }}
          />
        </div>
        <button onClick={send} disabled={!msg.trim() || sending} className="p-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white transition-colors disabled:opacity-40 shrink-0"><Send className="w-5 h-5" /></button>
      </div>
    </div>
  );
}
