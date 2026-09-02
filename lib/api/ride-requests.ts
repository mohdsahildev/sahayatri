import { apiFetch } from "./client";
import type { RideLocation } from "./rides";

export interface RideRequest {
  _id: string;
  ride: string | {
    _id?: string;
  };
  passenger?: string | {
    _id?: string;
    name?: string;
    profilePic?: string;
  };
  driver?: string | {
    _id?: string;
    name?: string;
  };
  seatsRequested: number;
  pickupLocation?: RideLocation;
  dropLocation?: RideLocation;
  status:
    | "pending"
    | "accepted"
    | "rejected"
    | "cancelled"
    | "completed"
    | "no_show";
  startPin?: string;
  pickupConfirmed?: boolean;
  pinVerified?: boolean;
  createdAt?: string;
}

interface RideRequestListResponse {
  success: boolean;
  message: string;
  data: {
    requests: RideRequest[];
    count: number;
  };
}

interface RideRequestResponse {
  success: boolean;
  message: string;
  data: {
    request: RideRequest;
    ride?: {
      bookedSeats?: number;
    };
  };
}

export interface CreateRideRequestData {
  seatsRequested: number;
  pickupLocation?: RideLocation;
  dropLocation?: RideLocation;
  notes?: string;
}

export function createRideRequest(
  rideId: string,
  data: CreateRideRequestData
) {
  return apiFetch<RideRequestResponse>(
    `/rides/${rideId}/requests`,
    {
      method: "POST",
      body: JSON.stringify(data),
    }
  );
}

export function getRideRequests(rideId: string) {
  return apiFetch<RideRequestListResponse>(
    `/rides/${rideId}/requests`
  );
}

export function getMyRideRequests() {
  return apiFetch<RideRequestListResponse>(
    "/me/ride-requests"
  );
}

export function acceptRideRequest(requestId: string) {
  return apiFetch<RideRequestResponse>(
    `/ride-requests/${requestId}/accept`,
    {
      method: "PATCH",
    }
  );
}

export function rejectRideRequest(requestId: string) {
  return apiFetch<RideRequestResponse>(
    `/ride-requests/${requestId}/reject`,
    {
      method: "PATCH",
    }
  );
}

export function cancelRideRequest(requestId: string) {
  return apiFetch<RideRequestResponse>(
    `/ride-requests/${requestId}/cancel`,
    {
      method: "PATCH",
    }
  );
}