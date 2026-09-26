"use client";

import Link from "next/link";
import {
  Play,
  ArrowLeft,
  Sparkles,
  Mountain,
  Eye,
} from "lucide-react";

interface ScenicStartScreenProps {
  onStart: () => void;
}

export default function ScenicStartScreen({ onStart }: ScenicStartScreenProps) {
  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center bg-[#1E2022]/40 p-4 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-3xl border border-[#EAE6DF] bg-white/95 p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
        {/* Header Badge */}
        <div className="flex items-center justify-between mb-4">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-[#FAF0EB] px-3 py-1 text-xs font-bold text-[#C8522E] border border-[#C8522E]/20">
            <Sparkles size={13} />
            <span>SahaYatri 3D Experience</span>
          </div>
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Sahyadri Highway
          </span>
        </div>

        {/* Title */}
        <h1 className="font-sans text-2xl sm:text-3xl font-black tracking-tight text-[#1E2022]">
          Scenic Route Simulator
        </h1>
        <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
          Experience the serene Western Ghats corridor. Drive the SahaYatri car
          across winding asphalt roads, branch routes, and rolling hillside terrain.
        </p>

        {/* Features / Objective Highlights */}
        <div className="mt-5 grid grid-cols-2 gap-2.5">
          <div className="flex items-start gap-2.5 rounded-2xl border border-[#EAE6DF] bg-[#FAF8F5] p-3">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-white border border-[#EAE6DF] text-[#C8522E]">
              <Mountain size={14} />
            </div>
            <div>
              <span className="block font-sans text-xs font-bold text-[#1E2022]">
                Explore Trails
              </span>
              <span className="block text-[10px] text-slate-400">
                Main & branch roads
              </span>
            </div>
          </div>

          <div className="flex items-start gap-2.5 rounded-2xl border border-[#EAE6DF] bg-[#FAF8F5] p-3">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-white border border-[#EAE6DF] text-[#C8522E]">
              <Eye size={14} />
            </div>
            <div>
              <span className="block font-sans text-xs font-bold text-[#1E2022]">
                360° Free Look
              </span>
              <span className="block text-[10px] text-slate-400">
                Mouse orbit camera
              </span>
            </div>
          </div>
        </div>

        {/* Controls Cheatsheet */}
        <div className="mt-4 rounded-2xl border border-[#EAE6DF] bg-[#FAF8F5] p-4">
          <span className="block font-sans text-[10px] font-black uppercase tracking-wider text-slate-400 mb-2">
            CONTROLS GUIDE
          </span>
          <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-xs">
            <div className="flex items-center gap-2">
              <div className="flex gap-1 font-mono">
                <kbd className="rounded border border-slate-300 bg-white px-1.5 py-0.5 text-[10px] font-bold text-[#1E2022]">
                  W
                </kbd>
                <span className="text-slate-400">/</span>
                <kbd className="rounded border border-slate-300 bg-white px-1.5 py-0.5 text-[10px] font-bold text-[#1E2022]">
                  ↑
                </kbd>
              </div>
              <span className="text-slate-600 font-medium">Drive Forward</span>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex gap-1 font-mono">
                <kbd className="rounded border border-slate-300 bg-white px-1.5 py-0.5 text-[10px] font-bold text-[#1E2022]">
                  S
                </kbd>
                <span className="text-slate-400">/</span>
                <kbd className="rounded border border-slate-300 bg-white px-1.5 py-0.5 text-[10px] font-bold text-[#1E2022]">
                  ↓
                </kbd>
              </div>
              <span className="text-slate-600 font-medium">Reverse</span>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex gap-1 font-mono">
                <kbd className="rounded border border-slate-300 bg-white px-1.5 py-0.5 text-[10px] font-bold text-[#1E2022]">
                  A
                </kbd>
                <kbd className="rounded border border-slate-300 bg-white px-1.5 py-0.5 text-[10px] font-bold text-[#1E2022]">
                  D
                </kbd>
              </div>
              <span className="text-slate-600 font-medium">Steer Left / Right</span>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex gap-1 font-mono">
                <kbd className="rounded border border-slate-300 bg-white px-1.5 py-0.5 text-[10px] font-bold text-[#1E2022]">
                  R
                </kbd>
              </div>
              <span className="text-slate-600 font-medium">Respawn Car</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex flex-col sm:flex-row items-center gap-3">
          <button
            type="button"
            onClick={onStart}
            className="flex h-12 w-full flex-1 items-center justify-center gap-2 rounded-2xl bg-[#C8522E] px-6 font-sans text-sm font-bold text-white shadow-lg transition hover:bg-[#B34524] active:scale-98 cursor-pointer"
          >
            <Play size={16} fill="currentColor" />
            <span>Start Driving</span>
          </button>

          <Link
            href="/home"
            className="flex h-12 w-full sm:w-auto items-center justify-center gap-1.5 rounded-2xl border border-[#EAE6DF] bg-[#FAF8F5] px-5 font-sans text-xs font-bold text-slate-700 transition hover:bg-white hover:text-[#C8522E]"
          >
            <ArrowLeft size={14} />
            <span>Exit</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
