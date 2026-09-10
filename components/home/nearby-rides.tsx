"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Clock3, Compass, Loader2, ArrowRight } from "lucide-react";
import { apiFetch } from "@/lib/api/client";

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
  const [rides, setRides] = useState<NearbyRide[]>([]);
  const [locationState, setLocationState] = useState<LocationState>("loading");
  const [expanded, setExpanded] = useState(false);

  const fetchNearbyRides = useCallback(() => {
    if (typeof window === "undefined" || !navigator.geolocation) {
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

          const response = await apiFetch<NearbyRidesResponse>(
            `/rides/nearby?${params.toString()}`
          );

          setRides(response.data.rides.slice(0, 3));
          setLocationState("success");
        } catch (error) {
          console.error("Failed to fetch nearby rides:", error);
          setLocationState("error");
        }
      },
      (error) => {
        console.error("Failed to get location:", error);
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

  useEffect(() => {
    fetchNearbyRides();
  }, [fetchNearbyRides]);

  function formatDepartureTime(departureTime: string) {
    const date = new Date(departureTime);
    return date.toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      hour: "numeric",
      minute: "2-digit",
    });
  }

  return (
    <section className="mt-4">
      {/* Banner Strip matching Stitch design */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-2xl border border-[#F5E6D3] bg-[#FFF8F0] px-4 py-3 text-xs font-semibold text-[#8C4A27] shadow-xs">
        <div className="flex items-center gap-2.5">
          <Compass size={16} className="shrink-0 text-[#C8522E]" />
          <span>
            <strong className="font-bold text-[#C8522E]">Nearby rides</strong> ·{" "}
            {locationState === "loading"
              ? "Scanning location for nearby departures..."
              : locationState === "success" && rides.length > 0
              ? `${rides.length} rides are departing near your selected location.`
              : "Discover rides starting near your current coordinates."}
          </span>
        </div>

        <button
          type="button"
          onClick={() => setExpanded((prev) => !prev)}
          className="inline-flex items-center gap-1 font-bold text-[#C8522E] hover:underline self-start sm:self-auto shrink-0"
        >
          <span>{expanded ? "Hide closest" : "View closest"}</span>
          <ArrowRight size={14} />
        </button>
      </div>

      {/* Expanded list or states */}
      {expanded && (
        <div className="mt-3 rounded-2xl border border-[#EAE6DF] bg-white p-4 shadow-xs">
          {locationState === "loading" && (
            <div className="flex items-center justify-center gap-2 py-4 text-xs font-semibold text-slate-500">
              <Loader2 size={15} className="animate-spin text-[#C8522E]" />
              Finding nearby departures...
            </div>
          )}

          {locationState === "denied" && (
            <div className="p-3 text-center text-xs">
              <p className="font-bold text-[#1E2022]">Location Permission Denied</p>
              <p className="mt-0.5 text-slate-500">Enable location access to view rides nearby.</p>
              <button
                type="button"
                onClick={fetchNearbyRides}
                className="mt-2 font-bold text-[#C8522E] underline"
              >
                Retry Location Request
              </button>
            </div>
          )}

          {locationState === "unavailable" && (
            <div className="p-3 text-center text-xs text-slate-500">
              Location services are unavailable on this device.
            </div>
          )}

          {locationState === "error" && (
            <div className="p-3 text-center text-xs text-slate-500">
              Unable to load nearby rides right now.
            </div>
          )}

          {locationState === "success" && rides.length === 0 && (
            <div className="p-3 text-center text-xs text-slate-500">
              No active rides found within 10 km radius right now.
            </div>
          )}

          {locationState === "success" && rides.length > 0 && (
            <div className="grid gap-2 sm:grid-cols-3">
              {rides.map((ride) => (
                <Link
                  key={ride._id}
                  href={`/rides/${ride._id}`}
                  className="block rounded-xl border border-[#EAE6DF] bg-[#FAF8F5] p-3 transition hover:border-[#C8522E]"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate font-sans text-xs font-bold text-[#1E2022]">
                      {ride.source.name} → {ride.destination.name}
                    </p>
                    <span className="font-bold text-[#C8522E]">₹{ride.price}</span>
                  </div>

                  <div className="mt-2 flex items-center gap-1 text-[11px] text-slate-500">
                    <Clock3 size={12} />
                    <span>{formatDepartureTime(ride.departureTime)}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
}