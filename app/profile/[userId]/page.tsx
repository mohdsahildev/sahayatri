"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  CheckCircle,
  Star,
  ArrowLeft,
  Car,
  Clock,
  MessageSquare,
  ShieldCheck,
  ChevronRight,
  Info,
} from "lucide-react";
import {
  getPublicProfile,
  type PublicProfileData,
} from "@/lib/api/profile";
import Navbar from "@/components/layout/navbar";
import LandingFooter from "@/components/landing/landing-footer";

export default function PublicProfilePage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.userId as string;

  const [profile, setProfile] = useState<PublicProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!userId) return;

    async function fetchProfile() {
      try {
        setLoading(true);
        setError("");

        const response = await getPublicProfile(userId);
        setProfile(response.data);
      } catch (err) {
        console.error("Failed to fetch public profile:", err);
        setError(
          err instanceof Error ? err.message : "Unable to load this profile."
        );
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
  }, [userId]);

  function formatTime(dateStr?: string) {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-IN", {
      weekday: "short",
      day: "numeric",
      month: "short",
      hour: "numeric",
      minute: "2-digit",
    });
  }

  function formatReviewDate(dateStr?: string) {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FBF9F5] text-[#1E2022] font-body flex flex-col justify-between">
        <div>
          <Navbar />
          <main className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 md:px-8">
            <div className="rounded-3xl border border-[#EAE6DF] bg-white p-10 text-center shadow-xs">
              <p className="text-sm font-semibold text-slate-500">
                Loading profile dossier...
              </p>
            </div>
          </main>
        </div>
        <LandingFooter />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-[#FBF9F5] text-[#1E2022] font-body flex flex-col justify-between">
        <div>
          <Navbar />
          <main className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 md:px-8">
            <div className="rounded-3xl border border-[#EAE6DF] bg-white p-10 text-center shadow-xs">
              <h1 className="font-sans text-xl font-bold text-[#1E2022]">
                Profile Not Found
              </h1>
              <p className="mt-2 text-xs text-slate-500">
                {error || "This user profile could not be loaded."}
              </p>
              <Link
                href="/home"
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#C8522E] px-6 py-2.5 text-xs font-bold text-white shadow-xs transition hover:bg-[#B34524]"
              >
                <ArrowLeft size={15} />
                <span>Back to Rides</span>
              </Link>
            </div>
          </main>
        </div>
        <LandingFooter />
      </div>
    );
  }

  const { user, stats, reviews, recentDriverRides, recentPassengerRides } = profile;

  const combinedRecentRides = [
    ...recentDriverRides.map((ride) => ({ ...ride, role: "Driver" })),
    ...recentPassengerRides.map((ride) => ({ ...ride, role: "Passenger" })),
  ].slice(0, 5);

  const vehicle = user.vehicle;
  const hasVehicle = Boolean(
    vehicle && (vehicle.brand || vehicle.model || vehicle.type || vehicle.number || vehicle.seats)
  );

  return (
    <div className="min-h-screen bg-[#FBF9F5] text-[#1E2022] font-body flex flex-col justify-between selection:bg-[#C8522E] selection:text-white">
      <div>
        <Navbar />

        <main className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 md:px-8">
          {/* Back Navigation Bar */}
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => router.back()}
              className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 transition hover:text-[#C8522E]"
            >
              <ArrowLeft size={15} />
              <span>Back to previous page</span>
            </button>
          </div>

          {/* Main 2-Column Dossier Composition */}
          <div className="mt-5 grid grid-cols-1 gap-6 md:grid-cols-[1fr_320px] md:items-start">
            {/* Left Main Column */}
            <div className="space-y-5">
              {/* Profile Header Dossier Card */}
              <div className="relative overflow-hidden rounded-3xl border border-[#EAE6DF] bg-white p-6 sm:p-7 shadow-xs">
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#2E6F40] via-[#C8522E] to-amber-400" />

                <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                  {/* Avatar Container */}
                  <div className="relative flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-[#FAF8F5] border border-[#EAE6DF] font-sans text-2xl font-bold text-[#1E2022]">
                    {user.profilePic ? (
                      <img
                        src={user.profilePic}
                        alt={user.name}
                        className="h-full w-full rounded-2xl object-cover"
                      />
                    ) : (
                      user.name.charAt(0).toUpperCase()
                    )}
                    {user.isVerified && (
                      <span className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-[#EAF4ED] border-2 border-white text-[#2E6F40]">
                        <CheckCircle size={14} className="fill-[#2E6F40] text-white" />
                      </span>
                    )}
                  </div>

                  {/* Header Text Info */}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <h1 className="font-sans text-2xl font-black tracking-tight text-[#1E2022] sm:text-3xl">
                        {user.name}
                      </h1>

                      {user.isVerified && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-[#EAF4ED] px-3 py-1 text-xs font-bold text-[#2E6F40]">
                          <CheckCircle size={13} />
                          <span>Verified</span>
                        </span>
                      )}
                    </div>

                    <div className="mt-1.5 flex items-center gap-1.5 text-xs font-bold text-amber-600">
                      <Star size={14} className="text-amber-600" />
                      <span>{typeof user.rating === "number" ? user.rating.toFixed(1) : "—"}</span>
                    </div>

                    <p className="mt-2.5 text-xs leading-relaxed text-slate-600 sm:text-sm">
                      {user.bio || "Daily commuter and community carpool member on SahaYatri."}
                    </p>
                  </div>
                </div>

                {/* 4 Statistics Cards Grid */}
                <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4 border-t border-[#EAE6DF] pt-5">
                  <div className="rounded-2xl border border-slate-100 bg-[#FAF8F5] p-3.5 text-center">
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      DRIVER RIDES
                    </span>
                    <span className="mt-1 block font-sans text-2xl font-black text-[#1E2022]">
                      {stats.driverRideCount}
                    </span>
                  </div>

                  <div className="rounded-2xl border border-slate-100 bg-[#FAF8F5] p-3.5 text-center">
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      PASSENGER RIDES
                    </span>
                    <span className="mt-1 block font-sans text-2xl font-black text-[#1E2022]">
                      {stats.passengerRideCount}
                    </span>
                  </div>

                  <div className="rounded-2xl border border-slate-100 bg-[#FAF8F5] p-3.5 text-center">
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      REVIEWS
                    </span>
                    <span className="mt-1 block font-sans text-2xl font-black text-[#1E2022]">
                      {stats.reviewCount}
                    </span>
                  </div>

                  <div className="rounded-2xl border border-slate-100 bg-[#FAF8F5] p-3.5 text-center">
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      OVERALL RATING
                    </span>
                    <div className="mt-1 flex items-center justify-center gap-1 font-sans text-2xl font-black text-[#C8522E]">
                      <span>{typeof user.rating === "number" ? user.rating.toFixed(1) : "—"}</span>
                      <Star size={16} className="text-[#C8522E]" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Rides Card */}
              <div className="rounded-3xl border border-[#EAE6DF] bg-white p-6 shadow-xs">
                <div className="flex items-center gap-2.5 border-b border-[#EAE6DF] pb-4">
                  <Clock size={18} className="text-[#C8522E]" />
                  <h2 className="font-sans text-lg font-bold text-[#1E2022]">
                    Recent Rides
                  </h2>
                </div>

                {combinedRecentRides.length === 0 ? (
                  <div className="mt-4 rounded-2xl bg-[#FAF8F5] p-5 text-center text-xs text-slate-500">
                    No recent rides completed yet.
                  </div>
                ) : (
                  <div className="mt-4 space-y-2.5">
                    {combinedRecentRides.map((ride) => {
                      const sourceName =
                        (typeof ride.source === "object"
                          ? ride.source?.name
                          : ride.source) ||
                        ride.from ||
                        "Starting point";

                      const destinationName =
                        (typeof ride.destination === "object"
                          ? ride.destination?.name
                          : ride.destination) ||
                        ride.to ||
                        "Destination";

                      return (
                        <div
                          key={`${ride.role}-${ride._id}`}
                          className="flex items-center justify-between gap-3 rounded-2xl border border-[#EAE6DF] bg-[#FAF8F5] px-4 py-3.5 transition hover:border-[#C8522E]/40 hover:bg-white"
                        >
                          <div className="flex min-w-0 flex-1 items-center gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white border border-[#EAE6DF] text-[#C8522E]">
                              <Car size={16} />
                            </div>

                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2 min-w-0">
                                <span className="font-sans text-xs sm:text-sm font-bold text-[#1E2022] truncate min-w-0 flex-1">
                                  {sourceName} → {destinationName}
                                </span>
                                <span className="shrink-0 rounded-full bg-[#FAF5F0] border border-[#C8522E]/20 px-2.5 py-0.5 text-[10px] font-bold text-[#C8522E]">
                                  {ride.role}
                                </span>
                              </div>

                              {ride.departureTime && (
                                <p className="mt-0.5 text-[11px] text-slate-400 truncate">
                                  {formatTime(ride.departureTime)}
                                </p>
                              )}
                            </div>
                          </div>

                          <Link
                            href={`/rides/${ride._id}`}
                            className="inline-flex shrink-0 items-center gap-1 text-xs font-bold text-[#C8522E] transition hover:text-[#B34524] ml-2"
                          >
                            <span>View Ride</span>
                            <ChevronRight size={14} />
                          </Link>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Reviews Card */}
              <div className="rounded-3xl border border-[#EAE6DF] bg-white p-6 shadow-xs">
                <div className="flex items-center justify-between border-b border-[#EAE6DF] pb-4">
                  <div className="flex items-center gap-2.5">
                    <MessageSquare size={18} className="text-[#C8522E]" />
                    <h2 className="font-sans text-lg font-bold text-[#1E2022]">
                      Reviews ({stats.reviewCount})
                    </h2>
                  </div>

                  <span className="inline-flex items-center gap-1 rounded-full bg-[#FAF8F5] border border-[#EAE6DF] px-3 py-1 text-xs font-bold text-amber-600">
                    <Star size={13} className="text-amber-600" />
                    <span>{typeof user.rating === "number" ? user.rating.toFixed(1) : "—"}</span>
                  </span>
                </div>

                {reviews.length === 0 ? (
                  <div className="mt-4 rounded-2xl bg-[#FAF8F5] p-5 text-center text-xs text-slate-500">
                    No reviews written yet.
                  </div>
                ) : (
                  <div className="mt-4 space-y-3">
                    {reviews.map((review) => (
                      <div
                        key={review._id}
                        className="rounded-2xl border border-[#EAE6DF] bg-[#FAF8F5] p-4.5 shadow-xs"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#1E2022] font-sans text-xs font-bold text-white">
                              {review.reviewer?.name?.charAt(0).toUpperCase() ?? "U"}
                            </div>
                            <div className="min-w-0">
                              {review.reviewer?._id ? (
                                <Link
                                  href={`/profile/${review.reviewer._id}`}
                                  className="font-sans text-sm font-bold text-[#1E2022] transition hover:text-[#C8522E] truncate block"
                                >
                                  {review.reviewer.name}
                                </Link>
                              ) : (
                                <span className="font-sans text-sm font-bold text-[#1E2022] truncate block">
                                  {review.reviewer?.name ?? "Co-Traveler"}
                                </span>
                              )}
                              {review.createdAt && (
                                <span className="text-[11px] text-slate-400 block">
                                  {formatReviewDate(review.createdAt)}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex shrink-0 items-center gap-1 rounded-lg bg-white border border-[#EAE6DF] px-2.5 py-1 text-xs font-bold text-amber-600">
                            <Star size={12} className="text-amber-600" />
                            <span>{review.rating.toFixed(1)}</span>
                          </div>
                        </div>

                        {review.comment && (
                          <p className="mt-3 text-xs leading-relaxed text-slate-600 sm:pl-12">
                            &ldquo;{review.comment}&rdquo;
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                <div className="mt-5 flex items-center justify-center gap-2 rounded-2xl bg-[#FAF8F5] border border-[#EAE6DF] p-3 text-xs font-semibold text-slate-500">
                  <Info size={14} className="text-[#C8522E] shrink-0" />
                  <span>Reviews from completed rides will appear here.</span>
                </div>
              </div>
            </div>

            {/* Right Column: Vehicle Information Card */}
            <div className="rounded-3xl border border-[#EAE6DF] bg-white p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-2.5 border-b border-[#EAE6DF] pb-4">
                <Car size={18} className="text-[#2E6F40]" />
                <h2 className="font-sans text-lg font-bold text-[#1E2022]">
                  Vehicle Information
                </h2>
              </div>

              {hasVehicle ? (
                <div className="space-y-2.5">
                  {vehicle?.type && (
                    <div className="rounded-2xl border border-slate-100 bg-[#FAF8F5] p-3">
                      <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Vehicle Type
                      </span>
                      <span className="mt-0.5 block text-xs font-bold capitalize text-[#1E2022]">
                        {vehicle.type}
                      </span>
                    </div>
                  )}

                  {vehicle?.brand && (
                    <div className="rounded-2xl border border-slate-100 bg-[#FAF8F5] p-3">
                      <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Brand
                      </span>
                      <span className="mt-0.5 block text-xs font-bold text-[#1E2022]">
                        {vehicle.brand}
                      </span>
                    </div>
                  )}

                  {vehicle?.model && (
                    <div className="rounded-2xl border border-slate-100 bg-[#FAF8F5] p-3">
                      <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Model
                      </span>
                      <span className="mt-0.5 block text-xs font-bold text-[#1E2022]">
                        {vehicle.model}
                      </span>
                    </div>
                  )}

                  {vehicle?.seats !== undefined && (
                    <div className="rounded-2xl border border-slate-100 bg-[#FAF8F5] p-3">
                      <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Seats
                      </span>
                      <span className="mt-0.5 block text-xs font-bold text-[#1E2022]">
                        {vehicle.seats} seats
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="rounded-2xl bg-[#FAF8F5] border border-[#EAE6DF] p-4 text-center text-xs text-slate-500">
                  No vehicle registered for this profile.
                </div>
              )}

              <div className="border-t border-[#EAE6DF] pt-4 text-center">
                <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-slate-400">
                  <ShieldCheck size={13} className="text-[#2E6F40]" />
                  <span>Verified SahaYatri Member</span>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      <LandingFooter />
    </div>
  );
}