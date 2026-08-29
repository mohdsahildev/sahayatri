import Link from "next/link";
import {
  ArrowRight,
  Clock3,
  Users,
  BadgeCheck,
} from "lucide-react";

export interface Ride {
  id: string;
  driver: {
    name: string;
    rating: number;
    rides: number;
    verified: boolean;
  };
  from: string;
  to: string;
  date: string;
  time: string;
  seatsAvailable: number;
  price: number;
  description?: string;
}

interface RideCardProps {
  ride: Ride;
}

export default function RideCard({ ride }: RideCardProps) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-primary/30 hover:shadow-sm">
      {/* Driver + price */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-secondary font-sans text-sm font-bold text-white">
            {ride.driver.name.charAt(0).toUpperCase()}
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-sans text-sm font-bold text-secondary">
                {ride.driver.name}
              </h3>

              {ride.driver.verified && (
                <span className="inline-flex items-center gap-1 text-xs font-medium text-primary">
                  <BadgeCheck size={14} />
                  Verified
                </span>
              )}
            </div>

            <p className="mt-0.5 text-xs text-slate-500">
              {ride.driver.rating.toFixed(1)} · {ride.driver.rides} rides
            </p>
          </div>
        </div>

        <div className="shrink-0 text-right">
          <p className="font-sans text-lg font-bold text-secondary">
            ₹{ride.price}
          </p>
          <p className="text-xs text-slate-400">per seat</p>
        </div>
      </div>

      {/* Route */}
      <div className="mt-6 flex items-center gap-3">
        <div className="min-w-0">
          <p className="truncate font-sans text-base font-bold text-secondary">
            {ride.from}
          </p>
        </div>

        <div className="flex min-w-12 flex-1 items-center gap-2">
          <div className="h-px flex-1 bg-slate-300" />
          <ArrowRight
            size={18}
            strokeWidth={1.8}
            className="shrink-0 text-primary"
          />
          <div className="h-px flex-1 bg-slate-300" />
        </div>

        <div className="min-w-0 text-right">
          <p className="truncate font-sans text-base font-bold text-secondary">
            {ride.to}
          </p>
        </div>
      </div>

      {/* Ride information */}
      <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-slate-600">
        <span className="inline-flex items-center gap-1.5">
          <Clock3 size={15} className="text-primary" />
          {ride.date}, {ride.time}
        </span>

        <span className="inline-flex items-center gap-1.5">
          <Users size={15} className="text-primary" />
          {ride.seatsAvailable}{" "}
          {ride.seatsAvailable === 1 ? "seat" : "seats"} available
        </span>
      </div>

      {ride.description && (
        <p className="mt-4 rounded-xl bg-neutral px-4 py-3 text-sm leading-6 text-slate-600">
          {ride.description}
        </p>
      )}

      {/* Action */}
      <div className="mt-5 border-t border-slate-100 pt-4">
        <Link
          href={`/rides/${ride.id}`}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 font-sans text-sm font-bold text-white transition hover:bg-secondary"
        >
          View Ride
          <ArrowRight size={16} />
        </Link>
      </div>
    </article>
  );
}