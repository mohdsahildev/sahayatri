"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
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

interface UpdateRideResponse {
  success: boolean;
  message: string;
  data: {
    _id: string;
    price?: number;
  };
}

export default function EditRidePage() {
  const params = useParams();
  const router = useRouter();

  const rideId = params.id as string;

  const isAuthenticated = useAuthStore(
    (state) => state.isAuthenticated
  );
  const isHydrated = useAuthStore(
    (state) => state.isHydrated
  );

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [ride, setRide] = useState<RideResponse["data"] | null>(
    null
  );

  const [price, setPrice] = useState("");
  const [seatsAvailable, setSeatsAvailable] = useState("");
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

          const response = await apiFetch<RideResponse>(
            `/rides/${rideId}`
          );

          if (cancelled) return;

          const data = response.data;

          const driverId =
            typeof data.driver === "string"
              ? data.driver
              : data.driver._id;

          if (!driverId || driverId !== currentUserId) {
            router.replace(`/rides/${rideId}`);
            return;
          }

          if (data.status !== "scheduled") {
            setError("Only scheduled rides can be edited.");
            return;
          }

          setRide(data);
          setPrice(String(data.price));
          setSeatsAvailable(String(data.seatsAvailable));
          setDescription(data.description ?? "");
        } catch (error) {
          console.error("Load ride error:", error);

          if (cancelled) return;

          setError(
            error instanceof Error
              ? error.message
              : "Unable to load this ride"
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

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    const parsedPrice = Number(price);
    const parsedSeats = Number(seatsAvailable);

    if (!Number.isFinite(parsedPrice) || parsedPrice < 0) {
      setError("Please enter a valid price.");
      return;
    }

    if (
      !Number.isInteger(parsedSeats) ||
      parsedSeats < 1
    ) {
      setError("Please enter a valid number of seats.");
      return;
    }

    if (
      ride &&
      parsedSeats < 1
    ) {
      setError("Seats available must be at least 1.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      await apiFetch<UpdateRideResponse>(
        `/rides/${rideId}`,
        {
          method: "PUT",
          body: JSON.stringify({
            price: parsedPrice,
            seatsAvailable: parsedSeats,
            description: description.trim(),
          }),
        }
      );

      router.push(`/rides/${rideId}`);
      router.refresh();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to update this ride"
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="mx-auto w-full max-w-[800px] px-5 py-10 sm:px-8">
        <p className="text-sm text-slate-500">
          Loading ride...
        </p>
      </main>
    );
  }

  if (error && !ride) {
    return (
      <main className="mx-auto w-full max-w-[800px] px-5 py-10 sm:px-8">
        <Link
          href={`/rides/${rideId}`}
          className="inline-flex items-center gap-2 text-sm font-semibold text-secondary"
        >
          <ArrowLeft size={16} />
          Back to ride
        </Link>

        <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-5">
          <p className="text-sm font-semibold text-red-600">
            {error}
          </p>
        </div>
      </main>
    );
  }

  if (!ride) return null;

  return (
    <main className="mx-auto w-full max-w-[800px] px-5 py-8 sm:px-8">
      <Link
        href={`/rides/${rideId}`}
        className="inline-flex items-center gap-2 text-sm font-semibold text-secondary transition hover:text-primary"
      >
        <ArrowLeft size={16} />
        Back to ride
      </Link>

      <div className="mt-6">
        <h1 className="text-3xl font-bold tracking-tight text-secondary">
          Edit ride
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          Update the details of your scheduled ride.
        </p>
      </div>

      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6">
        <div className="mb-6 rounded-xl bg-neutral p-4">
          <p className="text-sm font-semibold text-secondary">
            {ride.source.name} → {ride.destination.name}
          </p>

          <p className="mt-1 text-xs text-slate-500">
            {new Date(
              ride.departureTime
            ).toLocaleString("en-IN", {
              dateStyle: "medium",
              timeStyle: "short",
            })}
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-5"
        >
          <div>
            <label
              htmlFor="price"
              className="mb-2 block text-sm font-semibold text-secondary"
            >
              Price per passenger
            </label>

            <input
              id="price"
              type="number"
              min="0"
              step="1"
              value={price}
              onChange={(event) =>
                setPrice(event.target.value)
              }
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-primary"
            />
          </div>

          <div>
            <label
              htmlFor="seats"
              className="mb-2 block text-sm font-semibold text-secondary"
            >
              Available seats
            </label>

            <input
              id="seats"
              type="number"
              min="1"
              step="1"
              value={seatsAvailable}
              onChange={(event) =>
                setSeatsAvailable(event.target.value)
              }
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-primary"
            />
          </div>

          <div>
            <label
              htmlFor="description"
              className="mb-2 block text-sm font-semibold text-secondary"
            >
              Description
            </label>

            <textarea
              id="description"
              rows={5}
              value={description}
              onChange={(event) =>
                setDescription(event.target.value)
              }
              placeholder="Add any useful information about the ride..."
              className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-primary"
            />
          </div>

          {error && (
            <div className="rounded-xl bg-red-50 p-3">
              <p className="text-sm text-red-600">
                {error}
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={saving}
            className="w-full rounded-xl bg-primary px-4 py-3 text-sm font-bold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? "Saving changes..." : "Save changes"}
          </button>
        </form>
      </div>
    </main>
  );
}