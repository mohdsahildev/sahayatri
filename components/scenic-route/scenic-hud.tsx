"use client";

import Link from "next/link";
import {
  ArrowLeft,
  RotateCcw,
  Pause,
  Play,
  Compass,
  MapPin,
  HelpCircle,
} from "lucide-react";

export interface ScenicMetrics {
  speedKmh: number;
  distanceMeters: number;
  gear: "P" | "D" | "R" | "N";
  headingDeg: number;
  isOnRoad: boolean;
}

interface ScenicHUDProps {
  metrics: ScenicMetrics;
  isPaused: boolean;
  onTogglePause: () => void;
  onResetCar: () => void;
  onShowHelp: () => void;
}

export default function ScenicHUD({
  metrics,
  isPaused,
  onTogglePause,
  onResetCar,
  onShowHelp,
}: ScenicHUDProps) {
  const distanceKm = (metrics.distanceMeters / 1000).toFixed(2);
  const speedPercentage = Math.min(100, Math.round((metrics.speedKmh / 80) * 100));

  // Determine scenic zone based on distance traveled
  function getScenicZone(distanceM: number): { name: string; tag: string } {
    if (distanceM < 300) {
      return { name: "Lonavala Valley Start", tag: "Elevation 620m" };
    }
    if (distanceM < 800) {
      return { name: "Western Ghats Ridge", tag: "Scenic Overlook" };
    }
    if (distanceM < 1500) {
      return { name: "Sahyadri Pass Trail", tag: "Winding Curves" };
    }
    return { name: "Khandala Highland Highway", tag: "Summit Highway" };
  }

  const currentZone = getScenicZone(metrics.distanceMeters);

  return (
    <div className="pointer-events-none absolute inset-0 z-20 flex flex-col justify-between p-4 sm:p-6 select-none">
      {/* Top Bar */}
      <div className="flex items-start justify-between gap-3">
        {/* Left Actions */}
        <div className="pointer-events-auto flex items-center gap-2">
          <Link
            href="/home"
            className="inline-flex items-center gap-2 rounded-2xl border border-[#EAE6DF] bg-white/90 px-3.5 py-2 font-sans text-xs font-bold text-[#1E2022] shadow-md backdrop-blur-md transition hover:bg-white hover:text-[#C8522E] hover:border-[#C8522E]/40 active:scale-95"
          >
            <ArrowLeft size={15} />
            <span className="hidden sm:inline">Exit to SahaYatri</span>
            <span className="sm:hidden">Exit</span>
          </Link>

          <button
            type="button"
            onClick={onTogglePause}
            aria-label={isPaused ? "Resume game" : "Pause game"}
            className="inline-flex h-9 w-9 items-center justify-center rounded-2xl border border-[#EAE6DF] bg-white/90 text-[#1E2022] shadow-md backdrop-blur-md transition hover:bg-white hover:text-[#C8522E] active:scale-95"
            title="Pause / Resume (ESC)"
          >
            {isPaused ? <Play size={15} /> : <Pause size={15} />}
          </button>

          <button
            type="button"
            onClick={onResetCar}
            aria-label="Respawn car to road"
            className="inline-flex items-center gap-1.5 rounded-2xl border border-[#EAE6DF] bg-white/90 px-3 py-2 text-xs font-bold text-slate-700 shadow-md backdrop-blur-md transition hover:bg-white hover:text-[#C8522E] active:scale-95"
            title="Reset car to starting line (R)"
          >
            <RotateCcw size={13} />
            <span className="hidden md:inline">Respawn</span>
          </button>
        </div>

        {/* Center Location Banner */}
        <div className="hidden lg:flex items-center gap-2.5 rounded-2xl border border-[#EAE6DF]/80 bg-white/85 px-4 py-2 shadow-md backdrop-blur-md">
          <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#FAF0EB] text-[#C8522E]">
            <MapPin size={14} />
          </div>
          <div className="text-left">
            <span className="block font-sans text-xs font-black text-[#1E2022]">
              {currentZone.name}
            </span>
            <span className="block text-[10px] font-bold text-slate-400">
              {currentZone.tag} · Pune ↔ Mumbai Corridor
            </span>
          </div>
        </div>

        {/* Right Status / Distance / Help */}
        <div className="pointer-events-auto flex items-center gap-2">
          {/* Road / Offroad Badge */}
          <div
            className={`hidden sm:inline-flex items-center gap-1.5 rounded-2xl border px-3 py-1.5 text-[11px] font-bold shadow-md backdrop-blur-md transition ${
              metrics.isOnRoad
                ? "border-emerald-200 bg-emerald-50/90 text-emerald-800"
                : "border-amber-200 bg-amber-50/90 text-amber-800"
            }`}
          >
            <span
              className={`h-2 w-2 rounded-full ${
                metrics.isOnRoad ? "bg-emerald-500 animate-pulse" : "bg-amber-500"
              }`}
            />
            <span>{metrics.isOnRoad ? "On Route" : "Off-Road"}</span>
          </div>

          {/* Odometer */}
          <div className="flex items-center gap-1.5 rounded-2xl border border-[#EAE6DF] bg-white/90 px-3.5 py-2 text-xs font-bold text-[#1E2022] shadow-md backdrop-blur-md">
            <Compass size={14} className="text-[#C8522E]" />
            <span>{distanceKm} km</span>
          </div>

          {/* Controls Help button */}
          <button
            type="button"
            onClick={onShowHelp}
            aria-label="View Controls"
            className="flex h-9 w-9 items-center justify-center rounded-2xl border border-[#EAE6DF] bg-white/90 text-slate-700 shadow-md backdrop-blur-md transition hover:bg-white hover:text-[#C8522E] active:scale-95"
            title="Controls Guide"
          >
            <HelpCircle size={16} />
          </button>
        </div>
      </div>

      {/* Bottom Bar: Mini Controls Hint & Speedometer HUD */}
      <div className="flex items-end justify-between gap-4">
        {/* Bottom Left: Quick Driving Guide */}
        <div className="pointer-events-auto hidden sm:flex items-center gap-2.5 rounded-2xl border border-[#EAE6DF]/90 bg-white/85 px-4 py-2.5 text-xs text-slate-600 shadow-lg backdrop-blur-md">
          <div className="flex items-center gap-1">
            <kbd className="rounded-md border border-slate-300 bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] font-bold text-[#1E2022]">
              W
            </kbd>
            <kbd className="rounded-md border border-slate-300 bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] font-bold text-[#1E2022]">
              A
            </kbd>
            <kbd className="rounded-md border border-slate-300 bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] font-bold text-[#1E2022]">
              S
            </kbd>
            <kbd className="rounded-md border border-slate-300 bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] font-bold text-[#1E2022]">
              D
            </kbd>
          </div>
          <span className="font-semibold text-slate-500">Drive</span>
          <span className="text-slate-300">·</span>
          <span className="font-semibold text-slate-500">🖱️ Drag to look</span>
          <span className="text-slate-300">·</span>
          <kbd className="rounded-md border border-slate-300 bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] font-bold text-[#1E2022]">
            R
          </kbd>
          <span className="font-semibold text-slate-500">Reset</span>
        </div>

        {/* Bottom Right: Digital Speedometer & Gear Box */}
        <div className="pointer-events-auto flex items-center gap-3 rounded-3xl border border-[#EAE6DF] bg-white/95 p-3.5 shadow-xl backdrop-blur-md">
          {/* Gear Pill */}
          <div className="flex flex-col items-center justify-center rounded-2xl border border-[#EAE6DF] bg-[#FAF8F5] px-3 py-1.5">
            <span className="text-[9px] font-extrabold uppercase text-slate-400">
              GEAR
            </span>
            <span
              className={`font-sans text-lg font-black ${
                metrics.gear === "R"
                  ? "text-amber-600"
                  : metrics.gear === "D"
                  ? "text-[#C8522E]"
                  : "text-slate-600"
              }`}
            >
              {metrics.gear}
            </span>
          </div>

          {/* Speed Display */}
          <div className="flex flex-col pr-1 min-w-[90px]">
            <div className="flex items-baseline gap-1">
              <span className="font-sans text-3xl sm:text-4xl font-black tracking-tight text-[#1E2022]">
                {metrics.speedKmh}
              </span>
              <span className="text-[11px] font-extrabold text-slate-400 uppercase">
                km/h
              </span>
            </div>

            {/* Speed Bar */}
            <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-slate-100 border border-slate-200/50">
              <div
                className="h-full bg-gradient-to-r from-[#C8522E] to-amber-500 transition-all duration-150 rounded-full"
                style={{ width: `${speedPercentage}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
