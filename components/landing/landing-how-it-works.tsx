"use client";

import Link from "next/link";
import { ArrowRight, Search, UserCheck, Shield } from "lucide-react";

export default function LandingHowItWorks() {
  const steps = [
    {
      number: "01",
      icon: Search,
      title: "Find or Offer a Ride",
      description:
        "Search routes by origin and destination or post your empty seats with customizable seat limits and preferences.",
      linkText: "Browse live & published empty seats →",
      href: "/home",
    },
    {
      number: "02",
      icon: UserCheck,
      title: "Request & Confirm",
      description:
        "Drivers receive requests, inspect passenger profiles, and accept matches. Chat opens directly for ride coordination.",
      linkText: "Instant confirmations & chat →",
      href: "/home",
    },
    {
      number: "03",
      icon: Shield,
      title: "Travel & Review",
      description:
        "Verify boarding with a 4-digit PIN for passenger safety. Trip completes, you're automatically billed, and both leave rating and feedback for the community.",
      linkText: "Boarding PIN & community reviews →",
      href: "/home",
    },
  ];

  return (
    <section className="py-16 md:py-24">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-end">
        <div className="lg:col-span-6">
          <span className="text-xs font-bold uppercase tracking-wider text-[#C8522E]">
            OIL-POWERED CARPOOLING
          </span>
          <h2 className="mt-2 font-sans text-3xl font-black tracking-tight text-[#1E2022] sm:text-4xl">
            How SahaYatri connects you
          </h2>
        </div>

        <div className="lg:col-span-6">
          <p className="text-sm leading-relaxed text-slate-600 sm:text-base">
            From discovering fellow commuters to split last-mile costs, every
            interaction is designed for maximum personal connection, total safety,
            and hand-held ease.
          </p>
        </div>
      </div>

      <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-3">
        {steps.map((step) => {
          const Icon = step.icon;
          return (
            <div
              key={step.number}
              className="group relative flex flex-col justify-between rounded-3xl border border-[#EAE6DF] bg-white p-8 shadow-sm transition hover:shadow-md"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-sans text-4xl font-black text-[#C8522E]/80">
                    {step.number}
                  </span>
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FAF8F5] text-slate-400 transition group-hover:bg-[#EAF4ED] group-hover:text-[#2E6F40]">
                    <Icon size={20} />
                  </div>
                </div>

                <h3 className="mt-6 font-sans text-xl font-bold text-[#1E2022]">
                  {step.title}
                </h3>

                <p className="mt-3 text-sm leading-relaxed text-slate-600">
                  {step.description}
                </p>
              </div>

              <div className="mt-8 border-t border-slate-100 pt-6">
                <Link
                  href={step.href}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#C8522E] transition hover:text-[#B34524]"
                >
                  <span>{step.linkText}</span>
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
