"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Heart,
  Loader2,
  MessageCircle,
  Search,
  Sparkles,
  TrendingUp,
  Users,
} from "lucide-react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type FeedPost = {
  id: string;
  author_id: string;
  content: string;
  image_url: string | null;
  is_active: boolean;
  like_count: number;
  comment_count: number;
  created_at: string;
  updated_at: string;
  profiles?: {
    id: string;
    username: string;
    first_name: string;
    last_name: string;
    avatar_url: string | null;
  } | null;
};

const trendingTopics = [
  "Design systems",
  "Creator tools",
  "Frontend build",
  "Product thinking",
];

const suggestedUsers = [
  { name: "Maya Stone", handle: "@mayastone" },
  { name: "Chris Lee", handle: "@chrislee" },
  { name: "Priya Roy", handle: "@priyaroy" },
];

function formatTime(value: string) {
  const date = new Date(value);
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
  }).format(date);
}

function getInitials(firstName?: string, lastName?: string) {
  const first = firstName?.[0] ?? "S";
  const last = lastName?.[0] ?? "C";

  return `${first}${last}`.toUpperCase();
}

export default function FeedPage() {
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function loadFeed() {
      try {
        const response = await fetch("/api/feed", {
          cache: "no-store",
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          setError(data.message || "Unable to load feed");
          return;
        }

        setPosts(Array.isArray(data.posts) ? data.posts : []);
      } catch {
        setError("Unable to load feed right now.");
      } finally {
        setLoading(false);
      }
    }

    loadFeed();
  }, []);

  const filteredPosts = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return posts;
    }

    return posts.filter((post) => {
      const author = `${post.profiles?.first_name ?? ""} ${post.profiles?.last_name ?? ""}`.toLowerCase();
      const username = post.profiles?.username?.toLowerCase() ?? "";
      const content = post.content.toLowerCase();

      return author.includes(query) || username.includes(query) || content.includes(query);
    });
  }, [posts, search]);

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.95),rgba(241,245,249,0.92)_35%,rgba(226,232,240,1))] text-slate-950">
      <div className="mx-auto grid min-h-screen w-full max-w-7xl gap-6 px-4 py-4 lg:grid-cols-[240px_minmax(0,1fr)_300px] lg:px-6">
        <aside className="hidden lg:flex lg:flex-col lg:gap-4">
          <Card className="border-white/70 bg-white/80 shadow-sm backdrop-blur">
            <CardContent className="space-y-5 p-5">
              <Link href="/" className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-white">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold tracking-tight">SocialConnect</p>
                  <p className="text-xs text-slate-500">Minimal social feed</p>
                </div>
              </Link>

              <div className="space-y-2 text-sm text-slate-600">
                <p className="rounded-2xl bg-slate-100 px-3 py-2 font-medium text-slate-950">Feed</p>
                <p className="rounded-2xl px-3 py-2 hover:bg-slate-100">Profile</p>
                <p className="rounded-2xl px-3 py-2 hover:bg-slate-100">Create post</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-white/70 bg-white/80 shadow-sm backdrop-blur">
            <CardContent className="space-y-3 p-5">
              <p className="text-sm font-medium text-slate-500">Trending</p>
              {trendingTopics.map((topic) => (
                <div key={topic} className="rounded-2xl bg-slate-100 px-3 py-2 text-sm text-slate-700">
                  #{topic}
                </div>
              ))}
            </CardContent>
          </Card>
        </aside>

        <section className="space-y-6">
          <header className="flex flex-col gap-4 rounded-[2rem] border border-white/70 bg-white/80 p-5 shadow-sm backdrop-blur sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-slate-500">Welcome back</p>
              <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Your feed</h1>
            </div>

            <div className="flex flex-col gap-3 sm:w-90 sm:flex-row sm:items-center">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search posts or creators"
                  className="h-11 rounded-full border-slate-200 bg-white pl-9"
                />
              </div>

              <Button asChild className="h-11 rounded-full px-5">
                <Link href="/create">
                  New post
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </header>

          {loading ? (
            <Card className="border-white/70 bg-white/80 shadow-sm backdrop-blur">
              <CardContent className="flex min-h-70 items-center justify-center p-8 text-slate-500">
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Loading feed...
              </CardContent>
            </Card>
          ) : error ? (
            <Card className="border-white/70 bg-white/80 shadow-sm backdrop-blur">
              <CardContent className="space-y-4 p-8 text-center">
                <p className="text-lg font-medium text-slate-950">Unable to load feed</p>
                <p className="text-sm text-slate-500">{error}</p>
                <Button asChild variant="outline" className="rounded-full">
                  <Link href="/feed">Try again</Link>
                </Button>
              </CardContent>
            </Card>
          ) : filteredPosts.length === 0 ? (
            <Card className="border-white/70 bg-white/80 shadow-sm backdrop-blur">
              <CardContent className="space-y-4 p-8 text-center">
                <p className="text-lg font-medium text-slate-950">No posts yet</p>
                <p className="text-sm text-slate-500">
                  Start the conversation by creating the first post.
                </p>
                <Button asChild className="rounded-full">
                  <Link href="/create">Create a post</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredPosts.map((post) => {
                const profile = post.profiles;
                const name = profile ? `${profile.first_name} ${profile.last_name}`.trim() : "SocialConnect user";

                return (
                  <Card key={post.id} className="overflow-hidden border-white/70 bg-white/85 shadow-sm backdrop-blur">
                    <CardContent className="space-y-5 p-5 sm:p-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="size-11">
                            <AvatarImage src={profile?.avatar_url ?? undefined} alt={name} />
                            <AvatarFallback>{getInitials(profile?.first_name, profile?.last_name)}</AvatarFallback>
                          </Avatar>

                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-semibold tracking-tight text-slate-950">{name}</p>
                              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-500">
                                {profile?.username ?? "@user"}
                              </span>
                            </div>
                            <p className="text-sm text-slate-500">{formatTime(post.created_at)}</p>
                          </div>
                        </div>

                        <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                          Active
                        </div>
                      </div>

                      <p className="whitespace-pre-line text-[15px] leading-7 text-slate-700">
                        {post.content}
                      </p>

                      {post.image_url ? (
                        <div className="overflow-hidden rounded-[1.5rem] border border-slate-200 bg-slate-100">
                          <img
                            src={post.image_url}
                            alt="Post attachment"
                            className="h-80 w-full object-cover"
                          />
                        </div>
                      ) : null}

                      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-4 text-sm text-slate-500">
                        <div className="flex items-center gap-5">
                          <span className="inline-flex items-center gap-1.5">
                            <Heart className="h-4 w-4" /> {post.like_count}
                          </span>
                          <span className="inline-flex items-center gap-1.5">
                            <MessageCircle className="h-4 w-4" /> {post.comment_count}
                          </span>
                        </div>

                        <Link href={`/post/${post.id}`} className="text-sm font-medium text-slate-950 hover:underline">
                          Open post
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </section>

        <aside className="hidden space-y-4 lg:block">
          <Card className="border-white/70 bg-white/80 shadow-sm backdrop-blur">
            <CardContent className="space-y-4 p-5">
              <div>
                <p className="text-sm text-slate-500">Quick stats</p>
                <h2 className="text-xl font-semibold tracking-tight">Community pulse</h2>
              </div>

              <div className="grid gap-3">
                <div className="rounded-2xl bg-slate-100 p-4">
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <TrendingUp className="h-4 w-4" /> Engagement
                  </div>
                  <p className="mt-2 text-2xl font-semibold tracking-tight">High</p>
                </div>

                <div className="rounded-2xl bg-slate-100 p-4">
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <Users className="h-4 w-4" /> Active members
                  </div>
                  <p className="mt-2 text-2xl font-semibold tracking-tight">12.4k</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-white/70 bg-white/80 shadow-sm backdrop-blur">
            <CardContent className="space-y-4 p-5">
              <p className="text-sm font-medium text-slate-500">Suggested creators</p>
              <div className="space-y-3">
                {suggestedUsers.map((user) => (
                  <div key={user.handle} className="flex items-center justify-between rounded-2xl bg-slate-100 px-3 py-3">
                    <div>
                      <p className="text-sm font-medium text-slate-950">{user.name}</p>
                      <p className="text-xs text-slate-500">{user.handle}</p>
                    </div>
                    <Button variant="ghost" size="sm" className="rounded-full px-3 text-xs">
                      Follow
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </aside>
      </div>
    </main>
  );
}