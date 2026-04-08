"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Globe,
  Loader2,
  MapPin,
  PencilLine,
  Sparkles,
} from "lucide-react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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

  const initials = `${user?.first_name?.[0] ?? "S"}${user?.last_name?.[0] ?? "C"}`.toUpperCase();

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.96),rgba(241,245,249,0.92)_35%,rgba(226,232,240,1))] text-slate-950">
      <div className="mx-auto grid min-h-screen w-full max-w-6xl gap-6 px-4 py-4 lg:grid-cols-[1fr_360px] lg:px-6">
        <section className="space-y-6">
          <header className="flex flex-col gap-4 rounded-[2rem] border border-white/70 bg-white/80 p-5 shadow-sm backdrop-blur sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-slate-500">Profile</p>
              <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Edit your profile</h1>
            </div>

            <Button asChild variant="outline" className="rounded-full px-5">
              <Link href="/feed">
                Back to feed
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </header>

          {loading ? (
            <Card className="border-white/70 bg-white/80 shadow-sm backdrop-blur">
              <CardContent className="flex min-h-72 items-center justify-center p-8 text-slate-500">
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Loading your profile...
              </CardContent>
            </Card>
          ) : error && !user ? (
            <Card className="border-white/70 bg-white/80 shadow-sm backdrop-blur">
              <CardContent className="space-y-4 p-8 text-center">
                <p className="text-lg font-medium text-slate-950">Unable to open profile</p>
                <p className="text-sm text-slate-500">{error}</p>
                <Button asChild className="rounded-full">
                  <Link href="/login">Go to login</Link>
                </Button>
              </CardContent>
            </Card>
          ) : user ? (
            <>
              <Card className="border-white/70 bg-white/85 shadow-sm backdrop-blur">
                <CardContent className="space-y-5 p-5 sm:p-6">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="size-14">
                        <AvatarImage src={user.avatar_url ?? undefined} alt={user.username} />
                        <AvatarFallback>{initials}</AvatarFallback>
                      </Avatar>

                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-xl font-semibold tracking-tight text-slate-950">
                            {user.first_name} {user.last_name}
                          </p>
                          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-500">
                            @{user.username}
                          </span>
                        </div>
                        <p className="text-sm text-slate-500">{user.email}</p>
                      </div>
                    </div>

                    <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                      Last login {user.last_login_at ? new Date(user.last_login_at).toLocaleDateString() : "unknown"}
                    </div>
                  </div>

                  <form onSubmit={handleSubmit} className="grid gap-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-slate-600">First name</p>
                        <Input
                          value={firstName}
                          onChange={(event) => setFirstName(event.target.value)}
                          placeholder="First name"
                          className="h-11 rounded-full border-slate-200 bg-white px-4"
                        />
                      </div>

                      <div className="space-y-2">
                        <p className="text-sm font-medium text-slate-600">Last name</p>
                        <Input
                          value={lastName}
                          onChange={(event) => setLastName(event.target.value)}
                          placeholder="Last name"
                          className="h-11 rounded-full border-slate-200 bg-white px-4"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <p className="text-sm font-medium text-slate-600">Bio</p>
                      <Textarea
                        value={bio}
                        onChange={(event) => setBio(event.target.value.slice(0, 160))}
                        placeholder="Short bio..."
                        className="min-h-28 rounded-[1.5rem] border-slate-200 bg-white px-4 py-4 text-base"
                      />
                    </div>

                    <div className="space-y-2">
                      <p className="text-sm font-medium text-slate-600">Avatar URL</p>
                      <Input
                        value={avatarUrl}
                        onChange={(event) => setAvatarUrl(event.target.value)}
                        placeholder="https://..."
                        className="h-11 rounded-full border-slate-200 bg-white px-4"
                      />
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-slate-600 inline-flex items-center gap-2">
                          <Globe className="h-4 w-4" /> Website
                        </p>
                        <Input
                          value={website}
                          onChange={(event) => setWebsite(event.target.value)}
                          placeholder="https://your-site.com"
                          className="h-11 rounded-full border-slate-200 bg-white px-4"
                        />
                      </div>

                      <div className="space-y-2">
                        <p className="text-sm font-medium text-slate-600 inline-flex items-center gap-2">
                          <MapPin className="h-4 w-4" /> Location
                        </p>
                        <Input
                          value={location}
                          onChange={(event) => setLocation(event.target.value)}
                          placeholder="City, Country"
                          className="h-11 rounded-full border-slate-200 bg-white px-4"
                        />
                      </div>
                    </div>

                    {success ? <p className="text-sm text-emerald-600">{success}</p> : null}
                    {error ? <p className="text-sm text-red-600">{error}</p> : null}

                    <div className="flex items-center justify-between gap-3 border-t border-slate-200 pt-4">
                      <p className="text-sm text-slate-500">Keep it clear and easy for people to recognize you.</p>
                      <Button type="submit" className="rounded-full px-6" disabled={saving}>
                        {saving ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            Save profile
                            <PencilLine className="h-4 w-4" />
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </>
          ) : null}
        </section>

        <aside className="space-y-4">
          <Card className="border-white/70 bg-white/80 shadow-sm backdrop-blur">
            <CardContent className="space-y-4 p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-white">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-950">Profile tips</p>
                  <p className="text-xs text-slate-500">Keep your identity simple</p>
                </div>
              </div>

              <ul className="space-y-2 text-sm text-slate-600">
                <li className="rounded-2xl bg-slate-100 px-3 py-2">Use a clear avatar URL</li>
                <li className="rounded-2xl bg-slate-100 px-3 py-2">Add a short bio people can scan</li>
                <li className="rounded-2xl bg-slate-100 px-3 py-2">Link a website if you have one</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-white/70 bg-white/80 shadow-sm backdrop-blur">
            <CardContent className="space-y-4 p-5">
              <p className="text-sm font-medium text-slate-500">Quick links</p>
              <div className="space-y-3 text-sm">
                <Link href="/feed" className="block rounded-2xl bg-slate-100 px-3 py-2 text-slate-700 hover:bg-slate-200">
                  Open feed
                </Link>
                <Link href={`/profile/${user?.id ?? ""}`} className="block rounded-2xl bg-slate-100 px-3 py-2 text-slate-700 hover:bg-slate-200">
                  View public profile
                </Link>
              </div>
            </CardContent>
          </Card>
        </aside>
      </div>
    </main>
  );
}