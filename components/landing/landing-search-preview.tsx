"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MapPin, Calendar, Users, Search, ArrowLeftRight } from "lucide-react";
import LocationSearch from "@/components/location/location-search";

export default function LandingSearchPreview() {
  const router = useRouter();

  const [from, setFrom] = useState("Pune (Shivajinagar)");
  const [to, setTo] = useState("Mumbai (BDKR / Dadar)");
  const [date, setDate] = useState("");
  const [seats, setSeats] = useState("1");

  function handleSwap() {
    setFrom(to);
    setTo(from);
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();

    const query = new URLSearchParams();

    if (from.trim()) query.set("from", from.trim());
    if (to.trim()) query.set("to", to.trim());
    if (date) query.set("date", date);
    if (seats) query.set("minSeats", seats);

    router.push(`/home?${query.toString()}`);
  }

  return (
    <div className="relative z-10 -mt-2 mb-16">
      <form
        onSubmit={handleSearch}
        className="rounded-3xl border border-[#EAE6DF] bg-white p-4 shadow-xl sm:p-6"
      >
        <div className="grid grid-cols-1 items-center gap-3 md:grid-cols-[1fr_auto_1fr_180px_130px_auto]">
          {/* FROM Location */}
          <div className="rounded-2xl border border-slate-100 bg-[#FAF8F5] px-4 py-3">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">
              FROM
            </label>
            <div className="mt-1 flex items-center gap-2">
              <MapPin size={16} className="text-[#C8522E] shrink-0" />
              <input
                type="text"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                placeholder="Leaving from..."
                className="w-full bg-transparent text-sm font-bold text-[#1E2022] outline-none placeholder:text-slate-400"
              />
            </div>
          </div>

          {/* Swap Button */}
          <button
            type="button"
            onClick={handleSwap}
            aria-label="Swap locations"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition hover:border-[#C8522E] hover:text-[#C8522E] mx-auto md:mx-0"
          >
            <ArrowLeftRight size={16} />
          </button>

          {/* TO Location */}
          <div className="rounded-2xl border border-slate-100 bg-[#FAF8F5] px-4 py-3">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">
              TO
            </label>
            <div className="mt-1 flex items-center gap-2">
              <MapPin size={16} className="text-[#C8522E] shrink-0" />
              <input
                type="text"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                placeholder="Going to..."
                className="w-full bg-transparent text-sm font-bold text-[#1E2022] outline-none placeholder:text-slate-400"
              />
            </div>
          </div>

          {/* DATE */}
          <div className="rounded-2xl border border-slate-100 bg-[#FAF8F5] px-4 py-3">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">
              DATE
            </label>
            <div className="mt-1 flex items-center gap-2">
              <Calendar size={16} className="text-slate-400 shrink-0" />
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-transparent text-sm font-bold text-[#1E2022] outline-none"
              />
            </div>
          </div>

          {/* SEATS */}
          <div className="rounded-2xl border border-slate-100 bg-[#FAF8F5] px-4 py-3">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">
              SEATS
            </label>
            <div className="mt-1 flex items-center gap-2">
              <Users size={16} className="text-slate-400 shrink-0" />
              <select
                value={seats}
                onChange={(e) => setSeats(e.target.value)}
                className="w-full bg-transparent text-sm font-bold text-[#1E2022] outline-none"
              >
                <option value="1">1 Seat</option>
                <option value="2">2 Seats</option>
                <option value="3">3 Seats</option>
                <option value="4">4+ Seats</option>
              </select>
            </div>
          </div>

          {/* SUBMIT BUTTON */}
          <button
            type="submit"
            className="flex h-full min-h-[52px] items-center justify-center gap-2 rounded-2xl bg-[#C8522E] px-6 py-3 text-sm font-bold text-white shadow-md transition hover:bg-[#B34524]"
          >
            <Search size={18} />
            <span>Search Rides</span>
          </button>
        </div>
      </form>
    </div>
  );
}
