"use client";

import { useState } from "react";
import Link from "next/link";
import { Calendar, Compass, History, Plus } from "lucide-react";
import type { MyRide } from "@/lib/api/rides";
import DriverRideCard from "./driver-ride-card";
import PassengerRideCard from "./passenger-ride-card";

interface MyRidesViewProps {
  createdRides: MyRide[];
  joinedRides: MyRide[];
}

type UnifiedRide = MyRide & { role: "driver" | "passenger" };

export default function MyRidesView({
  createdRides = [],
  joinedRides = [],
}: MyRidesViewProps) {
  const [activeTab, setActiveTab] = useState<"upcoming" | "past">("upcoming");

  const now = new Date().getTime();

  // 1. Upcoming Rides (Departure >= current time)
  const upcomingCreated: UnifiedRide[] = createdRides
    .filter((r) => new Date(r.departureTime).getTime() >= now)
    .map((r) => ({ ...r, role: "driver" }));

  const upcomingJoined: UnifiedRide[] = joinedRides
    .filter((r) => new Date(r.departureTime).getTime() >= now)
    .map((r) => ({ ...r, role: "passenger" }));

  // Deduplicate by ID (driver role takes precedence)
  const upcomingMap = new Map<string, UnifiedRide>();
  upcomingJoined.forEach((r) => upcomingMap.set(r._id, r));
  upcomingCreated.forEach((r) => upcomingMap.set(r._id, r));

  const upcomingRides = Array.from(upcomingMap.values()).sort(
    (a, b) =>
      new Date(a.departureTime).getTime() - new Date(b.departureTime).getTime()
  );

  // 2. Past Rides (Departure < current time)
  const pastCreated: UnifiedRide[] = createdRides
    .filter((r) => new Date(r.departureTime).getTime() < now)
    .map((r) => ({ ...r, role: "driver" }));

  const pastJoined: UnifiedRide[] = joinedRides
    .filter((r) => new Date(r.departureTime).getTime() < now)
    .map((r) => ({ ...r, role: "passenger" }));

  // Deduplicate by ID
  const pastMap = new Map<string, UnifiedRide>();
  pastJoined.forEach((r) => pastMap.set(r._id, r));
  pastCreated.forEach((r) => pastMap.set(r._id, r));

  // Sort past rides: most recent first
  const pastRides = Array.from(pastMap.values()).sort(
    (a, b) =>
      new Date(b.departureTime).getTime() - new Date(a.departureTime).getTime()
  );

  const displayedRides = activeTab === "upcoming" ? upcomingRides : pastRides;

  return (
    <div className="space-y-6">
      {/* Pill-Style Tab Switcher */}
      <div className="inline-flex rounded-2xl bg-[#EAE6DF]/60 p-1.5 border border-[#EAE6DF]">
        <button
          type="button"
          onClick={() => setActiveTab("upcoming")}
          className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-bold transition-all duration-150 ${
            activeTab === "upcoming"
              ? "bg-white text-[#1E2022] shadow-sm"
              : "text-slate-600 hover:text-[#1E2022]"
          }`}
        >
          <span>Upcoming</span>
          <span
            className={`rounded-full px-2 py-0.5 text-[10px] font-black ${
              activeTab === "upcoming"
                ? "bg-[#FDF2E9] text-[#C8522E]"
                : "bg-slate-200/80 text-slate-600"
            }`}
          >
            {upcomingRides.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("past")}
          className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-bold transition-all duration-150 ${
            activeTab === "past"
              ? "bg-white text-[#1E2022] shadow-sm"
              : "text-slate-600 hover:text-[#1E2022]"
          }`}
        >
          <span>Past Rides</span>
          <span
            className={`rounded-full px-2 py-0.5 text-[10px] font-black ${
              activeTab === "past"
                ? "bg-[#FDF2E9] text-[#C8522E]"
                : "bg-slate-200/80 text-slate-600"
            }`}
          >
            {pastRides.length}
          </span>
        </button>
      </div>

      {/* Rides Feed / Empty State */}
      {displayedRides.length === 0 ? (
        <div className="rounded-3xl border border-[#EAE6DF] bg-white p-12 text-center shadow-xs">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#FAF8F5] text-slate-400">
            {activeTab === "upcoming" ? (
              <Calendar size={28} className="text-[#C8522E]" />
            ) : (
              <History size={28} className="text-slate-400" />
            )}
          </div>

          <h3 className="mt-4 font-sans text-lg font-bold text-[#1E2022]">
            {activeTab === "upcoming" ? "No upcoming rides" : "No past rides"}
          </h3>

          <p className="mt-1 text-xs text-slate-500 max-w-md mx-auto">
            {activeTab === "upcoming"
              ? "You don't have any upcoming rides yet. Find a shared ride or offer empty seats in your car."
              : "Your completed ride history will appear here once you finish a journey."}
          </p>

          {activeTab === "upcoming" && (
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/home"
                className="inline-flex items-center gap-2 rounded-xl border border-[#EAE6DF] bg-[#FAF8F5] px-4 py-2.5 font-sans text-xs font-bold text-[#1E2022] transition hover:bg-white hover:border-[#1E2022]"
              >
                <Compass size={14} />
                <span>Find a Ride</span>
              </Link>

              <Link
                href="/post-ride"
                className="inline-flex items-center gap-2 rounded-xl bg-[#C8522E] px-4 py-2.5 font-sans text-xs font-bold text-white shadow-xs transition hover:bg-[#B34524]"
              >
                <Plus size={14} />
                <span>Offer a Ride</span>
              </Link>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {displayedRides.map((ride) =>
            ride.role === "driver" ? (
              <DriverRideCard
                key={ride._id}
                ride={ride}
                isPast={activeTab === "past"}
              />
            ) : (
              <PassengerRideCard
                key={ride._id}
                ride={ride}
                isPast={activeTab === "past"}
              />
            )
          )}
        </div>
      )}
    </div>
  );
}
