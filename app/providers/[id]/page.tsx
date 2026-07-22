import { notFound } from "next/navigation";
import { getProviderById } from "@/lib/data";
import ProfileHeader from "@/components/profile/ProfileHeader";
import ProfileTabs from "@/components/profile/ProfileTabs";

export default async function ProviderProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const provider = getProviderById(Number(id));
  if (!provider) notFound();

  return (
    <div className="min-h-screen bg-[#F8FAFB]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <ProfileHeader p={provider} />
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <ProfileTabs p={provider} />
      </div>
    </div>
  );
}
