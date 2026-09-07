import { apiFetch } from "@/lib/api/client";

export async function cancelRide(
  rideId: string,
  reason: string
) {
  return apiFetch<{
    success: boolean;
    data?: unknown;
  }>(`/rides/${rideId}/cancel`, {
    method: "POST",
    body: JSON.stringify({ reason }),
  });
}

export async function leaveRide(rideId: string) {
  return apiFetch<{
    success: boolean;
    data?: unknown;
  }>(`/rides/${rideId}/leave`, {
    method: "POST",
  });
}