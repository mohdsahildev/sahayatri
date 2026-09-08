import { apiFetch } from "./client";
import type { ApiResponse } from "@/lib/api/types";

export interface TrustedContact {
  name?: string;
  phone?: string;
  relationship?: string;
}

export interface PublicUserProfile {
  _id: string;
  name: string;
  bio?: string;
  profilePic?: string;
  selectedAvatar?: string;
  isVerified?: boolean;
  rating?: number;
  rideCount?: number;
  vehicle?: {
    type?: string;
    brand?: string;
    model?: string;
    number?: string;
    seats?: number;
  };
}

export interface SafetyPreferences {
  shareRideDetails?: boolean;
  emergencyAlerts?: boolean;
  allowTrustedContact?: boolean;
}

export interface ProfileUser {
  _id: string;
  name?: string;
  email?: string;
  phone?: string;
  bio?: string;
  profilePic?: string;
  selectedAvatar?: string;
  isVerified?: boolean;
  trustedContact?: TrustedContact;
  safetyPreferences?: SafetyPreferences;
}

export async function getMyProfile() {
  return apiFetch<{
    success: boolean;
    data: {
      user: ProfileUser;
    };
  }>("/auth/me");
}

export async function updateMyProfile(data: {
  name?: string;
  phone?: string;
  bio?: string;
  profilePic?: string;
  selectedAvatar?: string;
  trustedContact?: TrustedContact;
  safetyPreferences?: SafetyPreferences;
}) {
  return apiFetch<{
    success: boolean;
    data: {
      user: ProfileUser;
    };
  }>("/auth/me", {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function uploadProfileImage(
  file: File
) {
  const formData = new FormData();

  formData.append("image", file);

  return apiFetch<{
    success: boolean;
    data: {
      user: ProfileUser;
    };
  }>("/auth/me/profile-image", {
    method: "POST",
    body: formData,
  });
}

export interface PublicProfileReview {
  _id: string;
  rating: number;
  comment?: string;
  reviewer?: {
    _id: string;
    name: string;
    profilePic?: string;
  };
  createdAt?: string;
}

export interface PublicProfileRide {
  _id: string;
  from?: string;
  to?: string;
  departureTime?: string;
  status?: string;
}

export interface PublicProfileData {
  user: PublicUserProfile;
  reviews: PublicProfileReview[];
  recentDriverRides: PublicProfileRide[];
  recentPassengerRides: PublicProfileRide[];
  stats: {
    driverRideCount: number;
    passengerRideCount: number;
    reviewCount: number;
  };
}

export async function getPublicProfile(userId: string) {
  return apiFetch<ApiResponse<PublicProfileData>>(
    `/auth/users/${userId}/public`
  );
}