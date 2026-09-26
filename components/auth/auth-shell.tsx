"use client";

import Link from "next/link";
import Image from "next/image";
import { Check, Shield, Users, Sparkles, ArrowLeft } from "lucide-react";

interface AuthShellProps {
  children: React.ReactNode;
  activePage?: "login" | "register" | "verify-otp";
}

export default function AuthShell({ children }: AuthShellProps) {
  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#1E2022] flex flex-col lg:flex-row">
      {/* ============================================================ */}
      {/* LEFT PANEL — BRAND & TRAVEL STORY (50% on lg+ screens)       */}
      {/* ============================================================ */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-8 lg:p-10 xl:p-14 border-r border-[#EBE6DE] bg-[#F5F2EC]/60 relative overflow-hidden">
        {/* Subtle Ambient Pattern/Texture */}
        <div className="absolute inset-0 bg-[radial-gradient(#E8E2D8_1px,transparent_1px)] [background-size:24px_24px] opacity-40 pointer-events-none" />

        {/* Top: Logo & Brand (40px height) — remains top-left */}
        <div className="relative z-10 h-10 flex items-center mb-6 lg:mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2.5 transition hover:opacity-90"
            aria-label="SahaYatri home"
          >
            <Image
              src="/logo/SahaYatri-logo.svg"
              alt="SahaYatri logo"
              width={38}
              height={38}
              priority
            />
            <span className="font-sans text-2xl font-bold tracking-tight text-[#1E2022]">
              SahaYatri
            </span>
          </Link>
        </div>

        {/* Main Content Area: Centered horizontally in the left half */}
        <div className="relative z-10 my-auto py-2 w-full flex justify-center">
          <div className="w-full max-w-[480px] xl:max-w-[520px]">
            {/* Eyebrow */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF0EB] text-[#C8522E] text-xs font-semibold tracking-wider uppercase mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              Travel Together
            </div>

            {/* Heading */}
            <h2 className="font-sans text-3xl xl:text-4xl font-extrabold tracking-tight text-[#1E2022] leading-[1.18]">
              Travel together. <br />
              <span className="text-[#C8522E]">Arrive a little lighter.</span>
            </h2>

            {/* Clean Supporting Paragraph */}
            <p className="mt-3 text-sm text-[#5A6068] leading-relaxed">
              Share everyday journeys with people heading the same way. Connect, coordinate, and share the journey.
            </p>

            {/* Editorial Travel Image Card */}
            <div className="mt-6 relative rounded-2xl overflow-hidden border border-[#E5DFD7] shadow-sm bg-white aspect-[16/8.5] max-h-64 w-full group">
              <Image
                src="/images/hero_scenic_drive.jpg"
                alt="Scenic road journey"
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                sizes="(max-width: 1200px) 50vw, 45vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            </div>

            {/* 3 Core Benefits */}
            <div className="mt-5 space-y-2.5">
              <div className="flex items-center gap-3">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-[#2E6F40]/10 text-[#2E6F40]">
                  <Shield className="h-3.5 w-3.5" />
                </div>
                <span className="text-xs sm:text-sm font-semibold text-[#1E2022]">
                  Verified co-travelers & boarding PIN security
                </span>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-[#C8522E]/10 text-[#C8522E]">
                  <Check className="h-3.5 w-3.5 stroke-[2.5]" />
                </div>
                <span className="text-xs sm:text-sm font-semibold text-[#1E2022]">
                  Fair shared travel costs without surge pricing
                </span>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-[#1E2022]/10 text-[#1E2022]">
                  <Users className="h-3.5 w-3.5" />
                </div>
                <span className="text-xs sm:text-sm font-semibold text-[#1E2022]">
                  Real journeys, trusted community reviews
                </span>
              </div>
            </div>

          </div>
        </div>

        {/* Bottom: Subtle Footer Statement */}
        <div className="relative z-10 pt-4 border-t border-[#EBE6DE]/80 text-xs text-[#7C828A]">
          Community carpooling for everyday journeys.
        </div>
      </div>

      {/* ============================================================ */}
      {/* RIGHT PANEL — AUTH FORM CONTAINER (50% on lg+ screens)       */}
      {/* ============================================================ */}
      <div className="flex-1 lg:w-1/2 flex flex-col justify-between p-6 sm:p-8 lg:p-10 xl:p-14 overflow-y-auto">
        {/* Top Bar on Desktop & Mobile */}
        <div className="flex items-center justify-between h-10 mb-6 lg:mb-8">
          {/* Mobile Logo (hidden on lg) */}
          <div className="lg:hidden">
            <Link
              href="/"
              className="flex items-center gap-2"
              aria-label="SahaYatri home"
            >
              <Image
                src="/logo/SahaYatri-logo.svg"
                alt="SahaYatri logo"
                width={34}
                height={34}
                priority
              />
              <span className="font-sans text-xl font-bold tracking-tight text-[#1E2022]">
                SahaYatri
              </span>
            </Link>
          </div>

          {/* Desktop Spacer / Back link */}
          <div className="hidden lg:block" />

          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#6C727A] hover:text-[#1E2022] transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Home
          </Link>
        </div>

        {/* Center Form Wrapper */}
        <div className="my-auto w-full flex flex-col items-center py-2">
          <div className="w-full max-w-[440px] xl:max-w-[460px]">
            {children}

            {/* Tightened Supporting Footer Note */}
            <p className="mt-6 text-center text-xs text-[#8C929A]">
              Safe, community-driven carpooling · © {new Date().getFullYear()} SahaYatri
            </p>
          </div>
        </div>

        {/* Invisible bottom spacer to match left footer line height */}
        <div className="hidden lg:block pt-4 text-xs invisible">
          Spacer
        </div>
      </div>
    </div>
  );
}
