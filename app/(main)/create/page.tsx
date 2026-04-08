"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowRight,
  ImageIcon,
  Loader2,
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

export default function CreatePostPage() {
  const router = useRouter();

  const [user, setUser] = useState<CurrentUser | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const remainingChars = useMemo(() => 280 - content.length, [content]);

  useEffect(() => {
    async function loadUser() {
      try {
        const response = await fetch("/api/users/me", {
          cache: "no-store",
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          setError(data.message || "Unable to load your profile");
          return;
        }

        setUser(data.user);
      } catch {
        setError("Unable to load your profile right now.");
      } finally {
        setLoadingUser(false);
      }
    }

    loadUser();
  }, []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    setMessage("");

    try {
      if (!user) {
        setError("Your profile could not be loaded.");
        return;
      }

      const response = await fetch("/api/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          author_id: user.id,
          content,
          image_url: imageUrl || null,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.message || "Could not create post");
        return;
      }

      setMessage("Post published successfully.");
      setContent("");
      setImageUrl("");

      setTimeout(() => {
        router.push("/feed");
      }, 600);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  const initials = `${user?.first_name?.[0] ?? "S"}${user?.last_name?.[0] ?? "C"}`.toUpperCase();

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.96),rgba(241,245,249,0.92)_35%,rgba(226,232,240,1))] text-slate-950">
      <div className="mx-auto grid min-h-screen w-full max-w-6xl gap-6 px-4 py-4 lg:grid-cols-[1fr_360px] lg:px-6">
        <section className="space-y-6">
          <header className="flex flex-col gap-4 rounded-[2rem] border border-white/70 bg-white/80 p-5 shadow-sm backdrop-blur sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-slate-500">Create</p>
              <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">New post</h1>
            </div>

            <Button asChild variant="outline" className="rounded-full px-5">
              <Link href="/feed">
                Back to feed
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </header>

          {loadingUser ? (
            <Card className="border-white/70 bg-white/80 shadow-sm backdrop-blur">
              <CardContent className="flex min-h-64 items-center justify-center p-8 text-slate-500">
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Loading your profile...
              </CardContent>
            </Card>
          ) : error && !user ? (
            <Card className="border-white/70 bg-white/80 shadow-sm backdrop-blur">
              <CardContent className="space-y-4 p-8 text-center">
                <p className="text-lg font-medium text-slate-950">Unable to open composer</p>
                <p className="text-sm text-slate-500">{error}</p>
                <Button asChild className="rounded-full">
                  <Link href="/login">Go to login</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-white/70 bg-white/85 shadow-sm backdrop-blur">
              <CardContent className="space-y-6 p-5 sm:p-6">
                <div className="flex items-center gap-3">
                  <Avatar className="size-11">
                    <AvatarImage src={user?.avatar_url ?? undefined} alt={user?.username ?? "SocialConnect user"} />
                    <AvatarFallback>{initials}</AvatarFallback>
                  </Avatar>

                  <div>
                    <p className="font-semibold tracking-tight text-slate-950">
                      {user ? `${user.first_name} ${user.last_name}`.trim() : "SocialConnect user"}
                    </p>
                    <p className="text-sm text-slate-500">{user?.username ? `@${user.username}` : "Ready to post"}</p>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-2">
                    <Textarea
                      value={content}
                      onChange={(event) => setContent(event.target.value.slice(0, 280))}
                      placeholder="Share something thoughtful with your network..."
                      className="min-h-40 rounded-[1.5rem] border-slate-200 bg-white px-4 py-4 text-base"
                      required
                    />
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span>{remainingChars} characters left</span>
                      <span>Max 280 characters</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
                      <ImageIcon className="h-4 w-4" />
                      Image URL
                    </div>
                    <Input
                      value={imageUrl}
                      onChange={(event) => setImageUrl(event.target.value)}
                      placeholder="https://..."
                      className="h-11 rounded-full border-slate-200 bg-white px-4"
                    />
                  </div>

                  {message ? <p className="text-sm text-emerald-600">{message}</p> : null}
                  {error ? <p className="text-sm text-red-600">{error}</p> : null}

                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm text-slate-500">
                      Keep it clear, short, and easy to scan.
                    </p>
                    <Button type="submit" className="rounded-full px-6" disabled={submitting || !content.trim()}>
                      {submitting ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Publishing...
                        </>
                      ) : (
                        <>
                          Publish post
                          <ArrowRight className="h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}
        </section>

        <aside className="space-y-4">
          <Card className="border-white/70 bg-white/80 shadow-sm backdrop-blur">
            <CardContent className="space-y-4 p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-white">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-950">Writing tips</p>
                  <p className="text-xs text-slate-500">Simple, direct, and visual</p>
                </div>
              </div>

              <ul className="space-y-2 text-sm text-slate-600">
                <li className="rounded-2xl bg-slate-100 px-3 py-2">Lead with the main idea</li>
                <li className="rounded-2xl bg-slate-100 px-3 py-2">Use one image max</li>
                <li className="rounded-2xl bg-slate-100 px-3 py-2">Keep the post easy to skim</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-white/70 bg-white/80 shadow-sm backdrop-blur">
            <CardContent className="space-y-4 p-5">
              <p className="text-sm font-medium text-slate-500">Preview</p>

              <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center gap-3">
                  <Avatar className="size-10">
                    <AvatarImage src={user?.avatar_url ?? undefined} alt={user?.username ?? "SocialConnect user"} />
                    <AvatarFallback>{initials}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium text-slate-950">
                      {user ? `${user.first_name} ${user.last_name}`.trim() : "Your profile"}
                    </p>
                    <p className="text-xs text-slate-500">{user?.username ? `@${user.username}` : "@your-handle"}</p>
                  </div>
                </div>

                <p className="mt-4 whitespace-pre-line text-sm leading-6 text-slate-700">
                  {content || "Your post preview will appear here."}
                </p>

                {imageUrl ? (
                  <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
                    <img src={imageUrl} alt="Preview" className="h-52 w-full object-cover" />
                  </div>
                ) : null}
              </div>
            </CardContent>
          </Card>
        </aside>
      </div>
    </main>
  );
}