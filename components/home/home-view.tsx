"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import HeroMap from "./hero-map";
import RideSearch from "./ride-search";
import NearbyRides from "./nearby-rides";
import RideFilters from "./ride-filters";
import RideFeed from "./ride-feed";
import type { Ride } from "./ride-card";
import { getSocket } from "@/lib/socket";

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
  const router = useRouter();
  const from = searchParams.from;
  const to = searchParams.to;

  useEffect(() => {
    const socket = getSocket();

    const handleRefresh = () => {
      router.refresh();
    };

    socket.on("ride_created", handleRefresh);
    socket.on("ride_updated", handleRefresh);
    socket.on("ride_cancelled", handleRefresh);

    return () => {
      socket.off("ride_created", handleRefresh);
      socket.off("ride_updated", handleRefresh);
      socket.off("ride_cancelled", handleRefresh);
    };
  }, [router]);

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
