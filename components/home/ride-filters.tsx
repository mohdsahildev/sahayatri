"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { ChevronDown, SlidersHorizontal } from "lucide-react";

interface RideFiltersProps {
  totalRides?: number;
  from?: string;
  to?: string;
}

export default function RideFilters({ totalRides, from, to }: RideFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const sort = searchParams.get("sort") ?? "";
  const showFilters = searchParams.get("filters") === "open";
  const timeFrom = searchParams.get("timeFrom") ?? "";
  const maxPrice = searchParams.get("maxPrice") ?? "";
  const vehicleType = searchParams.get("vehicleType") ?? "";

  // Active filters counter
  const activeFiltersCount = [timeFrom, maxPrice, vehicleType].filter(Boolean).length;

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());

    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }

    params.delete("page");

    router.push(`/home?${params.toString()}`);
  }

  function toggleFilters() {
    const params = new URLSearchParams(searchParams.toString());

    if (showFilters) {
      params.delete("filters");
    } else {
      params.set("filters", "open");
    }

    router.push(`/home?${params.toString()}`);
  }

  let routeLabel = "All Routes";
  if (from && to) {
    routeLabel = `${from} → ${to}`;
  } else if (from) {
    routeLabel = `Leaving from ${from}`;
  } else if (to) {
    routeLabel = `Going to ${to}`;
  }

  return (
    <section className="mt-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Left Stats */}
        <div className="flex items-center gap-2">
          <span className="font-sans text-xl font-bold tracking-tight text-[#1E2022]">
            {totalRides !== undefined ? `${totalRides} rides available` : "Available rides"}
          </span>
          <span className="text-slate-400">·</span>
          <span className="text-sm font-semibold text-slate-500">{routeLabel}</span>
        </div>

        {/* Right Filter Controls Pills */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={toggleFilters}
            className={`inline-flex items-center gap-2 rounded-xl border px-3.5 py-2 text-xs font-bold transition ${
              showFilters || activeFiltersCount > 0
                ? "border-[#C8522E] bg-[#C8522E]/10 text-[#C8522E]"
                : "border-[#EAE6DF] bg-white text-[#1E2022] hover:border-slate-300"
            }`}
          >
            <SlidersHorizontal size={14} />
            <span>Filters</span>
            {activeFiltersCount > 0 && (
              <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-[#C8522E] px-1 text-[10px] text-white">
                {activeFiltersCount}
              </span>
            )}
          </button>

          {/* Time Filter Pill */}
          <div className="relative">
            <select
              value={timeFrom}
              onChange={(e) => updateParam("timeFrom", e.target.value)}
              className="appearance-none rounded-xl border border-[#EAE6DF] bg-white py-2 pl-3.5 pr-8 font-sans text-xs font-bold text-[#1E2022] outline-none transition hover:border-slate-300 cursor-pointer"
            >
              <option value="">Departure Time</option>
              <option value="06:00">Morning (6 AM+)</option>
              <option value="12:00">Afternoon (12 PM+)</option>
              <option value="17:00">After 5:00 PM</option>
              <option value="21:00">Night (9 PM+)</option>
            </select>
            <ChevronDown size={14} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
          </div>

          {/* Price Filter Pill */}
          <div className="relative">
            <select
              value={maxPrice}
              onChange={(e) => updateParam("maxPrice", e.target.value)}
              className="appearance-none rounded-xl border border-[#EAE6DF] bg-white py-2 pl-3.5 pr-8 font-sans text-xs font-bold text-[#1E2022] outline-none transition hover:border-slate-300 cursor-pointer"
            >
              <option value="">Max Price</option>
              <option value="350">Max Price: Under ₹350</option>
              <option value="450">Max Price: Under ₹450</option>
              <option value="600">Max Price: Under ₹600</option>
            </select>
            <ChevronDown size={14} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
          </div>

          {/* Vehicle Type Filter Pill */}
          <div className="relative">
            <select
              value={vehicleType}
              onChange={(e) => updateParam("vehicleType", e.target.value)}
              className="appearance-none rounded-xl border border-[#EAE6DF] bg-white py-2 pl-3.5 pr-8 font-sans text-xs font-bold text-[#1E2022] outline-none transition hover:border-slate-300 cursor-pointer"
            >
              <option value="">Vehicle Type</option>
              <option value="car">Sedan / EV</option>
              <option value="suv">SUV</option>
              <option value="bike">Bike</option>
            </select>
            <ChevronDown size={14} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
          </div>

          {/* Sort Select */}
          <div className="relative">
            <select
              value={sort}
              onChange={(e) => updateParam("sort", e.target.value)}
              className="appearance-none rounded-xl border border-[#EAE6DF] bg-white py-2 pl-3.5 pr-8 font-sans text-xs font-bold text-[#1E2022] outline-none transition hover:border-slate-300 cursor-pointer"
              aria-label="Sort rides"
            >
              <option value="">Sort: Earliest Departure</option>
              <option value="departureTime">Earliest Departure</option>
              <option value="price">Lowest Price</option>
              <option value="distance">Closest</option>
            </select>
            <ChevronDown size={14} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
          </div>
        </div>
      </div>

      {showFilters && (
        <div className="mt-4 rounded-2xl border border-[#EAE6DF] bg-white p-4 shadow-xs">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className="block font-sans text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Departure Time
              </label>
              <select
                value={timeFrom}
                onChange={(e) => updateParam("timeFrom", e.target.value)}
                className="mt-1 w-full rounded-xl border border-[#EAE6DF] bg-[#FAF8F5] px-3 py-2 text-xs font-semibold text-[#1E2022]"
              >
                <option value="">Any time</option>
                <option value="06:00">Morning (6 AM+)</option>
                <option value="12:00">Afternoon (12 PM+)</option>
                <option value="17:00">Evening (5 PM+)</option>
                <option value="21:00">Night (9 PM+)</option>
              </select>
            </div>

            <div>
              <label className="block font-sans text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Max Price
              </label>
              <select
                value={maxPrice}
                onChange={(e) => updateParam("maxPrice", e.target.value)}
                className="mt-1 w-full rounded-xl border border-[#EAE6DF] bg-[#FAF8F5] px-3 py-2 text-xs font-semibold text-[#1E2022]"
              >
                <option value="">Any price</option>
                <option value="200">Under ₹200</option>
                <option value="450">Under ₹450</option>
                <option value="1000">Under ₹1000</option>
              </select>
            </div>

            <div>
              <label className="block font-sans text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Min Seats
              </label>
              <select
                value={searchParams.get("minSeats") ?? ""}
                onChange={(e) => updateParam("minSeats", e.target.value)}
                className="mt-1 w-full rounded-xl border border-[#EAE6DF] bg-[#FAF8F5] px-3 py-2 text-xs font-semibold text-[#1E2022]"
              >
                <option value="">Any</option>
                <option value="1">1+ seat</option>
                <option value="2">2+ seats</option>
                <option value="3">3+ seats</option>
              </select>
            </div>

            <div>
              <label className="block font-sans text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Vehicle
              </label>
              <select
                value={vehicleType}
                onChange={(e) => updateParam("vehicleType", e.target.value)}
                className="mt-1 w-full rounded-xl border border-[#EAE6DF] bg-[#FAF8F5] px-3 py-2 text-xs font-semibold text-[#1E2022]"
              >
                <option value="">Any vehicle</option>
                <option value="car">Car</option>
                <option value="bike">Bike</option>
                <option value="suv">SUV</option>
              </select>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}