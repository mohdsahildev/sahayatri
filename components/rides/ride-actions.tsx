"use client";

import { useState } from "react";
import Link from "next/link";
import { Minus, Plus } from "lucide-react";
import { apiFetch } from "@/lib/api/client";
import { useAuthStore } from "@/lib/stores/auth.store";

interface RideActionsProps {
  rideId: string;
  driverId: string;
  status: string;
  seatsLeft: number;
}

interface RideActionResponse {
  success: boolean;
  message: string;
  data: {
    _id: string;
    bookedSeats: number;
  };
}

export default function RideActions({
  rideId,
  driverId,
  status,
  seatsLeft,
}: RideActionsProps) {
  const user = useAuthStore(
    (state) => state.user
  );

  const isAuthenticated = useAuthStore(
    (state) => state.isAuthenticated
  );

  const isOwner =
    isAuthenticated &&
    user?._id === driverId;

  const [seats, setSeats] = useState(1);
  const [loading, setLoading] = useState(false);
  const [joined, setJoined] = useState(false);
  const [error, setError] = useState("");

  async function handleJoin() {
    if (!isAuthenticated || isOwner) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      await apiFetch<RideActionResponse>(
        `/rides/${rideId}/join`,
        {
          method: "POST",
          body: JSON.stringify({ seats }),
        }
      );

      setJoined(true);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to join this ride"
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleLeave() {
    setLoading(true);
    setError("");

    try {
      await apiFetch<RideActionResponse>(
        `/rides/${rideId}/leave`,
        {
          method: "POST",
        }
      );

      setJoined(false);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to leave this ride"
      );
    } finally {
      setLoading(false);
    }
  }

  const canJoin =
    isAuthenticated &&
    !isOwner &&
    status === "scheduled" &&
    seatsLeft > 0;

  return (
    <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-6 lg:sticky lg:top-6">
      {isOwner ? (
        <>
          <h2 className="text-lg font-bold text-secondary">
            Your ride
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            You created this ride. Ride management
            actions will be added here next.
          </p>

          <div className="mt-5 rounded-xl bg-neutral p-4">
            <p className="text-sm font-semibold text-secondary">
              You're the driver
            </p>

            <p className="mt-1 text-xs leading-5 text-slate-500">
              You can't join your own ride.
            </p>
          </div>
        </>
      ) : !isAuthenticated ? (
        <>
          <h2 className="text-lg font-bold text-secondary">
            Join this ride
          </h2>

          <div className="mt-4 rounded-xl bg-neutral p-4">
            <p className="text-sm font-semibold text-secondary">
              Want to join this ride?
            </p>

            <p className="mt-1 text-xs leading-5 text-slate-500">
              Log in to book a seat.
            </p>

            <Link
              href="/login"
              className="mt-4 flex w-full items-center justify-center rounded-xl bg-primary px-4 py-3 text-sm font-bold text-white transition hover:bg-secondary"
            >
              Log in
            </Link>
          </div>
        </>
      ) : joined ? (
        <>
          <h2 className="text-lg font-bold text-secondary">
            Your booking
          </h2>

          <div className="mt-4 rounded-xl bg-neutral p-4">
            <p className="text-sm font-semibold text-secondary">
              You're on this ride
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Your seat has been booked successfully.
            </p>
          </div>

          <button
            type="button"
            onClick={handleLeave}
            disabled={loading}
            className="mt-3 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold text-secondary transition hover:border-red-300 hover:text-red-600 disabled:opacity-50"
          >
            {loading ? "Leaving..." : "Leave ride"}
          </button>
        </>
      ) : (
        <>
          <h2 className="text-lg font-bold text-secondary">
            Join this ride
          </h2>

          <div className="mt-5">
            <p className="text-xs font-semibold text-slate-500">
              Seats
            </p>

            <div className="mt-2 flex items-center justify-between rounded-xl border border-slate-200 p-2">
              <button
                type="button"
                onClick={() =>
                  setSeats((value) =>
                    Math.max(1, value - 1)
                  )
                }
                disabled={seats <= 1}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-secondary hover:bg-neutral disabled:opacity-30"
              >
                <Minus size={16} />
              </button>

              <span className="font-semibold text-secondary">
                {seats}
              </span>

              <button
                type="button"
                onClick={() =>
                  setSeats((value) =>
                    Math.min(seatsLeft, value + 1)
                  )
                }
                disabled={seats >= seatsLeft}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-secondary hover:bg-neutral disabled:opacity-30"
              >
                <Plus size={16} />
              </button>
            </div>
          </div>

          {error && (
            <p className="mt-3 rounded-xl bg-red-50 p-3 text-xs leading-5 text-red-600">
              {error}
            </p>
          )}

          <button
            type="button"
            onClick={handleJoin}
            disabled={!canJoin || loading}
            className="mt-5 w-full rounded-xl bg-primary px-4 py-3 text-sm font-bold text-white transition hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Joining..." : "Join Ride"}
          </button>

          {status !== "scheduled" && (
            <p className="mt-3 text-center text-xs text-slate-500">
              This ride is no longer available to join.
            </p>
          )}

          {status === "scheduled" &&
            seatsLeft === 0 && (
              <p className="mt-3 text-center text-xs text-slate-500">
                This ride is full.
              </p>
            )}
        </>
      )}
    </aside>
  );
}