"use client";

import { Users, Compass, MessageCircle, DollarSign } from "lucide-react";

export default function LandingCoreBenefits() {
  const benefits = [
    {
      icon: Users,
      title: "Verified Community",
      description:
        "Real identities, verified profile badges, and mutual rating history. Build real connections everywhere you travel.",
    },
    {
      icon: Compass,
      title: "Flexible Rides",
      description:
        "Find trips leaving your way or post your own route in 60 seconds. Set customizable seat pricing and preferences.",
    },
    {
      icon: MessageCircle,
      title: "Easy Coordination",
      description:
        "Instant in-app chat to coordinate pickup points & route details. Keep privacy protected without exposing your phone number.",
    },
    {
      icon: DollarSign,
      title: "Transparent Rates",
      description:
        "Zero dynamic surge pricing. Fixed rates visible up-front. Drivers and riders split actual trip costs without price spikes.",
    },
  ];

  return (
    <section className="py-16 md:py-24 border-t border-[#EAE6DF]">
      <div className="mx-auto max-w-3xl text-center">
        <span className="text-xs font-bold uppercase tracking-wider text-[#C8522E]">
          OUR CORE VALUES
        </span>
        <h2 className="mt-2 font-sans text-3xl font-black tracking-tight text-[#1E2022] sm:text-4xl">
          A mobility system built around people, not surge algorithms
        </h2>
        <p className="mt-4 text-sm leading-relaxed text-slate-600 sm:text-base">
          Designed to make intercity transit hand-held, cheap, and fundamentally safe.
        </p>
      </div>

      <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {benefits.map((benefit, index) => {
          const Icon = benefit.icon;
          return (
            <div
              key={index}
              className="rounded-3xl border border-[#EAE6DF] bg-white p-7 shadow-xs transition hover:shadow-md"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FAF8F5] text-[#C8522E]">
                <Icon size={22} />
              </div>

              <h3 className="mt-6 font-sans text-lg font-bold text-[#1E2022]">
                {benefit.title}
              </h3>

              <p className="mt-3 text-xs leading-relaxed text-slate-600">
                {benefit.description}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
