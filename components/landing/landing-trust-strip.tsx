"use client";

import { ShieldCheck, KeyRound, MessageSquare, Tag } from "lucide-react";

export default function LandingTrustStrip() {
  const trustItems = [
    {
      icon: ShieldCheck,
      title: "Verified Profiles",
      description: "Thorough verification of driver and passenger identity.",
    },
    {
      icon: KeyRound,
      title: "Boarding PIN Check",
      description: "Secure 4-digit OTP system for every boarding.",
    },
    {
      icon: MessageSquare,
      title: "Direct In-App Chat",
      description: "Coordinate pickup points & timings inside the app.",
    },
    {
      icon: Tag,
      title: "Transparent Pricing",
      description: "Know exactly what costs are split. No hidden surcharges.",
    },
  ];

  return (
    <section className="py-10 border-y border-[#EAE6DF] bg-white/60">
      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
        {trustItems.map((item, index) => {
          const Icon = item.icon;
          return (
            <div key={index} className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#EAF4ED] text-[#2E6F40]">
                <Icon size={22} />
              </div>
              <div>
                <h3 className="font-sans text-base font-bold text-[#1E2022]">
                  {item.title}
                </h3>
                <p className="mt-1 text-xs leading-relaxed text-slate-500">
                  {item.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
