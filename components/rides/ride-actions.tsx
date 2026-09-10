"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Minus,
  Plus,
  Pencil,
  Send,
  Check,
  X,
  MessageCircle,
  Play,
  Square,
  CheckCircle,
  LogOut,
} from "lucide-react";
import { apiFetch } from "@/lib/api/client";
import {
  createRideRequest,
  getRideRequests,
  getMyRideRequests,
  acceptRideRequest,
  rejectRideRequest,
  cancelRideRequest,
  type RideRequest,
} from "@/lib/api/ride-requests";
import { useAuthStore } from "@/lib/stores/auth.store";
import { getRideChat } from "@/lib/api/chat";
import RideReview from "./ride-review";

interface RideActionsProps {
  rideId: string;
  driverId: string;
  status: string;
  seatsLeft: number;
  price?: number;
  seatsAvailable?: number;
  bookedSeats?: number;
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
  price,
  seatsAvailable,
  bookedSeats,
}: RideActionsProps) {
  const router = useRouter();

  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const isOwner = isAuthenticated && user?._id === driverId;

  const [seats, setSeats] = useState(1);
  const [loading, setLoading] = useState(false);
  const [joined, setJoined] = useState(false);
  const [requestStatus, setRequestStatus] = useState<
    RideRequest["status"] | null
  >(null);

  const [chatPartner, setChatPartner] = useState<{
    userId: string;
    name: string;
  } | null>(null);
  const [error, setError] = useState("");
  const [requests, setRequests] = useState<RideRequest[]>([]);
  const [requestsLoading, setRequestsLoading] = useState(false);
  const [requestActionLoading, setRequestActionLoading] = useState<string | null>(
    null
  );

  const [otpValues, setOtpValues] = useState<Record<string, string>>({});
  const [verifyingPassenger, setVerifyingPassenger] = useState<string | null>(
    null
  );
  const [rideActionLoading, setRideActionLoading] = useState(false);
  const [startPin, setStartPin] = useState<string | null>(null);

  useEffect(() => {
    if (!isOwner) return;

    async function loadRequests() {
      setRequestsLoading(true);

      try {
        const response = await getRideRequests(rideId);
        setRequests(response.data.requests ?? []);
      } catch (err) {
        console.error("Unable to load ride requests:", err);
      } finally {
        setRequestsLoading(false);
      }
    }

    loadRequests();
  }, [isOwner, rideId, status]);

  useEffect(() => {
    if (!isAuthenticated || isOwner) return;

    async function loadMyRequest() {
      try {
        const response = await getMyRideRequests();

        const currentRequest = response.data.requests?.find((request) => {
          const requestRideId =
            typeof request.ride === "string"
              ? request.ride
              : request.ride?._id;

          return requestRideId === rideId;
        });

        if (currentRequest) {
          setStartPin(currentRequest.startPin ?? null);
          setRequestStatus(currentRequest.status);

          const driver =
            typeof currentRequest.driver === "object"
              ? currentRequest.driver
              : null;

          if (driver?._id) {
            setChatPartner({
              userId: driver._id,
              name: driver.name ?? "Driver",
            });
          }
        }
      } catch (err) {
        console.error("Unable to load request status:", err);
      }
    }

    loadMyRequest();
  }, [isAuthenticated, isOwner, rideId]);

  async function handleJoin() {
    if (!isAuthenticated || isOwner) return;

    setLoading(true);
    setError("");

    try {
      await apiFetch<RideActionResponse>(`/rides/${rideId}/join`, {
        method: "POST",
        body: JSON.stringify({ seats }),
      });

      setJoined(true);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to join this ride"
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleRequest() {
    if (!isAuthenticated || isOwner) return;
    setLoading(true);
    setError("");
    try {
      await createRideRequest(rideId, {
        seatsRequested: seats,
      });

      setRequestStatus("pending");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to send ride request"
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleCancelRequest() {
    if (!requestStatus || requestStatus !== "pending") return;

    setLoading(true);
    setError("");

    try {
      const response = await getMyRideRequests();

      const currentRequest = response.data.requests?.find((request) => {
        const requestRideId =
          typeof request.ride === "string"
            ? request.ride
            : request.ride?._id;

        return requestRideId === rideId && request.status === "pending";
      });

      if (!currentRequest) {
        setRequestStatus(null);
        setError("No pending request found.");
        return;
      }

      await cancelRideRequest(currentRequest._id);
      setRequestStatus("cancelled");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to cancel request"
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyPassenger(
    requestId: string,
    passengerId: string
  ) {
    const otp = otpValues[requestId]?.trim();

    if (!otp || !/^\d{4}$/.test(otp)) {
      setError("Enter the passenger's 4-digit OTP.");
      return;
    }

    setVerifyingPassenger(requestId);
    setError("");

    try {
      await apiFetch(`/rides/${rideId}/verify-passenger`, {
        method: "POST",
        body: JSON.stringify({
          requestId,
          passengerId,
          otp,
        }),
      });

      setRequests((current) =>
        current.map((request) =>
          request._id === requestId
            ? {
                ...request,
                verifiedBoarding: true,
                pinVerified: true,
              }
            : request
        )
      );

      setOtpValues((current) => ({
        ...current,
        [requestId]: "",
      }));

      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to verify passenger."
      );
    } finally {
      setVerifyingPassenger(null);
    }
  }

  async function handleAcceptRequest(requestId: string) {
    setRequestActionLoading(requestId);
    setError("");

    try {
      const response = await acceptRideRequest(requestId);

      setRequests((current) =>
        current.map((request) =>
          request._id === requestId ? response.data.request : request
        )
      );

      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to accept request"
      );
    } finally {
      setRequestActionLoading(null);
    }
  }

  async function handleRejectRequest(requestId: string) {
    setRequestActionLoading(requestId);
    setError("");

    try {
      const response = await rejectRideRequest(requestId);

      setRequests((current) =>
        current.map((request) =>
          request._id === requestId ? response.data.request : request
        )
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to reject request"
      );
    } finally {
      setRequestActionLoading(null);
    }
  }

  async function handleLeave() {
    setLoading(true);
    setError("");

    try {
      await apiFetch<RideActionResponse>(`/rides/${rideId}/leave`, {
        method: "POST",
      });

      setJoined(false);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to leave this ride"
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleCancel() {
    const confirmed = window.confirm(
      "Are you sure you want to cancel this ride?"
    );

    if (!confirmed) return;

    setLoading(true);
    setError("");

    try {
      await apiFetch(`/rides/${rideId}`, {
        method: "DELETE",
      });

      window.location.href = "/home";
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to cancel this ride"
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleStartRide(startWithoutPassengers = false) {
    const confirmed = window.confirm(
      startWithoutPassengers
        ? "Start this ride without the accepted passengers? They will be marked as no-shows."
        : "Are you sure you want to start this ride?"
    );

    if (!confirmed) return;

    setRideActionLoading(true);
    setError("");

    try {
      await apiFetch(`/rides/${rideId}/start`, {
        method: "PUT",
        body: JSON.stringify({
          startWithoutPassengers,
        }),
      });

      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to start ride."
      );
    } finally {
      setRideActionLoading(false);
    }
  }

  async function handleEndRide() {
    const confirmed = window.confirm(
      "Are you sure you want to end this ride?"
    );

    if (!confirmed) return;

    setRideActionLoading(true);
    setError("");

    try {
      await apiFetch(`/rides/${rideId}/end`, {
        method: "PUT",
      });

      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to end ride."
      );
    } finally {
      setRideActionLoading(false);
    }
  }

  async function handleCompleteRide() {
    const confirmed = window.confirm(
      "Mark this ride as completed? This will allow participants to leave reviews."
    );

    if (!confirmed) return;

    setRideActionLoading(true);
    setError("");

    try {
      await apiFetch(`/rides/${rideId}/complete`, {
        method: "PUT",
      });

      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to complete ride."
      );
    } finally {
      setRideActionLoading(false);
    }
  }

  const canJoin =
    isAuthenticated && !isOwner && status === "scheduled" && seatsLeft > 0;

  return (
    <aside className="h-fit rounded-3xl border border-[#EAE6DF] bg-white p-6 sm:p-7 shadow-xs space-y-6">
      {/* Top Pricing & Availability Header */}
      {price !== undefined && (
        <div className="flex items-baseline justify-between gap-3 pb-5 border-b border-[#EAE6DF]/60">
          <div>
            <span className="font-sans text-2xl sm:text-3xl font-black tracking-tight text-[#1E2022]">
              ₹{price}
            </span>
            <span className="text-xs font-semibold text-slate-500"> / seat</span>
          </div>

          <span className="text-xs font-bold text-slate-600">
            {seatsLeft} {seatsLeft === 1 ? "seat" : "seats"} left
          </span>
        </div>
      )}

      {isOwner ? (
        /* DRIVER / HOST VIEW */
        <div className="space-y-6">
          <div>
            <h2 className="font-sans text-xl font-black tracking-tight text-[#1E2022]">
              Manage your ride
            </h2>
            <p className="mt-1 text-xs text-slate-500 leading-relaxed">
              {status === "scheduled"
                ? "Your journey is scheduled."
                : status === "started"
                ? "Your ride is currently active."
                : status === "ended"
                ? "Your journey has concluded."
                : status === "completed"
                ? "Your journey is completed."
                : "This ride has been cancelled."}
            </p>
          </div>

          {/* Lifecycle Actions */}
          <div className="space-y-3">
            {status === "scheduled" && (
              <>
                {/* Primary Action: Start Ride */}
                <button
                  type="button"
                  onClick={() => handleStartRide(false)}
                  disabled={rideActionLoading}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#C8522E] px-4 py-3 font-sans text-xs font-bold text-white shadow-xs transition hover:bg-[#B34524] active:scale-98 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Play size={14} />
                  <span>{rideActionLoading ? "Starting ride..." : "Start Ride"}</span>
                </button>

                {/* Secondary Warning Action: Start without passengers */}
                {requests.some(
                  (request) =>
                    request.status === "accepted" &&
                    !request.verifiedBoarding &&
                    !request.pinVerified
                ) && (
                  <button
                    type="button"
                    onClick={() => handleStartRide(true)}
                    disabled={rideActionLoading}
                    className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-amber-300 bg-amber-50/50 px-4 py-2 font-sans text-xs font-bold text-amber-900 transition hover:bg-amber-100 disabled:opacity-50"
                  >
                    <span>Start without passengers</span>
                  </button>
                )}

                {/* Quiet Tertiary Actions: Edit & Cancel */}
                <div className="flex items-center justify-between pt-1 text-xs font-semibold">
                  <Link
                    href={`/rides/${rideId}/edit`}
                    className="inline-flex items-center gap-1.5 text-slate-600 transition hover:text-[#1E2022]"
                  >
                    <Pencil size={13} />
                    <span>Edit ride</span>
                  </Link>

                  <button
                    type="button"
                    onClick={handleCancel}
                    disabled={loading}
                    className="inline-flex items-center gap-1.5 text-rose-600 transition hover:text-rose-700 disabled:opacity-50"
                  >
                    <X size={13} />
                    <span>{loading ? "Cancelling..." : "Cancel ride"}</span>
                  </button>
                </div>
              </>
            )}

            {status === "started" && (
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={handleEndRide}
                  disabled={rideActionLoading}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#1E2022] px-4 py-3 font-sans text-xs font-bold text-white shadow-xs transition hover:bg-slate-800 disabled:opacity-50"
                >
                  <Square size={14} />
                  <span>{rideActionLoading ? "Ending ride..." : "End Ride"}</span>
                </button>
              </div>
            )}

            {status === "ended" && (
              <button
                type="button"
                onClick={handleCompleteRide}
                disabled={rideActionLoading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#C8522E] px-4 py-3 font-sans text-xs font-bold text-white shadow-xs transition hover:bg-[#B34524] disabled:opacity-50"
              >
                <CheckCircle size={14} />
                <span>{rideActionLoading ? "Completing..." : "Complete Ride"}</span>
              </button>
            )}

            {status === "completed" && (
              <div className="rounded-2xl border border-[#D0E5D5] bg-[#EAF4ED] p-4 text-center">
                <p className="font-sans text-xs font-bold text-[#2E6F40]">
                  ✓ Journey Completed
                </p>
                <p className="mt-0.5 text-xs text-[#2E6F40]/80">
                  Participants can now exchange reviews.
                </p>
              </div>
            )}

            {status === "cancelled" && (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-center">
                <p className="font-sans text-xs font-bold text-rose-700">
                  ✕ Ride Cancelled
                </p>
                <p className="mt-0.5 text-xs text-rose-600/80">
                  This journey was cancelled.
                </p>
              </div>
            )}
          </div>

          {/* Passenger Requests Section */}
          <div className="pt-4 border-t border-[#EAE6DF]/60 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-sans text-xs font-bold text-[#1E2022]">
                Passenger requests
              </h3>

              <span className="text-xs font-medium text-slate-500">
                {requests.filter((r) => r.status === "pending").length} pending
              </span>
            </div>

            {requestsLoading ? (
              <p className="text-xs text-slate-400">Loading requests...</p>
            ) : requests.length === 0 ? (
              <p className="text-xs text-slate-400 py-2">
                No passenger requests yet.
              </p>
            ) : (
              <div className="divide-y divide-[#EAE6DF]/60">
                {requests.map((request) => {
                  const passenger =
                    typeof request.passenger === "object"
                      ? request.passenger
                      : null;

                  const isPending = request.status === "pending";
                  const actionLoading = requestActionLoading === request._id;
                  const isVerified =
                    request.verifiedBoarding || request.pinVerified;

                  return (
                    <div
                      key={request._id}
                      className="py-3.5 first:pt-0 last:pb-0 space-y-2.5"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div>
                          {passenger?._id ? (
                            <Link
                              href={`/profile/${passenger._id}`}
                              className="font-sans text-xs font-bold text-[#1E2022] hover:text-[#C8522E] transition"
                            >
                              {passenger.name ?? "Passenger"}
                            </Link>
                          ) : (
                            <span className="font-sans text-xs font-bold text-[#1E2022]">
                              Passenger
                            </span>
                          )}
                          <p className="text-[11px] text-slate-500">
                            {request.seatsRequested}{" "}
                            {request.seatsRequested === 1 ? "seat" : "seats"}
                          </p>
                        </div>

                        <span
                          className={`text-xs font-bold ${
                            request.status === "accepted"
                              ? "text-[#2E6F40]"
                              : request.status === "rejected"
                              ? "text-rose-600"
                              : "text-amber-600"
                          }`}
                        >
                          {request.status === "accepted"
                            ? "Accepted"
                            : request.status === "rejected"
                            ? "Declined"
                            : "Pending"}
                        </span>
                      </div>

                      {/* Pending Action Buttons */}
                      {isPending && (
                        <div className="flex items-center gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() => handleAcceptRequest(request._id)}
                            disabled={actionLoading}
                            className="flex-1 flex items-center justify-center gap-1 rounded-xl bg-[#C8522E] px-3 py-1.5 font-sans text-xs font-bold text-white shadow-xs transition hover:bg-[#B34524] disabled:opacity-50"
                          >
                            <Check size={13} />
                            <span>{actionLoading ? "..." : "Accept"}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleRejectRequest(request._id)}
                            disabled={actionLoading}
                            className="flex-1 flex items-center justify-center gap-1 rounded-xl border border-[#EAE6DF] bg-[#FAF8F5] px-3 py-1.5 font-sans text-xs font-semibold text-slate-700 transition hover:bg-white disabled:opacity-50"
                          >
                            <X size={13} />
                            <span>Reject</span>
                          </button>
                        </div>
                      )}

                      {/* Accepted Verification & Chat */}
                      {request.status === "accepted" && passenger?._id && (
                        <div className="space-y-2 pt-0.5">
                          {isVerified ? (
                            <p className="text-xs font-bold text-[#2E6F40]">
                              ✓ Verified at pickup
                            </p>
                          ) : (
                            <div className="space-y-1.5">
                              <p className="text-[11px] font-semibold text-slate-500">
                                Verify at pickup
                              </p>
                              <div className="flex gap-2">
                                <input
                                  type="text"
                                  inputMode="numeric"
                                  maxLength={4}
                                  placeholder="4-digit OTP"
                                  value={otpValues[request._id] ?? ""}
                                  onChange={(e) =>
                                    setOtpValues((current) => ({
                                      ...current,
                                      [request._id]: e.target.value
                                        .replace(/\D/g, "")
                                        .slice(0, 4),
                                    }))
                                  }
                                  className="min-w-0 flex-1 rounded-xl border border-[#EAE6DF] px-3 py-1.5 font-mono text-xs font-bold outline-none focus:border-[#C8522E]"
                                />

                                <button
                                  type="button"
                                  onClick={() =>
                                    handleVerifyPassenger(
                                      request._id,
                                      passenger._id!
                                    )
                                  }
                                  disabled={verifyingPassenger === request._id}
                                  className="rounded-xl bg-[#C8522E] px-3.5 py-1.5 font-sans text-xs font-bold text-white shadow-xs transition hover:bg-[#B34524] disabled:opacity-50"
                                >
                                  {verifyingPassenger === request._id
                                    ? "..."
                                    : "Verify"}
                                </button>
                              </div>
                            </div>
                          )}

                          <button
                            type="button"
                            onClick={async () => {
                              try {
                                const response = await getRideChat(
                                  rideId,
                                  passenger._id!
                                );
                                router.push(`/chats/${response.data.chat._id}`);
                              } catch (err) {
                                console.error("Unable to open chat:", err);
                                setError("Unable to open conversation.");
                              }
                            }}
                            className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-[#EAE6DF] bg-[#FAF8F5] px-3 py-2 font-sans text-xs font-bold text-[#1E2022] transition hover:bg-white hover:border-[#1E2022]"
                          >
                            <MessageCircle size={13} className="text-slate-500" />
                            <span>Chat with {passenger.name ?? "Passenger"}</span>
                          </button>

                          {status === "completed" && (
                            <RideReview
                              rideId={rideId}
                              target={{
                                id: passenger._id,
                                name: passenger.name ?? "Passenger",
                              }}
                              onSubmitted={() => router.refresh()}
                            />
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      ) : !isAuthenticated ? (
        /* UNAUTHENTICATED VISITOR */
        <div className="space-y-4">
          <div>
            <h2 className="font-sans text-xl font-black tracking-tight text-[#1E2022]">
              Join this ride
            </h2>
            <p className="mt-1 text-xs text-slate-500 leading-relaxed">
              Sign in to SahaYatri to book empty seats and message the host.
            </p>
          </div>

          <Link
            href="/login"
            className="flex w-full items-center justify-center rounded-xl bg-[#C8522E] px-4 py-3 font-sans text-xs font-bold text-white shadow-xs transition hover:bg-[#B34524] active:scale-98"
          >
            Sign In to SahaYatri
          </Link>
        </div>
      ) : joined ? (
        /* LEGACY JOINED STATE */
        <div className="space-y-4">
          <div>
            <h2 className="font-sans text-xl font-black tracking-tight text-[#1E2022]">
              You&apos;re on this ride
            </h2>
            <p className="mt-1 text-xs text-slate-500 leading-relaxed">
              Your seat has been reserved successfully.
            </p>
          </div>

          <button
            type="button"
            onClick={handleLeave}
            disabled={loading}
            className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-rose-200 px-4 py-2.5 font-sans text-xs font-bold text-rose-600 transition hover:bg-rose-50 disabled:opacity-50"
          >
            <LogOut size={14} />
            <span>{loading ? "Leaving..." : "Leave Ride"}</span>
          </button>
        </div>
      ) : requestStatus === "pending" ? (
        /* PASSENGER PENDING STATE */
        <div className="space-y-4">
          <div>
            <h2 className="font-sans text-xl font-black tracking-tight text-[#1E2022]">
              Request pending
            </h2>
            <p className="mt-1 text-xs text-slate-500 leading-relaxed">
              Your request is waiting for the driver&apos;s response.
            </p>
          </div>

          <button
            type="button"
            onClick={handleCancelRequest}
            disabled={loading}
            className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-rose-200 px-4 py-2.5 font-sans text-xs font-bold text-rose-600 transition hover:bg-rose-50 disabled:opacity-50"
          >
            <X size={14} />
            <span>{loading ? "Cancelling..." : "Cancel Request"}</span>
          </button>
        </div>
      ) : requestStatus === "accepted" ? (
        /* PASSENGER ACCEPTED STATE */
        <div className="space-y-5">
          <div>
            <h2 className="font-sans text-xl font-black tracking-tight text-[#1E2022]">
              Request accepted
            </h2>
            <p className="mt-1 text-xs text-slate-500 leading-relaxed">
              Your seat is confirmed.
            </p>
          </div>

          {/* Boarding PIN Box */}
          {startPin && (
            <div className="rounded-2xl border border-[#C8522E]/30 bg-[#FDF2E9]/60 p-5 text-center space-y-2">
              <p className="text-xs font-bold text-[#C8522E]">
                Boarding PIN
              </p>

              <p className="font-mono text-3xl sm:text-4xl font-black tracking-[0.35em] text-[#1E2022] py-1">
                {startPin}
              </p>

              <p className="text-xs text-slate-600 leading-relaxed max-w-xs mx-auto">
                Show this PIN to the driver at pickup.
              </p>
            </div>
          )}

          {/* Chat with Driver CTA */}
          {chatPartner && (
            <button
              type="button"
              onClick={async () => {
                try {
                  const response = await getRideChat(
                    rideId,
                    chatPartner.userId
                  );
                  router.push(`/chats/${response.data.chat._id}`);
                } catch (err) {
                  console.error("Unable to open chat:", err);
                  setError("Unable to open conversation.");
                }
              }}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#EAE6DF] bg-[#FAF8F5] px-4 py-3 font-sans text-xs font-bold text-[#1E2022] transition hover:bg-white hover:border-[#1E2022] active:scale-98"
            >
              <MessageCircle size={15} />
              <span>Chat with {chatPartner.name}</span>
            </button>
          )}
        </div>
      ) : requestStatus === "rejected" ? (
        /* PASSENGER REJECTED STATE */
        <div className="space-y-2">
          <h2 className="font-sans text-xl font-black tracking-tight text-[#1E2022]">
            Request declined
          </h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            The driver did not accept this request.
          </p>
        </div>
      ) : status === "cancelled" ? (
        /* CANCELLED RIDE STATE */
        <div className="space-y-2">
          <h2 className="font-sans text-xl font-black tracking-tight text-[#1E2022]">
            Ride cancelled
          </h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            This journey is no longer available.
          </p>
        </div>
      ) : status === "completed" ? (
        /* COMPLETED RIDE STATE */
        <div className="space-y-2">
          <h2 className="font-sans text-xl font-black tracking-tight text-[#1E2022]">
            Journey completed
          </h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            The ride has ended.
          </p>
        </div>
      ) : (
        /* PASSENGER AVAILABLE STATE (REQUEST TO JOIN) */
        <div className="space-y-4">
          <div>
            <h2 className="font-sans text-xl font-black tracking-tight text-[#1E2022]">
              Join this ride
            </h2>
            <p className="mt-1 text-xs text-slate-500 leading-relaxed">
              Select seats and request to join the journey.
            </p>
          </div>

          {/* Seats Selector */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between text-xs font-bold text-slate-600">
              <span>Seats</span>
              <span className="text-slate-400 font-medium">
                {seatsLeft} available
              </span>
            </div>

            <div className="flex items-center justify-between rounded-2xl border border-[#EAE6DF] bg-[#FAF8F5] p-2">
              <button
                type="button"
                onClick={() => setSeats((v) => Math.max(1, v - 1))}
                disabled={seats <= 1}
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-[#1E2022] shadow-xs border border-[#EAE6DF] hover:border-[#1E2022] disabled:opacity-30 transition"
              >
                <Minus size={15} />
              </button>

              <span className="font-sans text-base font-black text-[#1E2022]">
                {seats} {seats === 1 ? "seat" : "seats"}
              </span>

              <button
                type="button"
                onClick={() => setSeats((v) => Math.min(seatsLeft, v + 1))}
                disabled={seats >= seatsLeft}
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-[#1E2022] shadow-xs border border-[#EAE6DF] hover:border-[#1E2022] disabled:opacity-30 transition"
              >
                <Plus size={15} />
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={handleRequest}
            disabled={loading || !canJoin}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#C8522E] px-4 py-3 font-sans text-xs font-bold text-white shadow-xs transition hover:bg-[#B34524] active:scale-98 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Send size={14} />
            <span>{loading ? "Sending request..." : "Request to Join Ride"}</span>
          </button>

          {status !== "scheduled" && (
            <p className="text-center text-xs text-slate-500">
              This ride is no longer open for bookings.
            </p>
          )}

          {status === "scheduled" && seatsLeft === 0 && (
            <p className="text-center text-xs text-slate-500">
              This ride is currently fully booked.
            </p>
          )}
        </div>
      )}

      {/* Error Message Container */}
      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-medium text-rose-700">
          {error}
        </div>
      )}
    </aside>
  );
}