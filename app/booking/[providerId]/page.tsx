import { notFound } from "next/navigation";
import { getProviderById } from "@/lib/data";
import BookingFlow from "@/components/booking/BookingFlow";

export default async function BookingPage({ params }: { params: Promise<{ providerId: string }> }) {
  const { providerId } = await params;
  const provider = getProviderById(Number(providerId));
  if (!provider) notFound();

  return (
    <div className="min-h-screen bg-[#F8FAFB]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <BookingFlow provider={provider} />
      <div className="h-24" />
    </div>
  );
}
