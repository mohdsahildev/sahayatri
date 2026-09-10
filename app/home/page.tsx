import Navbar from "@/components/layout/navbar";
import HomeView from "@/components/home/home-view";
import RecentActivitySection from "@/components/home/recent-activity";
import ScenicRouteTeaser from "@/components/home/scenic-route-teaser";
import { getRides, mapApiRideToRide } from "@/lib/api/rides";

interface HomePageProps {
  searchParams: Promise<{
    from?: string;
    to?: string;
    date?: string;
    timeFrom?: string;
    timeTo?: string;
    minPrice?: string;
    maxPrice?: string;
    minSeats?: string;
    vehicleType?: string;
    sort?: string;
    page?: string;
  }>;
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const params = await searchParams;
  const rideData = await getRides(params);
  const rides = rideData.rides.map(mapApiRideToRide);

  return (
    <div className="min-h-screen bg-[#FAF8F5] font-sans text-[#1E2022]">
      <Navbar />

      <main className="mx-auto max-w-[1240px] px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <HomeView
          rides={rides}
          page={rideData.page}
          totalPages={rideData.totalPages}
          searchParams={params}
        />

        {/* Compact Recent Activity Section */}
        <RecentActivitySection />

        {/* Take the Scenic Route Mini-Game Teaser */}
        <ScenicRouteTeaser />
      </main>
    </div>
  );
}