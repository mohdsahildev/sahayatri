import Link from "next/link";
import { ArrowRight, CarFront } from "lucide-react";

export default function PostRideCta() {
  return (
    <section className="mt-8">
      <div className="flex flex-col items-start justify-between gap-5 rounded-2xl bg-secondary px-6 py-5 text-white sm:flex-row sm:items-center md:px-7">
        <div className="flex items-center gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-tertiary text-secondary">
            <CarFront size={21} strokeWidth={2} />
          </div>

          <div>
            <h2 className="font-sans text-base font-bold">
              Planning a journey?
            </h2>

            <p className="mt-1 text-sm text-white/70">
              Share your route with people going your way.
            </p>
          </div>
        </div>

        <Link
          href="/post-ride"
          className="flex shrink-0 items-center gap-2 rounded-xl bg-primary px-5 py-2.5 font-sans text-sm font-bold text-white transition hover:bg-tertiary hover:text-secondary"
        >
          Post a Ride
          <ArrowRight size={16} strokeWidth={2} />
        </Link>
      </div>
    </section>
  );
}