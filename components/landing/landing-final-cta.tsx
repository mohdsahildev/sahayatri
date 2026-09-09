"use client";

import Link from "next/link";
import { ArrowRight, Plus, CheckCircle2 } from "lucide-react";

export default function LandingFinalCta() {
  return (
    <section className="py-16 md:py-24">
      <div className="relative overflow-hidden rounded-3xl bg-[#121417] px-8 py-16 text-center text-white md:px-16 md:py-20 shadow-2xl">
        <div className="relative z-10 mx-auto max-w-3xl">
          <span className="text-xs font-bold uppercase tracking-widest text-[#C8522E]">
            GET ON THE ROAD TODAY
          </span>

          <h2 className="mt-3 font-sans text-3xl font-black tracking-tight sm:text-4xl md:text-5xl">
            Ready to find your way together?
          </h2>

          <p className="mt-5 text-base leading-relaxed text-slate-300 sm:text-lg">
            Connect with verified fellow travelers, fill empty seats, and make
            everyday journeys more affordable and enjoyable across India.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/home"
              className="inline-flex items-center gap-2.5 rounded-2xl bg-[#C8522E] px-8 py-4 text-base font-bold text-white shadow-lg transition hover:bg-[#B34524]"
            >
              <span>Find a Ride</span>
              <ArrowRight size={18} />
            </Link>

            <Link
              href="/post-ride"
              className="inline-flex items-center gap-2.5 rounded-2xl border border-slate-700 bg-white/10 px-8 py-4 text-base font-bold text-white backdrop-blur-md transition hover:bg-white/20"
            >
              <Plus size={18} className="text-[#C8522E]" />
              <span>Offer a Ride</span>
            </Link>
          </div>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-8 border-t border-slate-800 pt-8 text-xs font-semibold text-slate-400 sm:text-sm">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-[#2E6F40]" />
              <span>Free registration</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-[#2E6F40]" />
              <span>Profile verification under 2 mins</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
