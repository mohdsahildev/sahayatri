import Navbar from "@/components/layout/navbar";
import { serverApiFetch } from "@/lib/api/server-client";

interface MyRide {
  _id: string;
  source: {
    name: string;
  };
  destination: {
    name: string;
  };
  departureTime: string;
  seatsAvailable: number;
  bookedSeats: number;
  price: number;
  status: string;
}

interface MyRidesResponse {
  success: boolean;
  message: string;
  data: {
    createdRides: MyRide[];
    joinedRides: MyRide[];
  };
}

export default async function MyRidesPage() {
  let data: MyRidesResponse["data"];

  try {
    const response = await serverApiFetch<MyRidesResponse>(
      "/api/rides/user/me"
    );

    data = response.data;
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

  return (
    <>
      <Navbar />

      <main className="mx-auto w-full max-w-[1200px] px-5 py-12">
        <div>
          <h1 className="font-sans text-3xl font-bold text-secondary">
            My Rides
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Manage the rides you've created and joined.
          </p>
        </div>

        {/* Created rides */}
        <section className="mt-8">
          <h2 className="font-sans text-xl font-bold text-secondary">
            Rides you've created
          </h2>

          {data.createdRides.length === 0 ? (
            <p className="mt-4 text-sm text-slate-500">
              You haven't created any rides yet.
            </p>
          ) : (
            <div className="mt-4 space-y-4">
              {data.createdRides.map((ride) => (
                <RideItem key={ride._id} ride={ride} />
              ))}
            </div>
          )}
        </section>

        {/* Joined rides */}
        <section className="mt-10">
          <h2 className="font-sans text-xl font-bold text-secondary">
            Rides you've joined
          </h2>

          {data.joinedRides.length === 0 ? (
            <p className="mt-4 text-sm text-slate-500">
              You haven't joined any rides yet.
            </p>
          ) : (
            <div className="mt-4 space-y-4">
              {data.joinedRides.map((ride) => (
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
    <article className="rounded-2xl border border-slate-200 bg-white p-5">
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
  );
}