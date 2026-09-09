"use client";

import { ShieldCheck, KeyRound, Star, Phone, Lock, MessageSquare } from "lucide-react";

export default function LandingSafetySection() {
  const safetyFeatures = [
    {
      icon: KeyRound,
      title: "Boarding PIN Verification",
      description:
        "Unique 4-digit PIN generated for every ride to confirm accurate passenger onboarding.",
    },
    {
      icon: ShieldCheck,
      title: "Verified Drivers & Passengers",
      description:
        "Real ID checks, vehicle verification, and profile badges for peace of mind.",
    },
    {
      icon: Star,
      title: "Genuine Ratings & Reviews",
      description:
        "Transparent feedback from real co-travelers to maintain community trust.",
    },
    {
      icon: MessageSquare,
      title: "Direct In-App Chat",
      description:
        "Coordinate pickup locations and timing safely without sharing private numbers.",
    },
  ];

  return (
    <section id="safety" className="py-16 md:py-24 border-t border-[#EAE6DF]">
      <div className="rounded-3xl border border-[#EAE6DF] bg-[#FAF8F5] p-8 md:p-12 shadow-sm">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:items-center">
          {/* Left Content */}
          <div className="lg:col-span-7">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#D0E5D5] bg-[#EAF4ED] px-4 py-1.5 text-xs font-bold text-[#2E6F40]">
              <ShieldCheck size={14} />
              <span>Safety & Assurances</span>
            </div>

            <h2 className="mt-4 font-sans text-3xl font-black tracking-tight text-[#1E2022] sm:text-4xl">
              Travel with confidence on every route
            </h2>

            <p className="mt-4 text-sm leading-relaxed text-slate-600 sm:text-base">
              Every feature in SahaYatri is thoughtfully designed to ensure clarity
              and mutual trust between riders before you even step into the car.
            </p>

            <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2">
              {safetyFeatures.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <div key={index} className="flex items-start gap-3.5">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white border border-[#EAE6DF] text-[#C8522E] shadow-xs">
                      <Icon size={18} />
                    </div>
                    <div>
                      <h3 className="font-sans text-sm font-bold text-[#1E2022]">
                        {feature.title}
                      </h3>
                      <p className="mt-1 text-xs leading-relaxed text-slate-500">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right UI Showcase Card */}
          <div className="lg:col-span-5">
            <div className="rounded-3xl border border-[#EAE6DF] bg-white p-6 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  CONFIRMED TRIP DETAILS
                </span>
                <span className="rounded-full bg-[#EAF4ED] px-3 py-1 text-[11px] font-bold text-[#2E6F40]">
                  Verified Match
                </span>
              </div>

              {/* Driver Match Info (Generic Concept) */}
              <div className="mt-5 flex items-center justify-between rounded-2xl border border-slate-100 bg-[#FAF8F5] p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#1E2022] font-sans text-sm font-bold text-white">
                    VD
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-[#1E2022]">Verified Driver</span>
                      <span className="inline-flex items-center text-xs font-bold text-amber-500">
                        <Star size={12} className="fill-amber-400 text-amber-400 mr-0.5" />
                        5.0
                      </span>
                    </div>
                    <span className="text-xs text-slate-500">
                      Vehicle Verified · Community Member
                    </span>
                  </div>
                </div>

                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white border border-slate-200 text-slate-500">
                  <Phone size={16} />
                </div>
              </div>

              {/* Boarding PIN Showcase Box (Generic Concept) */}
              <div className="mt-5 rounded-2xl border border-[#C8522E]/20 bg-[#C8522E]/5 p-5 text-center">
                <span className="block text-[11px] font-bold uppercase tracking-wider text-[#C8522E]">
                  BOARDING VERIFICATION
                </span>
                <p className="mt-1 text-xs text-slate-500">
                  Show 4-digit PIN to driver at pickup
                </p>

                <div className="mt-3 inline-flex items-center justify-center gap-3 rounded-xl bg-white border border-[#C8522E]/30 px-6 py-2.5 shadow-xs">
                  <Lock size={18} className="text-[#C8522E]" />
                  <span className="font-mono text-xl font-bold tracking-widest text-[#1E2022]">
                    [ 4-Digit Boarding PIN ]
                  </span>
                </div>
              </div>

              <p className="mt-4 text-center text-[11px] text-slate-400">
                🔒 Boarding protection ensures zero unauthorized route start
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
