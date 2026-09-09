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
  KeyRound,
  Play,
  Square,
  CheckCircle,
} from "lucide-react";
import { apiFetch } from "@/lib/api/client";
import { 
  createRideRequest, 
  getRideRequests, 
  getMyRideRequests, 
  acceptRideRequest, 
  rejectRideRequest,
  cancelRideRequest, 
  type RideRequest } from "@/lib/api/ride-requests";
import { useAuthStore } from "@/lib/stores/auth.store";
import { getRideChat } from "@/lib/api/chat";
import RideReview from "./ride-review";

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
  const router = useRouter()

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
  const [requestActionLoading, setRequestActionLoading] = useState<string | null>(null);

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
      } catch (error) {
        console.error("Unable to load ride requests:", error);
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

        const currentRequest = response.data.requests?.find(
          (request) => {
            const requestRideId =
              typeof request.ride === "string"
                ? request.ride
                : request.ride?._id;

            return requestRideId === rideId;
          }
        );

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
      } catch (error) {
        console.error(
          "Unable to load request status:",
          error
        );
      }
    }

    loadMyRequest();
  }, [isAuthenticated, isOwner, rideId]);

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

  async function handleRequest() {
    if (!isAuthenticated || isOwner) return;
    setLoading(true);
    setError("");
    try {
      await createRideRequest(rideId, {
        seatsRequested: seats,
      });
    
      setRequestStatus("pending");
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to send ride request"
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleCancelRequest() {
    if (!requestStatus || requestStatus !== "pending") {
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await getMyRideRequests();

      const currentRequest = response.data.requests?.find(
        (request) => {
          const requestRideId =
            typeof request.ride === "string"
              ? request.ride
              : request.ride?._id;

          return (
            requestRideId === rideId &&
            request.status === "pending"
          );
        }
      );

      if (!currentRequest) {
        setRequestStatus(null);
        setError("No pending request found.");
        return;
      }

      await cancelRideRequest(currentRequest._id);

      setRequestStatus("cancelled");
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to cancel request"
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
      await apiFetch(
        `/rides/${rideId}/verify-passenger`,
        {
          method: "POST",
          body: JSON.stringify({
            requestId,
            passengerId,
            otp,
          }),
        }
      );

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
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to verify passenger."
      );
    } finally {
      setVerifyingPassenger(null);
    }
  }

  async function handleAcceptRequest(requestId: string) {
    setRequestActionLoading(requestId);
    setError("");

    try {
      const response =
        await acceptRideRequest(requestId);

      setRequests((current) =>
        current.map((request) =>
          request._id === requestId
            ? response.data.request
            : request
        )
      );

      router.refresh();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to accept request"
      );
    } finally {
      setRequestActionLoading(null);
    }
  }

  async function handleRejectRequest(requestId: string) {
    setRequestActionLoading(requestId);
    setError("");

    try {
      const response =
        await rejectRideRequest(requestId);

      setRequests((current) =>
        current.map((request) =>
          request._id === requestId
            ? response.data.request
            : request
        )
      );
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to reject request"
      );
    } finally {
      setRequestActionLoading(null);
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

  async function handleCancel() {
    const confirmed = window.confirm(
      "Are you sure you want to cancel this ride?"
    );

    if (!confirmed) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      await apiFetch(
        `/rides/${rideId}`,
        {
          method: "DELETE",
        }
      );

      window.location.href = "/home";
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to cancel this ride"
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
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to start ride."
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
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to end ride."
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
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to complete ride."
      );
    } finally {
      setRideActionLoading(false);
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

            <p className="mt-2 text-sm text-slate-500">
              Manage your ride and update its progress here.
            </p>
                  
            <div className="mt-5 space-y-3">
              {status === "scheduled" && (
                <>
                  <button
                    type="button"
                    onClick={() => handleStartRide(false)}
                    disabled={rideActionLoading}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-bold text-white transition hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Play size={16} />
                    {rideActionLoading ? "Starting..." : "Start Ride"}
                  </button>
              
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
                      className="w-full rounded-xl border border-amber-200 px-4 py-3 text-sm font-bold text-amber-700 transition hover:bg-amber-50 disabled:opacity-50"
                    >
                      Start without passengers
                    </button>
                  )}
            
                  <p className="text-center text-xs leading-5 text-slate-500">
                    Accepted passengers should be verified before starting.
                  </p>
                </>
              )}
            
              {status === "started" && (
                <button
                  type="button"
                  onClick={handleEndRide}
                  disabled={rideActionLoading}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-secondary px-4 py-3 text-sm font-bold text-white transition hover:opacity-90 disabled:opacity-50"
                >
                  <Square size={15} />
                  {rideActionLoading ? "Ending..." : "End Ride"}
                </button>
              )}
            
              {status === "ended" && (
                <button
                  type="button"
                  onClick={handleCompleteRide}
                  disabled={rideActionLoading}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-bold text-white transition hover:bg-secondary disabled:opacity-50"
                >
                  <CheckCircle size={17} />
                  {rideActionLoading
                    ? "Completing..."
                    : "Complete Ride"}
                </button>
              )}
            
              {status === "completed" && (
                <div className="rounded-xl bg-green-50 p-4 text-center">
                  <p className="text-sm font-bold text-green-700">
                    Ride completed
                  </p>
              
                  <p className="mt-1 text-xs text-green-600">
                    Participants can now leave reviews.
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="mt-5">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-secondary">
                Ride requests
              </p>

              {requests.length > 0 && (
                <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-bold text-primary">
                  {requests.filter(
                    (request) => request.status === "pending"
                  ).length} pending
                </span>
              )}
            </div>
            
            {requestsLoading ? (
              <p className="mt-3 text-sm text-slate-500">
                Loading requests...
              </p>
            ) : requests.length === 0 ? (
              <p className="mt-3 rounded-xl bg-neutral p-4 text-xs leading-5 text-slate-500">
                No ride requests yet.
              </p>
            ) : (
              <div className="mt-3 space-y-3">
                {requests.map((request) => {
                  const passenger =
                    typeof request.passenger === "object"
                      ? request.passenger
                      : null;
                
                  const isPending =
                    request.status === "pending";
                
                  const actionLoading =
                    requestActionLoading === request._id;
                
                  return (
                    <div
                      key={request._id}
                      className="rounded-xl border border-slate-200 p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          {passenger?._id ? (
                            <Link
                              href={`/profile/${passenger._id}`}
                              className="text-sm font-semibold text-secondary transition hover:text-primary"
                            >
                              {passenger.name ?? "Passenger"}
                            </Link>
                          ) : (
                            <p className="text-sm font-semibold text-secondary">
                              Passenger
                            </p>
                          )}
                  
                          <p className="mt-1 text-xs text-slate-500">
                            {request.seatsRequested}{" "}
                            {request.seatsRequested === 1
                              ? "seat"
                              : "seats"}{" "}
                            requested
                          </p>
                        </div>
                            
                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold capitalize text-slate-600">
                          {request.status.replace("_", " ")}
                        </span>
                      </div>
                            
                      {isPending && (
                        <div className="mt-3 grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              handleAcceptRequest(request._id)
                            }
                            disabled={actionLoading}
                            className="flex items-center justify-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-bold text-white disabled:opacity-50"
                          >
                            <Check size={14} />
                            {actionLoading
                              ? "..."
                              : "Accept"}
                          </button>
                            
                          <button
                            type="button"
                            onClick={() =>
                              handleRejectRequest(request._id)
                            }
                            disabled={actionLoading}
                            className="flex items-center justify-center gap-1.5 rounded-lg border border-red-200 px-3 py-2 text-xs font-bold text-red-600 disabled:opacity-50"
                          >
                            <X size={14} />
                            Reject
                          </button>
                        </div>
                      )}
                      {request.status === "accepted" && passenger?._id && (
                        <>
                          <div className="mt-3 rounded-xl bg-neutral p-3">
                            {request.verifiedBoarding || request.pinVerified ? (
                              <div className="flex items-center gap-2 text-xs font-semibold text-green-700">
                                <CheckCircle size={15} />
                                Passenger verified
                              </div>
                            ) : (
                              <>
                                <div className="flex items-center gap-2">
                                  <KeyRound size={15} className="text-primary" />
                            
                                  <p className="text-xs font-semibold text-secondary">
                                    Verify passenger
                                  </p>
                                </div>
                            
                                <div className="mt-2 flex gap-2">
                                  <input
                                    type="text"
                                    inputMode="numeric"
                                    maxLength={4}
                                    placeholder="4-digit OTP"
                                    value={otpValues[request._id] ?? ""}
                                    onChange={(event) =>
                                      setOtpValues((current) => ({
                                        ...current,
                                        [request._id]: event.target.value
                                          .replace(/\D/g, "")
                                          .slice(0, 4),
                                      }))
                                    }
                                    className="min-w-0 flex-1 rounded-lg border border-slate-200 px-3 py-2 text-xs outline-none focus:border-primary"
                                  />

                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleVerifyPassenger(
                                        request._id,
                                        passenger._id!
                                      )
                                    }
                                    disabled={
                                      verifyingPassenger === request._id
                                    }
                                    className="rounded-lg bg-primary px-3 py-2 text-xs font-bold text-white disabled:opacity-50"
                                  >
                                    {verifyingPassenger === request._id
                                      ? "..."
                                      : "Verify"}
                                  </button>
                                </div>
                              </>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={async () => {
                              try {
                                const response = await getRideChat(
                                  rideId,
                                  passenger._id!
                                );
                              
                                router.push(
                                  `/chats/${response.data.chat._id}`
                                );
                              } catch (error) {
                                console.error("Unable to open chat:", error);
                                setError("Unable to open chat.");
                              }
                            }}
                            className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-primary px-3 py-2 text-xs font-bold text-primary transition hover:bg-primary/5"
                          >
                            <MessageCircle size={14} />
                            Chat
                          </button>
                                                  
                        {request.status === "accepted" &&
                          status === "completed" &&
                          passenger?._id && (
                            <RideReview
                              rideId={rideId}
                              target={{
                                id: passenger._id,
                                name: passenger.name ?? "Passenger",
                              }}
                              onSubmitted={() => router.refresh()}
                            />
                          )}
                        </>
                       )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <Link
            href={`/rides/${rideId}/edit`}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-bold text-white transition hover:opacity-90"
          >
            <Pencil size={16} />
            Edit ride
          </Link>

          {error && (
            <p className="mt-3 rounded-xl bg-red-50 p-3 text-xs leading-5 text-red-600">
              {error}
            </p>
          )}

          <button
            type="button"
            onClick={handleCancel}
            disabled={loading || status !== "scheduled"}
            className="mt-4 w-full rounded-xl border border-red-200 px-4 py-3 text-sm font-bold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Cancelling..." : "Cancel ride"}
          </button>
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
      ) : requestStatus === "pending" ? (
        <>
          <h2 className="text-lg font-bold text-secondary">
            Request pending
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            Your request has been sent to the driver.
            You'll be able to join once they accept it.
          </p>

          <button
            type="button"
            onClick={handleCancelRequest}
            disabled={loading}
            className="mt-4 w-full rounded-xl border border-red-200 px-4 py-3 text-sm font-bold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Cancelling..." : "Cancel request"}
          </button>
        </>
      ) : requestStatus === "accepted" ? (
        <>
          <h2 className="text-lg font-bold text-primary">
            Request accepted
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            The driver accepted your request. Your seat is
            booked.
          </p>

          {startPin && (
            <div className="mt-4 rounded-xl border border-primary/20 bg-primary/5 p-4 text-center">
              <div className="flex items-center justify-center gap-2 text-xs font-semibold text-primary">
                <KeyRound size={15} />
                Boarding PIN
              </div>

              <p className="mt-2 text-3xl font-black tracking-[0.35em] text-secondary">
                {startPin}
              </p>

              <p className="mt-2 text-xs leading-5 text-slate-500">
                Show this 4-digit PIN to the driver when you meet.
              </p>
            </div>
          )}

          {chatPartner && (
            <button
              type="button"
              onClick={async () => {
                try {
                  const response = await getRideChat(
                    rideId,
                    chatPartner.userId
                  );
                
                  router.push(
                    `/chats/${response.data.chat._id}`
                  );
                } catch (error) {
                  console.error("Unable to open chat:", error);
                  setError("Unable to open chat.");
                }
              }}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-bold text-white transition hover:bg-secondary"
            >
              <MessageCircle size={16} />
              Chat with {chatPartner.name}
            </button>
          )}
        </>
      ) : requestStatus === "rejected" ? (
        <>
          <h2 className="text-lg font-bold text-red-600">
            Request rejected
          </h2>
      
          <p className="mt-2 text-sm text-slate-500">
            The driver didn't accept your request.
          </p>
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

          <button
            type="button"
            onClick={handleRequest}
            disabled={loading || !canJoin}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-primary px-4 py-3 text-sm font-bold text-primary transition hover:bg-primary/5 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Send size={16} />
            {loading ? "Sending..." : "Request to Join"}
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