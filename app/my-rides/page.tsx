import Link from "next/link";
import Navbar from "@/components/layout/navbar";
import { getMyRides, type MyRide } from "@/lib/api/rides";
import MyRideActions from "@/components/rides/my-ride-actions";

export default async function MyRidesPage() {
  let data: {
    createdRides: MyRide[];
    joinedRides: MyRide[];
  };

  try {
    data = await getMyRides();
  } catch {
    return (
      <>
        <Navbar />

        <main className="mx-auto w-full max-w-[1200px] px-5 py-12">
          <h1 className="font-sans text-3xl font-bold text-secondary">
            My Rides
          </h1>

          <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-8 text-center">
            <p className="font-semibold text-secondary">
              Please log in to view your rides.
            </p>
          </div>
        </main>
      </>
    );
  }

  const createdRides = data?.createdRides ?? [];
  const joinedRides = data?.joinedRides ?? [];

  const allCreatedUpcoming = createdRides.filter(
    (ride) => new Date(ride.departureTime) >= new Date()
  );

  const allCreatedPast = createdRides.filter(
    (ride) => new Date(ride.departureTime) < new Date()
  );

  const allJoinedUpcoming = joinedRides.filter(
    (ride) => new Date(ride.departureTime) >= new Date()
  );

  const allJoinedPast = joinedRides.filter(
    (ride) => new Date(ride.departureTime) < new Date()
  );

  return (
    <>
      <Navbar />

      <main className="mx-auto w-full max-w-[1200px] px-5 py-12">
        <div>
          <h1 className="font-sans text-3xl font-bold text-secondary">
            My Rides
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Manage the rides you&apos;ve created and joined.
          </p>
        </div>

        {/* Created rides */}
        <section className="mt-8">
          <h2 className="font-sans text-xl font-bold text-secondary">
            Rides you&apos;ve created
          </h2>

          <RideSection
            title="Upcoming"
            rides={allCreatedUpcoming}
            emptyMessage="You have no upcoming rides you've created."
            isCreated={true}
          />

          <RideSection
            title="Past"
            rides={allCreatedPast}
            emptyMessage="No past rides."
            muted
            isCreated={true}
          />
        </section>

        {/* Joined rides */}
        <section className="mt-10">
          <h2 className="font-sans text-xl font-bold text-secondary">
            Rides you&apos;ve joined
          </h2>

          <RideSection
            title="Upcoming"
            rides={allJoinedUpcoming}
            emptyMessage="You have no upcoming rides you've joined."
            isCreated={false}
          />

          <RideSection
            title="Past"
            rides={allJoinedPast}
            emptyMessage="No past rides."
            muted
            isCreated={false}
          />
        </section>
      </main>
    </>
  );
}

function RideSection({
  title,
  rides,
  emptyMessage,
  muted = false,
  isCreated,
}: {
  title: string;
  rides: MyRide[];
  emptyMessage: string;
  muted?: boolean;
  isCreated: boolean;
}) {
  return (
    <div className="mt-5">
      <h3 className="text-sm font-bold uppercase tracking-wide text-slate-500">
        {title}
      </h3>

      {rides.length === 0 ? (
        <p className="mt-3 text-sm text-slate-400">
          {emptyMessage}
        </p>
      ) : (
        <div className="mt-3 space-y-4">
          {rides.map((ride) => (
            <RideItem
              key={ride._id}
              ride={ride}
              muted={muted}
              isCreated={isCreated}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function RideItem({
  ride,
  muted,
  isCreated,
}: {
  ride: MyRide;
  muted: boolean;
  isCreated: boolean;
}) {
  const departure = new Date(ride.departureTime);

  return (
    <Link
      href={`/rides/${ride._id}`}
      className="block transition hover:opacity-95"
    >
      <article
        className={`rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-primary/30 hover:shadow-sm ${
          muted ? "opacity-70" : ""
        }`}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="font-sans text-base font-bold text-secondary">
              {ride.source.name}
            </p>

            <p className="mt-1 text-sm text-slate-500">
              → {ride.destination.name}
            </p>
          </div>

          <span className="shrink-0 font-sans text-lg font-bold text-primary">
            ₹{ride.price}
          </span>
        </div>

        <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-500">
          <span>
            {departure.toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </span>

          <span>
            {departure.toLocaleTimeString("en-IN", {
              hour: "numeric",
              minute: "2-digit",
            })}
          </span>

          <span>
            {ride.bookedSeats}/{ride.seatsAvailable} seats booked
          </span>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <span className="rounded-full bg-neutral px-3 py-1 text-xs font-semibold capitalize text-secondary">
            {ride.status}
          </span>

          <span className="text-xs font-semibold text-primary">
            View ride →
          </span>
        </div>
        <MyRideActions
          rideId={ride._id}
          isCreated={isCreated}
          status={ride.status}
        />
      </article>
    </Link>
  );
}