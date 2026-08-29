"use client";

import { useState } from "react";
import { ChevronDown, SlidersHorizontal } from "lucide-react";

const sortOptions = [
  "Recommended",
  "Soonest departure",
  "Lowest price",
  "Closest",
];

export default function RideFilters() {
  const [sort, setSort] = useState("Recommended");
  const [showFilters, setShowFilters] = useState(false);

  return (
    <section className="mt-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-sans text-2xl font-bold text-secondary">
            Discover rides
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Find journeys happening your way
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Filter */}
          <button
            type="button"
            onClick={() => setShowFilters((current) => !current)}
            className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 font-sans text-sm font-semibold transition ${
              showFilters
                ? "border-primary bg-primary/5 text-primary"
                : "border-slate-200 bg-white text-secondary hover:border-primary hover:text-primary"
            }`}
          >
            <SlidersHorizontal size={17} strokeWidth={1.8} />
            Filter
          </button>

          {/* Sort */}
          <div className="relative">
            <select
              value={sort}
              onChange={(event) => setSort(event.target.value)}
              className="appearance-none rounded-xl border border-slate-200 bg-white py-2.5 pl-4 pr-10 font-sans text-sm font-semibold text-secondary outline-none transition hover:border-primary focus:border-primary"
              aria-label="Sort rides"
            >
              {sortOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>

            <ChevronDown
              size={16}
              strokeWidth={1.8}
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"
            />
          </div>
        </div>
      </div>

      {/* Filter panel */}
      {showFilters && (
        <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-5">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label
                htmlFor="departure-time"
                className="block font-sans text-xs font-semibold text-slate-500"
              >
                Departure time
              </label>

              <select
                id="departure-time"
                className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-secondary outline-none focus:border-primary"
                defaultValue=""
              >
                <option value="">Any time</option>
                <option value="morning">Morning</option>
                <option value="afternoon">Afternoon</option>
                <option value="evening">Evening</option>
                <option value="night">Night</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="price"
                className="block font-sans text-xs font-semibold text-slate-500"
              >
                Price
              </label>

              <select
                id="price"
                className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-secondary outline-none focus:border-primary"
                defaultValue=""
              >
                <option value="">Any price</option>
                <option value="low">Under ₹200</option>
                <option value="medium">₹200 – ₹500</option>
                <option value="high">₹500+</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="seats"
                className="block font-sans text-xs font-semibold text-slate-500"
              >
                Available seats
              </label>

              <select
                id="seats"
                className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-secondary outline-none focus:border-primary"
                defaultValue=""
              >
                <option value="">Any</option>
                <option value="1">1+ seat</option>
                <option value="2">2+ seats</option>
                <option value="3">3+ seats</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="distance"
                className="block font-sans text-xs font-semibold text-slate-500"
              >
                Distance
              </label>

              <select
                id="distance"
                className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-secondary outline-none focus:border-primary"
                defaultValue=""
              >
                <option value="">Any distance</option>
                <option value="5">Within 5 km</option>
                <option value="10">Within 10 km</option>
                <option value="25">Within 25 km</option>
              </select>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}