"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { ArrowRight, Clock3, MapPin, Loader2 } from "lucide-react";
import { apiFetch } from "@/lib/api/client";
import { useAuthStore } from "@/lib/stores/auth.store";

interface NearbyRide {
  _id: string;
  source: {
    name: string;
  };
  destination: {
    name: string;
  };
  departureTime: string;
  price: number;
}

interface UserRide {
  _id: string;
  source: {
    name: string;
  };
  destination: {
    name: string;
  };
  departureTime: string;
}

interface MyRidesResponse {
  success: boolean;
  message: string;
  data: {
    createdRides: UserRide[];
    joinedRides: UserRide[];
  };
}

interface NearbyRidesResponse {
  success: boolean;
  message: string;
  data: {
    rides: NearbyRide[];
    count: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

type LocationState =
  | "loading"
  | "success"
  | "denied"
  | "unavailable"
  | "error";

export default function NearbyRides() {
  const isAuthenticated = useAuthStore(
    (state) => state.isAuthenticated
  );

  const [rides, setRides] = useState<NearbyRide[]>([]);
  const [locationState, setLocationState] =
    useState<LocationState>("loading");

  const [recentRides, setRecentRides] = useState<UserRide[]>([]);
  const [recentActivityState, setRecentActivityState] =
    useState<"loading" | "success" | "error">("loading");

  const fetchNearbyRides = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationState("unavailable");
      return;
    }

    setLocationState("loading");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        try {
          const params = new URLSearchParams({
            lat: String(latitude),
            lng: String(longitude),
            radiusKm: "10",
            page: "1",
            limit: "5",
          });

          const response =
            await apiFetch<NearbyRidesResponse>(
              `/rides/nearby?${params.toString()}`
            );

          setRides(response.data.rides.slice(0, 3));
          setLocationState("success");
        } catch (error) {
          console.error(
            "Failed to fetch nearby rides:",
            error
          );

          setLocationState("error");
        }
      },
      (error) => {
        console.error(
          "Failed to get location:",
          error
        );

        if (error.code === error.PERMISSION_DENIED) {
          setLocationState("denied");
        } else {
          setLocationState("unavailable");
        }
      },
      {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 300000,
      }
    );
  }, []);

  const fetchRecentActivity = useCallback(async () => {
    try {
      const response =
        await apiFetch<MyRidesResponse>(
          "/rides/user/me"
        );
      
      const created = response.data.createdRides ?? [];
      const joined = response.data.joinedRides ?? [];

      const combined = [...created, ...joined]
        .sort(
          (a, b) =>
            new Date(b.departureTime).getTime() -
            new Date(a.departureTime).getTime()
        )
        .slice(0, 2);
      
      setRecentRides(combined);
      setRecentActivityState("success");
    } catch (error) {
      console.error(
        "Failed to fetch recent activity:",
        error
      );
    
      setRecentActivityState("error");
    }
  }, []);

  useEffect(() => {
  fetchNearbyRides();

  if (isAuthenticated) {
      fetchRecentActivity();
    } else {
      setRecentActivityState("success");
      setRecentRides([]);
    }
  }, [
    fetchNearbyRides,
    fetchRecentActivity,
    isAuthenticated,
  ]);

  function formatDepartureTime(
    departureTime: string
  ) {
    const date = new Date(departureTime);

    return date.toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      hour: "numeric",
      minute: "2-digit",
    });
  }

  return (
    <aside className="w-full min-w-0 space-y-6">
      {/* Nearby rides */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <div>
          <div className="flex items-center gap-2">
            <MapPin
              size={18}
              className="text-primary"
            />

            <h2 className="font-sans text-lg font-bold text-secondary">
              Nearby rides
            </h2>
          </div>

          <p className="mt-1 text-xs text-slate-500">
            Journeys starting around you.
          </p>
        </div>

        {/* Loading */}
        {locationState === "loading" && (
          <div className="mt-5 flex items-center justify-center gap-2 py-6 text-sm text-slate-500">
            <Loader2
              size={16}
              className="animate-spin text-primary"
            />
            Finding rides near you...
          </div>
        )}

        {/* Location denied */}
        {locationState === "denied" && (
          <div className="mt-5 rounded-xl bg-neutral p-4 text-center">
            <p className="text-sm font-semibold text-secondary">
              Location access is needed
            </p>

            <p className="mt-1 text-xs leading-5 text-slate-500">
              Allow location access to discover rides
              near you.
            </p>

            <button
              type="button"
              onClick={fetchNearbyRides}
              className="mt-3 text-xs font-bold text-primary hover:text-secondary"
            >
              Try again
            </button>
          </div>
        )}

        {/* Location unavailable */}
        {locationState === "unavailable" && (
          <div className="mt-5 rounded-xl bg-neutral p-4 text-center">
            <p className="text-sm font-semibold text-secondary">
              Location unavailable
            </p>

            <p className="mt-1 text-xs leading-5 text-slate-500">
              We couldn't access your location.
            </p>

            <button
              type="button"
              onClick={fetchNearbyRides}
              className="mt-3 text-xs font-bold text-primary hover:text-secondary"
            >
              Try again
            </button>
          </div>
        )}

        {/* API error */}
        {locationState === "error" && (
          <div className="mt-5 rounded-xl bg-neutral p-4 text-center">
            <p className="text-sm font-semibold text-secondary">
              Couldn't load nearby rides
            </p>

            <button
              type="button"
              onClick={fetchNearbyRides}
              className="mt-3 text-xs font-bold text-primary hover:text-secondary"
            >
              Try again
            </button>
          </div>
        )}

        {/* No rides */}
        {locationState === "success" &&
          rides.length === 0 && (
            <div className="mt-5 rounded-xl bg-neutral p-4 text-center">
              <p className="text-sm font-semibold text-secondary">
                No nearby rides
              </p>

              <p className="mt-1 text-xs text-slate-500">
                There aren't any rides within 10 km
                right now.
              </p>
            </div>
          )}

        {/* Real rides */}
        {locationState === "success" &&
          rides.length > 0 && (
            <div className="mt-4 space-y-3">
              {rides.map((ride) => (
                <Link
                  key={ride._id}
                  href={`/rides/${ride._id}`}
                  className="block rounded-xl border border-slate-100 p-3 transition hover:border-primary/30 hover:bg-neutral"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="truncate font-sans text-sm font-bold text-secondary">
                      {ride.source.name} →{" "}
                      {ride.destination.name}
                    </p>

                    <span className="shrink-0 font-sans text-sm font-bold text-primary">
                      ₹{ride.price}
                    </span>
                  </div>

                  <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-500">
                    <Clock3 size={13} />

                    {formatDepartureTime(
                      ride.departureTime
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
      </section>

      {/* Recent activity */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="flex items-center justify-between">
          <h2 className="font-sans text-lg font-bold text-secondary">
            Recent activity
          </h2>


          <Link
            href="/my-rides"
            className="text-xs font-semibold text-primary hover:text-secondary"
            >
            View all
          </Link>
        </div>

        {!isAuthenticated && (
          <div className="mt-4 rounded-xl bg-neutral p-4 text-center">
            <p className="text-sm font-semibold text-secondary">
              Log in to see your recent activity
            </p>
            <p className="mt-1 text-xs leading-5 text-slate-500">
              Your rides and bookings will appear here.
            </p>
            <Link
              href="/login"
              className="mt-3 inline-flex rounded-lg bg-primary px-4 py-2 text-xs font-bold text-white transition hover:bg-secondary"
            >
              Log in
            </Link>
          </div>
        )}

        {isAuthenticated && recentActivityState === "loading" && (
          <div className="mt-4 py-4 text-center text-xs text-slate-500">
            Loading recent activity...
          </div>
        )}

        {isAuthenticated && recentActivityState === "error" && (
          <div className="mt-4 rounded-xl bg-neutral p-4 text-center">
            <p className="text-sm font-semibold text-secondary">
              Couldn't load recent activity
            </p>
          </div>
        )}

        {isAuthenticated && recentActivityState === "success" &&
          recentRides.length === 0 && (
            <div className="mt-4 rounded-xl bg-neutral p-4 text-center">
              <p className="text-sm font-semibold text-secondary">
                No recent activity
              </p>
          
              <p className="mt-1 text-xs text-slate-500">
                Your recent rides will appear here.
              </p>
            </div>
          )}

        {isAuthenticated && recentActivityState === "success" &&
          recentRides.length > 0 && (
            <div className="mt-4 divide-y divide-slate-100">
              {recentRides.map((ride) => (
                <Link
                  key={ride._id}
                  href={`/rides/${ride._id}`}
                  className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-secondary font-sans text-xs font-bold text-white">
                    R
                  </div>
              
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-sans text-sm font-semibold text-secondary">
                      {ride.source.name}
                    </p>
              
                    <p className="mt-0.5 truncate text-xs text-slate-500">
                      → {ride.destination.name}
                    </p>
                  </div>
              
                  <ArrowRight
                    size={15}
                    className="shrink-0 text-slate-400"
                  />
                </Link>
              ))}
            </div>
          )}
      </section>

    </aside>
  );
}