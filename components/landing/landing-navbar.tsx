"use client";

import Link from "next/link";
import Image from "next/image";

export default function LandingNavbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-[#EAE6DF] bg-[#FBF9F5]/90 backdrop-blur-md">
      <nav className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 sm:px-8">
        {/* Brand Logo */}
        <Link
          href="/"
          className="flex items-center gap-2.5 transition hover:opacity-90"
          aria-label="SahaYatri Home"
        >
          <Image
            src="/logo/SahaYatri-logo.svg"
            alt="SahaYatri Logo"
            width={44}
            height={44}
            priority
          />
          <span className="font-sans text-2xl font-black tracking-tight text-[#1E2022]">
            SahaYatri
          </span>
        </Link>

        {/* Navigation Links */}
        <div className="hidden items-center gap-8 md:flex">
          <Link
            href="/home"
            className="text-sm font-semibold text-[#1E2022] transition hover:text-[#C8522E]"
          >
            Find a Ride
          </Link>
          <Link
            href="/post-ride"
            className="text-sm font-semibold text-[#1E2022] transition hover:text-[#C8522E]"
          >
            Offer a Ride
          </Link>
          <a
            href="#safety"
            className="text-sm font-semibold text-slate-600 transition hover:text-[#C8522E]"
          >
            Safety
          </a>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="px-4 py-2.5 text-sm font-bold text-[#1E2022] transition hover:text-[#C8522E]"
          >
            Login
          </Link>

          <Link
            href="/register"
            className="rounded-full bg-[#C8522E] px-6 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-[#B34524]"
          >
            Get Started
          </Link>
        </div>
      </nav>
    </header>
  );
}
