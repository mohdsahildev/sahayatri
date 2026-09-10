"use client";

import Link from "next/link";
import { ArrowRight, Calendar, Car, Clock3 } from "lucide-react";
import type { MyRide } from "@/lib/api/rides";
import MyRideActions from "@/components/rides/my-ride-actions";

interface DriverRideCardProps {
  ride: MyRide;
  isPast?: boolean;
}

export default function DriverRideCard({
  ride,
  isPast = false,
}: DriverRideCardProps) {
  const departureDate = new Date(ride.departureTime);

  const formattedDate = departureDate.toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const formattedDepartureTime = departureDate.toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
  });

  // Calculate estimated arrival time if duration is available
  let formattedArrivalTime: string | null = null;
  if (ride.estimatedEndTime) {
    const end = new Date(ride.estimatedEndTime);
    formattedArrivalTime = end.toLocaleTimeString("en-IN", {
      hour: "numeric",
      minute: "2-digit",
    });
  } else if (typeof ride.duration === "number" && ride.duration > 0) {
    const end = new Date(departureDate.getTime() + ride.duration * 60 * 1000);
    formattedArrivalTime = end.toLocaleTimeString("en-IN", {
      hour: "numeric",
      minute: "2-digit",
    });
  }

  const durationText =
    typeof ride.duration === "number" && ride.duration > 0
      ? `${Math.floor(ride.duration / 60)}h ${ride.duration % 60 > 0 ? `${ride.duration % 60}m` : ""}`.trim()
      : null;

  const seatsLeft = Math.max(ride.seatsAvailable - (ride.bookedSeats || 0), 0);

  // Status configuration
  let statusBadge = {
    label: "Scheduled",
    bgClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
    dotClass: "bg-emerald-500",
  };

  if (ride.status === "cancelled") {
    statusBadge = {
      label: "Cancelled",
      bgClass: "bg-rose-50 text-rose-700 border-rose-200",
      dotClass: "bg-rose-500",
    };
  } else if (ride.status === "completed") {
    statusBadge = {
      label: "Completed",
      bgClass: "bg-slate-100 text-slate-700 border-slate-200",
      dotClass: "bg-slate-400",
    };
  } else if (ride.status === "started") {
    statusBadge = {
      label: "In progress",
      bgClass: "bg-blue-50 text-blue-700 border-blue-200",
      dotClass: "bg-blue-500",
    };
  } else if (ride.status === "ended") {
    statusBadge = {
      label: "Ride ended",
      bgClass: "bg-amber-50 text-amber-700 border-amber-200",
      dotClass: "bg-amber-500",
    };
  } else if (isPast) {
    statusBadge = {
      label: "Past ride",
      bgClass: "bg-slate-100 text-slate-700 border-slate-200",
      dotClass: "bg-slate-400",
    };
  } else if (seatsLeft > 0) {
    statusBadge = {
      label: `Active · ${seatsLeft} ${seatsLeft === 1 ? "seat" : "seats"} left`,
      bgClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
      dotClass: "bg-emerald-500",
    };
  } else {
    statusBadge = {
      label: "Active · Fully booked",
      bgClass: "bg-blue-50 text-blue-700 border-blue-200",
      dotClass: "bg-blue-500",
    };
  }

  const vehicleName = [ride.vehicle?.brand, ride.vehicle?.model]
    .filter(Boolean)
    .join(" ");

  const vehiclePlate = ride.vehicle?.number;
  const isVehicleVerified = ride.vehicle?.verified === true;
  const vehicleSummary = [vehicleName, vehiclePlate].filter(Boolean).join(" · ");

  return (
    <article className="rounded-3xl border border-[#EAE6DF] bg-white p-6 shadow-xs transition hover:border-[#C8522E]/30 hover:shadow-md">
      {/* Top Header Tags */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[#EAE6DF]/60">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FDF2E9] px-3 py-1 text-xs font-bold text-[#C8522E] border border-[#FADBD8]">
          <Car size={13} className="text-[#C8522E]" />
          <span>You&apos;re driving</span>
        </span>

        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold border ${statusBadge.bgClass}`}
        >
          <span className={`h-1.5 w-1.5 rounded-full ${statusBadge.dotClass}`} />
          <span>{statusBadge.label}</span>
        </span>
      </div>

      {/* Main Card Body */}
      <div className="mt-5 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        {/* Left: Journey Info & Timeline */}
        <div className="flex-1 space-y-4">
          {/* Date & Route Title */}
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-400">
              <Calendar size={13} className="text-[#C8522E]" />
              <span>{formattedDate}</span>
            </div>

            <h3 className="mt-1 font-sans text-xl sm:text-2xl font-black tracking-tight text-[#1E2022]">
              {ride.source.name} <span className="text-[#C8522E]">→</span> {ride.destination.name}
            </h3>
          </div>

          {/* Timeline */}
          <div className="space-y-3 pt-1">
            {/* Departure */}
            <div className="flex items-start gap-3">
              <span className="mt-1 flex h-3.5 w-3.5 items-center justify-center rounded-full border-2 border-[#C8522E] bg-white shrink-0">
                <span className="h-1.5 w-1.5 rounded-full bg-[#C8522E]" />
              </span>
              <div>
                <span className="font-sans text-sm font-bold text-[#1E2022]">
                  {formattedDepartureTime}
                </span>
                <p className="text-xs font-medium text-slate-500">{ride.source.name}</p>
              </div>
            </div>

            {/* Duration Connector */}
            {durationText && (
              <div className="flex items-center gap-3 pl-1 text-xs text-slate-400 font-medium">
                <span className="w-2 border-l-2 border-dashed border-slate-300 h-4 ml-0.5" />
                <span className="inline-flex items-center gap-1 text-[11px] text-slate-500">
                  <Clock3 size={11} className="text-slate-400" />
                  <span>{durationText} transit window</span>
                </span>
              </div>
            )}

            {/* Arrival */}
            <div className="flex items-start gap-3">
              <span className="mt-1 flex h-3.5 w-3.5 items-center justify-center rounded-sm bg-[#1E2022] shrink-0" />
              <div>
                <span className="font-sans text-sm font-bold text-[#1E2022]">
                  {formattedArrivalTime || "Arrival Destination"}
                </span>
                <p className="text-xs font-medium text-slate-500">{ride.destination.name}</p>
              </div>
            </div>
          </div>

          {/* Meta Info */}
          <div className="flex flex-wrap items-center gap-3 pt-2 text-xs font-medium text-slate-600">
            <span className="inline-flex items-center gap-1.5">
              <span className="font-bold text-[#1E2022]">
                {ride.bookedSeats || 0} of {ride.seatsAvailable}
              </span>
              <span>seats booked</span>
            </span>

            {vehicleSummary && (
              <>
                <span className="text-slate-300">·</span>
                <span className="inline-flex items-center gap-1.5 truncate">
                  {isVehicleVerified && (
                    <span className="inline-flex items-center text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                      ✓ Verified vehicle
                    </span>
                  )}
                  <span>{vehicleSummary}</span>
                </span>
              </>
            )}
          </div>
        </div>

        {/* Right Sidebar: Price & Actions */}
        <div className="flex flex-col justify-between gap-4 border-t lg:border-t-0 lg:border-l border-[#EAE6DF] pt-4 lg:pt-0 lg:pl-6 lg:w-64 shrink-0">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Per Passenger
            </p>
            <p className="font-sans text-2xl font-black tracking-tight text-[#C8522E]">
              ₹{ride.price}
              <span className="text-xs font-semibold text-slate-500"> / seat</span>
            </p>
          </div>

          <div className="space-y-2">
            <Link
              href={`/rides/${ride._id}`}
              className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-[#C8522E] px-4 py-2.5 font-sans text-xs font-bold text-white shadow-xs transition hover:bg-[#B34524] active:scale-98"
            >
              <span>View Ride Details</span>
              <ArrowRight size={14} />
            </Link>

            <MyRideActions
              rideId={ride._id}
              isCreated={true}
              status={ride.status}
              isPast={isPast}
            />
          </div>
        </div>
      </div>
    </article>
  );
}
