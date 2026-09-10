"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, X } from "lucide-react";
import {
  cancelRide,
  leaveRide,
} from "@/lib/api/rides-client";

interface MyRideActionsProps {
  rideId: string;
  isCreated: boolean;
  status: string;
  isPast?: boolean;
}

export default function MyRideActions({
  rideId,
  isCreated,
  status,
  isPast = false,
}: MyRideActionsProps) {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const canManage =
    !isPast &&
    status !== "cancelled" &&
    status !== "completed" &&
    status !== "ended";

  if (!canManage) {
    return null;
  }

  async function handleAction() {
    const confirmed = window.confirm(
      isCreated
        ? "Are you sure you want to cancel this ride?"
        : "Are you sure you want to leave this ride?"
    );

    if (!confirmed || loading) return;

    setLoading(true);
    setError("");

    try {
      if (isCreated) {
        await cancelRide(
          rideId,
          "Cancelled by the driver"
        );
      } else {
        await leaveRide(rideId);
      }

      router.refresh();
    } catch (error) {
      console.error(
        "Unable to update ride:",
        error
      );

      setError(
        isCreated
          ? "Unable to cancel the ride."
          : "Unable to leave the ride."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
      }}
    >
      <button
        type="button"
        onClick={handleAction}
        disabled={loading}
        className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-rose-200 px-4 py-2.5 font-sans text-xs font-bold text-rose-600 transition hover:bg-rose-50 active:scale-98 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isCreated ? (
          <X size={14} />
        ) : (
          <LogOut size={14} />
        )}

        {loading
          ? "Processing..."
          : isCreated
            ? "Cancel Ride"
            : "Leave Ride"}
      </button>

      {error && (
        <p className="mt-1 text-center text-[11px] font-medium text-rose-600">
          {error}
        </p>
      )}
    </div>
  );
}