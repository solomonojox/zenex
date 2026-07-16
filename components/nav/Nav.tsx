"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, MessageSquare, Wallet, Menu, X, Sparkles } from "lucide-react";

const MOBILE_LINKS: { href: string; label: string }[] = [
  { href: "/", label: "Home" },
  { href: "/search", label: "Search" },
  { href: "/auth", label: "Auth" },
  { href: "/client", label: "Client" },
  { href: "/provider", label: "Provider" },
  { href: "/wallet", label: "Wallet" },
  { href: "/messages", label: "Messages" },
  { href: "/admin", label: "Admin" },
];

export default function Nav() {
  const [mob, setMob] = useState(false);
  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center shadow-sm shadow-teal-200">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className="font-extrabold text-[18px] text-slate-900 tracking-tight" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Zenex<span className="text-teal-600"></span>
          </span>
        </Link>
        <nav className="hidden md:flex items-center gap-1">
          <Link href="/search" className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-teal-700 hover:bg-teal-50 rounded-lg transition-colors">Find Cleaners</Link>
          <Link href="/" className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-teal-700 hover:bg-teal-50 rounded-lg transition-colors">How It Works</Link>
          <Link href="/auth" className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-teal-700 hover:bg-teal-50 rounded-lg transition-colors">Become a Pro</Link>
        </nav>
        <div className="flex items-center gap-2">
          <Link href="/messages" className="relative p-2 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors">
            <MessageSquare className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-teal-500 rounded-full ring-1 ring-white" />
          </Link>
          <Link href="/wallet" className="hidden sm:flex p-2 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors"><Wallet className="w-5 h-5" /></Link>
          <Link href="/client" className="hidden sm:flex items-center gap-1.5 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 rounded-lg transition-colors">
            <div className="w-6 h-6 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 text-xs font-bold">A</div> Alexandra
          </Link>
          <Link href="/search" className="hidden sm:flex items-center gap-2 px-4 py-2 text-sm font-bold bg-teal-600 hover:bg-teal-700 text-white rounded-xl transition-colors shadow-sm shadow-teal-200">
            <Search className="w-3.5 h-3.5" /> Book Now
          </Link>
          <button onClick={() => setMob(!mob)} className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100">
            {mob ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>
      {mob && (
        <div className="md:hidden bg-white border-t border-slate-100 px-4 py-3 grid grid-cols-2 gap-1">
          {MOBILE_LINKS.map((l) => (
            <Link key={l.href} href={l.href} onClick={() => setMob(false)} className="text-left px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-teal-50 hover:text-teal-700 rounded-lg capitalize">
              {l.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
