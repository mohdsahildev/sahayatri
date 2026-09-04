"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Minus, Plus, Pencil, Send, Check, X } from "lucide-react";
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
  const [error, setError] = useState("");
  const [requests, setRequests] = useState<RideRequest[]>([]);
  const [requestsLoading, setRequestsLoading] = useState(false);
  const [requestActionLoading, setRequestActionLoading] = useState<string | null>(null);

  useEffect(() => {
    if (!isOwner || status !== "scheduled") return;
    
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
          setRequestStatus(currentRequest.status);
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

      router.refresh
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
              This ride belongs to you.
            </p>
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
                          <p className="text-sm font-semibold text-secondary">
                            {passenger?.name ?? "Passenger"}
                          </p>
                  
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