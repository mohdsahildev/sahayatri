import Link from "next/link";
import { ArrowRight, Clock3, MapPin } from "lucide-react";

const nearbyRides = [
  {
    id: "nearby-1",
    from: "Kochi",
    to: "Alappuzha",
    date: "Today",
    time: "5:30 PM",
    price: 180,
  },
  {
    id: "nearby-2",
    from: "Kochi",
    to: "Thrissur",
    date: "Tomorrow",
    time: "8:00 AM",
    price: 250,
  },
];

export default function NearbyRides() {
  return (
    <aside className="space-y-6">
        
      {/* Nearby rides */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <div>
          <div className="flex items-center gap-2">
            <MapPin size={18} className="text-primary" />

            <h2 className="font-sans text-lg font-bold text-secondary">
              Nearby rides
            </h2>
          </div>

          <p className="mt-1 text-xs text-slate-500">
            Journeys starting around you.
          </p>
        </div>

        <div className="mt-4 space-y-3">
          {nearbyRides.map((ride) => (
            <Link
              key={ride.id}
              href={`/rides/${ride.id}`}
              className="block rounded-xl border border-slate-100 p-3 transition hover:border-primary/30 hover:bg-neutral"
            >
              <div className="flex items-center justify-between gap-3">
                <p className="truncate font-sans text-sm font-bold text-secondary">
                  {ride.from} → {ride.to}
                </p>

                <span className="shrink-0 font-sans text-sm font-bold text-primary">
                  ₹{ride.price}
                </span>
              </div>

              <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-500">
                <Clock3 size={13} />
                {ride.date}, {ride.time}
              </div>
            </Link>
          ))}
        </div>
      </section>
      {/* Recent activity */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="flex items-center justify-between">
          <h2 className="font-sans text-lg font-bold text-secondary">
            Recent activity
          </h2>

          <Link
            href="/my-rides"
            className="text-xs font-semibold text-primary hover:text-secondary"
          >
            View all
          </Link>
        </div>

        <div className="mt-4 divide-y divide-slate-100">
          <Link
            href="/rides/ride-1"
            className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-secondary font-sans text-xs font-bold text-white">
              A
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate font-sans text-sm font-semibold text-secondary">
                Arjun
              </p>

              <p className="mt-0.5 truncate text-xs text-slate-500">
                Kochi → Bangalore
              </p>
            </div>

            <ArrowRight
              size={15}
              className="shrink-0 text-slate-400"
            />
          </Link>

          <Link
            href="/rides/ride-2"
            className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-tertiary font-sans text-xs font-bold text-secondary">
              M
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate font-sans text-sm font-semibold text-secondary">
                Meera
              </p>

              <p className="mt-0.5 truncate text-xs text-slate-500">
                Kozhikode → Kochi
              </p>
            </div>

            <ArrowRight
              size={15}
              className="shrink-0 text-slate-400"
            />
          </Link>
        </div>
      </section>

    </aside>
  );
}