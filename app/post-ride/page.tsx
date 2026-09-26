"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowUpDown,
  Car,
  ShieldCheck,
  Check,
  MapPin,
  Users,
  AlertCircle,
  Loader2,
  ChevronRight,
  Clock,
  X,
} from "lucide-react";
import Navbar from "@/components/layout/navbar";
import LandingFooter from "@/components/landing/landing-footer";
import LocationSearch from "@/components/location/location-search";
import OfferRideMap from "@/components/post-ride/offer-ride-map";
import DatePicker from "@/components/ui/date-picker";
import TimePicker from "@/components/ui/time-picker";
import type { Location } from "@/lib/location/geoapify";
import type { CreateRideRequest } from "@/lib/api/rides";
import { useAuthStore } from "@/lib/stores/auth.store";

export default function PostRidePage() {
  const router = useRouter();

  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isHydrated = useAuthStore((state) => state.isHydrated);

  // Form State
  const [source, setSource] = useState<Location | null>(null);
  const [destination, setDestination] = useState<Location | null>(null);

  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [duration, setDuration] = useState("60");
  const [seats, setSeats] = useState<number>(3);
  const [customSeats, setCustomSeats] = useState<string>("");
  const [isCustomSeats, setIsCustomSeats] = useState(false);
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");

  const [vehicleType, setVehicleType] = useState("car");
  const [vehicleBrand, setVehicleBrand] = useState("");
  const [vehicleModel, setVehicleModel] = useState("");
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [isEditingVehicle, setIsEditingVehicle] = useState(false);

  // Preferences
  const [womenOnly, setWomenOnly] = useState(false);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [smokingAllowed, setSmokingAllowed] = useState(false);
  const [musicAllowed, setMusicAllowed] = useState(true);
  const [petsAllowed, setPetsAllowed] = useState(false);
  const [acAvailable, setAcAvailable] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Pre-populate vehicle and default safety preferences from authenticated user
  useEffect(() => {
    if (user?.vehicle) {
      setVehicleType(user.vehicle.type || "car");
      setVehicleBrand(user.vehicle.brand || "");
      setVehicleModel(user.vehicle.model || "");
      setVehicleNumber(user.vehicle.number || "");
      setIsEditingVehicle(false);
    } else {
      setIsEditingVehicle(true);
    }

    if (user?.safetyPreferences) {
      if (user.safetyPreferences.womenOnlyRides) setWomenOnly(true);
      if (user.safetyPreferences.verifiedOnlyRides) setVerifiedOnly(true);
    }
  }, [user]);

  // Swap Locations function
  function handleSwapLocations() {
    const tempSource = source;
    setSource(destination);
    setDestination(tempSource);
  }

  // Handle Seat Selection
  function handleSeatSelect(val: number | "custom") {
    if (val === "custom") {
      setIsCustomSeats(true);
      const parsed = parseInt(customSeats, 10);
      setSeats(Number.isFinite(parsed) && parsed > 0 ? parsed : 5);
    } else {
      setIsCustomSeats(false);
      setSeats(val);
    }
  }

  // Handle Form Submit
  async function handleSubmit(event?: FormEvent<HTMLFormElement>) {
    if (event) {
      event.preventDefault();
    }

    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }

    setError("");

    if (!source || !destination) {
      setError("Please select both a starting location and destination.");
      return;
    }

    if (!date || !time) {
      setError("Please select a departure date and time.");
      return;
    }

    const departureTime = new Date(`${date}T${time}`);

    if (Number.isNaN(departureTime.getTime())) {
      setError("Please enter a valid departure time.");
      return;
    }

    if (departureTime <= new Date()) {
      setError("Departure time must be in the future.");
      return;
    }

    const effectiveSeats = isCustomSeats
      ? parseInt(customSeats, 10) || 5
      : seats;

    if (!effectiveSeats || effectiveSeats < 1 || effectiveSeats > 50) {
      setError("Available seats must be between 1 and 50.");
      return;
    }

    const parsedPrice = Number(price);
    if (!price || Number.isNaN(parsedPrice) || parsedPrice < 0) {
      setError("Please enter a valid price per seat (₹).");
      return;
    }

    if (!vehicleBrand.trim() || !vehicleModel.trim() || !vehicleNumber.trim()) {
      setError("Please provide complete vehicle details (brand, model, registration number).");
      return;
    }

    const payload: CreateRideRequest = {
      source,
      destination,
      departureTime: departureTime.toISOString(),
      duration: Number(duration) || 60,
      seatsAvailable: effectiveSeats,
      price: parsedPrice,
      description: description.trim() || undefined,
      vehicle: {
        type: vehicleType,
        brand: vehicleBrand.trim(),
        model: vehicleModel.trim(),
        number: vehicleNumber.trim().toUpperCase(),
      },
      preferences: {
        womenOnly,
        verifiedOnly,
        smokingAllowed,
        musicAllowed,
        petsAllowed,
        acAvailable,
      },
    };

    try {
      setLoading(true);

      const response = await fetch("/api/rides", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message ?? "Unable to create ride.");
      }

      router.push(`/rides/${result.data._id}`);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to create ride. Please check your details."
      );
    } finally {
      setLoading(false);
    }
  }

  // Format date display for live preview
  function formatPreviewDate() {
    if (!date) return "Date not set";
    const d = new Date(`${date}T${time || "00:00"}`);
    if (Number.isNaN(d.getTime())) return date;
    return d.toLocaleDateString("en-IN", {
      weekday: "short",
      day: "numeric",
      month: "short",
    });
  }

  function formatPreviewTime() {
    if (!time) return "Time not set";
    const [h, m] = time.split(":");
    const hour = parseInt(h, 10);
    const ampm = hour >= 12 ? "PM" : "AM";
    const formattedHour = hour % 12 || 12;
    return `${formattedHour}:${m} ${ampm}`;
  }

  const effectiveSeatsDisplay = isCustomSeats
    ? parseInt(customSeats, 10) || 5
    : seats;

  const hasValidRoute = Boolean(source?.name && destination?.name);

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#1E2022] font-body flex flex-col justify-between selection:bg-[#C8522E] selection:text-white">
      <div>
        <Navbar />

        <main className="mx-auto w-full max-w-[1240px] px-4 py-8 sm:px-6 md:px-8">
          {/* Top Breadcrumb & Host Identity Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#EAE6DF]">
            <div>
              <Link
                href="/home"
                className="inline-flex items-center gap-1.5 font-sans text-xs font-bold text-slate-500 hover:text-[#C8522E] transition mb-2"
              >
                <ArrowLeft size={14} />
                <span>Back to rides</span>
              </Link>
              <h1 className="mt-1 font-sans text-3xl sm:text-4xl font-black tracking-tight text-[#1E2022]">
                Offer a Ride
              </h1>
              <p className="mt-1 text-xs sm:text-sm text-slate-500 max-w-xl">
                Share your journey with people heading the same way.
              </p>
            </div>

            {/* Authenticated Driver Pill */}
            {user && (
              <div className="inline-flex items-center gap-3 rounded-2xl border border-[#EAE6DF] bg-white px-4 py-2.5 shadow-xs self-start sm:self-auto">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#FAF8F5] border border-[#EAE6DF] text-[#C8522E] font-sans text-xs font-black">
                  {user.name
                    ? user.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .substring(0, 2)
                        .toUpperCase()
                    : "DR"}
                </div>
                <div>
                  <div className="font-sans text-xs font-bold text-[#1E2022]">
                    {user.name || "Authenticated User"}
                  </div>
                  {user.isVerified ? (
                    <div className="flex items-center gap-1 text-[11px] font-medium text-[#2E6F40]">
                      <ShieldCheck size={12} />
                      <span>Verified member</span>
                    </div>
                  ) : (
                    <span className="text-[11px] text-slate-400">Registered Host</span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Form and Preview Layout */}
          <div className="mt-8 grid gap-8 lg:grid-cols-12 items-start">
            {/* LEFT: 5-Step Form (7 Columns) */}
            <div className="lg:col-span-7 space-y-6">
              {/* Error Alert */}
              {error && (
                <div className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs font-medium text-rose-700">
                  <AlertCircle size={16} className="mt-0.5 shrink-0 text-rose-600" />
                  <div className="flex-1">
                    <p className="font-bold text-rose-800">Please review your submission</p>
                    <p className="mt-0.5">{error}</p>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* 01. ROUTE */}
                <section className="rounded-3xl border border-[#EAE6DF] bg-white p-6 sm:p-7 shadow-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#FAF8F5] border border-[#EAE6DF] font-sans text-[11px] font-black text-[#C8522E]">
                        01
                      </span>
                      <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                        ROUTE
                      </span>
                    </div>
                  </div>

                  <h2 className="mt-2 font-sans text-lg font-bold text-[#1E2022]">
                    Where are you going?
                  </h2>

                  <div className="mt-5 space-y-3 relative">
                    {/* Source */}
                    <div>
                      <label className="block text-xs font-bold text-[#1E2022] mb-1.5">
                        Leaving from
                      </label>
                      <LocationSearch
                        value={source}
                        placeholder="Search origin city, area or landmark"
                        onSelect={setSource}
                        icon={
                          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#EAF4ED] text-[#2E6F40]">
                            <span className="h-2 w-2 rounded-full bg-[#2E6F40]" />
                          </div>
                        }
                      />
                    </div>

                    {/* Swap Button */}
                    <div className="flex justify-center -my-2 relative z-10">
                      <button
                        type="button"
                        onClick={handleSwapLocations}
                        className="inline-flex items-center justify-center h-8 w-8 rounded-full border border-[#EAE6DF] bg-white text-slate-500 shadow-xs hover:text-[#C8522E] hover:border-[#C8522E] transition"
                        title="Swap Origin and Destination"
                      >
                        <ArrowUpDown size={14} />
                      </button>
                    </div>

                    {/* Destination */}
                    <div>
                      <label className="block text-xs font-bold text-[#1E2022] mb-1.5">
                        Going to
                      </label>
                      <LocationSearch
                        value={destination}
                        placeholder="Search destination city or point of arrival"
                        onSelect={setDestination}
                        icon={
                          <div className="flex h-5 w-5 items-center justify-center rounded-md bg-[#FDF2E9] text-[#C8522E]">
                            <span className="h-2 w-2 rounded-xs bg-[#C8522E]" />
                          </div>
                        }
                      />
                    </div>
                  </div>
                </section>

                {/* 02. DEPARTURE */}
                <section className="rounded-3xl border border-[#EAE6DF] bg-white p-6 sm:p-7 shadow-xs">
                  <div className="flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#FAF8F5] border border-[#EAE6DF] font-sans text-[11px] font-black text-[#C8522E]">
                      02
                    </span>
                    <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                      DEPARTURE
                    </span>
                  </div>

                  <h2 className="mt-2 font-sans text-lg font-bold text-[#1E2022]">
                    When are you leaving?
                  </h2>

                  <div className="mt-5 grid gap-4 sm:grid-cols-2">
                    <div>
                      <label
                        htmlFor="date"
                        className="block text-xs font-bold text-[#1E2022] mb-1.5"
                      >
                        Departure Date
                      </label>
                      <div className="rounded-xl border border-[#EAE6DF] bg-[#FAF8F5]/60 px-3.5 py-2 focus-within:border-[#1E2022] focus-within:bg-white transition">
                        <DatePicker
                          id="date"
                          value={date}
                          onChange={setDate}
                          minDate={new Date().toISOString().split("T")[0]}
                          placeholder="Select departure date"
                          allowClear
                        />
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="time"
                        className="block text-xs font-bold text-[#1E2022] mb-1.5"
                      >
                        Departure Time
                      </label>
                      <div className="rounded-xl border border-[#EAE6DF] bg-[#FAF8F5]/60 px-3.5 py-2 focus-within:border-[#1E2022] focus-within:bg-white transition">
                        <TimePicker
                          id="time"
                          value={time}
                          onChange={setTime}
                          placeholder="Select departure time"
                        />
                      </div>
                    </div>
                  </div>
                </section>

                {/* 03. SEATS & PRICE */}
                <section className="rounded-3xl border border-[#EAE6DF] bg-white p-6 sm:p-7 shadow-xs">
                  <div className="flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#FAF8F5] border border-[#EAE6DF] font-sans text-[11px] font-black text-[#C8522E]">
                      03
                    </span>
                    <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                      SEATS & PRICE
                    </span>
                  </div>

                  <h2 className="mt-2 font-sans text-lg font-bold text-[#1E2022]">
                    Set your availability
                  </h2>

                  <div className="mt-5 grid gap-6 sm:grid-cols-2">
                    {/* Seats Selector */}
                    <div>
                      <label className="block text-xs font-bold text-[#1E2022]">
                        Available passenger seats
                      </label>
                      <p className="text-[11px] text-slate-400 mb-2.5">
                        Exclude your own driver seat
                      </p>

                      <div className="flex flex-wrap items-center gap-2">
                        {[1, 2, 3, 4].map((num) => (
                          <button
                            key={num}
                            type="button"
                            onClick={() => handleSeatSelect(num)}
                            className={`flex h-11 w-11 items-center justify-center rounded-xl font-sans text-xs font-bold transition ${
                              !isCustomSeats && seats === num
                                ? "bg-[#C8522E] text-white shadow-xs"
                                : "bg-[#FAF8F5] text-[#1E2022] border border-[#EAE6DF] hover:border-slate-400"
                            }`}
                          >
                            {num}
                          </button>
                        ))}

                        <button
                          type="button"
                          onClick={() => handleSeatSelect("custom")}
                          className={`flex h-11 px-3.5 items-center justify-center rounded-xl font-sans text-xs font-bold transition ${
                            isCustomSeats
                              ? "bg-[#C8522E] text-white shadow-xs"
                              : "bg-[#FAF8F5] text-[#1E2022] border border-[#EAE6DF] hover:border-slate-400"
                          }`}
                        >
                          5+
                        </button>
                      </div>

                      {isCustomSeats && (
                        <div className="mt-3">
                          <input
                            type="number"
                            min="5"
                            max="50"
                            placeholder="Enter seats (e.g. 6)"
                            value={customSeats}
                            onChange={(e) => {
                              setCustomSeats(e.target.value);
                              const parsed = parseInt(e.target.value, 10);
                              if (Number.isFinite(parsed) && parsed > 0) {
                                setSeats(parsed);
                              }
                            }}
                            className="w-full rounded-xl border border-[#EAE6DF] bg-white px-3.5 py-2 text-xs font-bold text-[#1E2022] outline-none focus:border-[#1E2022]"
                          />
                        </div>
                      )}
                    </div>

                    {/* Price Input */}
                    <div>
                      <label
                        htmlFor="price"
                        className="block text-xs font-bold text-[#1E2022]"
                      >
                        Price per passenger
                      </label>
                      <p className="text-[11px] text-slate-400 mb-2.5">
                        Cost share per passenger for fuel and tolls
                      </p>

                      <div className="relative flex items-center rounded-xl border border-[#EAE6DF] bg-[#FAF8F5]/60 px-3.5 py-2.5 focus-within:border-[#1E2022] focus-within:bg-white transition">
                        <span className="font-sans text-sm font-bold text-[#1E2022] mr-2">
                          ₹
                        </span>
                        <input
                          id="price"
                          type="number"
                          min="0"
                          step="1"
                          placeholder="350"
                          value={price}
                          onChange={(e) => setPrice(e.target.value)}
                          required
                          className="w-full bg-transparent font-sans text-sm font-bold text-[#1E2022] outline-none"
                        />
                        <span className="text-[11px] font-bold text-slate-400 whitespace-nowrap ml-2">
                          / seat
                        </span>
                      </div>
                    </div>
                  </div>
                </section>

                {/* 04. VEHICLE */}
                <section className="rounded-3xl border border-[#EAE6DF] bg-white p-6 sm:p-7 shadow-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#FAF8F5] border border-[#EAE6DF] font-sans text-[11px] font-black text-[#C8522E]">
                        04
                      </span>
                      <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                        VEHICLE
                      </span>
                    </div>

                    {user?.vehicle && (
                      <button
                        type="button"
                        onClick={() => setIsEditingVehicle(!isEditingVehicle)}
                        className="text-xs font-bold text-[#C8522E] hover:underline"
                      >
                        {isEditingVehicle ? "Use Saved Vehicle" : "Change Vehicle"}
                      </button>
                    )}
                  </div>

                  <h2 className="mt-2 font-sans text-lg font-bold text-[#1E2022]">
                    What are you driving?
                  </h2>

                  {!isEditingVehicle && user?.vehicle ? (
                    /* Display Saved Vehicle */
                    <div className="mt-4 flex items-center gap-4 rounded-2xl border border-[#EAE6DF] bg-[#FAF8F5] p-4">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white border border-[#EAE6DF] text-[#1E2022]">
                        <Car size={20} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-sans text-sm font-bold text-[#1E2022] truncate">
                            {user.vehicle.brand} {user.vehicle.model}
                          </h3>
                          <span className="text-[11px] font-bold capitalize text-slate-400">
                            · {user.vehicle.type}
                          </span>
                        </div>
                        <p className="text-xs font-semibold text-slate-500 mt-0.5">
                          {user.vehicle.number}
                        </p>
                      </div>
                    </div>
                  ) : (
                    /* Vehicle Manual Form */
                    <div className="mt-4 grid gap-4 sm:grid-cols-2">
                      <div>
                        <label
                          htmlFor="vehicleType"
                          className="block text-xs font-bold text-[#1E2022] mb-1.5"
                        >
                          Vehicle Type
                        </label>
                        <select
                          id="vehicleType"
                          value={vehicleType}
                          onChange={(e) => setVehicleType(e.target.value)}
                          className="w-full rounded-xl border border-[#EAE6DF] bg-white px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-[#1E2022] outline-none focus:border-[#1E2022]"
                        >
                          <option value="car">Car (Sedan / Hatchback / SUV)</option>
                          <option value="bike">Motorcycle / Scooter</option>
                          <option value="van">Van / Mini-bus</option>
                          <option value="auto">Auto Rickshaw</option>
                        </select>
                      </div>

                      <div>
                        <label
                          htmlFor="vehicleBrand"
                          className="block text-xs font-bold text-[#1E2022] mb-1.5"
                        >
                          Brand
                        </label>
                        <input
                          id="vehicleBrand"
                          type="text"
                          placeholder="e.g. Honda, Hyundai, Tata"
                          value={vehicleBrand}
                          onChange={(e) => setVehicleBrand(e.target.value)}
                          required
                          className="w-full rounded-xl border border-[#EAE6DF] bg-white px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-[#1E2022] outline-none focus:border-[#1E2022]"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="vehicleModel"
                          className="block text-xs font-bold text-[#1E2022] mb-1.5"
                        >
                          Model
                        </label>
                        <input
                          id="vehicleModel"
                          type="text"
                          placeholder="e.g. City, Creta, Nexon"
                          value={vehicleModel}
                          onChange={(e) => setVehicleModel(e.target.value)}
                          required
                          className="w-full rounded-xl border border-[#EAE6DF] bg-white px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-[#1E2022] outline-none focus:border-[#1E2022]"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="vehicleNumber"
                          className="block text-xs font-bold text-[#1E2022] mb-1.5"
                        >
                          Registration Plate Number
                        </label>
                        <input
                          id="vehicleNumber"
                          type="text"
                          placeholder="e.g. MH 12 AB 1234"
                          value={vehicleNumber}
                          onChange={(e) => setVehicleNumber(e.target.value.toUpperCase())}
                          required
                          className="w-full rounded-xl border border-[#EAE6DF] bg-white px-3.5 py-2.5 text-xs sm:text-sm font-semibold uppercase text-[#1E2022] outline-none focus:border-[#1E2022]"
                        />
                      </div>
                    </div>
                  )}
                </section>

                {/* 05. RIDE NOTE & PREFERENCES */}
                <section className="rounded-3xl border border-[#EAE6DF] bg-white p-6 sm:p-7 shadow-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#FAF8F5] border border-[#EAE6DF] font-sans text-[11px] font-black text-[#C8522E]">
                        05
                      </span>
                      <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                        RIDE NOTE & PREFERENCES
                      </span>
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider rounded-md bg-[#FAF8F5] border border-[#EAE6DF] px-2 py-0.5 text-slate-500">
                      Optional
                    </span>
                  </div>

                  <h2 className="mt-2 font-sans text-lg font-bold text-[#1E2022]">
                    Anything your co-travelers should know?
                  </h2>

                  <div className="mt-4">
                    <label htmlFor="description" className="sr-only">
                      Ride description
                    </label>
                    <textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value.slice(0, 500))}
                      rows={3}
                      placeholder="Share anything useful for your co-travelers..."
                      className="w-full resize-none rounded-xl border border-[#EAE6DF] bg-[#FAF8F5]/40 p-3.5 text-xs sm:text-sm font-medium text-[#1E2022] outline-none focus:border-[#1E2022] focus:bg-white transition"
                    />
                    <div className="flex justify-end mt-1">
                      <span className="text-[10px] font-semibold text-slate-400">
                        {description.length}/500
                      </span>
                    </div>
                  </div>

                  {/* Preferences Toggles */}
                  <div className="mt-4 pt-4 border-t border-[#EAE6DF]">
                    <span className="text-xs font-bold text-[#1E2022] block mb-2.5">
                      Trip Preferences
                    </span>

                    <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
                      <PreferenceToggle
                        label="Women only"
                        checked={womenOnly}
                        onChange={setWomenOnly}
                      />
                      <PreferenceToggle
                        label="Verified passengers only"
                        checked={verifiedOnly}
                        onChange={setVerifiedOnly}
                      />
                      <PreferenceToggle
                        label="AC Available"
                        checked={acAvailable}
                        onChange={setAcAvailable}
                      />
                      <PreferenceToggle
                        label="Music allowed"
                        checked={musicAllowed}
                        onChange={setMusicAllowed}
                      />
                      <PreferenceToggle
                        label="Smoking allowed"
                        checked={smokingAllowed}
                        onChange={setSmokingAllowed}
                      />
                      <PreferenceToggle
                        label="Pets allowed"
                        checked={petsAllowed}
                        onChange={setPetsAllowed}
                      />
                    </div>
                  </div>
                </section>
              </form>
            </div>

            {/* RIGHT: Sticky Live Ride Preview (5 Columns) */}
            <div className="lg:col-span-5 sticky top-24 space-y-5">
              <div className="rounded-3xl border border-[#EAE6DF] bg-white p-6 shadow-xs space-y-5">
                {/* Header Badge */}
                <div className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-[#C8522E]">
                  <span>YOUR RIDE PREVIEW</span>
                </div>

                {/* Route Header */}
                <div>
                  <div className="flex items-baseline justify-between gap-2">
                    <h3 className="font-sans text-xl sm:text-2xl font-black text-[#1E2022] tracking-tight">
                      {hasValidRoute ? (
                        <span>
                          {source?.name.split(",")[0]} → {destination?.name.split(",")[0]}
                        </span>
                      ) : (
                        <span className="text-slate-400 font-bold text-lg">
                          Your route will appear here
                        </span>
                      )}
                    </h3>
                  </div>

                  <div className="mt-1 flex items-center gap-2 text-xs font-semibold text-slate-500">
                    <Clock size={13} className="text-[#C8522E]" />
                    <span>
                      {date ? `${formatPreviewDate()} · ${formatPreviewTime()}` : "Select departure time"}
                    </span>
                  </div>
                </div>

                {/* Host Info */}
                {user && (
                  <div className="flex items-center justify-between rounded-2xl border border-[#EAE6DF] bg-[#FAF8F5] p-3.5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white border border-[#EAE6DF] text-[#C8522E] font-sans text-xs font-black">
                        {user.name
                          ? user.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .substring(0, 2)
                              .toUpperCase()
                          : "DR"}
                      </div>
                      <div className="min-w-0">
                        <div className="font-sans text-xs sm:text-sm font-bold text-[#1E2022] truncate">
                          {user.name || "Authenticated User"}
                        </div>
                        {user.isVerified ? (
                          <div className="flex items-center gap-1 text-[11px] font-medium text-[#2E6F40]">
                            <ShieldCheck size={12} className="text-[#2E6F40]" />
                            <span>Verified member</span>
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-400">Host</span>
                        )}
                      </div>
                    </div>

                    {vehicleBrand && vehicleModel && (
                      <div className="text-right text-[11px] font-medium text-slate-400">
                        {vehicleBrand} {vehicleModel}
                      </div>
                    )}
                  </div>
                )}

                {/* Price & Seats Strip */}
                <div className="flex items-center justify-between rounded-2xl border border-[#EAE6DF] bg-white p-4">
                  <div>
                    <div className="flex items-baseline gap-1">
                      <span className="font-sans text-2xl font-black text-[#1E2022]">
                        ₹{price || "0"}
                      </span>
                      <span className="text-xs font-bold text-slate-400">/ seat</span>
                    </div>
                    <span className="text-[10px] font-semibold text-slate-400">
                      Standard cost-share
                    </span>
                  </div>

                  <div className="inline-flex items-center gap-1.5 rounded-full bg-[#FDF2E9] border border-[#FADBD8] px-3 py-1 font-sans text-xs font-bold text-[#C8522E]">
                    <Users size={13} />
                    <span>
                      {effectiveSeatsDisplay} seat{effectiveSeatsDisplay > 1 ? "s" : ""} left
                    </span>
                  </div>
                </div>

                {/* Note Quote (if description exists) */}
                {description.trim().length > 0 && (
                  <div className="rounded-2xl border border-[#EAE6DF] bg-[#FAF8F5] p-3.5 text-xs text-slate-600 italic font-sans leading-relaxed">
                    &ldquo;{description}&rdquo;
                  </div>
                )}

                {/* Interactive Map Preview */}
                <div>
                  {hasValidRoute ? (
                    <OfferRideMap source={source} destination={destination} />
                  ) : (
                    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#EAE6DF] bg-[#FAF8F5] p-8 text-center text-slate-400">
                      <MapPin size={24} className="mb-2 text-slate-300" />
                      <p className="text-xs font-bold text-slate-600">Route Map Preview</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Select origin and destination to view the road corridor
                      </p>
                    </div>
                  )}
                </div>

                {/* Primary Publish Action */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => handleSubmit()}
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 rounded-2xl bg-[#C8522E] px-6 py-4 font-sans text-sm font-bold text-white shadow-xs transition hover:bg-[#B34524] disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        <span>Publishing Ride...</span>
                      </>
                    ) : (
                      <>
                        <span>Publish Ride</span>
                        <ChevronRight size={16} />
                      </>
                    )}
                  </button>

                  <p className="mt-2 text-center text-[11px] text-slate-400">
                    Your ride will be discoverable by commuters searching this route
                  </p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Authentication Required Modal Popup */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-md rounded-3xl border border-[#EAE6DF] bg-white p-6 sm:p-8 shadow-2xl space-y-5">
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setShowAuthModal(false)}
              aria-label="Close modal"
              className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-[#1E2022] transition"
            >
              <X size={18} />
            </button>

            {/* Icon & Heading */}
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#FAF8F5] border border-[#EAE6DF] text-[#C8522E]">
              <Car size={26} />
            </div>

            <div>
              <div className="inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-[#C8522E]">
                <span>Host Verification</span>
              </div>
              <h2 className="mt-1 font-sans text-2xl font-black tracking-tight text-[#1E2022]">
                Authentication Required
              </h2>
              <p className="mt-2 text-xs sm:text-sm text-slate-500 leading-relaxed">
                You must be logged in to publish a ride. Sign in to your SahaYatri account to share your journey and connect with co-travelers.
              </p>
            </div>

            {/* Action CTAs */}
            <div className="space-y-2.5 pt-2">
              <Link
                href="/login"
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#C8522E] px-5 py-3 font-sans text-xs font-bold text-white shadow-xs transition hover:bg-[#B34524] active:scale-98"
              >
                <span>Sign In to SahaYatri</span>
                <ChevronRight size={14} />
              </Link>

              <Link
                href="/register"
                className="flex w-full items-center justify-center rounded-xl border border-[#EAE6DF] bg-[#FAF8F5] px-5 py-3 font-sans text-xs font-bold text-[#1E2022] shadow-xs transition hover:border-[#1E2022] hover:bg-white"
              >
                Create New Account
              </Link>

              <button
                type="button"
                onClick={() => setShowAuthModal(false)}
                className="w-full py-2 text-center text-xs font-semibold text-slate-400 hover:text-slate-600 transition"
              >
                Cancel & Keep Editing
              </button>
            </div>
          </div>
        </div>
      )}

      <LandingFooter />
    </div>
  );
}

// Preference Toggle Pill Component
interface PreferenceToggleProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

function PreferenceToggle({
  label,
  checked,
  onChange,
}: PreferenceToggleProps) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`flex items-center justify-between rounded-xl px-3 py-2 text-left transition border ${
        checked
          ? "bg-[#FDF2E9] border-[#C8522E] text-[#C8522E]"
          : "bg-[#FAF8F5] border-[#EAE6DF] text-slate-600 hover:border-slate-300"
      }`}
    >
      <span className="text-xs font-semibold">{label}</span>
      <div
        className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-md border ${
          checked
            ? "bg-[#C8522E] border-[#C8522E] text-white"
            : "border-slate-300 bg-white"
        }`}
      >
        {checked && <Check size={11} strokeWidth={3} />}
      </div>
    </button>
  );
}