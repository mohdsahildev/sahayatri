"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import {
  CheckCircle,
  Star,
  Car,
  MessageSquare,
  ShieldCheck,
  ChevronRight,
  Pencil,
  Check,
  Camera,
  Eye,
  PlusCircle,
  Compass,
} from "lucide-react";
import Navbar from "@/components/layout/navbar";
import LandingFooter from "@/components/landing/landing-footer";
import {
  getMyProfile,
  updateMyProfile,
  uploadProfileImage,
  getPublicProfile,
  type ProfileUser,
  type PublicProfileData,
} from "@/lib/api/profile";
import { useAuthStore } from "@/lib/stores/auth.store";

export default function ProfilePage() {
  const authUser = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const setAuth = useAuthStore((state) => state.setAuth);
  const accessToken = useAuthStore((state) => state.accessToken);

  const [user, setUser] = useState<ProfileUser | null>(null);
  const [publicData, setPublicData] = useState<PublicProfileData | null>(null);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [bio, setBio] = useState("");

  const [trustedContactName, setTrustedContactName] = useState("");
  const [trustedContactPhone, setTrustedContactPhone] = useState("");
  const [trustedContactRelationship, setTrustedContactRelationship] = useState("");

  const [shareRideDetails, setShareRideDetails] = useState(false);
  const [emergencyAlerts, setEmergencyAlerts] = useState(false);
  const [allowTrustedContact, setAllowTrustedContact] = useState(false);

  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    async function loadData() {
      try {
        setLoading(true);
        setError("");

        const profileRes = await getMyProfile();
        const profile = profileRes.data.user;

        setUser(profile);
        setName(profile.name ?? "");
        setPhone(profile.phone ?? "");
        setBio(profile.bio ?? "");

        setTrustedContactName(profile.trustedContact?.name ?? "");
        setTrustedContactPhone(profile.trustedContact?.phone ?? "");
        setTrustedContactRelationship(profile.trustedContact?.relationship ?? "");

        setShareRideDetails(profile.safetyPreferences?.shareRideDetails ?? false);
        setEmergencyAlerts(profile.safetyPreferences?.emergencyAlerts ?? false);
        setAllowTrustedContact(profile.safetyPreferences?.allowTrustedContact ?? false);

        // Fetch public profile data for real stats, reviews, and vehicle
        if (profile._id) {
          try {
            const publicRes = await getPublicProfile(profile._id);
            setPublicData(publicRes.data);
          } catch (err) {
            console.error("Unable to load public profile stats:", err);
          }
        }
      } catch (err) {
        console.error("Unable to load profile:", err);
        setError("Unable to load your profile. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [isAuthenticated]);

  async function handleProfileImageChange(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];

    if (!file || uploadingPhoto) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select an image file.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Profile image must be smaller than 5 MB.");
      return;
    }

    setUploadingPhoto(true);
    setError("");
    setSuccessMessage("");

    try {
      const response = await uploadProfileImage(file);
      const updatedUser = response.data.user;
      setUser(updatedUser);

      if (authUser && accessToken) {
        setAuth(
          {
            ...authUser,
            profilePic: updatedUser.profilePic,
          },
          accessToken
        );
      }

      setSuccessMessage("Profile photo updated successfully.");
    } catch (err) {
      console.error("Unable to upload profile image:", err);
      setError("Unable to update your profile image.");
    } finally {
      setUploadingPhoto(false);
      event.target.value = "";
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (saving) return;

    setSaving(true);
    setError("");
    setSuccessMessage("");

    try {
      const response = await updateMyProfile({
        name: name.trim(),
        phone: phone.trim(),
        bio: bio.trim(),
        trustedContact: {
          name: trustedContactName.trim() || undefined,
          phone: trustedContactPhone.trim() || undefined,
          relationship: trustedContactRelationship.trim() || undefined,
        },
        safetyPreferences: {
          shareRideDetails,
          emergencyAlerts,
          allowTrustedContact,
        },
      });

      const updatedUser = response.data.user;
      setUser(updatedUser);

      if (authUser && accessToken) {
        setAuth(
          {
            ...authUser,
            name: updatedUser.name ?? authUser.name,
            phone: updatedUser.phone,
            bio: updatedUser.bio,
            trustedContact: updatedUser.trustedContact as any,
            safetyPreferences: updatedUser.safetyPreferences as any,
          },
          accessToken
        );
      }

      setEditing(false);
      setSuccessMessage("Profile updated successfully.");
    } catch (err) {
      console.error("Unable to update profile:", err);
      setError("Unable to update your profile.");
    } finally {
      setSaving(false);
    }
  }

  function formatReviewDate(dateStr?: string) {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FBF9F5] text-[#1E2022] font-body flex flex-col justify-between">
        <div>
          <Navbar />
          <main className="mx-auto w-full max-w-5xl px-4 py-12 sm:px-6 md:px-8">
            <div className="rounded-3xl border border-[#EAE6DF] bg-white p-10 text-center shadow-xs">
              <p className="text-sm font-semibold text-slate-500">
                Loading your travel dossier...
              </p>
            </div>
          </main>
        </div>
        <LandingFooter />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#FBF9F5] text-[#1E2022] font-body flex flex-col justify-between selection:bg-[#C8522E] selection:text-white">
        <div>
          <Navbar />
          <main className="mx-auto w-full max-w-4xl px-4 py-12 sm:px-6 md:px-8">
            <div className="rounded-3xl border border-[#EAE6DF] bg-white p-8 sm:p-12 text-center shadow-xs space-y-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#FAF8F5] border border-[#EAE6DF] mx-auto text-[#C8522E]">
                <ShieldCheck size={28} />
              </div>

              <h1 className="font-sans text-2xl sm:text-3xl font-black text-[#1E2022]">
                Sign In to View Your Profile
              </h1>

              <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
                Please sign in to access your SahaYatri travel dossier, view verification status, manage your registered vehicle, and update safety preferences.
              </p>

              <div className="pt-3 flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link
                  href="/login"
                  className="w-full sm:w-auto inline-flex items-center justify-center rounded-xl bg-[#C8522E] px-6 py-3 font-sans text-xs font-bold text-white shadow-xs transition hover:bg-[#B34524] active:scale-98"
                >
                  Sign In to SahaYatri
                </Link>

                <Link
                  href="/register"
                  className="w-full sm:w-auto inline-flex items-center justify-center rounded-xl border border-[#EAE6DF] bg-[#FAF8F5] px-6 py-3 font-sans text-xs font-bold text-[#1E2022] shadow-xs transition hover:border-[#1E2022] hover:bg-white"
                >
                  Create an Account
                </Link>
              </div>
            </div>
          </main>
        </div>
        <LandingFooter />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#FBF9F5] text-[#1E2022] font-body flex flex-col justify-between selection:bg-[#C8522E] selection:text-white">
        <div>
          <Navbar />
          <main className="mx-auto w-full max-w-4xl px-4 py-12 sm:px-6 md:px-8">
            <div className="rounded-3xl border border-[#EAE6DF] bg-white p-8 sm:p-12 text-center shadow-xs space-y-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 border border-rose-100 mx-auto text-rose-600">
                <ShieldCheck size={28} />
              </div>

              <h1 className="font-sans text-2xl font-bold text-[#1E2022]">
                Profile Unavailable
              </h1>

              <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
                {error || "Unable to load your profile details right now. Please try again."}
              </p>

              <div className="pt-3 flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => window.location.reload()}
                  className="w-full sm:w-auto inline-flex items-center justify-center rounded-xl bg-[#C8522E] px-6 py-3 font-sans text-xs font-bold text-white shadow-xs transition hover:bg-[#B34524]"
                >
                  Try Again
                </button>

                <Link
                  href="/home"
                  className="w-full sm:w-auto inline-flex items-center justify-center rounded-xl border border-[#EAE6DF] bg-[#FAF8F5] px-6 py-3 font-sans text-xs font-bold text-[#1E2022] shadow-xs transition hover:border-[#1E2022] hover:bg-white"
                >
                  Return Home
                </Link>
              </div>
            </div>
          </main>
        </div>
        <LandingFooter />
      </div>
    );
  }

  const stats = publicData?.stats ?? {
    driverRideCount: 0,
    passengerRideCount: 0,
    reviewCount: 0,
  };

  const userRating =
    typeof publicData?.user?.rating === "number"
      ? publicData.user.rating
      : typeof (user as { rating?: number }).rating === "number"
      ? (user as { rating?: number }).rating
      : null;

  const reviews = publicData?.reviews ?? [];

  const vehicle =
    publicData?.user?.vehicle ??
    (user as { vehicle?: { type?: string; brand?: string; model?: string; number?: string; seats?: number; verified?: boolean } }).vehicle;

  const hasVehicle = Boolean(
    vehicle && (vehicle.brand || vehicle.model || vehicle.type || vehicle.number || vehicle.seats)
  );

  return (
    <div className="min-h-screen bg-[#FBF9F5] text-[#1E2022] font-body flex flex-col justify-between selection:bg-[#C8522E] selection:text-white">
      <div>
        <Navbar />

        <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 md:px-8 space-y-6">
          {/* Page Header with Title and Actions */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-2 border-b border-[#EAE6DF]">
            <div>
              <h1 className="font-sans text-2xl sm:text-3xl font-black tracking-tight text-[#1E2022]">
                My Profile
              </h1>
              <p className="mt-1 text-xs sm:text-sm text-slate-500">
                Manage your profile, safety details, and travel identity.
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              {user._id && (
                <Link
                  href={`/profile/${user._id}`}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-[#EAE6DF] bg-white px-3.5 py-2 font-sans text-xs font-bold text-[#1E2022] shadow-xs transition hover:border-[#1E2022]"
                >
                  <Eye size={13} className="text-[#C8522E]" />
                  <span>View Public Profile</span>
                </Link>
              )}

              {!editing && (
                <button
                  type="button"
                  onClick={() => setEditing(true)}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#C8522E] px-4 py-2 font-sans text-xs font-bold text-white shadow-xs transition hover:bg-[#B34524]"
                >
                  <Pencil size={13} />
                  <span>Edit Profile</span>
                </button>
              )}
            </div>
          </div>

          {/* Feedback Messages */}
          {error && (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs font-medium text-rose-700">
              {error}
            </div>
          )}

          {successMessage && (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-medium text-emerald-800">
              {successMessage}
            </div>
          )}

          {/* Main 2-Column Dossier Composition */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-[1fr_320px] md:items-start">
            {/* LEFT COLUMN: Main Dossier, Safety & Trust, Reviews */}
            <div className="space-y-6">
              {/* 1. Main Profile Dossier Card */}
              <article className="relative overflow-hidden rounded-3xl border border-[#EAE6DF] bg-white p-6 sm:p-7 shadow-xs">
                <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
                  {/* Avatar Container with Change Photo Upload */}
                  <div className="relative group shrink-0">
                    <div className="relative flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl bg-[#FAF8F5] border border-[#EAE6DF] font-sans text-2xl font-bold text-[#1E2022]">
                      {user.profilePic ? (
                        <img
                          src={user.profilePic}
                          alt={user.name ?? "Profile"}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        user.name?.charAt(0).toUpperCase() ?? "S"
                      )}
                      {user.isVerified && (
                        <span className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-[#EAF4ED] border-2 border-white text-[#2E6F40]">
                          <CheckCircle size={14} className="fill-[#2E6F40] text-white" />
                        </span>
                      )}
                    </div>

                    {/* Change Photo Overlay / Trigger */}
                    <label className="mt-2 flex items-center justify-center gap-1 cursor-pointer rounded-lg bg-[#FAF8F5] border border-[#EAE6DF] px-2 py-1 text-[11px] font-bold text-slate-700 transition hover:bg-white hover:border-[#1E2022]">
                      <Camera size={12} className="text-[#C8522E]" />
                      <span>{uploadingPhoto ? "Uploading..." : "Change photo"}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleProfileImageChange}
                        disabled={uploadingPhoto}
                        className="hidden"
                      />
                    </label>
                  </div>

                  {/* Header Text Info */}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <h2 className="font-sans text-2xl font-black tracking-tight text-[#1E2022]">
                        {user.name ?? "SahaYatri User"}
                      </h2>

                      {user.isVerified && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-[#EAF4ED] px-3 py-1 text-xs font-bold text-[#2E6F40] border border-[#D0E5D5]">
                          <CheckCircle size={13} />
                          <span>Verified Member</span>
                        </span>
                      )}
                    </div>

                    <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-slate-500 font-medium">
                      <span>{user.email}</span>
                      {user.phone && (
                        <>
                          <span>·</span>
                          <span>{user.phone}</span>
                        </>
                      )}
                      {typeof userRating === "number" && (
                        <>
                          <span>·</span>
                          <span className="inline-flex items-center gap-1 font-bold text-amber-600">
                            <Star size={13} className="fill-amber-400 text-amber-400" />
                            <span>{userRating.toFixed(1)}</span>
                          </span>
                        </>
                      )}
                    </div>

                    {/* Bio Display (when not editing) */}
                    {!editing && (
                      <p className="mt-3 text-xs sm:text-sm leading-relaxed text-slate-600">
                        {user.bio ? (
                          user.bio
                        ) : (
                          <span className="italic text-slate-400">
                            No bio added yet.
                          </span>
                        )}
                      </p>
                    )}
                  </div>
                </div>

                {/* Inline Edit Form */}
                {editing && (
                  <form onSubmit={handleSubmit} className="mt-6 pt-5 border-t border-[#EAE6DF] space-y-5">
                    <div className="flex items-center justify-between">
                      <h3 className="font-sans text-sm font-bold text-[#1E2022]">
                        Edit Profile Details
                      </h3>
                      <span className="text-[11px] text-slate-400 font-medium">
                        Email cannot be changed
                      </span>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                          Full Name
                        </label>
                        <input
                          type="text"
                          required
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="w-full rounded-xl border border-[#EAE6DF] px-3.5 py-2 text-xs font-medium outline-none transition focus:border-[#C8522E] bg-[#FAF8F5] focus:bg-white"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                          Email (Read-only)
                        </label>
                        <input
                          type="email"
                          disabled
                          value={user.email ?? ""}
                          className="w-full rounded-xl border border-[#EAE6DF] px-3.5 py-2 text-xs font-medium text-slate-400 bg-slate-50 cursor-not-allowed"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="Enter phone number"
                        className="w-full rounded-xl border border-[#EAE6DF] px-3.5 py-2 text-xs font-medium outline-none transition focus:border-[#C8522E] bg-[#FAF8F5] focus:bg-white"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-xs font-bold text-slate-700">
                          Bio
                        </label>
                        <span className="text-[11px] text-slate-400">
                          {bio.length}/300 characters
                        </span>
                      </div>
                      <textarea
                        rows={3}
                        maxLength={300}
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        placeholder="Write a few words about your travel style..."
                        className="w-full resize-none rounded-xl border border-[#EAE6DF] p-3 text-xs font-medium outline-none transition focus:border-[#C8522E] bg-[#FAF8F5] focus:bg-white"
                      />
                    </div>

                    {/* Trusted Contact Editing */}
                    <div className="pt-3 border-t border-[#EAE6DF]/60 space-y-3">
                      <h4 className="text-xs font-bold text-[#1E2022]">
                        Trusted Contact Details
                      </h4>

                      <div className="grid gap-3 sm:grid-cols-3">
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                            Contact Name
                          </label>
                          <input
                            type="text"
                            value={trustedContactName}
                            onChange={(e) => setTrustedContactName(e.target.value)}
                            placeholder="e.g. Rahul Sharma"
                            className="w-full rounded-xl border border-[#EAE6DF] px-3 py-1.5 text-xs font-medium outline-none transition focus:border-[#C8522E] bg-[#FAF8F5] focus:bg-white"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                            Phone Number
                          </label>
                          <input
                            type="tel"
                            value={trustedContactPhone}
                            onChange={(e) => setTrustedContactPhone(e.target.value)}
                            placeholder="e.g. +91 9876543210"
                            className="w-full rounded-xl border border-[#EAE6DF] px-3 py-1.5 text-xs font-medium outline-none transition focus:border-[#C8522E] bg-[#FAF8F5] focus:bg-white"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                            Relationship
                          </label>
                          <input
                            type="text"
                            value={trustedContactRelationship}
                            onChange={(e) => setTrustedContactRelationship(e.target.value)}
                            placeholder="e.g. Sister, Friend"
                            className="w-full rounded-xl border border-[#EAE6DF] px-3 py-1.5 text-xs font-medium outline-none transition focus:border-[#C8522E] bg-[#FAF8F5] focus:bg-white"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Safety Preferences Toggles */}
                    <div className="pt-3 border-t border-[#EAE6DF]/60 space-y-2.5">
                      <h4 className="text-xs font-bold text-[#1E2022]">
                        Safety Preferences
                      </h4>

                      <div className="space-y-2 text-xs">
                        <label className="flex items-center gap-2.5 cursor-pointer text-slate-700">
                          <input
                            type="checkbox"
                            checked={shareRideDetails}
                            onChange={(e) => setShareRideDetails(e.target.checked)}
                            className="h-4 w-4 rounded-md border-[#EAE6DF] text-[#C8522E] focus:ring-[#C8522E]"
                          />
                          <span>Share live ride details automatically</span>
                        </label>

                        <label className="flex items-center gap-2.5 cursor-pointer text-slate-700">
                          <input
                            type="checkbox"
                            checked={emergencyAlerts}
                            onChange={(e) => setEmergencyAlerts(e.target.checked)}
                            className="h-4 w-4 rounded-md border-[#EAE6DF] text-[#C8522E] focus:ring-[#C8522E]"
                          />
                          <span>Enable emergency alerts</span>
                        </label>

                        <label className="flex items-center gap-2.5 cursor-pointer text-slate-700">
                          <input
                            type="checkbox"
                            checked={allowTrustedContact}
                            onChange={(e) => setAllowTrustedContact(e.target.checked)}
                            className="h-4 w-4 rounded-md border-[#EAE6DF] text-[#C8522E] focus:ring-[#C8522E]"
                          />
                          <span>Allow trusted contact to view booking status</span>
                        </label>
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2.5 pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          setName(user.name ?? "");
                          setPhone(user.phone ?? "");
                          setBio(user.bio ?? "");
                          setTrustedContactName(user.trustedContact?.name ?? "");
                          setTrustedContactPhone(user.trustedContact?.phone ?? "");
                          setTrustedContactRelationship(user.trustedContact?.relationship ?? "");
                          setShareRideDetails(user.safetyPreferences?.shareRideDetails ?? false);
                          setEmergencyAlerts(user.safetyPreferences?.emergencyAlerts ?? false);
                          setAllowTrustedContact(user.safetyPreferences?.allowTrustedContact ?? false);
                          setError("");
                          setEditing(false);
                        }}
                        className="rounded-xl border border-[#EAE6DF] bg-white px-4 py-2 font-sans text-xs font-bold text-slate-700 transition hover:bg-slate-50"
                      >
                        Cancel
                      </button>

                      <button
                        type="submit"
                        disabled={saving}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-[#C8522E] px-5 py-2 font-sans text-xs font-bold text-white shadow-xs transition hover:bg-[#B34524] disabled:opacity-50"
                      >
                        <Check size={14} />
                        <span>{saving ? "Saving..." : "Save changes"}</span>
                      </button>
                    </div>
                  </form>
                )}

                {/* 4 Statistics Metrics Grid */}
                <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4 border-t border-[#EAE6DF] pt-5">
                  <div className="rounded-2xl border border-slate-100 bg-[#FAF8F5] p-3.5 text-center">
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      DRIVER RIDES
                    </span>
                    <span className="mt-1 block font-sans text-2xl font-black text-[#1E2022]">
                      {stats.driverRideCount}
                    </span>
                  </div>

                  <div className="rounded-2xl border border-slate-100 bg-[#FAF8F5] p-3.5 text-center">
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      PASSENGER RIDES
                    </span>
                    <span className="mt-1 block font-sans text-2xl font-black text-[#1E2022]">
                      {stats.passengerRideCount}
                    </span>
                  </div>

                  <div className="rounded-2xl border border-slate-100 bg-[#FAF8F5] p-3.5 text-center">
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      REVIEWS
                    </span>
                    <span className="mt-1 block font-sans text-2xl font-black text-[#1E2022]">
                      {stats.reviewCount}
                    </span>
                  </div>

                  <div className="rounded-2xl border border-slate-100 bg-[#FAF8F5] p-3.5 text-center">
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      OVERALL RATING
                    </span>
                    <div className="mt-1 flex items-center justify-center gap-1 font-sans text-2xl font-black text-[#C8522E]">
                      <span>{typeof userRating === "number" ? userRating.toFixed(1) : "—"}</span>
                      <Star size={16} className="text-[#C8522E]" />
                    </div>
                  </div>
                </div>
              </article>

              {/* 2. Safety & Trust Card (Private) */}
              <article className="rounded-3xl border border-[#EAE6DF] bg-white p-6 sm:p-7 shadow-xs space-y-5">
                <div className="flex items-center gap-2.5 border-b border-[#EAE6DF] pb-4">
                  <ShieldCheck size={18} className="text-[#2E6F40]" />
                  <div>
                    <h2 className="font-sans text-lg font-bold text-[#1E2022]">
                      Safety & Trust
                    </h2>
                    <p className="text-xs text-slate-500">
                      Information that keeps your journeys safe and verified.
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Verification Status */}
                  <div className="flex items-center justify-between rounded-2xl bg-[#FAF8F5] border border-[#EAE6DF] p-4">
                    <div>
                      <p className="text-xs font-bold text-[#1E2022]">
                        Account Verification
                      </p>
                      <p className="mt-0.5 text-xs text-slate-500">
                        {user.isVerified
                          ? "Your SahaYatri account is verified."
                          : "Your account is not verified yet."}
                      </p>
                    </div>

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold border ${
                        user.isVerified
                          ? "bg-[#EAF4ED] text-[#2E6F40] border-[#D0E5D5]"
                          : "bg-slate-100 text-slate-600 border-slate-200"
                      }`}
                    >
                      {user.isVerified ? "✓ Verified" : "Unverified"}
                    </span>
                  </div>

                  {/* Trusted Contact */}
                  <div className="rounded-2xl border border-[#EAE6DF] bg-[#FAF8F5] p-4">
                    <p className="text-xs font-bold text-[#1E2022]">
                      Trusted Contact
                    </p>

                    {user.trustedContact?.name || user.trustedContact?.phone ? (
                      <div className="mt-2 space-y-0.5 text-xs text-slate-600 font-medium">
                        {user.trustedContact.name && (
                          <p>
                            <span className="text-slate-400">Name:</span> {user.trustedContact.name}
                            {user.trustedContact.relationship && ` (${user.trustedContact.relationship})`}
                          </p>
                        )}
                        {user.trustedContact.phone && (
                          <p>
                            <span className="text-slate-400">Phone:</span> {user.trustedContact.phone}
                          </p>
                        )}
                      </div>
                    ) : (
                      <p className="mt-1 text-xs text-slate-500">
                        No trusted contact added.
                      </p>
                    )}
                  </div>

                  {/* Safety Preferences */}
                  <div className="rounded-2xl border border-[#EAE6DF] bg-[#FAF8F5] p-4">
                    <p className="text-xs font-bold text-[#1E2022] mb-2.5">
                      Safety Preferences
                    </p>

                    <div className="grid gap-2 text-xs text-slate-600">
                      <div className="flex items-center justify-between py-1 border-b border-[#EAE6DF]/60">
                        <span>Ride details sharing</span>
                        <span className="font-bold text-[#1E2022]">
                          {user.safetyPreferences?.shareRideDetails ? "Enabled" : "Disabled"}
                        </span>
                      </div>

                      <div className="flex items-center justify-between py-1 border-b border-[#EAE6DF]/60">
                        <span>Emergency alerts</span>
                        <span className="font-bold text-[#1E2022]">
                          {user.safetyPreferences?.emergencyAlerts ? "Enabled" : "Disabled"}
                        </span>
                      </div>

                      <div className="flex items-center justify-between py-1">
                        <span>Trusted contact access</span>
                        <span className="font-bold text-[#1E2022]">
                          {user.safetyPreferences?.allowTrustedContact ? "Enabled" : "Disabled"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </article>

              {/* 3. Reviews Received Card */}
              <article className="rounded-3xl border border-[#EAE6DF] bg-white p-6 sm:p-7 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-[#EAE6DF] pb-4">
                  <div className="flex items-center gap-2.5">
                    <MessageSquare size={18} className="text-[#C8522E]" />
                    <h2 className="font-sans text-lg font-bold text-[#1E2022]">
                      Reviews from co-travelers ({stats.reviewCount})
                    </h2>
                  </div>

                  {typeof userRating === "number" && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-[#FAF8F5] border border-[#EAE6DF] px-3 py-1 text-xs font-bold text-amber-600">
                      <Star size={13} className="text-amber-600" />
                      <span>{userRating.toFixed(1)}</span>
                    </span>
                  )}
                </div>

                {reviews.length === 0 ? (
                  <div className="rounded-2xl bg-[#FAF8F5] p-5 text-center text-xs text-slate-500">
                    No reviews yet.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {reviews.map((review) => (
                      <div
                        key={review._id}
                        className="rounded-2xl border border-[#EAE6DF] bg-[#FAF8F5] p-4.5 shadow-xs"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#1E2022] font-sans text-xs font-bold text-white">
                              {review.reviewer?.name?.charAt(0).toUpperCase() ?? "U"}
                            </div>
                            <div className="min-w-0">
                              {review.reviewer?._id ? (
                                <Link
                                  href={`/profile/${review.reviewer._id}`}
                                  className="font-sans text-xs sm:text-sm font-bold text-[#1E2022] transition hover:text-[#C8522E] truncate block"
                                >
                                  {review.reviewer.name}
                                </Link>
                              ) : (
                                <span className="font-sans text-xs sm:text-sm font-bold text-[#1E2022] truncate block">
                                  {review.reviewer?.name ?? "Co-Traveler"}
                                </span>
                              )}
                              {review.createdAt && (
                                <span className="text-[11px] text-slate-400 block">
                                  {formatReviewDate(review.createdAt)}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex shrink-0 items-center gap-1 rounded-lg bg-white border border-[#EAE6DF] px-2.5 py-1 text-xs font-bold text-amber-600">
                            <Star size={12} className="text-amber-600" />
                            <span>{review.rating.toFixed(1)}</span>
                          </div>
                        </div>

                        {review.comment && (
                          <p className="mt-3 text-xs leading-relaxed text-slate-600 sm:pl-12">
                            &ldquo;{review.comment}&rdquo;
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </article>
            </div>

            {/* RIGHT COLUMN: Vehicle & Quick Actions */}
            <div className="space-y-6">
              {/* Vehicle Card */}
              <article className="rounded-3xl border border-[#EAE6DF] bg-white p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-[#EAE6DF] pb-4">
                  <div className="flex items-center gap-2.5">
                    <Car size={18} className="text-[#2E6F40]" />
                    <h2 className="font-sans text-lg font-bold text-[#1E2022]">
                      Your Vehicle
                    </h2>
                  </div>

                  {(vehicle as { verified?: boolean })?.verified && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#2E6F40] bg-[#EAF4ED] px-2 py-0.5 rounded-full border border-[#D0E5D5]">
                      ✓ Verified Vehicle
                    </span>
                  )}
                </div>

                {hasVehicle ? (
                  <div className="space-y-2.5">
                    {vehicle?.type && (
                      <div className="rounded-2xl border border-slate-100 bg-[#FAF8F5] p-3">
                        <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Vehicle Type
                        </span>
                        <span className="mt-0.5 block text-xs font-bold capitalize text-[#1E2022]">
                          {vehicle.type}
                        </span>
                      </div>
                    )}

                    {vehicle?.brand && (
                      <div className="rounded-2xl border border-slate-100 bg-[#FAF8F5] p-3">
                        <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Brand
                        </span>
                        <span className="mt-0.5 block text-xs font-bold text-[#1E2022]">
                          {vehicle.brand}
                        </span>
                      </div>
                    )}

                    {vehicle?.model && (
                      <div className="rounded-2xl border border-slate-100 bg-[#FAF8F5] p-3">
                        <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Model
                        </span>
                        <span className="mt-0.5 block text-xs font-bold text-[#1E2022]">
                          {vehicle.model}
                        </span>
                      </div>
                    )}

                    {vehicle?.number && (
                      <div className="rounded-2xl border border-slate-100 bg-[#FAF8F5] p-3">
                        <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Registration Plate
                        </span>
                        <span className="mt-0.5 block text-xs font-bold text-[#1E2022]">
                          {vehicle.number}
                        </span>
                      </div>
                    )}

                    {vehicle?.seats !== undefined && (
                      <div className="rounded-2xl border border-slate-100 bg-[#FAF8F5] p-3">
                        <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Seat Capacity
                        </span>
                        <span className="mt-0.5 block text-xs font-bold text-[#1E2022]">
                          {vehicle.seats} seats
                        </span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="rounded-2xl bg-[#FAF8F5] border border-[#EAE6DF] p-4 text-center text-xs text-slate-500">
                    No vehicle registered yet.
                  </div>
                )}
              </article>

              {/* Quick Actions Card */}
              <article className="rounded-3xl border border-[#EAE6DF] bg-white p-6 shadow-xs space-y-4">
                <h2 className="font-sans text-xs font-black uppercase tracking-wider text-slate-400">
                  Quick Actions
                </h2>

                <div className="space-y-2">
                  {user._id && (
                    <Link
                      href={`/profile/${user._id}`}
                      className="flex items-center justify-between gap-2 rounded-2xl border border-[#EAE6DF] bg-[#FAF8F5] px-4 py-3 text-xs font-bold text-[#1E2022] transition hover:border-[#1E2022] hover:bg-white"
                    >
                      <div className="flex items-center gap-2.5">
                        <Eye size={15} className="text-[#C8522E]" />
                        <span>View Public Profile</span>
                      </div>
                      <ChevronRight size={14} className="text-slate-400" />
                    </Link>
                  )}

                  <Link
                    href="/my-rides"
                    className="flex items-center justify-between gap-2 rounded-2xl border border-[#EAE6DF] bg-[#FAF8F5] px-4 py-3 text-xs font-bold text-[#1E2022] transition hover:border-[#1E2022] hover:bg-white"
                  >
                    <div className="flex items-center gap-2.5">
                      <Compass size={15} className="text-[#2E6F40]" />
                      <span>My Rides</span>
                    </div>
                    <ChevronRight size={14} className="text-slate-400" />
                  </Link>

                  <Link
                    href="/post-ride"
                    className="flex items-center justify-between gap-2 rounded-2xl border border-[#EAE6DF] bg-[#FAF8F5] px-4 py-3 text-xs font-bold text-[#1E2022] transition hover:border-[#1E2022] hover:bg-white"
                  >
                    <div className="flex items-center gap-2.5">
                      <PlusCircle size={15} className="text-[#C8522E]" />
                      <span>Offer a Ride</span>
                    </div>
                    <ChevronRight size={14} className="text-slate-400" />
                  </Link>
                </div>
              </article>
            </div>
          </div>
        </main>
      </div>

      <LandingFooter />
    </div>
  );
}
