"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Heart,
  Loader2,
  LogOut,
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

type SuggestedUser = {
  id: string;
  username: string;
  first_name: string;
  last_name: string;
  avatar_url: string | null;
};

type FollowingItem = {
  following_id: string;
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
  const router = useRouter();
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [likedPostIds, setLikedPostIds] = useState<string[]>([]);
  const [likePendingPostIds, setLikePendingPostIds] = useState<string[]>([]);
  const [suggestedUsers, setSuggestedUsers] = useState<SuggestedUser[]>([]);
  const [followedUserIds, setFollowedUserIds] = useState<string[]>([]);
  const [followingPendingId, setFollowingPendingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function loadFeed() {
      try {
        const [feedResponse, meResponse, usersResponse] = await Promise.all([
          fetch("/api/feed", {
            cache: "no-store",
          }),
          fetch("/api/users/me", {
            cache: "no-store",
          }),
          fetch("/api/users", {
            cache: "no-store",
          }),
        ]);

        const [data, usersData] = await Promise.all([
          feedResponse.json(),
          usersResponse.json(),
        ]);

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

            const followingResponse = await fetch(`/api/users/${meData.user.id}/following`, {
              cache: "no-store",
            });

            if (followingResponse.ok) {
              const followingData = await followingResponse.json();
              if (followingData?.success && Array.isArray(followingData.following)) {
                setFollowedUserIds(
                  followingData.following
                    .map((item: FollowingItem) => item.following_id)
                    .filter((id: string | undefined): id is string => Boolean(id)),
                );
              }
            }

            if (usersResponse.ok && usersData?.success && Array.isArray(usersData.users)) {
              const mappedSuggestions = usersData.users
                .filter((user: SuggestedUser) => user.id !== meData.user.id)
                .slice(0, 8)
                .map((user: SuggestedUser) => ({
                  id: user.id,
                  username: user.username,
                  first_name: user.first_name,
                  last_name: user.last_name,
                  avatar_url: user.avatar_url,
                }));

              setSuggestedUsers(mappedSuggestions);
            }
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

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
      });
    } finally {
      router.push("/login");
      router.refresh();
      setLoggingOut(false);
    }
  }

  async function handleSuggestionFollow(targetUserId: string, currentlyFollowing: boolean) {
    if (!currentUser) {
      return;
    }

    setFollowingPendingId(targetUserId);

    try {
      const response = await fetch(`/api/users/${targetUserId}/follow`, {
        method: currentlyFollowing ? "DELETE" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          follower_id: currentUser.id,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data?.success) {
        return;
      }

      setFollowedUserIds((current) => {
        if (currentlyFollowing) {
          return current.filter((id) => id !== targetUserId);
        }

        if (current.includes(targetUserId)) {
          return current;
        }

        return [...current, targetUserId];
      });
    } finally {
      setFollowingPendingId(null);
    }
  }

  async function handleLikeToggle(postId: string) {
    if (!currentUser || likePendingPostIds.includes(postId)) {
      return;
    }

    const isLiked = likedPostIds.includes(postId);

    setLikePendingPostIds((current) => [...current, postId]);

    try {
      const response = await fetch(`/api/posts/${postId}/like`, {
        method: isLiked ? "DELETE" : "POST",
      });

      const data = await response.json();

      if (!response.ok || !data?.success) {
        if (!isLiked && response.status === 409) {
          setLikedPostIds((current) => (current.includes(postId) ? current : [...current, postId]));
        }
        return;
      }

      if (isLiked) {
        setLikedPostIds((current) => current.filter((id) => id !== postId));
        setPosts((currentPosts) =>
          currentPosts.map((post) =>
            post.id === postId
              ? { ...post, like_count: Math.max(post.like_count - 1, 0) }
              : post,
          ),
        );
      } else {
        setLikedPostIds((current) => (current.includes(postId) ? current : [...current, postId]));
        setPosts((currentPosts) =>
          currentPosts.map((post) =>
            post.id === postId ? { ...post, like_count: post.like_count + 1 } : post,
          ),
        );
      }
    } finally {
      setLikePendingPostIds((current) => current.filter((id) => id !== postId));
    }
  }

  return (
    <main className="min-h-screen bg-white text-slate-950">
      <div className="mx-auto grid w-full max-w-7xl gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
        {/* Left Sidebar */}
        <aside className="hidden border-r border-slate-200 py-6 lg:block">
          <div className="sticky top-0 space-y-6 px-4">
            {/* Logo */}
            <Link href="/feed" className="flex items-center gap-2">
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
              <button
                type="button"
                onClick={handleLogout}
                disabled={loggingOut}
                className="flex w-full items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 disabled:opacity-60"
              >
                {loggingOut ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4" />}
                {loggingOut ? "Logging out..." : "Logout"}
              </button>
            </nav>

            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Suggestions</p>
              <div className="mt-3 space-y-2">
                {suggestedUsers.length === 0 ? (
                  <p className="text-xs text-slate-500">No account suggestions yet</p>
                ) : (
                  suggestedUsers.map((user) => {
                    const fullName = `${user.first_name ?? ""} ${user.last_name ?? ""}`.trim() || "User";
                    const isFollowing = followedUserIds.includes(user.id);
                    const isPending = followingPendingId === user.id;

                    return (
                      <div
                        key={user.id}
                        className="flex items-center justify-between gap-2 rounded-lg bg-white px-2.5 py-2"
                      >
                        <Link href={`/profile/${user.id}`} className="flex min-w-0 items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={user.avatar_url ?? undefined} alt={fullName} />
                            <AvatarFallback className="text-[10px]">
                              {getInitials(user.first_name, user.last_name)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <p className="truncate text-xs font-medium text-slate-900">{fullName}</p>
                            <p className="truncate text-[11px] text-slate-500">@{user.username}</p>
                          </div>
                        </Link>

                        <Button
                          type="button"
                          variant={isFollowing ? "outline" : "default"}
                          size="sm"
                          className="h-7 rounded-md px-2 text-[11px]"
                          disabled={isPending || !currentUser}
                          onClick={() => handleSuggestionFollow(user.id, isFollowing)}
                        >
                          {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : isFollowing ? "Following" : "Follow"}
                        </Button>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
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
                {search.trim() ? (
                  <>
                    <p className="font-medium text-slate-950">No matching posts found</p>
                    <p className="text-sm text-slate-600">Try a different keyword for author, username, or post content</p>
                  </>
                ) : (
                  <>
                    <p className="font-medium text-slate-950">No posts yet</p>
                    <p className="text-sm text-slate-600">Start a conversation by creating the first post</p>
                    <Button asChild size="sm" className="rounded-lg">
                      <Link href="/create">Create a post</Link>
                    </Button>
                  </>
                )}
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
                  const isLiked = likedPostIds.includes(post.id);
                  const isLiking = likePendingPostIds.includes(post.id);

                  return (
                    <article
                      key={post.id}
                      className="block rounded-lg border border-slate-200 bg-white p-5 transition-all hover:border-slate-300 hover:shadow-sm"
                    >
                      <Link href={`/post/${post.id}`} className="block">
                        {/* Post Header */}
                        <div className="mb-3 flex gap-3">
                          <Avatar className="h-10 w-10 shrink-0">
                            <AvatarImage src={avatarSrc} alt={name} />
                            <AvatarFallback className="text-xs">
                              {getInitials(profile?.first_name, profile?.last_name)}
                            </AvatarFallback>
                          </Avatar>

                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-baseline gap-2">
                              <p className="text-sm font-semibold text-slate-950">{name}</p>
                              <p className="text-xs text-slate-500">{profile?.username ?? "@user"}</p>
                              <span className="text-slate-400">·</span>
                              <p className="text-xs text-slate-500">{formatTime(post.created_at)}</p>
                            </div>
                          </div>
                        </div>

                        {/* Post Content */}
                        <div className="space-y-3">
                          <p className="wrap-break-word whitespace-pre-line text-sm leading-6 text-slate-700">
                            {post.content}
                          </p>

                          {/* Image */}
                          {post.image_url ? (
                            <div className="mx-auto w-full max-w-xl overflow-hidden rounded-lg border border-slate-200 bg-slate-100">
                              <img
                                src={post.image_url}
                                alt="Post attachment"
                                className="aspect-square h-full w-full object-cover"
                              />
                            </div>
                          ) : null}
                        </div>
                      </Link>

                      <div className="mt-3 flex items-center gap-4 border-t border-slate-100 pt-3 text-xs text-slate-500">
                        <button
                          type="button"
                          onClick={() => handleLikeToggle(post.id)}
                          disabled={!currentUser || isLiking}
                          className={`inline-flex items-center gap-1.5 transition-colors ${
                            isLiked ? "text-red-500" : "hover:text-slate-700"
                          } disabled:opacity-60`}
                        >
                          {isLiking ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Heart className={`h-4 w-4 ${isLiked ? "fill-current" : ""}`} />
                          )}
                          <span>{post.like_count}</span>
                        </button>

                        <Link
                          href={`/post/${post.id}`}
                          className="inline-flex items-center gap-1.5 transition-colors hover:text-slate-700"
                        >
                          <MessageCircle className="h-4 w-4" />
                          <span>{post.comment_count}</span>
                        </Link>
                      </div>
                    </article>
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