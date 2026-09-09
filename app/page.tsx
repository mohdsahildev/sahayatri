import LandingNavbar from "@/components/landing/landing-navbar";
import LandingHero from "@/components/landing/landing-hero";
import LandingSearchPreview from "@/components/landing/landing-search-preview";
import LandingTrustStrip from "@/components/landing/landing-trust-strip";
import LandingHowItWorks from "@/components/landing/landing-how-it-works";
import LandingTestimonial from "@/components/landing/landing-testimonial";
import LandingPopularRoutes from "@/components/landing/landing-popular-routes";
import LandingCoreBenefits from "@/components/landing/landing-core-benefits";
import LandingSafetySection from "@/components/landing/landing-safety-section";
import LandingFinalCta from "@/components/landing/landing-final-cta";
import LandingFooter from "@/components/landing/landing-footer";

import { getRides, mapApiRideToRide } from "@/lib/api/rides";
import type { Ride } from "@/components/home/ride-card";

export const revalidate = 60; // Refresh live route list every 60s

export default async function LandingPage() {
  let rides: Ride[] = [];

  try {
    const rideData = await getRides({ limit: "3" });
    if (rideData?.rides) {
      rides = rideData.rides.map(mapApiRideToRide);
    }
  } catch {
    // If backend isn't responding during static generation, gracefully fallback
    rides = [];
  }

  return (
    <div className="min-h-screen bg-[#FBF9F5] text-[#1E2022] font-body selection:bg-[#C8522E] selection:text-white">
      {/* Navbar */}
      <LandingNavbar />

      {/* Main Content Sections */}
      <main className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
        <LandingHero />
        <LandingSearchPreview />
        <LandingTrustStrip />
        <LandingHowItWorks />
        <LandingTestimonial />
        <LandingPopularRoutes rides={rides} />
        <LandingCoreBenefits />
        <LandingSafetySection />
        <LandingFinalCta />
      </main>

      {/* Footer */}
      <LandingFooter />
    </div>
  );
}