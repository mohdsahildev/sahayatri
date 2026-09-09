import Link from "next/link";
import { ArrowLeft,
  Clock3, 
  Users, 
  Car, 
  ShieldCheck,
  PhoneOff,
  Share2,
  Cigarette,
  Music,
  PawPrint,
  Luggage,
  Snowflake,
  MessageCircle,  
  } from "lucide-react";
import { serverApiFetch } from "@/lib/api/server-client";
import RideActions from "@/components/rides/ride-actions";
import RideReview from "@/components/rides/ride-review";

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

  const response = await serverApiFetch<RideResponse>(
    `/api/rides/${id}`
  );

  const ride = response.data;

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

  const seatsLeft = Math.max(
    ride.seatsAvailable - ride.bookedSeats,
    0
  );

  const driverName =
    ride.driverInfo?.name ??
    (typeof ride.driver === "object"
      ? ride.driver.name
      : null) ??
    "SahaYatri user";

  const driverRating = ride.driverInfo?.rating ?? 0;
  const driverRides = ride.driverInfo?.rideCount ?? 0;
  const driverVerified =
    ride.driverInfo?.isVerified ?? false;

  const driverId =
    typeof ride.driver === "string"
      ? ride.driver
      : ride.driver._id ?? "";

  const isDriver =
    Boolean(currentUserId) && currentUserId === driverId;

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

  return (
    <>
      <main className="mx-auto w-full max-w-[1100px] px-5 py-8 sm:px-8">
        {/* Back */}
        <Link
          href="/home"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-primary"
        >
          <ArrowLeft size={16} />
          Back to rides
        </Link>

        {/* Header */}
        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-neutral px-3 py-1 text-xs font-semibold capitalize text-secondary">
                  {ride.status ?? "scheduled"}
                </span>
              </div>

              <h1 className="mt-4 text-2xl font-bold text-secondary sm:text-3xl">
                {ride.source.name}
              </h1>

              <p className="mt-1 text-base text-slate-500">
                → {ride.destination.name}
              </p>
            </div>

            <div className="shrink-0 sm:text-right">
              <p className="text-2xl font-bold text-secondary">
                ₹{ride.price}
              </p>

              <p className="text-xs text-slate-500">
                per seat
              </p>
            </div>
          </div>

          {/* Journey info */}
          <div className="mt-6 grid gap-4 border-t border-slate-100 pt-5 sm:grid-cols-3">
            <div className="flex items-start gap-3">
              <Clock3
                size={18}
                className="mt-0.5 shrink-0 text-primary"
              />

              <div>
                <p className="text-xs font-semibold text-slate-500">
                  Departure
                </p>

                <p className="mt-1 text-sm font-semibold text-secondary">
                  {departure.toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </p>

                <p className="text-sm text-slate-500">
                  {departure.toLocaleTimeString("en-IN", {
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Users
                size={18}
                className="mt-0.5 shrink-0 text-primary"
              />

              <div>
                <p className="text-xs font-semibold text-slate-500">
                  Seats
                </p>

                <p className="mt-1 text-sm font-semibold text-secondary">
                  {seatsLeft} available
                </p>

                <p className="text-sm text-slate-500">
                  {ride.bookedSeats} already booked
                </p>
              </div>
            </div>

            {ride.duration !== undefined && (
              <div className="flex items-start gap-3">
                <Clock3
                  size={18}
                  className="mt-0.5 shrink-0 text-primary"
                />

                <div>
                  <p className="text-xs font-semibold text-slate-500">
                    Duration
                  </p>

                  <p className="mt-1 text-sm font-semibold text-secondary">
                    {ride.duration} minutes
                  </p>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Main content */}
        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
          {/* Details */}
          <div className="space-y-6">
            {/* Driver */}
            <section className="rounded-2xl border border-slate-200 bg-white p-6">
              <h2 className="text-lg font-bold text-secondary">
                Your driver
              </h2>

              <div className="mt-4 flex items-center gap-4">
                {driverId ? (
                  <Link href={`/profile/${driverId}`} className="transition hover:opacity-90">
                    {ride.driverInfo?.profilePic ? (
                      <img
                        src={ride.driverInfo.profilePic}
                        alt={driverName}
                        className="h-14 w-14 rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-secondary text-lg font-bold text-white">
                        {driverName.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </Link>
                ) : ride.driverInfo?.profilePic ? (
                  <img
                    src={ride.driverInfo.profilePic}
                    alt={driverName}
                    className="h-14 w-14 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-secondary text-lg font-bold text-white">
                    {driverName.charAt(0).toUpperCase()}
                  </div>
                )}

                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      href={`/profile/${driverId}`}
                      className="font-semibold text-secondary transition hover:text-primary"
                    >
                      {driverName}
                    </Link>

                    {driverVerified && (
                      <span className="text-xs font-semibold text-primary">
                        ✓ Verified
                      </span>
                    )}
                  </div>

                  <p className="mt-1 text-sm text-slate-500">
                    {driverRating.toFixed(1)} · {driverRides} rides
                  </p>
                </div>
              </div>
            </section>

            {/* Vehicle */}
            {ride.vehicle && (
              <section className="rounded-2xl border border-slate-200 bg-white p-6">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Car size={18} className="text-primary" />

                    <h2 className="text-lg font-bold text-secondary">
                      Vehicle
                    </h2>
                  </div>

                  {ride.vehicle.verified && (
                    <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700">
                      ✓ Verified vehicle
                    </span>
                  )}
                </div>

                {ride.vehicle.image && (
                  <img
                    src={ride.vehicle.image}
                    alt={`${ride.vehicle.brand ?? ""} ${ride.vehicle.model ?? ""}`}
                    className="mt-4 h-48 w-full rounded-xl object-cover"
                  />
                )}

                <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                  <div>
                    <p className="text-xs text-slate-500">
                      Vehicle
                    </p>

                    <p className="mt-1 font-semibold capitalize text-secondary">
                      {[
                        ride.vehicle.brand,
                        ride.vehicle.model,
                      ]
                        .filter(Boolean)
                        .join(" ") || "Not specified"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-500">
                      Type
                    </p>

                    <p className="mt-1 font-semibold capitalize text-secondary">
                      {ride.vehicle.type ?? "Not specified"}
                    </p>
                  </div>
                </div>
              </section>
            )}

            {ride.preferences && (
              <section className="rounded-2xl border border-border bg-white p-6 shadow-sm">
                <div className="mb-5 flex items-center gap-2">
                  <ShieldCheck size={18} className="text-primary" />
                  <h2 className="text-lg font-bold text-secondary">
                    Ride Preferences
                  </h2>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {ride.preferences.womenOnly && (
                    <PreferenceItem
                      icon={<Users size={18} />}
                      label="Women only"
                    />
                  )}

                  {ride.preferences.verifiedOnly && (
                    <PreferenceItem
                      icon={<ShieldCheck size={18} />}
                      label="Verified users only"
                    />
                  )}

                  {ride.preferences.hidePhoneNumber && (
                    <PreferenceItem
                      icon={<PhoneOff size={18} />}
                      label="Phone number hidden"
                    />
                  )}

                  {ride.preferences.requireRideShare && (
                    <PreferenceItem
                      icon={<Share2 size={18} />}
                      label="Ride sharing required"
                    />
                  )}

                  {ride.preferences.smokingAllowed && (
                    <PreferenceItem
                      icon={<Cigarette size={18} />}
                      label="Smoking allowed"
                    />
                  )}

                  {ride.preferences.musicAllowed && (
                    <PreferenceItem
                      icon={<Music size={18} />}
                      label="Music allowed"
                    />
                  )}

                  {ride.preferences.petsAllowed && (
                    <PreferenceItem
                      icon={<PawPrint size={18} />}
                      label="Pets allowed"
                    />
                  )}

                  {ride.preferences.luggageSpace && (
                    <PreferenceItem
                      icon={<Luggage size={18} />}
                      label="Luggage space available"
                    />
                  )}

                  {ride.preferences.acAvailable && (
                    <PreferenceItem
                      icon={<Snowflake size={18} />}
                      label="AC available"
                    />
                  )}

                  {ride.preferences.conversationLevel && (
                    <PreferenceItem
                      icon={<MessageCircle size={18} />}
                      label={`Conversation: ${
                        ride.preferences.conversationLevel.charAt(0).toUpperCase() +
                        ride.preferences.conversationLevel.slice(1)
                      }`}
                    />
                  )}

                  {ride.preferences.genderPreference &&
                    ride.preferences.genderPreference !== "any" && (
                      <PreferenceItem
                        icon={<Users size={18} />}
                        label={`Gender preference: ${
                          ride.preferences.genderPreference.charAt(0).toUpperCase() +
                          ride.preferences.genderPreference.slice(1)
                        }`}
                      />
                    )}
                </div>
              </section>
            )}

            {/* Description */}
            {ride.description && (
              <section className="rounded-2xl border border-slate-200 bg-white p-6">
                <h2 className="text-lg font-bold text-secondary">
                  About this ride
                </h2>

                <p className="mt-3 text-sm leading-6 text-slate-600">
                  {ride.description}
                </p>
              </section>
            )}

            {canReviewDriver && (
              <RideReview
                rideId={ride._id}
                target={{
                  id: driverId,
                  name: driverName,
                }}
              />
            )}
          </div>

          {/* Actions */}
          <RideActions
            rideId={ride._id}
            driverId={
              typeof ride.driver === "string"
                ? ride.driver
                : ride.driver._id ?? ""
            }
            status={ride.status ?? "scheduled"}
            seatsLeft={seatsLeft}
          />
        </div>
      </main>
    </>
  );
}

function PreferenceItem({
  icon,
  label,
}: {
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl bg-gray-50 px-4 py-3">
      <span className="text-primary">{icon}</span>
      <span className="text-sm font-medium text-secondary">{label}</span>
    </div>
  );
}