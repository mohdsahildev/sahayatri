"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import LocationSearch from "@/components/location/location-search";
import type { Location } from "@/lib/location/geoapify";
import type { CreateRideRequest } from "@/lib/api/rides";

export default function PostRidePage() {
  const router = useRouter();

  const [source, setSource] =
    useState<Location | null>(null);

  const [destination, setDestination] =
    useState<Location | null>(null);

  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [duration, setDuration] = useState("60");
  const [seats, setSeats] = useState("1");
  const [price, setPrice] = useState("");
  const [description, setDescription] =
    useState("");

  const [vehicleType, setVehicleType] =
    useState("car");
  const [vehicleBrand, setVehicleBrand] =
    useState("");
  const [vehicleModel, setVehicleModel] =
    useState("");
  const [vehicleNumber, setVehicleNumber] =
    useState("");

  const [womenOnly, setWomenOnly] =
    useState(false);
  const [verifiedOnly, setVerifiedOnly] =
    useState(false);
  const [smokingAllowed, setSmokingAllowed] =
    useState(false);
  const [musicAllowed, setMusicAllowed] =
    useState(true);
  const [petsAllowed, setPetsAllowed] =
    useState(false);
  const [acAvailable, setAcAvailable] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");

    if (!source || !destination) {
      setError(
        "Please select both a starting location and destination."
      );
      return;
    }

    if (!date || !time) {
      setError(
        "Please select a departure date and time."
      );
      return;
    }

    const departureTime = new Date(
      `${date}T${time}`
    );

    if (Number.isNaN(departureTime.getTime())) {
      setError("Please enter a valid departure time.");
      return;
    }

    if (departureTime <= new Date()) {
      setError(
        "Departure time must be in the future."
      );
      return;
    }

    const payload: CreateRideRequest = {
      source,
      destination,
      departureTime:
        departureTime.toISOString(),
      duration: Number(duration),
      seatsAvailable: Number(seats),
      price: Number(price),

      description:
        description.trim() || undefined,

      vehicle: {
        type: vehicleType,
        brand: vehicleBrand.trim(),
        model: vehicleModel.trim(),
        number: vehicleNumber.trim(),
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

      const response = await fetch(
        "/api/rides",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );
      
      const result = await response.json();
      
      if (!response.ok || !result.success) {
        throw new Error(
          result.message ?? "Unable to create ride."
        );
      }
      
      router.push(
        `/rides/${result.data._id}`
      );
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to create ride."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto w-full max-w-3xl px-5 py-10">
      <div>
        <h1 className="text-3xl font-bold text-secondary">
          Post a Ride
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Share your journey with people heading
          the same way.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="mt-8 space-y-6"
      >
        {/* Route */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="text-lg font-bold text-secondary">
            Your route
          </h2>

          <div className="mt-4 space-y-4">
            <LocationSearch
              value={source}
              placeholder="Starting location"
              onSelect={setSource}
            />

            <LocationSearch
              value={destination}
              placeholder="Destination"
              onSelect={setDestination}
            />
          </div>
        </section>

        {/* Journey */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="text-lg font-bold text-secondary">
            Journey details
          </h2>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="date"
                className="text-sm font-semibold text-secondary"
              >
                Departure date
              </label>

              <input
                id="date"
                type="date"
                value={date}
                onChange={(event) =>
                  setDate(event.target.value)
                }
                required
                className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-primary"
              />
            </div>

            <div>
              <label
                htmlFor="time"
                className="text-sm font-semibold text-secondary"
              >
                Departure time
              </label>

              <input
                id="time"
                type="time"
                value={time}
                onChange={(event) =>
                  setTime(event.target.value)
                }
                required
                className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-primary"
              />
            </div>

            <div>
              <label
                htmlFor="duration"
                className="text-sm font-semibold text-secondary"
              >
                Duration (minutes)
              </label>

              <input
                id="duration"
                type="number"
                min="1"
                value={duration}
                onChange={(event) =>
                  setDuration(event.target.value)
                }
                required
                className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-primary"
              />
            </div>

            <div>
              <label
                htmlFor="seats"
                className="text-sm font-semibold text-secondary"
              >
                Available seats
              </label>

              <input
                id="seats"
                type="number"
                min="1"
                value={seats}
                onChange={(event) =>
                  setSeats(event.target.value)
                }
                required
                className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-primary"
              />
            </div>

            <div>
              <label
                htmlFor="price"
                className="text-sm font-semibold text-secondary"
              >
                Price per seat (₹)
              </label>

              <input
                id="price"
                type="number"
                min="0"
                value={price}
                onChange={(event) =>
                  setPrice(event.target.value)
                }
                required
                className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-primary"
              />
            </div>
          </div>
        </section>

        {/* Vehicle */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="text-lg font-bold text-secondary">
            Vehicle
          </h2>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="vehicleType"
                className="text-sm font-semibold text-secondary"
              >
                Type
              </label>

              <select
                id="vehicleType"
                value={vehicleType}
                onChange={(event) =>
                  setVehicleType(event.target.value)
                }
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-primary"
              >
                <option value="car">Car</option>
                <option value="bike">Bike</option>
                <option value="van">Van</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="vehicleBrand"
                className="text-sm font-semibold text-secondary"
              >
                Brand
              </label>

              <input
                id="vehicleBrand"
                value={vehicleBrand}
                onChange={(event) =>
                  setVehicleBrand(event.target.value)
                }
                placeholder="e.g. Hyundai"
                required
                className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-primary"
              />
            </div>

            <div>
              <label
                htmlFor="vehicleModel"
                className="text-sm font-semibold text-secondary"
              >
                Model
              </label>

              <input
                id="vehicleModel"
                value={vehicleModel}
                onChange={(event) =>
                  setVehicleModel(event.target.value)
                }
                placeholder="e.g. i20"
                required
                className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-primary"
              />
            </div>

            <div>
              <label
                htmlFor="vehicleNumber"
                className="text-sm font-semibold text-secondary"
              >
                Registration number
              </label>

              <input
                id="vehicleNumber"
                value={vehicleNumber}
                onChange={(event) =>
                  setVehicleNumber(event.target.value)
                }
                placeholder="e.g. KL 10 AB 1234"
                required
                className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-primary"
              />
            </div>
          </div>
        </section>

        {/* Preferences */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="text-lg font-bold text-secondary">
            Preferences
          </h2>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <Preference
              label="Women only"
              checked={womenOnly}
              onChange={setWomenOnly}
            />

            <Preference
              label="Verified passengers only"
              checked={verifiedOnly}
              onChange={setVerifiedOnly}
            />

            <Preference
              label="Smoking allowed"
              checked={smokingAllowed}
              onChange={setSmokingAllowed}
            />

            <Preference
              label="Music allowed"
              checked={musicAllowed}
              onChange={setMusicAllowed}
            />

            <Preference
              label="Pets allowed"
              checked={petsAllowed}
              onChange={setPetsAllowed}
            />

            <Preference
              label="AC available"
              checked={acAvailable}
              onChange={setAcAvailable}
            />
          </div>
        </section>

        {/* Description */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6">
          <label
            htmlFor="description"
            className="text-lg font-bold text-secondary"
          >
            About this ride
          </label>

          <textarea
            id="description"
            value={description}
            onChange={(event) =>
              setDescription(event.target.value)
            }
            rows={4}
            placeholder="Anything passengers should know?"
            className="mt-4 w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-primary"
          />
        </section>

        {/* Error */}
        {error && (
          <div className="rounded-xl bg-red-50 p-4 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-primary px-5 py-3.5 text-sm font-bold text-white transition hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading
            ? "Creating ride..."
            : "Post Ride"}
        </button>
      </form>
    </main>
  );
}

interface PreferenceProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

function Preference({
  label,
  checked,
  onChange,
}: PreferenceProps) {
  return (
    <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 p-3">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) =>
          onChange(event.target.checked)
        }
        className="h-4 w-4 accent-primary"
      />

      <span className="text-sm font-medium text-secondary">
        {label}
      </span>
    </label>
  );
}