import { apiFetch } from "@/lib/api/client";

export interface TrustedContact {
  name?: string;
  phone?: string;
  relationship?: string;
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