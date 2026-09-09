"use client";

import { useState } from "react";
import { CalendarDays, MapPin, Search, ArrowRight } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import LocationSearch from "@/components/location/location-search";

export default function RideSearch() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [from, setFrom] = useState(searchParams.get("from") ?? "");
  const [to, setTo] = useState(searchParams.get("to") ?? "");
  const [date, setDate] = useState(searchParams.get("date") ?? "");

  function handleSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const params = new URLSearchParams(searchParams.toString());

    if (from.trim()) {
      params.set("from", from.trim());
    } else {
      params.delete("from");
    }

    if (to.trim()) {
      params.set("to", to.trim());
    } else {
      params.delete("to");
    }

    if (date) {
      params.set("date", date);
    } else {
      params.delete("date");
    }

    params.delete("page");

    const query = params.toString();

    router.push(query ? `/home?${query}` : "/home");
  }

  return (
    <section className="mt-8">
      <form
        onSubmit={handleSearch}
        className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm"
      >
        <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_190px_auto]">
          {/* From */}
          <LocationSearch
            value={from}
            onChangeText={setFrom}
            onSelect={(location) => setFrom(location.name)}
            placeholder="Where from?"
            icon={
              <MapPin
                size={19}
                strokeWidth={1.8}
                className="shrink-0 text-primary"
              />
            }
          />

          {/* To */}
          <LocationSearch
            value={to}
            onChangeText={setTo}
            onSelect={(location) => setTo(location.name)}
            placeholder="Where to?"
            icon={
              <ArrowRight
                size={19}
                strokeWidth={1.8}
                className="shrink-0 text-primary"
              />
            }
          />

          {/* Date */}
          <div className="flex items-center gap-3 rounded-xl border border-slate-200 px-4 py-3">
            <CalendarDays
              size={19}
              strokeWidth={1.8}
              className="shrink-0 text-primary"
            />

            <div className="min-w-0 flex-1">
              <label
                htmlFor="date"
                className="block font-sans text-xs font-semibold text-slate-500"
              >
                Date
              </label>

              <input
                id="date"
                type="date"
                value={date}
                onChange={(event) => setDate(event.target.value)}
                min={new Date().toISOString().split("T")[0]}
                className="mt-0.5 w-full bg-transparent text-sm text-secondary outline-none"
              />
            </div>
          </div>

          {/* Search */}
          <button
            type="submit"
            className="flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 font-sans text-sm font-bold text-white transition hover:bg-secondary"
          >
            <Search size={17} strokeWidth={2} />
            Search
          </button>
        </div>
      </form>
    </section>
  );
}