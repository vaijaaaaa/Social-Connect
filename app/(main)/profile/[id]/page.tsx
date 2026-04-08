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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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
  const [listDialogOpen, setListDialogOpen] = useState(false);
  const [activeList, setActiveList] = useState<"followers" | "following" | null>(null);

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
  const activeListItems = activeList === "followers" ? followers : activeList === "following" ? following : [];
  const activeListTitle = activeList === "followers" ? "Followers" : activeList === "following" ? "Following" : "People";

  function openListDialog(listType: "followers" | "following") {
    setActiveList(listType);
    setListDialogOpen(true);
  }

  function renderUserName(item: FollowItem) {
    const profileData = activeList === "followers" ? item.follower : item.following;
    return `${profileData?.first_name ?? ""} ${profileData?.last_name ?? ""}`.trim() || "SocialConnect user";
  }

  function renderUserHandle(item: FollowItem) {
    const profileData = activeList === "followers" ? item.follower : item.following;
    return profileData?.username ?? "user";
  }

  function renderUserAvatar(item: FollowItem) {
    const profileData = activeList === "followers" ? item.follower : item.following;
    return profileData?.avatar_url ?? undefined;
  }

  function renderUserHref(item: FollowItem) {
    const profileData = activeList === "followers" ? item.follower : item.following;
    return profileData?.id ? `/profile/${profileData.id}` : "/feed";
  }

  return (
    <main className="min-h-screen bg-white text-slate-950">
      <div className="mx-auto w-full max-w-2xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <Button asChild variant="ghost" className="rounded-lg px-3 h-10" size="sm">
            <Link href="/feed">
              <ArrowLeft className="h-4 w-4" />
              <span className="ml-2">Back</span>
            </Link>
          </Button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center rounded-lg border border-slate-200 bg-slate-50 py-24">
            <div className="text-center space-y-3">
              <Loader2 className="h-6 w-6 animate-spin text-slate-400 mx-auto" />
              <p className="text-sm text-slate-600">Loading profile...</p>
            </div>
          </div>
        ) : error && !profile ? (
          <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center space-y-3">
            <p className="font-medium text-red-900">Unable to load profile</p>
            <p className="text-sm text-red-700">{error}</p>
            <Button asChild variant="outline" size="sm" className="rounded-lg">
              <Link href="/feed">Return to feed</Link>
            </Button>
          </div>
        ) : profile ? (
          <div className="space-y-8">
            {/* Profile Header */}
            <div className="border-b border-slate-200 pb-8 space-y-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <Avatar className="h-16 w-16 shrink-0">
                    <AvatarImage src={profile.avatar_url ?? undefined} alt={profile.username} />
                    <AvatarFallback className="text-lg font-semibold">{initialsText}</AvatarFallback>
                  </Avatar>

                  <div className="space-y-2">
                    <div className="space-y-1">
                      <h1 className="text-2xl font-semibold tracking-tight">{profileName}</h1>
                      <p className="text-sm text-slate-600">@{profile.username}</p>
                    </div>
                    <p className="text-xs text-slate-500">Joined {formatDate(profile.created_at)}</p>

                    {/* Tags */}
                    {(profile.location || profile.website) && (
                      <div className="flex flex-wrap gap-2 pt-2">
                        {profile.location && (
                          <span className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs text-slate-600">
                            <MapPin className="h-3 w-3" />
                            {profile.location}
                          </span>
                        )}
                        {profile.website && (
                          <a
                            href={profile.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs text-slate-600 hover:border-slate-300 hover:bg-white"
                          >
                            <Sparkles className="h-3 w-3" />
                            Website
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Follow Button */}
                {currentUser && currentUser.id !== profile.id ? (
                  <Button
                    type="button"
                    onClick={handleFollowToggle}
                    disabled={followLoading}
                    className="rounded-lg"
                    variant={isFollowing ? "outline" : "default"}
                    size="sm"
                  >
                    {followLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
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
              </div>

              {/* Bio */}
              {profile.bio && (
                <p className="text-sm leading-6 text-slate-700">{profile.bio}</p>
              )}

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4">
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-center space-y-1">
                  <p className="text-lg font-semibold">{profilePosts.length}</p>
                  <p className="text-xs text-slate-600">Posts</p>
                </div>
                <button
                  type="button"
                  onClick={() => openListDialog("followers")}
                  className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-center space-y-1 transition-colors hover:border-slate-300 hover:bg-white"
                >
                  <p className="text-lg font-semibold">{followers.length}</p>
                  <p className="text-xs text-slate-600">Followers</p>
                </button>
                <button
                  type="button"
                  onClick={() => openListDialog("following")}
                  className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-center space-y-1 transition-colors hover:border-slate-300 hover:bg-white"
                >
                  <p className="text-lg font-semibold">{following.length}</p>
                  <p className="text-xs text-slate-600">Following</p>
                </button>
              </div>
            </div>

            {/* Posts */}
            <div className="space-y-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Posts</p>
                <h2 className="mt-1 text-lg font-semibold tracking-tight">Recent activity</h2>
              </div>

              {profilePosts.length === 0 ? (
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-8 text-center">
                  <p className="font-medium text-slate-950">No posts yet</p>
                  <p className="mt-1 text-sm text-slate-600">This user hasn't shared anything publicly</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {profilePosts.map((post) => (
                    <Link
                      key={post.id}
                      href={`/post/${post.id}`}
                      className="block rounded-lg border border-slate-200 bg-white p-4 transition-all hover:border-slate-300 hover:shadow-sm"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <p className="text-xs text-slate-500">{formatDate(post.created_at)}</p>
                      </div>

                      <p className="text-sm leading-6 text-slate-700 whitespace-pre-line wrap-break-word mb-3">
                        {post.content}
                      </p>

                      {post.image_url && (
                        <div className="overflow-hidden rounded-lg border border-slate-200 bg-slate-100 mb-3">
                          <img src={post.image_url} alt="Post" className="h-48 w-full object-cover" />
                        </div>
                      )}

                      <div className="flex gap-4 pt-3 border-t border-slate-100 text-xs text-slate-500">
                        <span className="inline-flex items-center gap-1.5">
                          <Heart className="h-3.5 w-3.5" />
                          {post.like_count}
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                          <MessageCircle className="h-3.5 w-3.5" />
                          {post.comment_count}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : null}

        <Dialog open={listDialogOpen} onOpenChange={setListDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{activeListTitle}</DialogTitle>
            </DialogHeader>

            <div className="max-h-[60vh] space-y-3 overflow-y-auto pr-1">
              {activeListItems.length === 0 ? (
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-center">
                  <p className="text-sm text-slate-600">No {activeListTitle.toLowerCase()} yet.</p>
                </div>
              ) : (
                activeListItems.map((item) => {
                  const userName = renderUserName(item);
                  const userHandle = renderUserHandle(item);
                  const avatarUrl = renderUserAvatar(item);
                  const href = renderUserHref(item);

                  return (
                    <Link
                      key={item.id}
                      href={href}
                      onClick={() => setListDialogOpen(false)}
                      className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-3 transition-colors hover:border-slate-300 hover:bg-slate-50"
                    >
                      <Avatar className="h-10 w-10 shrink-0">
                        <AvatarImage src={avatarUrl} alt={userHandle} />
                        <AvatarFallback className="text-xs">
                          {userName
                            .split(" ")
                            .slice(0, 2)
                            .map((part) => part[0])
                            .join("")
                            .toUpperCase()}
                        </AvatarFallback>
                      </Avatar>

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-slate-950">{userName}</p>
                        <p className="truncate text-xs text-slate-500">@{userHandle}</p>
                      </div>
                    </Link>
                  );
                })
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </main>
  );
}