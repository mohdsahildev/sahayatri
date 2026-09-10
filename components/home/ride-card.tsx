import Link from "next/link";
import { CheckCircle2, Star } from "lucide-react";

export interface Ride {
  id: string;
  driver: {
    id: string;
    name: string;
    rating: number;
    rides: number;
    verified: boolean;
  };
  from: string;
  to: string;
  sourceLat?: number;
  sourceLng?: number;
  destLat?: number;
  destLng?: number;
  date: string;
  time: string;
  seatsAvailable: number;
  price: number;
  description?: string;
  vehicleModel?: string;
  duration?: string;
}

interface RideCardProps {
  ride: Ride;
  isHighlighted?: boolean;
}

export default function RideCard({
  ride,
  isHighlighted = false,
}: RideCardProps) {
  const driverInitials = ride.driver.name
    .split(" ")
    .map((n) => n.charAt(0).toUpperCase())
    .slice(0, 2)
    .join("");

  const seatsText = `${ride.seatsAvailable} ${ride.seatsAvailable === 1 ? "seat" : "seats"} left`;

  return (
    <article
      className={`relative rounded-2xl border bg-white p-5 shadow-xs transition hover:shadow-md ${
        isHighlighted
          ? "border-[#C8522E] ring-1 ring-[#C8522E]"
          : "border-[#EAE6DF] hover:border-[#C8522E]/40"
      }`}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Left: Driver Info */}
        <div className="flex items-center gap-3.5 sm:w-1/3">
          <Link
            href={`/profile/${ride.driver.id}`}
            className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#1E2022] font-sans text-sm font-bold text-white transition hover:opacity-90 shadow-xs"
          >
            {driverInitials}
            {ride.driver.verified && (
              <span className="absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#2E6F40] text-white ring-2 ring-white">
                <CheckCircle2 size={12} />
              </span>
            )}
          </Link>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-1.5">
              <Link
                href={`/profile/${ride.driver.id}`}
                className="font-sans text-sm font-bold text-[#1E2022] transition hover:text-[#C8522E] truncate"
              >
                {ride.driver.name}
              </Link>

              {ride.driver.verified && (
                <span className="rounded-full bg-[#EAF4ED] px-2 py-0.5 text-[10px] font-bold text-[#2E6F40]">
                  Verified Host
                </span>
              )}
            </div>

            <p className="mt-0.5 flex items-center gap-1.5 text-xs text-slate-500">
              <span className="flex items-center gap-0.5 font-bold text-[#1E2022]">
                <Star size={12} className="fill-amber-400 text-amber-400" />
                {ride.driver.rating ? ride.driver.rating.toFixed(1) : "5.0"}
              </span>
              <span>·</span>
              <span className="truncate">{ride.vehicleModel || "Verified Transit Vehicle"}</span>
            </p>
          </div>
        </div>

        {/* Center: Route Timeline */}
        <div className="flex flex-1 items-center justify-between gap-3 px-2 sm:px-6">
          {/* Departure */}
          <div className="text-left">
            <p className="font-sans text-base font-bold text-[#1E2022]">
              {ride.time || "05:45 PM"}
            </p>
            <p className="text-xs font-medium text-slate-500 truncate max-w-[120px]">
              {ride.from}
            </p>
          </div>

          {/* Timeline Visual */}
          <div className="flex flex-1 flex-col items-center px-3">
            <span className="text-[10px] font-semibold text-slate-400">
              {ride.duration || "3h 30m"}
            </span>
            <div className="mt-1 flex w-full items-center">
              <span className="h-2 w-2 rounded-full bg-[#C8522E] shrink-0" />
              <span className="h-[2px] flex-1 bg-gradient-to-r from-[#C8522E] via-slate-300 to-[#1E2022]" />
              <span className="h-2 w-2 rounded-full bg-[#1E2022] shrink-0" />
            </div>
          </div>

          {/* Arrival */}
          <div className="text-right">
            <p className="font-sans text-base font-bold text-[#1E2022]">
              09:15 PM
            </p>
            <p className="text-xs font-medium text-slate-500 truncate max-w-[120px]">
              {ride.to}
            </p>
          </div>
        </div>

        {/* Right: Price & Action */}
        <div className="flex items-center justify-between gap-4 border-t border-slate-100 pt-3 sm:w-auto sm:border-0 sm:pt-0 sm:text-right">
          <div>
            <p className="font-sans text-xl font-black tracking-tight text-[#1E2022]">
              ₹{ride.price}
            </p>
            <span className="mt-0.5 inline-block rounded-full bg-[#EAF4ED] px-2.5 py-0.5 text-[10px] font-bold text-[#2E6F40]">
              {seatsText}
            </span>
          </div>

          <Link
            href={`/rides/${ride.id}`}
            className={`rounded-xl px-5 py-2.5 font-sans text-xs font-bold transition shadow-xs ${
              isHighlighted
                ? "bg-[#C8522E] text-white hover:bg-[#B34524]"
                : "border border-[#EAE6DF] bg-[#FAF8F5] text-[#1E2022] hover:bg-[#1E2022] hover:text-white"
            }`}
          >
            View Ride
          </Link>
        </div>
      </div>

      {ride.description && (
        <p className="mt-3.5 rounded-xl bg-[#FAF8F5] px-3.5 py-2.5 text-xs text-slate-600 border border-[#EAE6DF]/60">
          {ride.description}
        </p>
      )}
    </article>
  );
}