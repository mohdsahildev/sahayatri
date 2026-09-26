"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, X, AlertTriangle } from "lucide-react";
import {
  cancelRide,
  leaveRide,
} from "@/lib/api/rides-client";
import ConfirmModal from "@/components/ui/confirm-modal";

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

  const [confirmOpen, setConfirmOpen] = useState(false);
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

  function handleOpenConfirm() {
    setError("");
    setConfirmOpen(true);
  }

  async function handleConfirmAction() {
    if (loading) return;

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

      setConfirmOpen(false);
      router.refresh();
    } catch (err) {
      console.error(
        "Unable to update ride:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : isCreated
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
        onClick={handleOpenConfirm}
        disabled={loading}
        className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-rose-200 px-4 py-2.5 font-sans text-xs font-bold text-rose-600 transition hover:bg-rose-50 active:scale-98 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isCreated ? (
          <X size={14} />
        ) : (
          <LogOut size={14} />
        )}

        {isCreated ? "Cancel Ride" : "Leave Ride"}
      </button>

      {error && !confirmOpen && (
        <p className="mt-1 text-center text-[11px] font-medium text-rose-600">
          {error}
        </p>
      )}

      <ConfirmModal
        isOpen={confirmOpen}
        onClose={() => {
          if (!loading) {
            setConfirmOpen(false);
            setError("");
          }
        }}
        onConfirm={handleConfirmAction}
        isLoading={loading}
        title={isCreated ? "Cancel This Ride?" : "Leave This Ride?"}
        description={
          isCreated
            ? "Cancelling this ride will notify all co-travelers and withdraw it from the available rides feed."
            : "Leaving this ride will release your reserved seat back to the community."
        }
        confirmText={isCreated ? "Yes, Cancel Ride" : "Yes, Leave Ride"}
        cancelText="Never mind"
        variant="danger"
        category={isCreated ? "Driver Ride Action" : "Passenger Ride Action"}
        icon={isCreated ? <X size={24} /> : <AlertTriangle size={24} />}
        error={error}
      />
    </div>
  );
}