"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home, Lock, Search, User, Calendar, CreditCard, BarChart2,
  MessageSquare, Wallet, ShieldCheck,
} from "lucide-react";

// Quick-navigation bar for jumping between the app's main screens during
// development / demoing. Safe to delete once real in-app navigation
// (menus, links, redirects after actions) covers these paths.
const SCREENS: { href: string; label: string; Icon: typeof Home; match: (path: string) => boolean }[] = [
  { href: "/", label: "Home", Icon: Home, match: (p) => p === "/" },
  { href: "/auth", label: "Auth", Icon: Lock, match: (p) => p.startsWith("/auth") },
  { href: "/search", label: "Search", Icon: Search, match: (p) => p.startsWith("/search") },
  { href: "/providers/1", label: "Profile", Icon: User, match: (p) => p.startsWith("/providers") },
  { href: "/booking/1", label: "Book", Icon: Calendar, match: (p) => p.startsWith("/booking") },
  { href: "/client", label: "Client", Icon: CreditCard, match: (p) => p.startsWith("/client") },
  { href: "/provider", label: "Provider", Icon: BarChart2, match: (p) => p.startsWith("/provider") && !p.startsWith("/providers") },
  { href: "/messages", label: "Chat", Icon: MessageSquare, match: (p) => p.startsWith("/messages") },
  { href: "/wallet", label: "Wallet", Icon: Wallet, match: (p) => p.startsWith("/wallet") },
  { href: "/admin", label: "Admin", Icon: ShieldCheck, match: (p) => p.startsWith("/admin") },
];

export default function DemoBar() {
  const pathname = usePathname();
  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 bg-slate-900/96 backdrop-blur-xl rounded-2xl shadow-2xl px-2 py-2 flex items-center gap-0.5 max-w-[96vw] overflow-x-auto">
      {SCREENS.map(({ href, label, Icon, match }) => {
        const active = match(pathname);
        return (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              active ? "bg-teal-500 text-white shadow-sm" : "text-slate-400 hover:text-white hover:bg-slate-700"
            }`}
          >
            <Icon className="w-3.5 h-3.5" />{label}
          </Link>
        );
      })}
    </div>
  );
}
