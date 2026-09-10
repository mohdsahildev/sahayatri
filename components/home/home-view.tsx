"use client";

import HeroMap from "./hero-map";
import RideSearch from "./ride-search";
import NearbyRides from "./nearby-rides";
import RideFilters from "./ride-filters";
import RideFeed from "./ride-feed";
import type { Ride } from "./ride-card";

interface HomeViewProps {
  rides: Ride[];
  page: number;
  totalPages: number;
  searchParams: Record<string, string | undefined>;
}

export default function HomeView({
  rides,
  page,
  totalPages,
  searchParams,
}: HomeViewProps) {
  const from = searchParams.from;
  const to = searchParams.to;

  return (
    <div className="space-y-6">
      {/* Large Map Section at the Top */}
      <HeroMap
        rides={rides}
        from={from}
        to={to}
      />

      {/* Where are you going? Search Section */}
      <RideSearch />

      {/* Nearby Rides Strip */}
      <NearbyRides />

      {/* Available Rides Header & Filters Bar */}
      <RideFilters totalRides={rides.length} from={from} to={to} />

      {/* Available Rides Feed */}
      <RideFeed
        rides={rides}
        page={page}
        totalPages={totalPages}
        searchParams={searchParams}
      />
    </div>
  );
}
