"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, MessageSquare, Wallet, Menu, X, Sparkles, LogOut } from "lucide-react";
import { useAuth } from "@/context/auth/useAuth";
import NotificationBell from "./NotificationBell";

/** Mobile menu built for the signed-in user — no links to other roles' areas. */
function mobileLinks(isAuthenticated: boolean, role?: string) {
  const links = [
    { href: "/", label: "Home" },
    { href: "/search", label: "Find Cleaners" },
    { href: "/#how-it-works", label: "How It Works" },
  ];

  if (!isAuthenticated) {
    return [
      ...links,
      { href: "/auth?mode=login", label: "Sign in" },
      { href: "/auth?mode=signup&role=provider", label: "Become a Pro" },
    ];
  }

  if (role === "ADMIN") links.push({ href: "/admin", label: "Admin" });
  else if (role === "PROVIDER") links.push({ href: "/provider", label: "Dashboard" });
  else links.push({ href: "/client", label: "My Bookings" });

  links.push(
    { href: "/messages", label: "Messages" },
    { href: "/wallet", label: "Wallet" },
  );
  return links;
}

function dashboardFor(role?: string) {
  if (role === "PROVIDER") return "/provider";
  if (role === "ADMIN") return "/admin";
  return "/client";
}

export default function Nav() {
  const [mob, setMob] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();

  const displayName =
    user?.firstName || user?.email?.split("@")[0] || "Account";
  const initial = (user?.firstName || user?.email || "?")
    .charAt(0)
    .toUpperCase();

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
          <Link href="/#how-it-works" className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-teal-700 hover:bg-teal-50 rounded-lg transition-colors">How It Works</Link>
          {/* Recruitment link — pointless once signed in, and clicking it as a
              client would try to re-register the same email. */}
          {!isAuthenticated && (
            <Link href="/auth?mode=signup&role=provider" className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-teal-700 hover:bg-teal-50 rounded-lg transition-colors">Become a Pro</Link>
          )}
        </nav>
        <div className="flex items-center gap-2">
          {isAuthenticated ? (
            <>
              <NotificationBell />
              <Link href="/messages" className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors">
                <MessageSquare className="w-5 h-5" />
              </Link>
              <Link href="/wallet" className="hidden sm:flex p-2 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors"><Wallet className="w-5 h-5" /></Link>
              <Link href={dashboardFor(user?.role)} className="hidden sm:flex items-center gap-1.5 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 rounded-lg transition-colors">
                <div className="w-6 h-6 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 text-xs font-bold">{initial}</div> {displayName}
              </Link>
              <button onClick={logout} title="Sign out" className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors"><LogOut className="w-5 h-5" /></button>
            </>
          ) : (
            <>
              <Link href="/auth?mode=login" className="hidden sm:flex px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 rounded-lg transition-colors">Sign in</Link>
              <Link href="/search" className="flex items-center gap-2 px-4 py-2 text-sm font-bold bg-teal-600 hover:bg-teal-700 text-white rounded-xl transition-colors shadow-sm shadow-teal-200">
                <Search className="w-3.5 h-3.5" /> Book Now
              </Link>
            </>
          )}
          <button onClick={() => setMob(!mob)} className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100">
            {mob ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>
      {mob && (
        <div className="md:hidden bg-white border-t border-slate-100 px-4 py-3 grid grid-cols-2 gap-1">
          {mobileLinks(isAuthenticated, user?.role).map((l) => (
            <Link key={l.href} href={l.href} onClick={() => setMob(false)} className="text-left px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-teal-50 hover:text-teal-700 rounded-lg capitalize">
              {l.label}
            </Link>
          ))}
          {isAuthenticated && (
            <button onClick={() => { setMob(false); logout(); }} className="text-left px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 rounded-lg">
              Sign out
            </button>
          )}
        </div>
      )}
    </header>
  );
}
