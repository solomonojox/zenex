"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Repeat, Wallet, ChevronRight, MessageSquare } from "lucide-react";
import { useAuth } from "@/context/auth/useAuth";
import { useMyBookings } from "@/lib/queries/bookings";
import StatsGrid from "@/components/client/StatsGrid";
import BookingsList from "@/components/client/BookingsList";
import FavoriteProsList from "@/components/client/FavoriteProsList";
import NotificationsPanel from "@/components/client/NotificationsPanel";
import SubscriptionsList from "@/components/client/SubscriptionsList";

export default function ClientDashboardPage() {
  const router = useRouter();
  const { isAuthenticated, authLoading, user } = useAuth();
  const { data } = useMyBookings();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.replace("/auth?mode=login");
  }, [authLoading, isAuthenticated, router]);

  const bookings = data?.items ?? [];
  const upcoming = bookings
    .filter(
      (b) =>
        new Date(b.scheduledFor) >= new Date() &&
        !["CANCELLED", "COMPLETED"].includes(b.status),
    )
    .sort(
      (a, b) =>
        new Date(a.scheduledFor).getTime() - new Date(b.scheduledFor).getTime(),
    )[0];

  const firstName = user?.firstName || "there";
  const today = new Date().toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  const upcomingProvider = upcoming?.provider?.user
    ? `${upcoming.provider.user.firstName} ${upcoming.provider.user.lastName}`
    : upcoming?.provider?.title ?? "";
  const upcomingImg =
    upcoming?.provider?.imageUrl ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(upcomingProvider || "Zenex")}&background=0D9488&color=fff`;

  return (
    <div className="min-h-screen bg-[#F8FAFB]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="text-xs font-semibold text-slate-400 mb-0.5" style={{ fontFamily: "'Inter', sans-serif" }}>{today}</div>
            <h1 className="text-2xl font-extrabold text-slate-900">Good day, {firstName} 👋</h1>
          </div>
          <Link href="/search" className="flex items-center gap-2 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-sm font-bold rounded-xl transition-colors shadow-sm shadow-teal-200"><Plus className="w-4 h-4" />New Booking</Link>
        </div>

        {upcoming ? (
          <div className="bg-gradient-to-r from-[#0A3D38] to-teal-600 rounded-3xl p-6 mb-6 flex flex-col sm:flex-row items-start sm:items-center gap-5 shadow-xl shadow-teal-200/40">
            <img src={upcomingImg} alt={upcomingProvider} className="w-14 h-14 rounded-2xl object-cover ring-2 ring-white/30 shrink-0" />
            <div className="flex-1">
              <div className="text-xs font-bold text-teal-200 uppercase tracking-widest mb-1">
                Next booking · {new Date(upcoming.scheduledFor).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })}
              </div>
              <div className="font-extrabold text-white text-xl">{upcoming.service?.name ?? "Cleaning"}</div>
              <div className="text-teal-100 text-sm mt-0.5">{upcomingProvider}{upcoming.timeSlot ? ` · ${upcoming.timeSlot}` : ""}</div>
            </div>
            <div className="flex gap-2 shrink-0">
              <Link href="/messages" className="bg-white/15 hover:bg-white/25 text-white text-xs font-bold px-3 py-2 rounded-xl transition-colors flex items-center gap-1.5"><MessageSquare className="w-3.5 h-3.5" />Message</Link>
              <Link href={`/providers/${upcoming.providerId}`} className="bg-white text-teal-700 text-xs font-bold px-3 py-2 rounded-xl hover:bg-teal-50 transition-colors">View Pro</Link>
            </div>
          </div>
        ) : (
          <div className="bg-gradient-to-r from-[#0A3D38] to-teal-600 rounded-3xl p-6 mb-6 flex flex-col sm:flex-row items-center gap-5 shadow-xl shadow-teal-200/40">
            <div className="flex-1">
              <div className="font-extrabold text-white text-xl">No upcoming bookings</div>
              <div className="text-teal-100 text-sm mt-0.5">Book a vetted cleaner in under 3 minutes.</div>
            </div>
            <Link href="/search" className="bg-white text-teal-700 text-sm font-bold px-4 py-2.5 rounded-xl hover:bg-teal-50 transition-colors shrink-0">Find a cleaner</Link>
          </div>
        )}

        <StatsGrid />

        <div className="grid lg:grid-cols-[1fr_300px] gap-6">
          <div>
            <h2 className="font-extrabold text-slate-900 text-lg mb-4">Bookings</h2>
            <BookingsList />

            <h2 className="font-extrabold text-slate-900 text-lg mb-4">Favourite Pros</h2>
            <FavoriteProsList />

            <h2 className="font-extrabold text-slate-900 text-lg mb-4 mt-7">My Plans</h2>
            <SubscriptionsList />
          </div>

          <div className="space-y-4">
            <NotificationsPanel />
            <div className="bg-gradient-to-br from-teal-600 to-emerald-600 rounded-2xl p-5 text-white">
              <div className="flex items-center gap-1.5 mb-2"><Repeat className="w-4 h-4 text-teal-200" /><span className="text-xs font-black text-teal-100 uppercase tracking-wide">Save 15%</span></div>
              <h3 className="font-extrabold text-lg mb-1">Recurring clean plan</h3>
              <p className="text-teal-100 text-xs mb-4">Set up weekly or bi-weekly cleans with a dedicated pro.</p>
              <Link href="/search" className="block text-center w-full bg-white text-teal-700 font-bold py-2.5 rounded-xl text-sm hover:bg-teal-50 transition-colors">Browse Pros</Link>
            </div>
            <Link href="/wallet" className="w-full bg-white rounded-2xl p-4 ring-1 ring-black/[0.06] flex items-center gap-3 hover:shadow-md transition-shadow text-left">
              <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0"><Wallet className="w-5 h-5" /></div>
              <div><div className="font-bold text-sm text-slate-900">Zenex Wallet</div><div className="text-xs text-slate-500">View payments & invoices</div></div>
              <ChevronRight className="w-4 h-4 text-slate-300 ml-auto shrink-0" />
            </Link>
          </div>
        </div>
      </div>
      <div className="h-24" />
    </div>
  );
}
