"use client";

import Link from "next/link";
import { Compass, Play, Sparkles } from "lucide-react";

export default function ScenicRouteTeaser() {
  return (
    <section className="relative mt-8 overflow-hidden rounded-3xl border border-[#EAE6DF] bg-gradient-to-r from-[#FAF8F5] via-[#F4EFE6] to-[#EAE4D9] p-5 sm:p-6 shadow-xs">
      {/* Background decorative path line */}
      <svg
        className="absolute right-0 top-0 h-full w-1/2 pointer-events-none opacity-20"
        viewBox="0 0 400 120"
        fill="none"
      >
        <path
          d="M0 80 Q 100 20, 200 80 T 400 20"
          stroke="#C8522E"
          strokeWidth="3"
          strokeDasharray="6 6"
        />
      </svg>

      <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-[#C8522E] shadow-xs border border-[#EAE6DF]">
            <Compass size={24} />
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-sans text-lg font-extrabold text-[#1E2022]">
                Take the Scenic Route
              </h3>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[#D0E5D5] bg-[#EAF4ED] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#2E6F40]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#2E6F40] animate-pulse" />
                <span>3D Mini-Game · Live</span>
              </span>
            </div>
            <p className="mt-0.5 text-xs font-medium text-slate-600">
              Take a break, relax, and drive along interactive 3D scenic routes.
            </p>
          </div>
        </div>

        <Link
          href="/scenic-route"
          className="inline-flex items-center justify-center gap-2 self-start rounded-xl bg-[#C8522E] px-6 py-3 font-sans text-xs font-bold text-white shadow-xs transition hover:bg-[#B34524] active:scale-98 sm:self-auto"
        >
          <Play size={14} className="fill-current" />
          <span>Play Scenic Route</span>
        </Link>
      </div>
    </section>
  );
}

