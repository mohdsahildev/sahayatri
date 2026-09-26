"use client";

import Link from "next/link";
import Image from "next/image";
import { CheckCircle2 } from "lucide-react";

export default function LandingFooter() {
  return (
    <footer className="border-t border-[#EAE6DF] bg-[#121417] text-white">
      <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8 lg:px-10">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
          {/* Brand & Description */}
          <div className="lg:col-span-6">
            <Link href="/home" className="inline-flex items-center gap-2.5">
              <Image
                src="/logo/SahaYatri-logo.svg"
                alt="SahaYatri Logo"
                width={36}
                height={36}
              />
              <span className="font-sans text-xl font-black tracking-tight text-white">
                SahaYatri
              </span>
            </Link>

            <p className="mt-3 max-w-md text-xs leading-relaxed text-slate-400">
              Community carpooling platform connecting verified drivers and passengers
              for scheduled intercity and regional travel.
            </p>
          </div>

          {/* Nav Links Columns */}
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-2 lg:col-span-6">
            {/* PLATFORM NAVIGATION */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#C8522E]">
                Platform
              </h3>
              <ul className="mt-3.5 space-y-2 text-xs font-semibold text-slate-400">
                <li>
                  <Link href="/home" className="transition hover:text-white">
                    Find a Ride
                  </Link>
                </li>
                <li>
                  <Link href="/post-ride" className="transition hover:text-white">
                    Offer a Ride
                  </Link>
                </li>
                <li>
                  <Link href="/my-rides" className="transition hover:text-white">
                    My Rides
                  </Link>
                </li>
              </ul>
            </div>

            {/* ACCOUNT & COMMUNITY */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#C8522E]">
                Account
              </h3>
              <ul className="mt-3.5 space-y-2 text-xs font-semibold text-slate-400">
                <li>
                  <Link href="/profile" className="transition hover:text-white">
                    My Profile
                  </Link>
                </li>
                <li>
                  <Link href="/notifications" className="transition hover:text-white">
                    Notifications
                  </Link>
                </li>
                <li>
                  <Link href="/chats" className="transition hover:text-white">
                    Messages
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Legal Bottom Bar */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-slate-800 pt-6 text-[11px] text-slate-500 sm:flex-row">
          <p>© 2026 SahaYatri. All rights reserved.</p>
          <div className="flex items-center gap-4 text-slate-500">
            <span>Intercity Carpool Mobility</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
