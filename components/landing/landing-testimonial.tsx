"use client";

import Image from "next/image";

export default function LandingTestimonial() {
  return (
    <section className="py-12 md:py-16">
      <div className="overflow-hidden rounded-3xl border border-[#EAE6DF] bg-white shadow-xl">
        <div className="grid grid-cols-1 lg:grid-cols-12">
          {/* Left Text Content */}
          <div className="flex flex-col justify-between p-8 sm:p-12 lg:col-span-7">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-[#D0E5D5] bg-[#EAF4ED] px-4 py-1.5 text-xs font-bold text-[#2E6F40]">
                <span>🌿</span>
                <span>Personal & Social Responsibility</span>
              </div>

              <blockquote className="mt-6 font-sans text-2xl font-black leading-snug tracking-tight text-[#1E2022] sm:text-3xl lg:text-4xl">
                &ldquo;I used to dread the 3-hour intercity commute. Now it&apos;s
                my favorite part of Friday.&rdquo;
              </blockquote>

              <p className="mt-6 text-sm leading-relaxed text-slate-600 sm:text-base">
                Regular SahaYatri carpoolers connecting on busy highway corridors.
                What begins as an effort to share travel costs turns into a reliable network
                with shared expenses, great conversations, and dependable weekend companionship.
              </p>
              
              <p className="mt-3 text-xs font-bold text-[#C8522E]">
                — SahaYatri Commuter, Regular Intercity Route
              </p>
            </div>

            {/* Commuter Highlights */}
            <div className="mt-10 grid grid-cols-1 gap-6 border-t border-[#EAE6DF] pt-8 sm:grid-cols-3">
              <div>
                <span className="block font-sans text-base font-black text-[#1E2022]">
                  Regular Commuters
                </span>
                <span className="mt-1 block text-xs text-slate-500">
                  Shared highway routes
                </span>
              </div>

              <div>
                <span className="block font-sans text-base font-black text-[#2E6F40]">
                  Verified Community
                </span>
                <span className="mt-1 block text-xs text-slate-500">
                  ID & profile verification
                </span>
              </div>

              <div>
                <span className="block font-sans text-base font-black text-[#C8522E]">
                  Shared Fuel Split
                </span>
                <span className="mt-1 block text-xs text-slate-500">
                  Transparent cost structure
                </span>
              </div>
            </div>
          </div>

          {/* Right Image Frame */}
          <div className="relative min-h-[350px] lg:col-span-5 lg:min-h-full">
            <Image
              src="/images/carpool_commuters.jpg"
              alt="SahaYatri carpooling commuters"
              fill
              className="object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
