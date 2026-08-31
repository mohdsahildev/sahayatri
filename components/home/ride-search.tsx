"use client";

import { useState } from "react";
import { CalendarDays, MapPin, Search, ArrowRight } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

export default function RideSearch() {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [date, setDate] = useState("");

  const router = useRouter();
  const searchParams = useSearchParams();

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

    router.push(query ? `/?${query}` : "/");
  }

  return (
    <section className="mt-8">
      <form
        onSubmit={handleSearch}
        className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm"
      >
        <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_190px_auto]">
          {/* From */}
          <div className="flex items-center gap-3 rounded-xl border border-slate-200 px-4 py-3">
            <MapPin
              size={19}
              strokeWidth={1.8}
              className="shrink-0 text-primary"
            />

            <div className="min-w-0 flex-1">
              <label
                htmlFor="from"
                className="block font-sans text-xs font-semibold text-slate-500"
              >
                From
              </label>

              <input
                id="from"
                type="text"
                value={from}
                onChange={(event) => setFrom(event.target.value)}
                placeholder="Where from?"
                className="mt-0.5 w-full bg-transparent text-sm text-secondary outline-none placeholder:text-slate-400"
              />
            </div>
          </div>

          {/* To */}
          <div className="flex items-center gap-3 rounded-xl border border-slate-200 px-4 py-3">
            <ArrowRight
              size={19}
              strokeWidth={1.8}
              className="shrink-0 text-primary"
            />

            <div className="min-w-0 flex-1">
              <label
                htmlFor="to"
                className="block font-sans text-xs font-semibold text-slate-500"
              >
                To
              </label>

              <input
                id="to"
                type="text"
                value={to}
                onChange={(event) => setTo(event.target.value)}
                placeholder="Where to?"
                className="mt-0.5 w-full bg-transparent text-sm text-secondary outline-none placeholder:text-slate-400"
              />
            </div>
          </div>

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