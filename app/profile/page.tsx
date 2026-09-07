"use client";

import { FormEvent, useEffect, useState } from "react";
import { ArrowLeft, Check, Pencil } from "lucide-react";
import Link from "next/link";
import {
  getMyProfile,
  updateMyProfile,
  uploadProfileImage,
  type ProfileUser,
} from "@/lib/api/profile";

export default function ProfilePage() {
  const [user, setUser] = useState<ProfileUser | null>(
    null
  );

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [bio, setBio] = useState("");

  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] =
    useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadProfile() {
      try {
        const response = await getMyProfile();
        const profile = response.data.user;

        setUser(profile);
        setName(profile.name ?? "");
        setPhone(profile.phone ?? "");
        setBio(profile.bio ?? "");
      } catch (error) {
        console.error(
          "Unable to load profile:",
          error
        );
        setError("Unable to load your profile.");
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, []);

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

      try {
        const response = await uploadProfileImage(file);

        setUser(response.data.user);
      } catch (error) {
        console.error(
          "Unable to upload profile image:",
          error
        );

        setError("Unable to update your profile image.");
      } finally {
        setUploadingPhoto(false);
        event.target.value = "";
      }
    }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (saving) return;

    setSaving(true);
    setError("");

    try {
      const response = await updateMyProfile({
        name: name.trim(),
        phone: phone.trim(),
        bio: bio.trim(),
      });

      setUser(response.data.user);
      setEditing(false);
    } catch (error) {
      console.error(
        "Unable to update profile:",
        error
      );
      setError("Unable to update your profile.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="mx-auto w-full max-w-3xl px-5 py-8 sm:px-8">
        <p className="text-sm text-slate-500">
          Loading profile...
        </p>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="mx-auto w-full max-w-3xl px-5 py-8 sm:px-8">
        <p className="text-sm text-red-500">
          {error || "Profile unavailable."}
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-3xl px-5 py-8 sm:px-8">
      <Link
        href="/home"
        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-primary"
      >
        <ArrowLeft size={16} />
        Back
      </Link>

      <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="bg-secondary px-6 py-8 sm:px-8">
          <div className="flex items-center gap-5">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white text-2xl font-bold text-secondary">
              {user.profilePic ? (
                <img
                  src={user.profilePic}
                  alt={user.name ?? "Profile"}
                  className="h-full w-full object-cover"
                />
              ) : (
                user.name?.charAt(0).toUpperCase() ??
                "S"
              )}
            </div>
            <div>
              <label className="inline-flex cursor-pointer items-center rounded-xl bg-white px-4 py-2 text-sm font-semibold text-secondary transition hover:bg-slate-100">
                {uploadingPhoto
                  ? "Uploading..."
                  : "Change photo"}
            
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleProfileImageChange}
                  disabled={uploadingPhoto}
                  className="hidden"
                />
              </label>
                
              <p className="mt-2 text-xs text-slate-300">
                JPG, PNG or WebP · Max 5 MB
              </p>
            </div>

            <div>
              <h1 className="text-2xl font-bold text-white">
                {user.name ?? "SahaYatri user"}
              </h1>

              <p className="mt-1 text-sm text-slate-300">
                {user.email}
              </p>
            </div>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="p-6 sm:p-8"
        >
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-secondary">
                Profile information
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Keep your SahaYatri profile up to date.
              </p>
            </div>

            {!editing && (
              <button
                type="button"
                onClick={() => setEditing(true)}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-secondary transition hover:border-primary hover:text-primary"
              >
                <Pencil size={15} />
                Edit
              </button>
            )}
          </div>

          <div className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-semibold text-secondary">
                Name
              </label>

              <input
                value={name}
                onChange={(event) =>
                  setName(event.target.value)
                }
                disabled={!editing}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-primary disabled:bg-slate-50 disabled:text-slate-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-secondary">
                Email
              </label>

              <input
                value={user.email ?? ""}
                disabled
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-secondary">
                Phone
              </label>

              <input
                value={phone}
                onChange={(event) =>
                  setPhone(event.target.value)
                }
                disabled={!editing}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-primary disabled:bg-slate-50 disabled:text-slate-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-secondary">
                Bio
              </label>

              <textarea
                value={bio}
                onChange={(event) =>
                  setBio(event.target.value)
                }
                disabled={!editing}
                rows={4}
                maxLength={300}
                className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-primary disabled:bg-slate-50 disabled:text-slate-500"
              />
            </div>
          </div>

          {error && (
            <p className="mt-4 text-sm text-red-500">
              {error}
            </p>
          )}

          {editing && (
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setName(user.name ?? "");
                  setPhone(user.phone ?? "");
                  setBio(user.bio ?? "");
                  setError("");
                  setEditing(false);
                }}
                className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-white transition hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Check size={16} />

                {saving
                  ? "Saving..."
                  : "Save changes"}
              </button>
            </div>
          )}
        </form>
      </div>
      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
          <div>
            <h2 className="text-lg font-bold text-secondary">
              Safety & Trust
            </h2>
          
            <p className="mt-1 text-sm text-slate-500">
              Information that helps keep your rides safer.
            </p>
          </div>
          
          <div className="mt-6 space-y-4">
            <div className="flex items-center justify-between rounded-xl bg-slate-50 p-4">
              <div>
                <p className="font-semibold text-secondary">
                  Account verification
                </p>
          
                <p className="mt-1 text-sm text-slate-500">
                  {user.isVerified
                    ? "Your account is verified."
                    : "Your account is not verified yet."}
                </p>
              </div>
                    
              <span
                className={`rounded-full px-3 py-1 text-xs font-bold ${
                  user.isVerified
                    ? "bg-green-100 text-green-700"
                    : "bg-slate-200 text-slate-600"
                }`}
              >
                {user.isVerified
                  ? "Verified"
                  : "Not verified"}
              </span>
            </div>
                
            <div className="rounded-xl border border-slate-200 p-4">
              <p className="font-semibold text-secondary">
                Trusted contact
              </p>
                
              {user.trustedContact?.name ||
              user.trustedContact?.phone ? (
                <div className="mt-2 text-sm text-slate-500">
                  {user.trustedContact.name && (
                    <p>
                      {user.trustedContact.name}
                    </p>
                  )}
    
                  {user.trustedContact.phone && (
                    <p>
                      {user.trustedContact.phone}
                    </p>
                  )}
                </div>
              ) : (
                <p className="mt-1 text-sm text-slate-500">
                  No trusted contact added.
                </p>
              )}
            </div>
          
            <div className="rounded-xl border border-slate-200 p-4">
              <p className="font-semibold text-secondary">
                Safety preferences
              </p>
          
              <div className="mt-3 space-y-2 text-sm text-slate-600">
                <p>
                  Ride details sharing:{" "}
                  <strong>
                    {user.safetyPreferences
                      ?.shareRideDetails
                      ? "On"
                      : "Off"}
                  </strong>
                </p>
                    
                <p>
                  Emergency alerts:{" "}
                  <strong>
                    {user.safetyPreferences
                      ?.emergencyAlerts
                      ? "On"
                      : "Off"}
                  </strong>
                </p>
                    
                <p>
                  Trusted contact access:{" "}
                  <strong>
                    {user.safetyPreferences
                      ?.allowTrustedContact
                      ? "On"
                      : "Off"}
                  </strong>
                </p>
              </div>
            </div>
          </div>
        </div>
    </main>
  );
}

