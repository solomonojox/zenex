import Hero from "@/components/landing/Hero";
import InstantQuote from "@/components/landing/InstantQuote";
import TrustBar from "@/components/landing/TrustBar";
import CityTabs from "@/components/landing/CityTabs";
import ServiceCategories from "@/components/landing/ServiceCategories";
import AIMatchBanner from "@/components/landing/AIMatchBanner";
import FeaturedProviders from "@/components/landing/FeaturedProviders";
import HowItWorks from "@/components/landing/HowItWorks";
import SubscriptionPlans from "@/components/landing/SubscriptionPlans";
import Testimonials from "@/components/landing/Testimonials";
import DualCTA from "@/components/landing/DualCTA";
import Footer from "@/components/landing/Footer";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFB]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <Hero />
      {/* Primary conversion path: price from property size, no browsing. */}
      <InstantQuote />
      <TrustBar />
      <CityTabs />
      <ServiceCategories />
      <AIMatchBanner />
      <FeaturedProviders />
      <HowItWorks />
      <SubscriptionPlans />
      <Testimonials />
      <DualCTA />
      <Footer />
      <div className="h-24" />
    </div>
  );
}
