"use client";

import Link from "next/link";
import Image from "next/image";
import { CheckCircle2 } from "lucide-react";

export default function LandingFooter() {
  return (
    <footer className="border-t border-[#EAE6DF] bg-[#121417] text-white">
      <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:px-10">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
          {/* Brand Mission */}
          <div className="lg:col-span-5">
            <Link href="/" className="inline-flex items-center gap-2.5">
              <Image
                src="/logo/SahaYatri-logo.svg"
                alt="SahaYatri Logo"
                width={40}
                height={40}
              />
              <span className="font-sans text-2xl font-black tracking-tight text-white">
                SahaYatri
              </span>
            </Link>

            <p className="mt-4 max-w-md text-xs leading-relaxed text-slate-400 sm:text-sm">
              Re-imagining intercity mobility for real people. Free from surge fees,
              excessive commission algorithms, or unverified passenger matches.
            </p>

            <div className="mt-6 space-y-2 text-xs font-semibold text-slate-300">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={15} className="text-[#2E6F40]" />
                <span>Verified Community Reviews & Ratings</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 size={15} className="text-[#2E6F40]" />
                <span>Boarding PIN Security Standards Enabled</span>
              </div>
            </div>
          </div>

          {/* Nav Links Columns */}
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:col-span-7">
            {/* PLATFORM */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#C8522E]">
                PLATFORM
              </h3>
              <ul className="mt-4 space-y-2.5 text-xs font-semibold text-slate-400">
                <li>
                  <Link href="/home" className="transition hover:text-white">
                    Find Rides
                  </Link>
                </li>
                <li>
                  <Link href="/post-ride" className="transition hover:text-white">
                    Offer a Ride
                  </Link>
                </li>
                <li>
                  <Link href="/home" className="transition hover:text-white">
                    How It Works
                  </Link>
                </li>
                <li>
                  <span className="text-slate-600">Toll & Fare Calculator</span>
                </li>
              </ul>
            </div>

            {/* TRUST & SAFETY */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#C8522E]">
                TRUST & SAFETY
              </h3>
              <ul className="mt-4 space-y-2.5 text-xs font-semibold text-slate-400">
                <li>
                  <a href="#safety" className="transition hover:text-white">
                    Safety Standards
                  </a>
                </li>
                <li>
                  <span className="text-slate-600">Driver Verification</span>
                </li>
                <li>
                  <span className="text-slate-600">Community Guidelines</span>
                </li>
                <li>
                  <span className="text-slate-600">Help Center & Support</span>
                </li>
              </ul>
            </div>

            {/* COMPANY */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#C8522E]">
                COMPANY
              </h3>
              <ul className="mt-4 space-y-2.5 text-xs font-semibold text-slate-400">
                <li>
                  <span className="text-slate-600">Our Story</span>
                </li>
                <li>
                  <span className="text-slate-600">Sustainability</span>
                </li>
                <li>
                  <span className="text-slate-600">Press & Media</span>
                </li>
                <li>
                  <span className="text-slate-600">Terms of Service</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Legal Bottom Bar */}
        <div className="mt-16 flex flex-col items-center justify-between gap-4 border-t border-slate-800 pt-8 text-[11px] text-slate-500 sm:flex-row">
          <p>© 2026 SahaYatri Mobility Technologies Pvt. Ltd. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
            <span>Security Standard</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
