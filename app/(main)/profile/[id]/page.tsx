"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Check,
  Heart,
  Loader2,
  MapPin,
  MessageCircle,
  Plus,
  Sparkles,
} from "lucide-react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type Profile = {
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
};

type FollowItem = {
  id: string;
  created_at: string;
  follower_id?: string;
  following_id?: string;
  follower?: Profile | null;
  following?: Profile | null;
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function initials(firstName?: string, lastName?: string) {
  const first = firstName?.[0] ?? "S";
  const last = lastName?.[0] ?? "C";

  return `${first}${last}`.toUpperCase();
}

export default function PublicProfilePage() {
  const params = useParams<{ id?: string | string[] }>();
  const profileId = Array.isArray(params.id) ? params.id[0] : params.id;

  const [profile, setProfile] = useState<Profile | null>(null);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [followers, setFollowers] = useState<FollowItem[]>([]);
  const [following, setFollowing] = useState<FollowItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [followLoading, setFollowLoading] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);

  useEffect(() => {
    if (!profileId) {
      setError("Invalid profile id");
      setLoading(false);
      return;
    }

    async function loadProfile() {
      try {
        const [profileResponse, postsResponse, followersResponse, followingResponse, userResponse] =
          await Promise.all([
            fetch(`/api/users/${profileId}`, { cache: "no-store" }),
            fetch("/api/posts", { cache: "no-store" }),
            fetch(`/api/users/${profileId}/followers`, { cache: "no-store" }),
            fetch(`/api/users/${profileId}/following`, { cache: "no-store" }),
            fetch("/api/users/me", { cache: "no-store" }),
          ]);

        const [profileData, postsData, followersData, followingData, userData] = await Promise.all([
          profileResponse.json(),
          postsResponse.json(),
          followersResponse.json(),
          followingResponse.json(),
          userResponse.json(),
        ]);

        if (!profileResponse.ok || !profileData.success) {
          setError(profileData.message || "Unable to load profile");
          return;
        }

        setProfile(profileData.user);

        if (postsResponse.ok && postsData.success) {
          setPosts(
            Array.isArray(postsData.posts)
              ? postsData.posts.filter((post: FeedPost) => post.author_id === profileId)
              : [],
          );
        }

        if (followersResponse.ok && followersData.success) {
          setFollowers(Array.isArray(followersData.followers) ? followersData.followers : []);
        }

        if (followingResponse.ok && followingData.success) {
          setFollowing(Array.isArray(followingData.following) ? followingData.following : []);
        }

        if (userResponse.ok && userData.success) {
          setCurrentUser(userData.user);

          if (Array.isArray(userData.user?.id) || userData.user?.id) {
            const currentFollowingResponse = await fetch(`/api/users/${userData.user.id}/following`, {
              cache: "no-store",
            });

            const currentFollowingData = await currentFollowingResponse.json();

            if (currentFollowingResponse.ok && currentFollowingData.success) {
              const alreadyFollowing = Array.isArray(currentFollowingData.following)
                ? currentFollowingData.following.some(
                    (item: FollowItem) => item.following?.id === profileId,
                  )
                : false;

              setIsFollowing(alreadyFollowing);
            }
          }
        }
      } catch {
        setError("Unable to load this profile right now.");
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [profileId]);

  const profileName = profile ? `${profile.first_name} ${profile.last_name}`.trim() : "SocialConnect user";
  const profilePosts = useMemo(() => posts, [posts]);

  async function handleFollowToggle() {
    if (!profileId || !currentUser || currentUser.id === profileId) {
      return;
    }

    setFollowLoading(true);
    setError("");

    try {
      const response = await fetch(`/api/users/${profileId}/follow`, {
        method: isFollowing ? "DELETE" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ follower_id: currentUser.id }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.message || "Could not update follow state");
        return;
      }

      setIsFollowing(!isFollowing);

      if (isFollowing) {
        setFollowers((current) => current.filter((item) => item.follower_id !== currentUser.id));
      } else {
        setFollowers((current) => [
          {
            id: data.follow.id,
            created_at: data.follow.created_at,
            follower_id: currentUser.id,
            following_id: profileId,
          },
          ...current,
        ]);
      }
    } catch {
      setError("Could not update follow state right now.");
    } finally {
      setFollowLoading(false);
    }
  }

  const initialsText = `${profile?.first_name?.[0] ?? "S"}${profile?.last_name?.[0] ?? "C"}`.toUpperCase();

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.96),rgba(241,245,249,0.92)_35%,rgba(226,232,240,1))] text-slate-950">
      <div className="mx-auto grid min-h-screen w-full max-w-6xl gap-6 px-4 py-4 lg:grid-cols-[1fr_320px] lg:px-6">
        <section className="space-y-6">
          <header className="flex items-center justify-between rounded-[2rem] border border-white/70 bg-white/80 p-5 shadow-sm backdrop-blur">
            <Button asChild variant="ghost" className="rounded-full px-4">
              <Link href="/feed">
                <ArrowLeft className="h-4 w-4" />
                Back
              </Link>
            </Button>

            <div className="text-right">
              <p className="text-sm text-slate-500">Profile</p>
              <h1 className="text-2xl font-semibold tracking-tight">Public view</h1>
            </div>
          </header>

          {loading ? (
            <Card className="border-white/70 bg-white/80 shadow-sm backdrop-blur">
              <CardContent className="flex min-h-72 items-center justify-center p-8 text-slate-500">
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Loading profile...
              </CardContent>
            </Card>
          ) : error && !profile ? (
            <Card className="border-white/70 bg-white/80 shadow-sm backdrop-blur">
              <CardContent className="space-y-4 p-8 text-center">
                <p className="text-lg font-medium text-slate-950">Unable to load profile</p>
                <p className="text-sm text-slate-500">{error}</p>
                <Button asChild className="rounded-full">
                  <Link href="/feed">Return to feed</Link>
                </Button>
              </CardContent>
            </Card>
          ) : profile ? (
            <>
              <Card className="border-white/70 bg-white/85 shadow-sm backdrop-blur">
                <CardContent className="space-y-5 p-5 sm:p-6">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex items-start gap-3">
                      <Avatar className="size-16">
                        <AvatarImage src={profile.avatar_url ?? undefined} alt={profile.username} />
                        <AvatarFallback>{initialsText}</AvatarFallback>
                      </Avatar>

                      <div className="space-y-2">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="text-2xl font-semibold tracking-tight text-slate-950">{profileName}</p>
                            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-500">
                              @{profile.username}
                            </span>
                          </div>
                          <p className="text-sm text-slate-500">Joined {formatDate(profile.created_at)}</p>
                        </div>

                        <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600">
                          {profile.location ? (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1">
                              <MapPin className="h-4 w-4" /> {profile.location}
                            </span>
                          ) : null}
                          {profile.website ? (
                            <a
                              href={profile.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 hover:bg-slate-200"
                            >
                              <Sparkles className="h-4 w-4" /> Website
                            </a>
                          ) : null}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-start gap-3 sm:items-end">
                      {currentUser && currentUser.id !== profile.id ? (
                        <Button
                          type="button"
                          onClick={handleFollowToggle}
                          disabled={followLoading}
                          className="rounded-full px-5"
                          variant={isFollowing ? "outline" : "default"}
                        >
                          {followLoading ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Updating...
                            </>
                          ) : isFollowing ? (
                            <>
                              <Check className="h-4 w-4" />
                              Following
                            </>
                          ) : (
                            <>
                              <Plus className="h-4 w-4" />
                              Follow
                            </>
                          )}
                        </Button>
                      ) : null}

                      <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                        Public profile
                      </div>
                    </div>
                  </div>

                  {profile.bio ? (
                    <p className="max-w-3xl text-[15px] leading-7 text-slate-700">{profile.bio}</p>
                  ) : (
                    <p className="max-w-3xl text-[15px] leading-7 text-slate-500">
                      This user has not written a bio yet.
                    </p>
                  )}

                  <div className="grid gap-4 sm:grid-cols-3">
                    <Card size="sm" className="border-slate-200 bg-slate-50">
                      <CardContent className="p-4">
                        <p className="text-2xl font-semibold tracking-tight">{profilePosts.length}</p>
                        <p className="text-sm text-slate-500">Posts</p>
                      </CardContent>
                    </Card>
                    <Card size="sm" className="border-slate-200 bg-slate-50">
                      <CardContent className="p-4">
                        <p className="text-2xl font-semibold tracking-tight">{followers.length}</p>
                        <p className="text-sm text-slate-500">Followers</p>
                      </CardContent>
                    </Card>
                    <Card size="sm" className="border-slate-200 bg-slate-50">
                      <CardContent className="p-4">
                        <p className="text-2xl font-semibold tracking-tight">{following.length}</p>
                        <p className="text-sm text-slate-500">Following</p>
                      </CardContent>
                    </Card>
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-4">
                <div className="flex items-center justify-between px-1">
                  <div>
                    <p className="text-sm text-slate-500">Recent posts</p>
                    <h2 className="text-xl font-semibold tracking-tight">From {profile.first_name}</h2>
                  </div>
                </div>

                {profilePosts.length === 0 ? (
                  <Card className="border-white/70 bg-white/80 shadow-sm backdrop-blur">
                    <CardContent className="space-y-4 p-8 text-center">
                      <p className="text-lg font-medium text-slate-950">No posts yet</p>
                      <p className="text-sm text-slate-500">
                        This creator has not shared anything publicly yet.
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  profilePosts.map((post) => (
                    <Card key={post.id} className="overflow-hidden border-white/70 bg-white/85 shadow-sm backdrop-blur">
                      <CardContent className="space-y-4 p-5 sm:p-6">
                        <div className="flex items-center justify-between gap-3 text-sm text-slate-500">
                          <span>{formatDate(post.created_at)}</span>
                          <Link href={`/post/${post.id}`} className="font-medium text-slate-950 hover:underline">
                            Open post
                          </Link>
                        </div>

                        <p className="whitespace-pre-line text-[15px] leading-7 text-slate-700">
                          {post.content}
                        </p>

                        {post.image_url ? (
                          <div className="overflow-hidden rounded-[1.5rem] border border-slate-200 bg-slate-100">
                            <img src={post.image_url} alt="Post attachment" className="h-80 w-full object-cover" />
                          </div>
                        ) : null}

                        <div className="flex items-center gap-5 border-t border-slate-200 pt-4 text-sm text-slate-500">
                          <span className="inline-flex items-center gap-1.5">
                            <Heart className="h-4 w-4" /> {post.like_count}
                          </span>
                          <span className="inline-flex items-center gap-1.5">
                            <MessageCircle className="h-4 w-4" /> {post.comment_count}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
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
                  <p className="text-sm font-medium text-slate-950">Profile insights</p>
                  <p className="text-xs text-slate-500">Public identity and activity</p>
                </div>
              </div>

              <div className="space-y-2 text-sm text-slate-600">
                <div className="rounded-2xl bg-slate-100 px-3 py-2">Followers and following are stored separately</div>
                <div className="rounded-2xl bg-slate-100 px-3 py-2">Posts are filtered from the global feed</div>
                <div className="rounded-2xl bg-slate-100 px-3 py-2">Follow state updates in real time</div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-white/70 bg-white/80 shadow-sm backdrop-blur">
            <CardContent className="space-y-4 p-5">
              <p className="text-sm font-medium text-slate-500">Navigation</p>
              <div className="space-y-3 text-sm">
                <Link href="/feed" className="block rounded-2xl bg-slate-100 px-3 py-2 text-slate-700 hover:bg-slate-200">
                  Back to feed
                </Link>
                <Link href="/me" className="block rounded-2xl bg-slate-100 px-3 py-2 text-slate-700 hover:bg-slate-200">
                  Edit my profile
                </Link>
                <Link href="/create" className="block rounded-2xl bg-slate-100 px-3 py-2 text-slate-700 hover:bg-slate-200">
                  Create a post
                </Link>
              </div>
            </CardContent>
          </Card>
        </aside>
      </div>
    </main>
  );
}