"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Globe,
  Loader2,
  MapPin,
  Upload,
} from "lucide-react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type CurrentUser = {
  id: string;
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  bio: string | null;
  avatar_url: string | null;
  website: string | null;
  location: string | null;
  last_login_at: string | null;
  created_at: string;
  updated_at: string;
};

export default function MePage() {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [website, setWebsite] = useState("");
  const [location, setLocation] = useState("");

  useEffect(() => {
    async function loadProfile() {
      try {
        const response = await fetch("/api/users/me", {
          cache: "no-store",
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          setError(data.message || "Unable to load your profile");
          return;
        }

        const profile = data.user as CurrentUser;
        setUser(profile);
        setFirstName(profile.first_name ?? "");
        setLastName(profile.last_name ?? "");
        setBio(profile.bio ?? "");
        setAvatarUrl(profile.avatar_url ?? "");
        setWebsite(profile.website ?? "");
        setLocation(profile.location ?? "");
      } catch {
        setError("Unable to load your profile right now.");
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch("/api/users/me", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          first_name: firstName,
          last_name: lastName,
          bio: bio || null,
          avatar_url: avatarUrl || null,
          website: website || null,
          location: location || null,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.message || "Could not update profile");
        return;
      }

      setUser(data.user);
      setSuccess("Profile updated successfully.");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  async function handleAvatarUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    setUploadingAvatar(true);
    setError("");
    setSuccess("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/users/me/avatar", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.message || "Failed to upload avatar");
        return;
      }

      setAvatarUrl(data.avatar_url);
      setUser((current) =>
        current
          ? {
              ...current,
              avatar_url: data.avatar_url,
            }
          : current,
      );
      setSuccess("Avatar uploaded successfully.");
    } catch {
      setError("Failed to upload avatar right now.");
    } finally {
      event.target.value = "";
      setUploadingAvatar(false);
    }
  }

  const initials = `${user?.first_name?.[0] ?? "S"}${user?.last_name?.[0] ?? "C"}`.toUpperCase();

  return (
    <main className="min-h-screen bg-white text-slate-950">
      <div className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Settings</p>
            <h1 className="text-3xl font-semibold tracking-tight">Edit profile</h1>
          </div>
          <Button asChild variant="outline" className="rounded-lg" size="sm">
            <Link href="/feed">Back</Link>
          </Button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center rounded-lg border border-slate-200 bg-slate-50 py-24">
            <div className="text-center space-y-3">
              <Loader2 className="h-6 w-6 animate-spin text-slate-400 mx-auto" />
              <p className="text-sm text-slate-600">Loading your profile...</p>
            </div>
          </div>
        ) : error && !user ? (
          <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center space-y-3">
            <p className="font-medium text-red-900">Unable to load profile</p>
            <p className="text-sm text-red-700">{error}</p>
            <Button asChild variant="outline" size="sm" className="rounded-lg">
              <Link href="/login">Go to login</Link>
            </Button>
          </div>
        ) : user ? (
          <div className="space-y-6">
            {/* Current Profile Card */}
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-6 space-y-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Current profile</p>
              <div className="flex items-start gap-4">
                <Avatar className="h-14 w-14 shrink-0">
                  <AvatarImage src={user.avatar_url ?? undefined} alt={user.username} />
                  <AvatarFallback className="text-sm font-semibold">{initials}</AvatarFallback>
                </Avatar>

                <div className="flex-1 space-y-1">
                  <p className="font-semibold text-sm text-slate-950">
                    {user.first_name} {user.last_name}
                  </p>
                  <p className="text-xs text-slate-600">@{user.username}</p>
                  <p className="text-xs text-slate-500">{user.email}</p>
                </div>
              </div>
            </div>

            {/* Edit Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name Fields */}
              <div className="space-y-4">
                <h2 className="text-lg font-semibold tracking-tight">About you</h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label htmlFor="firstName" className="text-sm font-medium text-slate-700">
                      First name
                    </label>
                    <Input
                      id="firstName"
                      value={firstName}
                      onChange={(event) => setFirstName(event.target.value)}
                      placeholder="First"
                      className="h-10 border-slate-300 bg-white rounded-lg"
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="lastName" className="text-sm font-medium text-slate-700">
                      Last name
                    </label>
                    <Input
                      id="lastName"
                      value={lastName}
                      onChange={(event) => setLastName(event.target.value)}
                      placeholder="Last"
                      className="h-10 border-slate-300 bg-white rounded-lg"
                    />
                  </div>
                </div>
              </div>

              {/* Bio */}
              <div className="space-y-2">
                <label htmlFor="bio" className="text-sm font-medium text-slate-700">
                  Bio <span className="text-xs text-slate-500 font-normal">({bio.length}/160)</span>
                </label>
                <Textarea
                  id="bio"
                  value={bio}
                  onChange={(event) => setBio(event.target.value.slice(0, 160))}
                  placeholder="Tell people about yourself..."
                  className="min-h-24 border-slate-300 bg-white rounded-lg"
                />
              </div>

              {/* Avatar */}
              <div className="space-y-4">
                <h2 className="text-lg font-semibold tracking-tight">Photo & Links</h2>
                <div className="space-y-2">
                  <label htmlFor="avatarUrl" className="text-sm font-medium text-slate-700">
                    Avatar URL
                  </label>
                  <Input
                    id="avatarUrl"
                    value={avatarUrl}
                    onChange={(event) => setAvatarUrl(event.target.value)}
                    placeholder="https://example.com/avatar.jpg"
                    className="h-10 border-slate-300 bg-white rounded-lg"
                  />
                  <div className="flex flex-wrap items-center gap-3">
                    <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50">
                      {uploadingAvatar ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Upload className="h-3.5 w-3.5" />
                      )}
                      {uploadingAvatar ? "Uploading..." : "Upload image"}
                      <input
                        type="file"
                        accept="image/jpeg,image/png"
                        className="hidden"
                        onChange={handleAvatarUpload}
                        disabled={uploadingAvatar}
                      />
                    </label>
                    <p className="text-xs text-slate-500">Max 2MB. JPG or PNG only.</p>
                  </div>
                </div>
              </div>

              {/* Links */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label htmlFor="website" className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
                    <Globe className="h-4 w-4" />
                    Website
                  </label>
                  <Input
                    id="website"
                    value={website}
                    onChange={(event) => setWebsite(event.target.value)}
                    placeholder="https://yoursite.com"
                    className="h-10 border-slate-300 bg-white rounded-lg"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="location" className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
                    <MapPin className="h-4 w-4" />
                    Location
                  </label>
                  <Input
                    id="location"
                    value={location}
                    onChange={(event) => setLocation(event.target.value)}
                    placeholder="City, Country"
                    className="h-10 border-slate-300 bg-white rounded-lg"
                  />
                </div>
              </div>

              {/* Messages */}
              {success && (
                <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3">
                  <p className="text-sm text-emerald-700">{success}</p>
                </div>
              )}
              {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 border-t border-slate-200 pt-6">
                <Button
                  type="button"
                  asChild
                  variant="outline"
                  className="rounded-lg"
                >
                  <Link href="/feed">Cancel</Link>
                </Button>
                <Button
                  type="submit"
                  className="ml-auto rounded-lg"
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save changes"
                  )}
                </Button>
              </div>
            </form>
          </div>
        ) : null}
      </div>
    </main>
  );
}