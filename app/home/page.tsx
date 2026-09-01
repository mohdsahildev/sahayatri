import Navbar from "@/components/layout/navbar";
import HeroSection from "@/components/home/hero-section";
import RideSearch from "@/components/home/ride-search";
import PostRideCta from "@/components/home/post-ride-cta";
import RideFilters from "@/components/home/ride-filters";
import RideFeed from "@/components/home/ride-feed";
import NearbyRides from "@/components/home/nearby-rides";
import {
  getRides,
  mapApiRideToRide,
} from "@/lib/api/rides";

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

export default async function HomePage({
  searchParams,
}: HomePageProps) {
  const params = await searchParams;

  const rideData = await getRides(params);

  const rides = rideData.rides.map(mapApiRideToRide);

  return (
    <>
      <Navbar />

      <main className="mx-auto w-full max-w-[1440px] px-5 pb-16 sm:px-8 lg:px-10">
        <HeroSection />
        <RideSearch />
        <PostRideCta />
        <RideFilters />

        <div className="mt-6 grid min-w-0 grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_380px]">
          <div className="min-w-0">
            <RideFeed
              rides={rides}
              page={rideData.page}
              totalPages={rideData.totalPages}
              searchParams={params}
            />
          </div>

          <div className="min-w-0">
            <NearbyRides />
          </div>
        </div>
      </main>
    </>
  );
}