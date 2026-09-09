"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle, Star } from "lucide-react";
import {
  getPublicProfile,
  type PublicProfileData,
} from "@/lib/api/profile";

export default function PublicProfilePage() {
  const params = useParams();
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
      } catch (error) {
        console.error("Failed to fetch public profile:", error);
        setError(
          error instanceof Error
            ? error.message
            : "Unable to load this profile."
        );
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
  }, [userId]);

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-sm text-slate-500">Loading profile...</p>
      </main>
    );
  }

  if (error || !profile) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-sm text-slate-500">
          {error || "Profile not found."}
        </p>

        <Link
          href="/home"
          className="text-sm font-semibold text-primary hover:underline"
        >
          ← Back home
        </Link>
      </main>
    );
  }

  return (
      <main className="min-h-screen bg-neutral px-4 py-8">
        <div className="mx-auto max-w-3xl">
          <Link
            href="/home"
            className="text-sm font-semibold text-secondary hover:text-primary"
          >
            ← Back
          </Link>
    
          {/* Profile header */}
          <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col items-center text-center sm:flex-row sm:items-start sm:text-left">
              {profile.user.profilePic ? (
                <img
                  src={profile.user.profilePic}
                  alt={profile.user.name}
                  className="h-24 w-24 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-primary/10 text-3xl font-bold text-primary">
                  {profile.user.name.charAt(0).toUpperCase()}
                </div>
              )}
    
              <div className="mt-4 sm:ml-5 sm:mt-1">
                <div className="flex items-center justify-center gap-2 sm:justify-start">
                  <h1 className="text-2xl font-bold text-secondary">
                    {profile.user.name}
                  </h1>
          
                  {profile.user.isVerified && (
                    <CheckCircle
                      size={20}
                      className="text-primary"
                    />
                  )}
                </div>
              
                {profile.user.bio && (
                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    {profile.user.bio}
                  </p>
                )}
              </div>
            </div>
            
            {/* Stats */}
            <div className="mt-6 grid grid-cols-3 gap-3">
              <div className="rounded-xl bg-neutral p-4 text-center">
                <div className="flex items-center justify-center gap-1">
                  <Star
                    size={16}
                    className="fill-current text-primary"
                  />
                  <span className="font-bold text-secondary">
                    {typeof profile.user.rating === "number"
                      ? profile.user.rating.toFixed(1)
                      : "—"}
                  </span>
                </div>
            
                <p className="mt-1 text-xs text-slate-500">
                  Rating
                </p>
              </div>
            
              <div className="rounded-xl bg-neutral p-4 text-center">
                <p className="font-bold text-secondary">
                  {profile.stats.driverRideCount}
                </p>
            
                <p className="mt-1 text-xs text-slate-500">
                  Driver rides
                </p>
              </div>
            
              <div className="rounded-xl bg-neutral p-4 text-center">
                <p className="font-bold text-secondary">
                  {profile.stats.passengerRideCount}
                </p>
            
                <p className="mt-1 text-xs text-slate-500">
                  Passenger rides
                </p>
              </div>
            </div>
          </section>
            
          {/* Vehicle */}
          {profile.user.vehicle && (
            <section className="mt-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold text-secondary">
                Vehicle
              </h2>
        
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {(profile.user.vehicle.brand ||
                  profile.user.vehicle.model) && (
                  <div className="rounded-xl bg-neutral p-4">
                    <p className="text-xs text-slate-500">
                      Vehicle
                    </p>
                
                    <p className="mt-1 text-sm font-semibold text-secondary">
                      {[
                        profile.user.vehicle.brand,
                        profile.user.vehicle.model,
                      ]
                        .filter(Boolean)
                        .join(" ")}
                    </p>
                  </div>
                )}
    
                {profile.user.vehicle.type && (
                  <div className="rounded-xl bg-neutral p-4">
                    <p className="text-xs text-slate-500">
                      Type
                    </p>
                
                    <p className="mt-1 text-sm font-semibold capitalize text-secondary">
                      {profile.user.vehicle.type}
                    </p>
                  </div>
                )}
    
                {profile.user.vehicle.number && (
                  <div className="rounded-xl bg-neutral p-4">
                    <p className="text-xs text-slate-500">
                      Registration
                    </p>
                
                    <p className="mt-1 text-sm font-semibold text-secondary">
                      {profile.user.vehicle.number}
                    </p>
                  </div>
                )}
    
                {profile.user.vehicle.seats && (
                  <div className="rounded-xl bg-neutral p-4">
                    <p className="text-xs text-slate-500">
                      Seats
                    </p>
                
                    <p className="mt-1 text-sm font-semibold text-secondary">
                      {profile.user.vehicle.seats}
                    </p>
                  </div>
                )}
              </div>
            </section>
          )}
    
          {/* Reviews */}
          <section className="mt-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-secondary">
                Reviews
              </h2>
      
              <span className="text-xs text-slate-500">
                {profile.stats.reviewCount} total
              </span>
            </div>
      
            {profile.reviews.length === 0 ? (
              <p className="mt-4 rounded-xl bg-neutral p-4 text-sm text-slate-500">
                No reviews yet.
              </p>
            ) : (
              <div className="mt-4 space-y-3">
                {profile.reviews.map((review) => (
                  <div
                    key={review._id}
                    className="rounded-xl bg-neutral p-4"
                  >
                    <div className="flex items-center justify-between gap-3">
                      {review.reviewer?._id ? (
                        <Link
                          href={`/profile/${review.reviewer._id}`}
                          className="text-sm font-semibold text-secondary transition hover:text-primary"
                        >
                          {review.reviewer.name}
                        </Link>
                      ) : (
                        <p className="text-sm font-semibold text-secondary">
                          {review.reviewer?.name ?? "User"}
                        </p>
                      )}
                
                      <div className="flex items-center gap-1">
                        <Star
                          size={14}
                          className="fill-current text-primary"
                        />
    
                        <span className="text-xs font-bold text-secondary">
                          {review.rating}
                        </span>
                      </div>
                    </div>
                
                    {review.comment && (
                      <p className="mt-2 text-sm leading-5 text-slate-600">
                        {review.comment}
                      </p>
                    )}
    
                    {review.createdAt && (
                      <p className="mt-2 text-[11px] text-slate-400">
                        {new Date(
                          review.createdAt
                        ).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>
        
          {/* Recent rides */}
          {(profile.recentDriverRides.length > 0 ||
            profile.recentPassengerRides.length > 0) && (
            <section className="mt-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold text-secondary">
                Recent rides
              </h2>
            
              <div className="mt-4 space-y-3">
                {[
                  ...profile.recentDriverRides.map((ride) => ({
                    ...ride,
                    role: "Driver",
                  })),
                  ...profile.recentPassengerRides.map((ride) => ({
                    ...ride,
                    role: "Passenger",
                  })),
                ]
                  .slice(0, 5)
                  .map((ride) => {
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
                      <Link
                        key={`${ride.role}-${ride._id}`}
                        href={`/rides/${ride._id}`}
                        className="block rounded-xl bg-neutral p-4 transition hover:bg-primary/5"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-sm font-semibold text-secondary">
                            {sourceName} → {destinationName}
                          </p>

                          <span className="text-[11px] font-semibold text-primary">
                            {ride.role}
                          </span>
                        </div>

                        {ride.departureTime && (
                          <p className="mt-1 text-xs text-slate-500">
                            {new Date(ride.departureTime).toLocaleString()}
                          </p>
                        )}
                      </Link>
                    );
                  })}
              </div>
            </section>
          )}
        </div>
      </main>
    );
}