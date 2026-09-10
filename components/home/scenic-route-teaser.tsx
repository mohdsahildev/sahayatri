"use client";

import { useState } from "react";
import { Compass, Play, Sparkles, X } from "lucide-react";

export default function ScenicRouteTeaser() {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
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
                <span className="rounded-full border border-[#C8522E]/30 bg-[#C8522E]/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#C8522E]">
                  Mini-Game · Coming Soon
                </span>
              </div>
              <p className="mt-0.5 text-xs font-medium text-slate-600">
                A little something for the road.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowModal(true)}
            className="inline-flex items-center justify-center gap-2 self-start rounded-xl border border-[#EAE6DF] bg-white px-5 py-3 font-sans text-xs font-bold text-[#1E2022] shadow-xs transition hover:border-[#1E2022] hover:bg-[#1E2022] hover:text-white sm:self-auto"
          >
            <Play size={14} className="fill-current" />
            <span>Play Preview</span>
          </button>
        </div>
      </section>

      {/* Teaser Preview Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="relative w-full max-w-md rounded-3xl border border-[#EAE6DF] bg-white p-6 shadow-xl">
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-[#1E2022]"
            >
              <X size={18} />
            </button>

            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EAF4ED] text-[#2E6F40]">
              <Sparkles size={24} />
            </div>

            <span className="mt-4 inline-block rounded-full bg-[#C8522E]/10 px-3 py-1 text-[10px] font-bold text-[#C8522E]">
              Three.js Mini-Game Teaser
            </span>

            <h3 className="mt-2 font-sans text-xl font-bold text-[#1E2022]">
              Take the Scenic Route
            </h3>

            <p className="mt-2 text-xs leading-relaxed text-slate-600">
              We&apos;re building an interactive 3D road trip mini-game powered by Three.js!
              Relax and enjoy interactive scenic routes during long intercity journeys. Full release coming soon to SahaYatri.
            </p>

            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="mt-6 w-full rounded-xl bg-[#1E2022] py-3 text-xs font-bold text-white transition hover:bg-[#C8522E]"
            >
              Got it, thanks!
            </button>
          </div>
        </div>
      )}
    </>
  );
}
