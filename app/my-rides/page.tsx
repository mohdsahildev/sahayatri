import Link from "next/link";
import { Plus, Search } from "lucide-react";
import Navbar from "@/components/layout/navbar";
import { getMyRides, type MyRide } from "@/lib/api/rides";
import MyRidesView from "@/components/my-rides/my-rides-view";

export default async function MyRidesPage() {
  let data: {
    createdRides: MyRide[];
    joinedRides: MyRide[];
  };

  try {
    data = await getMyRides();
  } catch {
    return (
      <div className="min-h-screen bg-[#FAF8F5] font-sans text-[#1E2022]">
        <Navbar />

        <main className="mx-auto w-full max-w-[1240px] px-4 sm:px-6 lg:px-8 py-12">
          <div className="rounded-3xl border border-[#EAE6DF] bg-white p-12 text-center shadow-xs">
            <h1 className="font-sans text-2xl font-bold text-[#1E2022]">
              Authentication Required
            </h1>

            <p className="mt-2 text-sm text-slate-500 max-w-sm mx-auto">
              Please sign in to view and manage the journeys you&apos;ve offered and joined.
            </p>

            <div className="mt-6 flex justify-center">
              <Link
                href="/login"
                className="rounded-xl bg-[#C8522E] px-6 py-2.5 font-sans text-xs font-bold text-white shadow-xs transition hover:bg-[#B34524]"
              >
                Sign In to SahaYatri
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const createdRides = data?.createdRides ?? [];
  const joinedRides = data?.joinedRides ?? [];

  return (
    <div className="min-h-screen bg-[#FAF8F5] font-sans text-[#1E2022]">
      <Navbar />

      <main className="mx-auto w-full max-w-[1240px] px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Page Header */}
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-[#C8522E]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#C8522E]" />
              <span>Transit Journal</span>
            </div>

            <h1 className="mt-1 font-sans text-3xl sm:text-4xl font-black tracking-tight text-[#1E2022]">
              My Rides
            </h1>

            <p className="mt-1 text-xs sm:text-sm text-slate-500 max-w-xl">
              Keep track of rides you&apos;ve offered and rides you&apos;ve joined.
            </p>
          </div>

          {/* Action CTAs */}
          <div className="flex items-center gap-3 shrink-0">
            <Link
              href="/home"
              className="inline-flex items-center gap-2 rounded-xl border border-[#EAE6DF] bg-white px-4 py-2.5 font-sans text-xs font-bold text-[#1E2022] shadow-xs transition hover:border-[#1E2022] hover:bg-[#FAF8F5]"
            >
              <Search size={14} className="text-slate-500" />
              <span>Find a Ride</span>
            </Link>

            <Link
              href="/post-ride"
              className="inline-flex items-center gap-2 rounded-xl bg-[#C8522E] px-4 py-2.5 font-sans text-xs font-bold text-white shadow-xs transition hover:bg-[#B34524] active:scale-98"
            >
              <Plus size={14} />
              <span>Offer a Ride</span>
            </Link>
          </div>
        </div>

        {/* Unified Tabbed Rides View */}
        <MyRidesView
          createdRides={createdRides}
          joinedRides={joinedRides}
        />

        {/* Footer Links */}
        <div className="pt-6 border-t border-[#EAE6DF]/60 flex items-center justify-center gap-4 text-xs font-medium text-slate-400">
          <Link href="/cancellation-policy" className="hover:text-slate-600 transition">
            Cancellation Rules
          </Link>
          <span>·</span>
          <Link href="/support" className="hover:text-slate-600 transition">
            Support Desk
          </Link>
        </div>
      </main>
    </div>
  );
}