"use client";

import { useEffect } from "react";
import { Play, AlertTriangle, X, Loader2, Users, ShieldCheck, AlertCircle } from "lucide-react";

interface StartRideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading: boolean;
  error?: string;
  startWithoutPassengers?: boolean;
  acceptedPassengersCount?: number;
  unverifiedPassengersCount?: number;
}

export default function StartRideModal({
  isOpen,
  onClose,
  onConfirm,
  isLoading,
  error,
  startWithoutPassengers = false,
  acceptedPassengersCount = 0,
  unverifiedPassengersCount = 0,
}: StartRideModalProps) {
  // Close on Escape key
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && !isLoading) {
        onClose();
      }
    }

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, isLoading, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="start-ride-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isLoading) {
          onClose();
        }
      }}
    >
      <div className="relative w-full max-w-md rounded-3xl border border-[#EAE6DF] bg-white p-6 sm:p-7 shadow-2xl space-y-5 animate-in zoom-in-95 duration-150">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          disabled={isLoading}
          aria-label="Close modal"
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-[#1E2022] transition disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <X size={18} />
        </button>

        {/* Icon & Title Header */}
        <div className="flex items-start gap-4">
          <div
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border ${
              startWithoutPassengers
                ? "bg-amber-50 border-amber-200 text-amber-600"
                : "bg-[#FAF0EB] border-[#C8522E]/20 text-[#C8522E]"
            }`}
          >
            {startWithoutPassengers ? (
              <AlertTriangle size={24} />
            ) : (
              <Play size={22} fill="currentColor" />
            )}
          </div>

          <div className="flex-1 pr-6">
            <span
              className={`text-[10px] font-black uppercase tracking-wider ${
                startWithoutPassengers ? "text-amber-600" : "text-[#C8522E]"
              }`}
            >
              {startWithoutPassengers ? "Passenger Warning" : "Ride Lifecycle"}
            </span>
            <h2
              id="start-ride-modal-title"
              className="mt-0.5 font-sans text-xl font-black tracking-tight text-[#1E2022]"
            >
              {startWithoutPassengers
                ? "Start Without Passengers?"
                : "Start This Ride?"}
            </h2>
          </div>
        </div>

        {/* Description Body */}
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          {startWithoutPassengers
            ? "You have accepted passengers who have not verified their boarding PIN. Starting now will mark unverified passengers as no-shows and begin your trip."
            : "Starting your ride will mark it as active and notify your co-travelers that the journey has officially begun. You can verify passenger PINs as they board."}
        </p>

        {/* Passenger Status Summary */}
        {acceptedPassengersCount > 0 && (
          <div className="rounded-2xl border border-[#EAE6DF] bg-[#FAF8F5] p-3.5 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 font-semibold text-slate-600">
                <Users size={14} className="text-slate-400" />
                <span>Accepted Co-Travelers</span>
              </span>
              <span className="font-bold text-[#1E2022]">
                {acceptedPassengersCount} {acceptedPassengersCount === 1 ? "passenger" : "passengers"}
              </span>
            </div>

            {unverifiedPassengersCount > 0 ? (
              <div className="flex items-center justify-between text-xs pt-1 border-t border-[#EAE6DF]/70 text-amber-700">
                <span className="flex items-center gap-1.5 font-medium">
                  <AlertCircle size={13} className="text-amber-500" />
                  <span>Pending PIN verification</span>
                </span>
                <span className="font-bold">
                  {unverifiedPassengersCount}
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-xs pt-1 border-t border-[#EAE6DF]/70 text-emerald-700 font-medium">
                <ShieldCheck size={13} className="text-emerald-500" />
                <span>All accepted passengers onboard</span>
              </div>
            )}
          </div>
        )}

        {/* In-Modal Error Feedback */}
        {error && (
          <div className="flex items-start gap-2.5 rounded-2xl border border-rose-200 bg-rose-50 p-3.5 text-xs text-rose-700 animate-in fade-in duration-150">
            <AlertCircle size={16} className="shrink-0 text-rose-500 mt-0.5" />
            <div className="flex-1">
              <span className="font-bold block">Failed to start ride</span>
              <span className="text-rose-600">{error}</span>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-2">
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`flex h-11 w-full flex-1 items-center justify-center gap-2 rounded-xl font-sans text-xs font-bold text-white shadow-xs transition active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed ${
              startWithoutPassengers
                ? "bg-amber-600 hover:bg-amber-700"
                : "bg-[#C8522E] hover:bg-[#B34524]"
            }`}
          >
            {isLoading ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                <span>Starting Ride...</span>
              </>
            ) : (
              <>
                <Play size={14} fill="currentColor" />
                <span>
                  {startWithoutPassengers
                    ? "Confirm & Start Without Them"
                    : "Confirm & Start Ride"}
                </span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="flex h-11 w-full sm:w-auto items-center justify-center rounded-xl border border-[#EAE6DF] bg-[#FAF8F5] px-4 font-sans text-xs font-bold text-slate-700 transition hover:bg-white hover:text-[#1E2022] disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
