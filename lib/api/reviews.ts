import { apiFetch } from "@/lib/api/client";

export interface CreateRideReviewRequest {
  revieweeId?: string;
  rating: number;
  comment?: string;
}

export interface RideReview {
  _id: string;
  ride: string;
  reviewer: string;
  reviewee: string;
  rating: number;
  comment?: string;
  createdAt?: string;
}

export async function createRideReview(
  rideId: string,
  data: CreateRideReviewRequest
) {
  return apiFetch<{
    success: boolean;
    message: string;
    data: RideReview;
  }>(`/rides/${rideId}/review`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}