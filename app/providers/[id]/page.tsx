"use client";

import { useParams } from "next/navigation";
import ProfileHeader from "@/components/profile/ProfileHeader";
import ProfileTabs from "@/components/profile/ProfileTabs";
import { useProvider } from "@/lib/queries/providers";

export default function ProviderProfilePage() {
  const params = useParams();
  const id = String(params.id);
  const { data: provider, isLoading, isError } = useProvider(id);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8FAFB] flex items-center justify-center text-slate-400" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        Loading provider…
      </div>
    );
  }

  if (isError || !provider) {
    return (
      <div className="min-h-screen bg-[#F8FAFB] flex flex-col items-center justify-center gap-2 text-center px-4" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        <p className="font-bold text-slate-700">Provider not found</p>
        <p className="text-sm text-slate-400">This provider may not exist, or the API isn&apos;t running.</p>
        <a href="/search" className="mt-3 text-teal-600 font-bold text-sm">← Back to search</a>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFB]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <ProfileHeader p={provider} />
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <ProfileTabs p={provider} />
      </div>
    </div>
  );
}
