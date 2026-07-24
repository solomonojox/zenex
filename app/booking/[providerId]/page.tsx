"use client";

import { useParams } from "next/navigation";
import BookingFlow from "@/components/booking/BookingFlow";
import { useProvider } from "@/lib/queries/providers";

export default function BookingPage() {
  const params = useParams();
  const providerId = String(params.providerId);
  const { data: provider, isLoading, isError } = useProvider(providerId);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8FAFB] flex items-center justify-center text-slate-400" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        Loading…
      </div>
    );
  }

  if (isError || !provider) {
    return (
      <div className="min-h-screen bg-[#F8FAFB] flex flex-col items-center justify-center gap-2 text-center px-4" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        <p className="font-bold text-slate-700">Provider not found</p>
        <a href="/search" className="mt-2 text-teal-600 font-bold text-sm">← Back to search</a>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFB]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <BookingFlow provider={provider} />
      <div className="h-24" />
    </div>
  );
}
