import Link from "next/link";
import Navbar from "@/components/layout/navbar";
import { getMyRides, type MyRide } from "@/lib/api/rides";

export default async function MyRidesPage() {
  let data: { createdRides: MyRide[]; joinedRides: MyRide[] };

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

          {createdRides.length === 0 ? (
            <p className="mt-4 text-sm text-slate-500">
              You haven&apos;t created any rides yet.
            </p>
          ) : (
            <div className="mt-4 space-y-4">
              {createdRides.map((ride) => (
                <RideItem key={ride._id} ride={ride} />
              ))}
            </div>
          )}
        </section>

        {/* Joined rides */}
        <section className="mt-10">
          <h2 className="font-sans text-xl font-bold text-secondary">
            Rides you&apos;ve joined
          </h2>

          {joinedRides.length === 0 ? (
            <p className="mt-4 text-sm text-slate-500">
              You haven&apos;t joined any rides yet.
            </p>
          ) : (
            <div className="mt-4 space-y-4">
              {joinedRides.map((ride) => (
                <RideItem key={ride._id} ride={ride} />
              ))}
            </div>
          )}
        </section>
      </main>
    </>
  );
}

function RideItem({ ride }: { ride: MyRide }) {
  const departure = new Date(ride.departureTime);

  return (
    <Link href={`/rides/${ride._id}`} className="block transition hover:opacity-95">
      <article className="rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-primary/30 hover:shadow-sm">
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

        <div className="mt-4">
          <span className="rounded-full bg-neutral px-3 py-1 text-xs font-semibold capitalize text-secondary">
            {ride.status}
          </span>
        </div>
      </article>
    </Link>
  );
}