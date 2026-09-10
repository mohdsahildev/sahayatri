"use client";

import { useState } from "react";
import { CalendarDays, MapPin, Search, ArrowRightLeft } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import LocationSearch from "@/components/location/location-search";

export default function RideSearch() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [from, setFrom] = useState(searchParams.get("from") ?? "");
  const [to, setTo] = useState(searchParams.get("to") ?? "");
  const [date, setDate] = useState(searchParams.get("date") ?? "");
  const [minSeats, setMinSeats] = useState(searchParams.get("minSeats") ?? "1");

  function handleSwap() {
    const temp = from;
    setFrom(to);
    setTo(temp);
  }

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

    if (minSeats && minSeats !== "1") {
      params.set("minSeats", minSeats);
    } else {
      params.delete("minSeats");
    }

    params.delete("page");

    const query = params.toString();

    router.push(query ? `/home?${query}` : "/home");
  }

  return (
    <section className="mt-8">
      <h1 className="font-sans text-3xl font-black tracking-tight text-[#1E2022] sm:text-4xl">
        Where are you going?
      </h1>

      <form
        onSubmit={handleSearch}
        className="mt-4 rounded-3xl border border-[#EAE6DF] bg-white p-3 shadow-xs"
      >
        <div className="grid gap-3 lg:grid-cols-[1fr_auto_1fr_215px_130px_auto] items-stretch">
          {/* Leaving From */}
          <div className="flex flex-col justify-between rounded-2xl border border-[#EAE6DF] bg-[#FAF8F5] p-3 transition focus-within:border-[#C8522E] focus-within:bg-white">
            <span className="block font-sans text-[10px] font-bold uppercase tracking-wider text-slate-400">
              LEAVING FROM
            </span>
            <div className="mt-2 flex h-11 items-center rounded-xl bg-white px-3.5 border border-slate-100 shadow-2xs">
              <LocationSearch
                value={from}
                onChangeText={setFrom}
                onSelect={(location) => setFrom(location.name)}
                placeholder="Pune (Wakad / Hinjawadi)"
                className="border-none p-0 shadow-none bg-transparent w-full"
                icon={
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 border-[#C8522E]">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#C8522E]" />
                  </span>
                }
              />
            </div>
          </div>

          {/* Swap Button */}
          <div className="flex items-center justify-center">
            <button
              type="button"
              onClick={handleSwap}
              aria-label="Swap locations"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#EAE6DF] bg-[#FAF8F5] text-[#1E2022] shadow-xs transition hover:border-slate-300 hover:bg-white"
            >
              <ArrowRightLeft size={16} />
            </button>
          </div>

          {/* Going To */}
          <div className="flex flex-col justify-between rounded-2xl border border-[#EAE6DF] bg-[#FAF8F5] p-3 transition focus-within:border-[#C8522E] focus-within:bg-white">
            <span className="block font-sans text-[10px] font-bold uppercase tracking-wider text-slate-400">
              GOING TO
            </span>
            <div className="mt-2 flex h-11 items-center rounded-xl bg-white px-3.5 border border-slate-100 shadow-2xs">
              <LocationSearch
                value={to}
                onChangeText={setTo}
                onSelect={(location) => setTo(location.name)}
                placeholder="Mumbai (BKC / Dadar)"
                className="border-none p-0 shadow-none bg-transparent w-full"
                icon={
                  <MapPin
                    size={18}
                    className="shrink-0 text-[#1E2022]"
                  />
                }
              />
            </div>
          </div>

          {/* Departure */}
          <div className="flex flex-col justify-between rounded-2xl border border-[#EAE6DF] bg-[#FAF8F5] p-3 transition focus-within:border-[#C8522E] focus-within:bg-white">
            <span className="block font-sans text-[10px] font-bold uppercase tracking-wider text-slate-400">
              DEPARTURE
            </span>
            <div className="mt-2 flex h-11 items-center gap-1.5 rounded-xl bg-white px-3 border border-slate-100 shadow-2xs">
              <CalendarDays size={18} className="shrink-0 text-slate-500" />
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                min={new Date().toISOString().split("T")[0]}
                className="w-full bg-transparent font-sans text-sm font-semibold text-[#1E2022] outline-none cursor-pointer min-w-0"
              />
            </div>
          </div>

          {/* Seats Select */}
          <div className="flex flex-col justify-between rounded-2xl border border-[#EAE6DF] bg-[#FAF8F5] p-3 transition focus-within:border-[#C8522E] focus-within:bg-white">
            <span className="block font-sans text-[10px] font-bold uppercase tracking-wider text-slate-400">
              SEATS
            </span>
            <div className="mt-2 flex h-11 items-center rounded-xl bg-white px-3.5 border border-slate-100 shadow-2xs">
              <select
                value={minSeats}
                onChange={(e) => setMinSeats(e.target.value)}
                className="w-full bg-transparent font-sans text-sm font-semibold text-[#1E2022] outline-none cursor-pointer"
              >
                <option value="1">1 Seat</option>
                <option value="2">2 Seats</option>
                <option value="3">3 Seats</option>
                <option value="4">4 Seats</option>
              </select>
            </div>
          </div>

          {/* Search Button */}
          <div className="flex items-center justify-center">
            <button
              type="submit"
              className="flex h-full min-h-[52px] w-full items-center justify-center gap-2 rounded-2xl bg-[#C8522E] px-6 font-sans text-sm font-bold text-white shadow-sm transition hover:bg-[#B34524]"
            >
              <Search size={17} strokeWidth={2.5} />
              <span>Search Rides</span>
            </button>
          </div>
        </div>
      </form>
    </section>
  );
}