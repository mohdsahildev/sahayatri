"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Plus, Star, CheckCircle2 } from "lucide-react";

export default function LandingHero() {
  return (
    <section className="pt-8 pb-12 md:pt-12 md:pb-16">
      <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12">
        {/* Left Content Column */}
        <div className="lg:col-span-7">
          {/* Top Pill Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-[#D0E5D5] bg-[#EAF4ED] px-4 py-1.5 text-xs font-bold text-[#2E6F40]">
            <span>✨</span>
            <span>Community-powered carpooling for daily & weekend travel</span>
          </div>

          {/* Main Headline */}
          <h1 className="mt-6 font-sans text-4xl font-black leading-[1.12] tracking-tight text-[#1E2022] sm:text-5xl lg:text-6xl">
            Going somewhere?{" "}
            <span className="block text-[#C8522E]">Never travel alone</span>
            again.
          </h1>

          {/* Subtitle / Description */}
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-slate-600 sm:text-lg">
            Connect with verified fellow commuters, offer empty seats, split trip
            costs easily without unnecessary fees or complicated processes.
          </p>

          {/* CTA Buttons */}
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link
              href="/home"
              className="inline-flex items-center gap-2.5 rounded-2xl bg-[#C8522E] px-7 py-4 text-base font-bold text-white shadow-md transition hover:bg-[#B34524]"
            >
              <span>Find a Ride</span>
              <ArrowRight size={18} />
            </Link>

            <Link
              href="/post-ride"
              className="inline-flex items-center gap-2.5 rounded-2xl border border-[#EAE6DF] bg-white px-7 py-4 text-base font-bold text-[#1E2022] shadow-xs transition hover:border-slate-300 hover:bg-slate-50"
            >
              <Plus size={18} className="text-[#C8522E]" />
              <span>Offer a Ride</span>
            </Link>
          </div>

          {/* Trust Checkmarks */}
          <div className="mt-8 flex flex-wrap items-center gap-6 border-t border-[#EAE6DF] pt-6 text-xs font-semibold text-slate-600 sm:text-sm">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-[#2E6F40]" />
              <span>Verified Community Only</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-[#2E6F40]" />
              <span>Free To Join Algorithm</span>
            </div>
          </div>
        </div>

        {/* Right Card / Visual Showcase */}
        <div className="lg:col-span-5">
          <div className="relative overflow-hidden rounded-3xl border border-[#EAE6DF] bg-white p-3 shadow-xl">
            {/* Cinematic Image Frame */}
            <div className="relative h-[340px] w-full overflow-hidden rounded-2xl sm:h-[400px]">
              <Image
                src="/images/hero_scenic_drive.jpg"
                alt="SahaYatri scenic trip drive"
                fill
                priority
                className="object-cover transition duration-700 hover:scale-105"
              />

              {/* Location Tag */}
              <div className="absolute top-4 left-4 rounded-full bg-black/60 px-3.5 py-1.5 text-xs font-bold text-white backdrop-blur-md">
                📍 Intercity Route Preview
              </div>
            </div>

            {/* Floating Driver Info Card (Explicitly Labelled Example Ride) */}
            <div className="mt-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#1E2022] font-sans text-sm font-bold text-white">
                    VC
                  </div>

                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-[#1E2022]">
                        Verified Commuter
                      </span>
                      <span className="rounded-full bg-[#EAF4ED] px-2 py-0.5 text-[10px] font-bold text-[#2E6F40]">
                        Example Ride
                      </span>
                    </div>

                    <p className="text-xs text-slate-500">
                      Daily Commuter · Shared Route Preview
                    </p>
                  </div>
                </div>

                <div className="shrink-0 text-right">
                  <span className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    Est. Cost Share
                  </span>
                  <span className="text-lg font-black text-[#C8522E]">
                    ₹350
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
