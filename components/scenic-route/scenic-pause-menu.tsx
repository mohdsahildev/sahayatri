"use client";

import Link from "next/link";
import { Play, RotateCcw, ArrowLeft, Gauge } from "lucide-react";
import type { ScenicMetrics } from "./scenic-hud";

interface ScenicPauseMenuProps {
  metrics: ScenicMetrics;
  onResume: () => void;
  onResetCar: () => void;
}

export default function ScenicPauseMenu({
  metrics,
  onResume,
  onResetCar,
}: ScenicPauseMenuProps) {
  const distanceKm = (metrics.distanceMeters / 1000).toFixed(2);

  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center bg-[#1E2022]/40 p-4 backdrop-blur-md animate-in fade-in duration-150">
      <div className="w-full max-w-md rounded-3xl border border-[#EAE6DF] bg-white/95 p-6 sm:p-7 shadow-2xl backdrop-blur-xl">
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FAF0EB] text-[#C8522E] border border-[#C8522E]/20 mb-3">
            <Gauge size={22} />
          </div>

          <h2 className="font-sans text-xl sm:text-2xl font-black tracking-tight text-[#1E2022]">
            Journey Paused
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            Take a breather or respawn back on the main road.
          </p>
        </div>

        {/* Trip Summary Card */}
        <div className="mt-5 grid grid-cols-2 gap-3 rounded-2xl border border-[#EAE6DF] bg-[#FAF8F5] p-3.5">
          <div className="text-center border-r border-[#EAE6DF]/70 pr-2">
            <span className="block text-[10px] font-bold uppercase text-slate-400">
              DISTANCE COVERED
            </span>
            <span className="font-sans text-base font-black text-[#1E2022] mt-0.5 block">
              {distanceKm} km
            </span>
          </div>

          <div className="text-center pl-2">
            <span className="block text-[10px] font-bold uppercase text-slate-400">
              LOCATION
            </span>
            <span className="font-sans text-xs font-bold text-[#C8522E] mt-1 block truncate">
              Sahyadri Highway
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-5 space-y-2.5">
          <button
            type="button"
            onClick={onResume}
            className="flex h-11 w-full items-center justify-center gap-2 rounded-2xl bg-[#C8522E] px-4 font-sans text-xs font-bold text-white shadow-md transition hover:bg-[#B34524] active:scale-98 cursor-pointer"
          >
            <Play size={14} fill="currentColor" />
            <span>Resume Journey</span>
          </button>

          <button
            type="button"
            onClick={() => {
              onResetCar();
              onResume();
            }}
            className="flex h-11 w-full items-center justify-center gap-2 rounded-2xl border border-[#EAE6DF] bg-white px-4 font-sans text-xs font-bold text-[#1E2022] shadow-2xs transition hover:border-[#C8522E] hover:text-[#C8522E] active:scale-98 cursor-pointer"
          >
            <RotateCcw size={14} />
            <span>Respawn to Start Line (R)</span>
          </button>

          <Link
            href="/home"
            className="flex h-11 w-full items-center justify-center gap-2 rounded-2xl border border-transparent bg-slate-100/80 px-4 font-sans text-xs font-bold text-slate-600 transition hover:bg-slate-200/80 hover:text-[#1E2022]"
          >
            <ArrowLeft size={14} />
            <span>Exit to SahaYatri</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
