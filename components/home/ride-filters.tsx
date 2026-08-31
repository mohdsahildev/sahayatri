"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { ChevronDown, SlidersHorizontal } from "lucide-react";

const sortOptions = [
  { label: "Recommended", value: "" },
  { label: "Soonest departure", value: "departureTime" },
  { label: "Lowest price", value: "price" },
  { label: "Closest", value: "distance" },
];

export default function RideFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const sort = searchParams.get("sort") ?? "";
  const showFilters = searchParams.get("filters") === "open";

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());

    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }

    params.delete("page");

    router.push(`/?${params.toString()}`);
  }

  function toggleFilters() {
    const params = new URLSearchParams(searchParams.toString());

    if (showFilters) {
      params.delete("filters");
    } else {
      params.set("filters", "open");
    }

    router.push(`/?${params.toString()}`);
  }

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
          <button
            type="button"
            onClick={toggleFilters}
            className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 font-sans text-sm font-semibold transition ${
              showFilters
                ? "border-primary bg-primary/5 text-primary"
                : "border-slate-200 bg-white text-secondary hover:border-primary hover:text-primary"
            }`}
          >
            <SlidersHorizontal size={17} strokeWidth={1.8} />
            Filter
          </button>

          <div className="relative">
            <select
              value={sort}
              onChange={(event) =>
                updateParam("sort", event.target.value)
              }
              className="appearance-none rounded-xl border border-slate-200 bg-white py-2.5 pl-4 pr-10 font-sans text-sm font-semibold text-secondary outline-none transition hover:border-primary focus:border-primary"
              aria-label="Sort rides"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
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

      {showFilters && (
        <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-5">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <FilterSelect
              label="Departure time"
              value={searchParams.get("timeFrom") ?? ""}
              onChange={(value) =>
                updateParam("timeFrom", value)
              }
              options={[
                ["", "Any time"],
                ["06:00", "Morning"],
                ["12:00", "Afternoon"],
                ["17:00", "Evening"],
                ["21:00", "Night"],
              ]}
            />

            <FilterSelect
              label="Price"
              value={searchParams.get("maxPrice") ?? ""}
              onChange={(value) =>
                updateParam("maxPrice", value)
              }
              options={[
                ["", "Any price"],
                ["200", "Under ₹200"],
                ["500", "Under ₹500"],
                ["1000", "Under ₹1000"],
              ]}
            />

            <FilterSelect
              label="Available seats"
              value={searchParams.get("minSeats") ?? ""}
              onChange={(value) =>
                updateParam("minSeats", value)
              }
              options={[
                ["", "Any"],
                ["1", "1+ seat"],
                ["2", "2+ seats"],
                ["3", "3+ seats"],
              ]}
            />

            <FilterSelect
              label="Vehicle type"
              value={searchParams.get("vehicleType") ?? ""}
              onChange={(value) =>
                updateParam("vehicleType", value)
              }
              options={[
                ["", "Any vehicle"],
                ["car", "Car"],
                ["bike", "Bike"],
                ["suv", "SUV"],
              ]}
            />
          </div>
        </div>
      )}
    </section>
  );
}

interface FilterSelectProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: [string, string][];
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: FilterSelectProps) {
  return (
    <div>
      <label className="block font-sans text-xs font-semibold text-slate-500">
        {label}
      </label>

      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-secondary outline-none focus:border-primary"
      >
        {options.map(([optionValue, optionLabel]) => (
          <option key={optionValue} value={optionValue}>
            {optionLabel}
          </option>
        ))}
      </select>
    </div>
  );
}