"use client";

import Link from "next/link";
import { Star, MapPin, Clock, ShieldCheck, KeyRound, ChevronRight } from "lucide-react";
import type { Ride } from "@/components/home/ride-card";

interface LandingPopularRoutesProps {
  rides?: Ride[];
}

export default function LandingPopularRoutes({ rides = [] }: LandingPopularRoutesProps) {
  // Presentation fallback routes if no live backend rides exist
  const displayRides = rides.length > 0 ? rides.slice(0, 3) : [
    {
      id: "sample-1",
      driver: {
        id: "",
        name: "Shyam S.",
        rating: 4.9,
        rides: 52,
        verified: true,
      },
      from: "Pune (Shivajinagar)",
      to: "Mumbai (Dadar)",
      date: "Today",
      time: "08:00 AM",
      seatsAvailable: 3,
      price: 350,
    },
    {
      id: "sample-2",
      driver: {
        id: "",
        name: "Aparna G.",
        rating: 5.0,
        rides: 14,
        verified: true,
      },
      from: "Bangalore (Koramangala)",
      to: "Mysuru (Suburban Stand)",
      date: "Today",
      time: "07:15 AM",
      seatsAvailable: 2,
      price: 420,
    },
    {
      id: "sample-3",
      driver: {
        id: "",
        name: "Hariom G.",
        rating: 4.8,
        rides: 91,
        verified: true,
      },
      from: "Chandigarh (Sec 17)",
      to: "New Delhi (Noida Sec 18)",
      date: "Today",
      time: "08:00 AM",
      seatsAvailable: 3,
      price: 650,
    },
  ];

  return (
    <section className="py-16 md:py-24 border-t border-[#EAE6DF]">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#C8522E]">
            LIVE RIDES NEAR YOU
          </span>
          <h2 className="mt-2 font-sans text-3xl font-black tracking-tight text-[#1E2022] sm:text-4xl">
            Popular routes leaving today
          </h2>
        </div>

        <Link
          href="/home"
          className="inline-flex items-center gap-1 text-sm font-bold text-[#C8522E] transition hover:text-[#B34524]"
        >
          <span>View all available rides</span>
          <ChevronRight size={16} />
        </Link>
      </div>

      <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
        {displayRides.map((ride) => (
          <div
            key={ride.id}
            className="flex flex-col justify-between rounded-3xl border border-[#EAE6DF] bg-white p-6 shadow-sm transition hover:shadow-md"
          >
            <div>
              {/* Driver Header */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  {ride.driver.id ? (
                    <Link
                      href={`/profile/${ride.driver.id}`}
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#1E2022] font-sans text-xs font-bold text-white transition hover:opacity-90"
                    >
                      {ride.driver.name.charAt(0)}
                    </Link>
                  ) : (
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#1E2022] font-sans text-xs font-bold text-white">
                      {ride.driver.name.charAt(0)}
                    </div>
                  )}
                  <div>
                    <div className="flex items-center gap-1.5">
                      {ride.driver.id ? (
                        <Link
                          href={`/profile/${ride.driver.id}`}
                          className="font-bold text-[#1E2022] transition hover:text-[#C8522E]"
                        >
                          {ride.driver.name}
                        </Link>
                      ) : (
                        <span className="font-bold text-[#1E2022]">
                          {ride.driver.name}
                        </span>
                      )}
                      <span className="inline-flex items-center text-xs font-bold text-amber-500">
                        <Star size={12} className="text-amber-500 mr-0.5" />
                        {ride.driver.rating ? ride.driver.rating.toFixed(1) : "5.0"}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-500">
                      {ride.driver.rides} rides host
                    </span>
                  </div>
                </div>

                <span className="rounded-full bg-[#EAF4ED] px-2.5 py-1 text-[11px] font-bold text-[#2E6F40]">
                  Verified Host
                </span>
              </div>

              {/* Journey Route */}
              <div className="mt-5 space-y-4">
                <div className="flex items-start gap-3">
                  <div className="mt-1 flex h-3 w-3 shrink-0 items-center justify-center rounded-full bg-[#C8522E]" />
                  <div>
                    <span className="text-xs font-semibold text-slate-400">
                      {ride.time} · Departure
                    </span>
                    <p className="font-sans text-sm font-bold text-[#1E2022]">
                      {ride.from}
                    </p>
                  </div>
                </div>

                <div className="ml-1.5 h-4 w-0.5 bg-slate-200" />

                <div className="flex items-start gap-3">
                  <MapPin size={16} className="mt-0.5 shrink-0 text-[#2E6F40]" />
                  <div>
                    <span className="text-xs font-semibold text-slate-400">
                      Destination
                    </span>
                    <p className="font-sans text-sm font-bold text-[#1E2022]">
                      {ride.to}
                    </p>
                  </div>
                </div>
              </div>

              {/* Feature Badges */}
              <div className="mt-6 flex flex-wrap gap-2 text-[11px] font-bold text-slate-600">
                <span className="rounded-lg bg-[#FAF8F5] border border-[#EAE6DF] px-2.5 py-1">
                  AC Available
                </span>
                <span className="rounded-lg bg-[#FAF8F5] border border-[#EAE6DF] px-2.5 py-1">
                  Boarding PIN
                </span>
              </div>
            </div>

            {/* Price & Book Action */}
            <div className="mt-8 flex items-center justify-between border-t border-slate-100 pt-5">
              <div>
                <span className="text-2xl font-black text-[#1E2022]">
                  ₹{ride.price}
                </span>
                <span className="block text-[11px] text-slate-400">
                  {ride.seatsAvailable} seats left
                </span>
              </div>

              <Link
                href={ride.id.startsWith("sample") ? "/home" : `/rides/${ride.id}`}
                className="rounded-xl bg-[#C8522E] px-5 py-2.5 text-xs font-bold text-white shadow-xs transition hover:bg-[#B34524]"
              >
                Book Ride
              </Link>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
