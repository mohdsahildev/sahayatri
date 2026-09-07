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
}

export default function MyRideActions({
  rideId,
  isCreated,
  status,
}: MyRideActionsProps) {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const canManage =
    status !== "cancelled" &&
    status !== "completed";

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
      className="mt-4"
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
      }}
    >
      <button
        type="button"
        onClick={handleAction}
        disabled={loading}
        className="inline-flex items-center gap-2 rounded-xl border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isCreated ? (
          <X size={15} />
        ) : (
          <LogOut size={15} />
        )}

        {loading
          ? "Processing..."
          : isCreated
            ? "Cancel ride"
            : "Leave ride"}
      </button>

      {error && (
        <p className="mt-2 text-xs text-red-500">
          {error}
        </p>
      )}
    </div>
  );
}