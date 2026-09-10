import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  Car,
  ChevronRight,
  Cigarette,
  Clock3,
  Luggage,
  MapPin,
  MessageCircle,
  Music,
  PawPrint,
  PhoneOff,
  Share2,
  ShieldCheck,
  Snowflake,
  Star,
  Users,
} from "lucide-react";
import { serverApiFetch } from "@/lib/api/server-client";
import Navbar from "@/components/layout/navbar";
import RideActions from "@/components/rides/ride-actions";
import RideReview from "@/components/rides/ride-review";
import RideMapPreview from "@/components/rides/ride-map-preview";

interface RideResponse {
  success: boolean;
  message: string;
  data: {
    _id: string;
    driver: string | {
      _id?: string;
      name?: string;
    };

    driverInfo?: {
      _id: string;
      name: string;
      profilePic?: string;
      rating: number;
      rideCount: number;
      isVerified: boolean;
    };

    source: {
      name: string;
      lat?: number;
      lng?: number;
    };

    destination: {
      name: string;
      lat?: number;
      lng?: number;
    };

    departureTime: string;
    duration?: number;
    estimatedEndTime?: string;

    seatsAvailable: number;
    bookedSeats: number;
    price: number;

    description?: string;
    status?: string;

    passengers?: Array<{
      user: string | { _id?: string };
    }>;

    vehicle?: {
      type?: string;
      brand?: string;
      model?: string;
      number?: string;
      image?: string;
      verified?: boolean;
    };

    preferences?: {
      womenOnly?: boolean;
      verifiedOnly?: boolean;
      hidePhoneNumber?: boolean;
      requireRideShare?: boolean;
      smokingAllowed?: boolean;
      musicAllowed?: boolean;
      petsAllowed?: boolean;
      luggageSpace?: boolean;
      acAvailable?: boolean;
      conversationLevel?: "quiet" | "normal" | "talkative";
      genderPreference?: "any" | "male" | "female";
    };
  };
}

interface RideDetailsPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function RideDetailsPage({
  params,
}: RideDetailsPageProps) {
  const { id } = await params;

  let ride: RideResponse["data"];

  try {
    const response = await serverApiFetch<RideResponse>(`/api/rides/${id}`);
    ride = response.data;
  } catch {
    return (
      <div className="min-h-screen bg-[#FAF8F5] font-sans text-[#1E2022]">
        <Navbar />
        <main className="mx-auto w-full max-w-[1240px] px-4 sm:px-6 lg:px-8 py-12">
          <div className="rounded-3xl border border-[#EAE6DF] bg-white p-12 text-center shadow-xs">
            <h1 className="font-sans text-2xl font-bold text-[#1E2022]">
              Ride Not Found
            </h1>
            <p className="mt-2 text-sm text-slate-500 max-w-sm mx-auto">
              This ride may have been removed or is no longer accessible.
            </p>
            <div className="mt-6">
              <Link
                href="/home"
                className="inline-flex items-center gap-2 rounded-xl bg-[#C8522E] px-6 py-2.5 font-sans text-xs font-bold text-white shadow-xs transition hover:bg-[#B34524]"
              >
                <ArrowLeft size={14} />
                <span>Return to Find Rides</span>
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  let currentUserId = "";

  try {
    const meResponse = await serverApiFetch<{
      success: boolean;
      data: {
        user: {
          _id: string;
        };
      };
    }>("/api/auth/me");

    currentUserId = meResponse.data.user._id;
  } catch {
    currentUserId = "";
  }

  const departure = new Date(ride.departureTime);

  const formattedDate = departure.toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const formattedDepartureTime = departure.toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
  });

  // Calculate arrival time if available
  let formattedArrivalTime: string | null = null;
  if (ride.estimatedEndTime) {
    const end = new Date(ride.estimatedEndTime);
    formattedArrivalTime = end.toLocaleTimeString("en-IN", {
      hour: "numeric",
      minute: "2-digit",
    });
  } else if (typeof ride.duration === "number" && ride.duration > 0) {
    const end = new Date(departure.getTime() + ride.duration * 60 * 1000);
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

  const driverName =
    ride.driverInfo?.name ??
    (typeof ride.driver === "object" ? ride.driver.name : null) ??
    "SahaYatri User";

  const driverRating = ride.driverInfo?.rating ?? 5.0;
  const driverRides = ride.driverInfo?.rideCount ?? 0;
  const driverVerified = ride.driverInfo?.isVerified ?? true;

  const driverId =
    typeof ride.driver === "string"
      ? ride.driver
      : ride.driver?._id ?? "";

  const isDriver = Boolean(currentUserId) && currentUserId === driverId;

  const isPassenger =
    Boolean(currentUserId) &&
    Array.isArray(ride.passengers) &&
    ride.passengers.some((p) => {
      const uid = typeof p.user === "string" ? p.user : p.user?._id;
      return uid === currentUserId;
    });

  const canReviewDriver =
    ride.status === "completed" &&
    Boolean(currentUserId) &&
    !isDriver &&
    isPassenger;

  // Status Badge Configuration
  const rideStatus = ride.status ?? "scheduled";
  let statusBadge = {
    label: `${seatsLeft} ${seatsLeft === 1 ? "seat" : "seats"} available`,
    bgClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
    dotClass: "bg-emerald-500",
  };

  if (rideStatus === "cancelled") {
    statusBadge = {
      label: "Cancelled",
      bgClass: "bg-rose-50 text-rose-700 border-rose-200",
      dotClass: "bg-rose-500",
    };
  } else if (rideStatus === "completed") {
    statusBadge = {
      label: "Ride completed",
      bgClass: "bg-slate-100 text-slate-700 border-slate-200",
      dotClass: "bg-slate-400",
    };
  } else if (rideStatus === "started") {
    statusBadge = {
      label: "In progress",
      bgClass: "bg-blue-50 text-blue-700 border-blue-200",
      dotClass: "bg-blue-500",
    };
  } else if (rideStatus === "ended") {
    statusBadge = {
      label: "Ride ended",
      bgClass: "bg-amber-50 text-amber-700 border-amber-200",
      dotClass: "bg-amber-500",
    };
  } else if (seatsLeft === 0) {
    statusBadge = {
      label: "Fully booked",
      bgClass: "bg-blue-50 text-blue-700 border-blue-200",
      dotClass: "bg-blue-500",
    };
  }

  // Vehicle Details
  const vehicleName = [ride.vehicle?.brand, ride.vehicle?.model]
    .filter(Boolean)
    .join(" ");
  const vehiclePlate = ride.vehicle?.number;
  const isVehicleVerified = ride.vehicle?.verified === true;

  // Preference Pills Helper
  const activePreferences: Array<{ icon: React.ReactNode; label: string }> = [];

  if (ride.preferences) {
    if (ride.preferences.womenOnly) {
      activePreferences.push({
        icon: <Users size={13} />,
        label: "Women only",
      });
    }
    if (ride.preferences.verifiedOnly) {
      activePreferences.push({
        icon: <ShieldCheck size={13} />,
        label: "Verified members only",
      });
    }
    if (ride.preferences.acAvailable) {
      activePreferences.push({
        icon: <Snowflake size={13} />,
        label: "AC available",
      });
    }
    if (ride.preferences.luggageSpace) {
      activePreferences.push({
        icon: <Luggage size={13} />,
        label: "Boot space for bags",
      });
    }
    if (ride.preferences.musicAllowed) {
      activePreferences.push({
        icon: <Music size={13} />,
        label: "Music allowed",
      });
    }
    if (ride.preferences.petsAllowed) {
      activePreferences.push({
        icon: <PawPrint size={13} />,
        label: "Pets allowed",
      });
    }
    if (ride.preferences.smokingAllowed) {
      activePreferences.push({
        icon: <Cigarette size={13} />,
        label: "Smoking allowed",
      });
    }
    if (ride.preferences.hidePhoneNumber) {
      activePreferences.push({
        icon: <PhoneOff size={13} />,
        label: "Phone hidden",
      });
    }
    if (ride.preferences.requireRideShare) {
      activePreferences.push({
        icon: <Share2 size={13} />,
        label: "Shared ride",
      });
    }
    if (
      ride.preferences.conversationLevel &&
      ride.preferences.conversationLevel !== "normal"
    ) {
      activePreferences.push({
        icon: <MessageCircle size={13} />,
        label: `${ride.preferences.conversationLevel.charAt(0).toUpperCase() + ride.preferences.conversationLevel.slice(1)} conversation`,
      });
    }
    if (
      ride.preferences.genderPreference &&
      ride.preferences.genderPreference !== "any"
    ) {
      activePreferences.push({
        icon: <Users size={13} />,
        label: `${ride.preferences.genderPreference.charAt(0).toUpperCase() + ride.preferences.genderPreference.slice(1)} only`,
      });
    }
  }

  return (
    <div className="min-h-screen bg-[#FAF8F5] font-sans text-[#1E2022]">
      <Navbar />

      <main className="mx-auto w-full max-w-[1240px] px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Top Back Navigation Bar & Status Context */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/home"
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 transition hover:text-[#C8522E]"
          >
            <ArrowLeft size={16} />
            <span>Back to rides</span>
          </Link>

          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1 text-xs font-bold border ${statusBadge.bgClass}`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${statusBadge.dotClass}`} />
            <span>{statusBadge.label}</span>
          </span>
        </div>

        {/* Desktop Two-Column Layout */}
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px] items-start">
          {/* LEFT / MAIN COLUMN */}
          <div className="space-y-6">
            {/* 1. Corridor Journey Card */}
            <article className="rounded-3xl border border-[#EAE6DF] bg-white p-6 sm:p-8 shadow-xs">
              {/* Header Tag & Route */}
              <div className="flex flex-wrap items-center justify-between gap-2 pb-5 border-b border-[#EAE6DF]/60">
                <div>
                  <div className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-[#C8522E]">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#C8522E]" />
                    <span>Corridor Journey</span>
                  </div>

                  <h1 className="mt-1 font-sans text-2xl sm:text-3xl font-black tracking-tight text-[#1E2022]">
                    {ride.source.name} <span className="text-[#C8522E]">→</span> {ride.destination.name}
                  </h1>
                </div>

                <div className="text-right">
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#FAF8F5] px-3 py-1 text-xs font-bold text-slate-600 border border-[#EAE6DF]">
                    <Calendar size={12} className="text-[#C8522E]" />
                    <span>{formattedDate}</span>
                  </span>
                  {durationText && (
                    <p className="mt-1 text-[11px] font-medium text-slate-400">
                      Approx. {durationText}
                    </p>
                  )}
                </div>
              </div>

              {/* Visual Journey Timeline */}
              <div className="mt-6 space-y-6">
                {/* Departure Stop */}
                <div className="flex items-start gap-4">
                  <div className="flex flex-col items-center">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full border-2 border-[#C8522E] bg-white shrink-0 shadow-xs">
                      <span className="h-2 w-2 rounded-full bg-[#C8522E]" />
                    </span>
                    <span className="w-0.5 h-12 bg-gradient-to-b from-[#C8522E]/40 to-slate-300" />
                  </div>

                  <div className="flex-1 pb-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="font-sans text-lg font-black text-[#1E2022]">
                        {formattedDepartureTime}
                      </span>
                      <span className="rounded-md bg-[#FDF2E9] px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-[#C8522E] border border-[#FADBD8]">
                        Departure
                      </span>
                    </div>
                    <p className="mt-0.5 text-sm font-semibold text-slate-700">
                      {ride.source.name}
                    </p>
                  </div>
                </div>

                {/* Arrival Stop */}
                <div className="flex items-start gap-4">
                  <span className="flex h-5 w-5 items-center justify-center rounded-md bg-[#1E2022] shrink-0 shadow-xs">
                    <span className="h-1.5 w-1.5 rounded-xs bg-white" />
                  </span>

                  <div className="flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="font-sans text-lg font-black text-[#1E2022]">
                        {formattedArrivalTime || "Estimated Arrival"}
                      </span>
                      <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-slate-600 border border-slate-200">
                        Arrival
                      </span>
                    </div>
                    <p className="mt-0.5 text-sm font-semibold text-slate-700">
                      {ride.destination.name}
                    </p>
                  </div>
                </div>
              </div>
            </article>

            {/* 2. Ride Host Card */}
            <article className="rounded-3xl border border-[#EAE6DF] bg-white p-6 sm:p-7 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-4">
                  {driverId ? (
                    <Link
                      href={`/profile/${driverId}`}
                      className="relative block shrink-0 transition hover:opacity-90"
                    >
                      {ride.driverInfo?.profilePic ? (
                        <img
                          src={ride.driverInfo.profilePic}
                          alt={driverName}
                          className="h-14 w-14 rounded-2xl object-cover border border-[#EAE6DF]"
                        />
                      ) : (
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#1E2022] text-lg font-black text-white shadow-xs">
                          {driverName.charAt(0).toUpperCase()}
                        </div>
                      )}
                      {driverVerified && (
                        <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#2E6F40] text-white ring-2 ring-white">
                          <ShieldCheck size={12} />
                        </span>
                      )}
                    </Link>
                  ) : (
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#1E2022] text-lg font-black text-white shadow-xs">
                      {driverName.charAt(0).toUpperCase()}
                    </div>
                  )}

                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-sans text-base sm:text-lg font-black text-[#1E2022]">
                        {driverName}
                      </h2>
                      {driverVerified && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-[#EAF4ED] px-2.5 py-0.5 text-[11px] font-bold text-[#2E6F40] border border-[#D0E5D5]">
                          ✓ Verified Driver
                        </span>
                      )}
                    </div>

                    <div className="mt-1 flex items-center gap-2 text-xs font-medium text-slate-500">
                      <span className="inline-flex items-center gap-1 font-bold text-amber-600">
                        <Star size={13} className="fill-amber-400 text-amber-400" />
                        <span>{driverRating.toFixed(1)}</span>
                      </span>
                      <span>·</span>
                      <span>{driverRides} {driverRides === 1 ? "ride" : "rides"} hosted</span>
                    </div>
                  </div>
                </div>

                {driverId && (
                  <Link
                    href={`/profile/${driverId}`}
                    className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-[#EAE6DF] bg-[#FAF8F5] px-4 py-2 text-xs font-bold text-[#1E2022] transition hover:bg-white hover:border-[#1E2022]"
                  >
                    <span>View Public Profile</span>
                    <ChevronRight size={14} />
                  </Link>
                )}
              </div>
            </article>

            {/* 3. Vehicle & Ride Specifications Card */}
            <article className="rounded-3xl border border-[#EAE6DF] bg-white p-6 sm:p-7 shadow-xs space-y-6">
              <h2 className="font-sans text-sm font-black uppercase tracking-wider text-slate-400">
                Vehicle & Ride Specifications
              </h2>

              {/* Vehicle & Seat Grid */}
              <div className="grid gap-4 sm:grid-cols-2">
                {/* Vehicle Block */}
                <div className="flex items-start gap-3.5 rounded-2xl bg-[#FAF8F5] p-4 border border-[#EAE6DF]">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-[#C8522E] shadow-xs border border-[#EAE6DF] shrink-0">
                    <Car size={18} />
                  </div>

                  <div className="min-w-0">
                    <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                      Vehicle
                    </p>
                    <p className="mt-0.5 font-sans text-sm font-black text-[#1E2022] truncate">
                      {vehicleName || "Host's Car"}
                    </p>
                    <div className="mt-0.5 flex flex-wrap items-center gap-1.5 text-xs text-slate-500">
                      {vehiclePlate && <span>{vehiclePlate}</span>}
                      {isVehicleVerified && (
                        <span className="inline-flex items-center text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                          ✓ Verified
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Seat Block */}
                <div className="flex items-start gap-3.5 rounded-2xl bg-[#FAF8F5] p-4 border border-[#EAE6DF]">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-[#2E6F40] shadow-xs border border-[#EAE6DF] shrink-0">
                    <Users size={18} />
                  </div>

                  <div className="min-w-0">
                    <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                      Seat Configuration
                    </p>
                    <p className="mt-0.5 font-sans text-sm font-black text-[#1E2022]">
                      {seatsLeft} of {ride.seatsAvailable} seats available
                    </p>
                    <p className="mt-0.5 text-xs text-slate-500">
                      {ride.bookedSeats || 0} already booked
                    </p>
                  </div>
                </div>
              </div>

              {/* Driver Note (Quote Style) */}
              {ride.description && ride.description.trim().length > 0 && (
                <div className="space-y-1.5 pt-2">
                  <p className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                    Driver Note
                  </p>
                  <blockquote className="rounded-2xl border border-[#EAE6DF] bg-[#FAF8F5] p-4 text-xs sm:text-sm leading-relaxed text-slate-700 italic">
                    “{ride.description}”
                  </blockquote>
                </div>
              )}

              {/* Ride Preferences Pills */}
              {activePreferences.length > 0 && (
                <div className="space-y-2 pt-2">
                  <p className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                    Ride Features & Amenities
                  </p>
                  <div className="flex flex-wrap items-center gap-2">
                    {activePreferences.map((pref, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1.5 rounded-full bg-[#FAF8F5] px-3 py-1.5 text-xs font-semibold text-slate-700 border border-[#EAE6DF]"
                      >
                        <span className="text-[#C8522E]">{pref.icon}</span>
                        <span>{pref.label}</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </article>

            {/* 4. Route & Corridor Preview Card */}
            <article className="rounded-3xl border border-[#EAE6DF] bg-white p-6 sm:p-7 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MapPin size={16} className="text-[#C8522E]" />
                  <h2 className="font-sans text-sm font-black uppercase tracking-wider text-[#1E2022]">
                    Route & Corridor Preview
                  </h2>
                </div>

                <span className="text-[11px] font-medium text-slate-400">
                  Interactive Road Map
                </span>
              </div>

              {/* Map Preview Component */}
              <RideMapPreview
                source={ride.source}
                destination={ride.destination}
              />
            </article>

            {/* 5. Completed Ride Review Section */}
            {canReviewDriver && (
              <article className="rounded-3xl border border-[#EAE6DF] bg-white p-6 sm:p-7 shadow-xs">
                <h2 className="font-sans text-base font-black text-[#1E2022]">
                  Review Your Experience
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  Share your review for this completed ride with {driverName}.
                </p>
                <div className="mt-4">
                  <RideReview
                    rideId={ride._id}
                    target={{
                      id: driverId,
                      name: driverName,
                    }}
                  />
                </div>
              </article>
            )}
          </div>

          {/* RIGHT / SIDEBAR COLUMN (Preserves 100% of existing RideActions functionality) */}
          <div className="space-y-6 lg:sticky lg:top-8">
            <RideActions
              rideId={ride._id}
              driverId={driverId}
              status={rideStatus}
              seatsLeft={seatsLeft}
              price={ride.price}
              seatsAvailable={ride.seatsAvailable}
              bookedSeats={ride.bookedSeats || 0}
            />
          </div>
        </div>
      </main>
    </div>
  );
}