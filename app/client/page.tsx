import Link from "next/link";
import { Bell, Plus, Repeat, Wallet, ChevronRight, MessageSquare } from "lucide-react";
import { PROVIDERS } from "@/lib/data";
import StatsGrid from "@/components/client/StatsGrid";
import BookingsList from "@/components/client/BookingsList";
import FavoriteProsList from "@/components/client/FavoriteProsList";
import NotificationsPanel from "@/components/client/NotificationsPanel";

export default function ClientDashboardPage() {
  const nextProvider = PROVIDERS[0];

  return (
    <div className="min-h-screen bg-[#F8FAFB]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="text-xs font-semibold text-slate-400 mb-0.5" style={{ fontFamily: "'Inter', sans-serif" }}>Wednesday, July 2</div>
            <h1 className="text-2xl font-extrabold text-slate-900">Good morning, Alexandra 👋</h1>
          </div>
          <div className="flex items-center gap-2">
            <button className="relative p-2.5 rounded-xl ring-1 ring-slate-200 bg-white text-slate-500 hover:text-teal-600 transition-colors"><Bell className="w-5 h-5" /><span className="absolute top-2 right-2 w-2 h-2 bg-teal-500 rounded-full ring-1 ring-white" /></button>
            <Link href="/search" className="flex items-center gap-2 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-sm font-bold rounded-xl transition-colors shadow-sm shadow-teal-200"><Plus className="w-4 h-4" />New Booking</Link>
          </div>
        </div>

        <div className="bg-gradient-to-r from-[#0A3D38] to-teal-600 rounded-3xl p-6 mb-6 flex flex-col sm:flex-row items-start sm:items-center gap-5 shadow-xl shadow-teal-200/40">
          <img src={nextProvider.image} alt={nextProvider.name} className="w-14 h-14 rounded-2xl object-cover ring-2 ring-white/30 shrink-0" />
          <div className="flex-1">
            <div className="text-xs font-bold text-teal-200 uppercase tracking-widest mb-1">Next booking · Fri Jul 4</div>
            <div className="font-extrabold text-white text-xl">Deep Home Clean</div>
            <div className="text-teal-100 text-sm mt-0.5">{nextProvider.name} · 9:00 AM – 1:00 PM</div>
          </div>
          <div className="flex gap-2 shrink-0">
            <Link href={`/messages?thread=${nextProvider.id}`} className="bg-white/15 hover:bg-white/25 text-white text-xs font-bold px-3 py-2 rounded-xl transition-colors flex items-center gap-1.5"><MessageSquare className="w-3.5 h-3.5" />Message</Link>
            <Link href={`/booking/${nextProvider.id}`} className="bg-white text-teal-700 text-xs font-bold px-3 py-2 rounded-xl hover:bg-teal-50 transition-colors">Manage</Link>
          </div>
        </div>

        <StatsGrid />

        <div className="grid lg:grid-cols-[1fr_300px] gap-6">
          <div>
            <h2 className="font-extrabold text-slate-900 text-lg mb-4">Bookings</h2>
            <BookingsList />

            <h2 className="font-extrabold text-slate-900 text-lg mb-4">Favourite Pros</h2>
            <FavoriteProsList />
          </div>

          <div className="space-y-4">
            <NotificationsPanel />
            <div className="bg-gradient-to-br from-teal-600 to-emerald-600 rounded-2xl p-5 text-white">
              <div className="flex items-center gap-1.5 mb-2"><Repeat className="w-4 h-4 text-teal-200" /><span className="text-xs font-black text-teal-100 uppercase tracking-wide">Save 15%</span></div>
              <h3 className="font-extrabold text-lg mb-1">Recurring clean plan</h3>
              <p className="text-teal-100 text-xs mb-4">Set up weekly or bi-weekly cleans with a dedicated pro.</p>
              <Link href={`/booking/${nextProvider.id}`} className="block text-center w-full bg-white text-teal-700 font-bold py-2.5 rounded-xl text-sm hover:bg-teal-50 transition-colors">Set Up Plan</Link>
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
