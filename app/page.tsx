import Navbar from "@/components/layout/navbar";
import HeroSection from "@/components/home/hero-section";
import RideSearch from "@/components/home/ride-search";
import PostRideCta from "@/components/home/post-ride-cta";
import RideFilters from "@/components/home/ride-filters";
import RideFeed from "@/components/home/ride-feed";
import NearbyRides from "@/components/home/nearby-rides";

export default function HomePage() {
  return (
    <>
      <Navbar />

      <main className="mx-auto w-full max-w-[1440px] px-5 pb-16 sm:px-8 lg:px-10">
        <HeroSection />
        <RideSearch />
        <PostRideCta />
        <RideFilters />

        <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
          <RideFeed />
          <NearbyRides />
        </div>
      </main>
    </>
  );
}