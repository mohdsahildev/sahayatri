import Link from "next/link";
import { ArrowLeft, Clock3, Users, Car } from "lucide-react";
import { serverApiFetch } from "@/lib/api/server-client";
import RideActions from "@/components/rides/ride-actions";

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

    vehicle?: {
      type?: string;
      brand?: string;
      model?: string;
      number?: string;
      image?: string;
      verified?: boolean;
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

                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-secondary">
                      {driverName}
                    </p>

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
                <div className="flex items-center gap-2">
                  <Car size={18} className="text-primary" />

                  <h2 className="text-lg font-bold text-secondary">
                    Vehicle
                  </h2>
                </div>

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