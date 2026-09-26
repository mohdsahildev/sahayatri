"use client";

import { useEffect, useState, FormEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Users,
  AlertCircle,
  CheckCircle2,
  Lock,
  Loader2,
  Sparkles,
} from "lucide-react";
import Navbar from "@/components/layout/navbar";
import LandingFooter from "@/components/landing/landing-footer";
import { apiFetch } from "@/lib/api/client";
import { useAuthStore } from "@/lib/stores/auth.store";

interface RideResponse {
  success: boolean;
  message: string;
  data: {
    _id: string;
    driver: string | {
      _id?: string;
      name?: string;
    };
    source: {
      name: string;
      lat?: number;
      lng?: number;
    };
    destination: {
      name: string;
      lat?: number;
      lng?: number;
    };
    departureTime: string;
    duration?: number;
    seatsAvailable: number;
    price: number;
    description?: string;
    status?: string;
  };
}

export default function EditRidePage() {
  const params = useParams();
  const router = useRouter();
  const rideId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [ride, setRide] = useState<RideResponse["data"] | null>(null);

  const [price, setPrice] = useState("");
  const [seatsAvailable, setSeatsAvailable] = useState<number>(3);
  const [customSeats, setCustomSeats] = useState<string>("");
  const [isCustomSeats, setIsCustomSeats] = useState(false);
  const [description, setDescription] = useState("");

  useEffect(() => {
    const currentUser = useAuthStore.getState().user;

    if (!currentUser) {
      router.replace("/login");
      return;
    }

    const currentUserId = currentUser._id;
    let cancelled = false;

    async function loadRide() {
      try {
        setLoading(true);
        setError("");

        const response = await apiFetch<RideResponse>(`/rides/${rideId}`);

        if (cancelled) return;

        const data = response.data;
        const driverId =
          typeof data.driver === "string"
            ? data.driver
            : data.driver?._id;

        if (!driverId || driverId !== currentUserId) {
          router.replace(`/rides/${rideId}`);
          return;
        }

        if (data.status !== "scheduled") {
          setError("Only scheduled rides can be edited.");
          return;
        }

        setRide(data);
        setPrice(String(data.price ?? ""));

        const initialSeats = Number(data.seatsAvailable) || 1;
        setSeatsAvailable(initialSeats);
        if (initialSeats > 5) {
          setIsCustomSeats(true);
          setCustomSeats(String(initialSeats));
        }

        setDescription(data.description ?? "");
      } catch (err) {
        console.error("Load ride error:", err);
        if (cancelled) return;
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load this ride details."
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadRide();

    return () => {
      cancelled = true;
    };
  }, [rideId, router]);

  const handleSeatSelect = (num: number) => {
    setIsCustomSeats(false);
    setSeatsAvailable(num);
  };

  const handleCustomSeatsChange = (val: string) => {
    setCustomSeats(val);
    const parsed = parseInt(val, 10);
    if (!isNaN(parsed) && parsed >= 1 && parsed <= 50) {
      setSeatsAvailable(parsed);
    }
  };

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const parsedPrice = Number(price);
    const finalSeats = isCustomSeats ? parseInt(customSeats, 10) : seatsAvailable;

    if (!Number.isFinite(parsedPrice) || parsedPrice < 0) {
      setError("Please enter a valid price per passenger.");
      return;
    }

    if (!Number.isInteger(finalSeats) || finalSeats < 1 || finalSeats > 50) {
      setError("Available seats must be between 1 and 50.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      await apiFetch(`/rides/${rideId}`, {
        method: "PUT",
        body: JSON.stringify({
          price: parsedPrice,
          seatsAvailable: finalSeats,
          description: description.trim(),
        }),
      });

      router.push(`/rides/${rideId}`);
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to update this ride."
      );
    } finally {
      setSaving(false);
    }
  }

  // Format departure helper
  const departureDate = ride
    ? new Date(ride.departureTime).toLocaleDateString("en-IN", {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "";

  const departureTimeStr = ride
    ? new Date(ride.departureTime).toLocaleTimeString("en-IN", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      })
    : "";

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#1E2022] flex flex-col justify-between">
      <Navbar />

      <main className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12 flex-1">
        {/* Back Link & Page Header */}
        <div className="mb-8">
          <Link
            href={`/rides/${rideId}`}
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#6C727A] transition hover:text-[#1E2022] mb-4"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to ride details
          </Link>

          <div className="flex flex-col gap-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF0EB] text-[#C8522E] text-xs font-semibold tracking-wider uppercase w-fit">
              <Sparkles className="w-3.5 h-3.5" />
              Edit Your Ride
            </div>
            <h1 className="font-sans text-3xl sm:text-4xl font-extrabold tracking-tight text-[#1E2022]">
              Edit your journey
            </h1>
            <p className="text-sm sm:text-base text-[#5A6068] max-w-2xl leading-relaxed">
              Update the details of your scheduled ride before you set off.
            </p>
          </div>
        </div>

        {/* Loading Skeleton */}
        {loading && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-7 space-y-6">
              <div className="h-44 rounded-3xl bg-white border border-[#EBE6DE] animate-pulse p-6" />
              <div className="h-96 rounded-3xl bg-white border border-[#EBE6DE] animate-pulse p-6" />
            </div>
            <div className="lg:col-span-5">
              <div className="h-80 rounded-3xl bg-white border border-[#EBE6DE] animate-pulse p-6" />
            </div>
          </div>
        )}

        {/* Error State (when ride failed to load or non-scheduled) */}
        {!loading && error && !ride && (
          <div className="rounded-3xl border border-red-200 bg-white p-8 sm:p-10 shadow-sm max-w-xl mx-auto text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-600 border border-red-200">
              <AlertCircle className="h-6 w-6" />
            </div>
            <h2 className="text-xl font-bold text-[#1E2022]">Unable to Edit Ride</h2>
            <p className="mt-2 text-sm text-[#5A6068] leading-relaxed">{error}</p>
            <div className="mt-6">
              <Link
                href={`/rides/${rideId}`}
                className="inline-flex items-center justify-center rounded-2xl bg-[#C8522E] px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-[#B04322]"
              >
                Return to Ride Details
              </Link>
            </div>
          </div>
        )}

        {/* Main 2-Column Content */}
        {!loading && ride && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* ============================================================ */}
            {/* LEFT COLUMN: LOCKED JOURNEY CONTEXT + EDITABLE FORM          */}
            {/* ============================================================ */}
            <div className="lg:col-span-7 space-y-6">
              {/* Read-Only Locked Journey Details */}
              <div className="rounded-3xl border border-[#EBE6DE] bg-white p-6 sm:p-8 shadow-sm">
                <div className="flex items-center justify-between pb-4 border-b border-[#EBE6DE]/70">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#6C727A]">
                      Journey details
                    </span>
                  </div>
                  <div className="inline-flex items-center gap-1 text-xs font-medium text-[#6C727A] bg-[#F5F2EC] px-2.5 py-1 rounded-lg">
                    <Lock className="w-3 h-3 text-[#6C727A]" />
                    Fixed for this ride
                  </div>
                </div>

                <div className="mt-5 space-y-4">
                  {/* Origin & Destination */}
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#2E6F40]/10 text-[#2E6F40]">
                        <div className="h-2 w-2 rounded-full bg-[#2E6F40]" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-[#6C727A]">Leaving from</p>
                        <p className="text-sm font-bold text-[#1E2022]">{ride.source.name}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#C8522E]/10 text-[#C8522E]">
                        <MapPin className="h-3.5 w-3.5 text-[#C8522E]" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-[#6C727A]">Going to</p>
                        <p className="text-sm font-bold text-[#1E2022]">{ride.destination.name}</p>
                      </div>
                    </div>
                  </div>

                  {/* Departure time */}
                  <div className="pt-3 border-t border-[#EBE6DE]/60 flex flex-wrap items-center gap-4 text-xs font-semibold text-[#5A6068]">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-[#C8522E]" />
                      <span>{departureDate}</span>
                    </div>
                    <span>•</span>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-[#C8522E]" />
                      <span>{departureTimeStr}</span>
                    </div>
                  </div>
                </div>

                <p className="mt-4 text-[11px] text-[#8C929A] bg-[#FAF8F5] p-3 rounded-xl border border-[#EBE6DE]/70">
                  Route and departure schedule are locked to preserve existing passenger ride coordination.
                </p>
              </div>

              {/* Editable Form Card */}
              <div className="rounded-3xl border border-[#EBE6DE] bg-white p-6 sm:p-8 shadow-sm">
                <div className="mb-6">
                  <h2 className="font-sans text-xl font-bold tracking-tight text-[#1E2022]">
                    What would you like to change?
                  </h2>
                  <p className="mt-1 text-xs text-[#5A6068]">
                    Adjust your seat capacity, cost contribution, or passenger notes.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Price per passenger */}
                  <div>
                    <label
                      htmlFor="price"
                      className="block text-xs font-bold uppercase tracking-wider text-[#1E2022]"
                    >
                      Price per passenger
                    </label>
                    <div className="relative mt-2">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-sm text-[#6C727A]">
                        ₹
                      </span>
                      <input
                        id="price"
                        type="number"
                        min="0"
                        step="1"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        required
                        className="w-full rounded-2xl border border-[#EBE6DE] bg-[#FAF8F5] pl-9 pr-4 py-3.5 text-sm font-semibold text-[#1E2022] outline-none transition focus:border-[#C8522E] focus:bg-white focus:ring-2 focus:ring-[#C8522E]/10"
                        placeholder="e.g. 450"
                      />
                    </div>
                    <p className="mt-1.5 text-xs text-[#6C727A]">
                      Your cost share per passenger.
                    </p>
                  </div>

                  {/* Available passenger seats */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#1E2022]">
                      Available passenger seats
                    </label>

                    {/* Segmented Seat Selection */}
                    <div className="mt-2 grid grid-cols-6 gap-2">
                      {[1, 2, 3, 4, 5].map((num) => {
                        const isSelected = !isCustomSeats && seatsAvailable === num;
                        return (
                          <button
                            key={num}
                            type="button"
                            onClick={() => handleSeatSelect(num)}
                            className={`h-12 rounded-2xl border text-sm font-bold transition flex items-center justify-center cursor-pointer ${
                              isSelected
                                ? "border-[#C8522E] bg-[#FAF0EB] text-[#C8522E] shadow-sm ring-2 ring-[#C8522E]/10"
                                : "border-[#EBE6DE] bg-[#FAF8F5] text-[#1E2022] hover:bg-[#F2EFE9]"
                            }`}
                          >
                            {num}
                          </button>
                        );
                      })}

                      <button
                        type="button"
                        onClick={() => {
                          setIsCustomSeats(true);
                          if (!customSeats) setCustomSeats(String(seatsAvailable));
                        }}
                        className={`h-12 rounded-2xl border text-xs font-bold transition flex items-center justify-center cursor-pointer ${
                          isCustomSeats
                            ? "border-[#C8522E] bg-[#FAF0EB] text-[#C8522E] shadow-sm ring-2 ring-[#C8522E]/10"
                            : "border-[#EBE6DE] bg-[#FAF8F5] text-[#1E2022] hover:bg-[#F2EFE9]"
                        }`}
                      >
                        More
                      </button>
                    </div>

                    {isCustomSeats && (
                      <div className="mt-3">
                        <input
                          type="number"
                          min="1"
                          max="50"
                          value={customSeats}
                          onChange={(e) => handleCustomSeatsChange(e.target.value)}
                          placeholder="Enter seat count (1–50)"
                          className="w-full rounded-2xl border border-[#C8522E] bg-white px-4 py-3 text-sm font-semibold text-[#1E2022] outline-none ring-2 ring-[#C8522E]/10"
                        />
                      </div>
                    )}

                    <p className="mt-1.5 text-xs text-[#6C727A]">
                      Seats available for passengers (supports 1–50).
                    </p>
                  </div>

                  {/* Ride note / Description */}
                  <div>
                    <div className="flex items-center justify-between">
                      <label
                        htmlFor="description"
                        className="block text-xs font-bold uppercase tracking-wider text-[#1E2022]"
                      >
                        Ride note
                      </label>
                      <span className="text-xs text-[#8C929A]">
                        {description.length}/500
                      </span>
                    </div>

                    <textarea
                      id="description"
                      rows={4}
                      maxLength={500}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Share anything useful with your co-travelers..."
                      className="mt-2 w-full resize-none rounded-2xl border border-[#EBE6DE] bg-[#FAF8F5] p-4 text-sm text-[#1E2022] placeholder-[#9CA3AF] outline-none transition focus:border-[#C8522E] focus:bg-white focus:ring-2 focus:ring-[#C8522E]/10 leading-relaxed"
                    />
                    <p className="mt-1 text-xs text-[#6C727A]">
                      Optional pickup guidance, luggage preferences, or travel rules.
                    </p>
                  </div>

                  {/* Inline Error */}
                  {error && (
                    <div className="rounded-2xl bg-red-50 border border-red-200 p-4 text-sm text-red-700 flex items-start gap-2.5">
                      <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                      <span>{error}</span>
                    </div>
                  )}

                  {/* Action Bar */}
                  <div className="pt-4 border-t border-[#EBE6DE] flex flex-col sm:flex-row items-center gap-3">
                    <button
                      type="submit"
                      disabled={saving}
                      className="w-full sm:flex-1 rounded-2xl bg-[#C8522E] px-6 py-3.5 text-sm font-bold text-white shadow-sm transition hover:bg-[#B04322] focus:outline-none focus:ring-2 focus:ring-[#C8522E] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {saving ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin text-white" />
                          <span>Saving changes...</span>
                        </>
                      ) : (
                        "Save changes"
                      )}
                    </button>

                    <Link
                      href={`/rides/${rideId}`}
                      className="w-full sm:w-auto inline-flex items-center justify-center rounded-2xl border border-[#EBE6DE] bg-[#FAF8F5] px-6 py-3.5 text-sm font-semibold text-[#1E2022] transition hover:bg-[#F2EFE9] text-center"
                    >
                      Discard changes
                    </Link>
                  </div>
                </form>
              </div>
            </div>

            {/* ============================================================ */}
            {/* RIGHT COLUMN: CURRENT RIDE SUMMARY CARD                      */}
            {/* ============================================================ */}
            <div className="lg:col-span-5 sticky top-24">
              <div className="rounded-3xl border border-[#EBE6DE] bg-white p-6 sm:p-8 shadow-sm">
                <div className="flex items-center justify-between pb-4 border-b border-[#EBE6DE]">
                  <h3 className="font-sans text-base font-bold text-[#1E2022]">
                    Current ride
                  </h3>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#2E6F40]/10 text-[#2E6F40]">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Scheduled
                  </span>
                </div>

                {/* Route Flow */}
                <div className="py-5 space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#2E6F40]/10 text-[#2E6F40]">
                      <div className="h-2 w-2 rounded-full bg-[#2E6F40]" />
                    </div>
                    <div className="flex-1">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-[#8C929A]">
                        Origin
                      </p>
                      <p className="text-sm font-bold text-[#1E2022] mt-0.5">
                        {ride.source.name}
                      </p>
                    </div>
                  </div>

                  <div className="ml-2.5 h-5 border-l-2 border-dashed border-[#EBE6DE]" />

                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#C8522E]/10 text-[#C8522E]">
                      <MapPin className="h-3.5 w-3.5 text-[#C8522E]" />
                    </div>
                    <div className="flex-1">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-[#8C929A]">
                        Destination
                      </p>
                      <p className="text-sm font-bold text-[#1E2022] mt-0.5">
                        {ride.destination.name}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Metric Strip */}
                <div className="pt-4 border-t border-[#EBE6DE] grid grid-cols-2 gap-3">
                  <div className="rounded-2xl bg-[#FAF8F5] border border-[#EBE6DE]/70 p-3.5 text-center">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-[#8C929A]">
                      Current Price
                    </p>
                    <p className="text-lg font-extrabold text-[#C8522E] mt-1">
                      ₹{ride.price}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-[#FAF8F5] border border-[#EBE6DE]/70 p-3.5 text-center">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-[#8C929A]">
                      Seats Set
                    </p>
                    <p className="text-lg font-extrabold text-[#1E2022] mt-1">
                      {ride.seatsAvailable}
                    </p>
                  </div>
                </div>

                {/* Departure Summary */}
                <div className="mt-4 pt-4 border-t border-[#EBE6DE] space-y-2 text-xs text-[#5A6068]">
                  <div className="flex items-center justify-between">
                    <span className="text-[#8C929A]">Departure date</span>
                    <span className="font-semibold text-[#1E2022]">{departureDate}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#8C929A]">Departure time</span>
                    <span className="font-semibold text-[#1E2022]">{departureTimeStr}</span>
                  </div>
                </div>

                {/* Footer Note */}
                <div className="mt-5 rounded-2xl bg-[#FAF8F5] p-3.5 text-[11px] text-[#6C727A] border border-[#EBE6DE]/70">
                  <p className="leading-relaxed">
                    Route and departure time are fixed for this scheduled ride.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <LandingFooter />
    </div>
  );
}