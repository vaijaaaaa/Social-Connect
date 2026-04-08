"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Heart,
  Loader2,
  MessageCircle,
  Search,
  Sparkles,
} from "lucide-react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
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

type CurrentUser = {
  id: string;
  avatar_url: string | null;
};

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
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function loadFeed() {
      try {
        const [feedResponse, meResponse] = await Promise.all([
          fetch("/api/feed", {
            cache: "no-store",
          }),
          fetch("/api/users/me", {
            cache: "no-store",
          }),
        ]);

        const data = await feedResponse.json();

        if (!feedResponse.ok || !data.success) {
          setError(data.message || "Unable to load feed");
          return;
        }

        setPosts(Array.isArray(data.posts) ? data.posts : []);

        if (meResponse.ok) {
          const meData = await meResponse.json();
          if (meData?.success && meData?.user?.id) {
            setCurrentUser({
              id: meData.user.id,
              avatar_url: meData.user.avatar_url ?? null,
            });
          }
        }
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
    <main className="min-h-screen bg-white text-slate-950">
      <div className="mx-auto grid w-full max-w-7xl gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
        {/* Left Sidebar */}
        <aside className="hidden border-r border-slate-200 py-6 lg:block">
          <div className="sticky top-0 space-y-6 px-4">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-950 text-white">
                <Sparkles className="h-5 w-5" />
              </div>
              <p className="text-sm font-semibold tracking-tight">SocialConnect</p>
            </Link>

            {/* Navigation */}
            <nav className="space-y-1">
              <Link
                href="/feed"
                className="block rounded-lg bg-slate-100 px-4 py-2.5 text-sm font-medium text-slate-950"
              >
                Feed
              </Link>
              <Link
                href="/me"
                className="block rounded-lg px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Profile
              </Link>
              <Link
                href="/create"
                className="block rounded-lg px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Create post
              </Link>
            </nav>
          </div>
        </aside>

        {/* Main Feed */}
        <section className="py-6">
          <div className="sticky top-0 z-10 space-y-4 border-b border-slate-200 bg-white px-4 py-4 sm:px-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Your feed</p>
              <h1 className="mt-1 text-2xl font-semibold tracking-tight">Latest posts</h1>
            </div>

            {/* Search & Create */}
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search posts or creators..."
                  className="h-10 border-slate-300 bg-white pl-9 rounded-lg"
                />
              </div>

              <Button asChild className="rounded-lg">
                <Link href="/create">Create</Link>
              </Button>
            </div>
          </div>

          {/* Feed Content */}
          <div className="px-4 py-4 sm:px-6">
            {loading ? (
              <div className="flex items-center justify-center rounded-lg border border-slate-200 bg-slate-50 py-12">
                <div className="text-center space-y-3">
                  <Loader2 className="h-6 w-6 animate-spin text-slate-400 mx-auto" />
                  <p className="text-sm text-slate-600">Loading posts...</p>
                </div>
              </div>
            ) : error ? (
              <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center space-y-3">
                <p className="font-medium text-red-900">Unable to load feed</p>
                <p className="text-sm text-red-700">{error}</p>
                <Button asChild variant="outline" size="sm" className="rounded-lg">
                  <Link href="/feed">Try again</Link>
                </Button>
              </div>
            ) : filteredPosts.length === 0 ? (
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-8 text-center space-y-3">
                <p className="font-medium text-slate-950">No posts yet</p>
                <p className="text-sm text-slate-600">Start a conversation by creating the first post</p>
                <Button asChild size="sm" className="rounded-lg">
                  <Link href="/create">Create a post</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredPosts.map((post) => {
                  const profile = post.profiles;
                  const name = profile ? `${profile.first_name} ${profile.last_name}`.trim() : "User";
                  const avatarSrc =
                    profile?.avatar_url ??
                    (currentUser?.id === post.author_id ? currentUser.avatar_url : null) ??
                    undefined;

                  return (
                    <Link
                      key={post.id}
                      href={`/post/${post.id}`}
                      className="block rounded-lg border border-slate-200 bg-white p-5 transition-all hover:border-slate-300 hover:shadow-sm"
                    >
                      {/* Post Header */}
                      <div className="flex gap-3 mb-3">
                        <Avatar className="h-10 w-10 shrink-0">
                          <AvatarImage src={avatarSrc} alt={name} />
                          <AvatarFallback className="text-xs">
                            {getInitials(profile?.first_name, profile?.last_name)}
                          </AvatarFallback>
                        </Avatar>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-baseline gap-2 flex-wrap">
                            <p className="font-semibold text-sm text-slate-950">{name}</p>
                            <p className="text-xs text-slate-500">{profile?.username ?? "@user"}</p>
                            <span className="text-slate-400">·</span>
                            <p className="text-xs text-slate-500">{formatTime(post.created_at)}</p>
                          </div>
                        </div>
                      </div>

                      {/* Post Content */}
                      <div className="space-y-3">
                        <p className="text-sm leading-6 text-slate-700 whitespace-pre-line wrap-break-word">
                          {post.content}
                        </p>

                        {/* Image */}
                        {post.image_url ? (
                          <div className="overflow-hidden rounded-lg border border-slate-200 bg-slate-100">
                            <img
                              src={post.image_url}
                              alt="Post attachment"
                              className="h-64 w-full object-cover"
                            />
                          </div>
                        ) : null}

                        {/* Actions */}
                        <div className="flex gap-4 pt-3 border-t border-slate-100 text-xs text-slate-500">
                          <span className="inline-flex items-center gap-1.5 hover:text-slate-700">
                            <Heart className="h-4 w-4" />
                            <span>{post.like_count}</span>
                          </span>
                          <span className="inline-flex items-center gap-1.5 hover:text-slate-700">
                            <MessageCircle className="h-4 w-4" />
                            <span>{post.comment_count}</span>
                          </span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}