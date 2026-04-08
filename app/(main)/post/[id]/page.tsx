"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Heart,
  Loader2,
  MessageCircle,
  Trash2,
  UserCheck,
  UserPlus,
} from "lucide-react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

type CurrentUser = {
  id: string;
  username: string;
  first_name: string;
  last_name: string;
  avatar_url: string | null;
};

type Post = {
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

type Comment = {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  profiles?: {
    id: string;
    username: string;
    avatar_url: string | null;
  } | null;
};

type PostDetail = Post & {
  profiles?: {
    id: string;
    username: string;
    first_name: string;
    last_name: string;
    avatar_url: string | null;
  } | null;
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

export default function PostDetailPage() {
  const params = useParams<{ id?: string | string[] }>();
  const router = useRouter();
  const postId = Array.isArray(params.id) ? params.id[0] : params.id;

  const [post, setPost] = useState<PostDetail | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [commentText, setCommentText] = useState("");
  const [postingComment, setPostingComment] = useState(false);
  const [liking, setLiking] = useState(false);
  const [liked, setLiked] = useState(false);
  const [followingAuthor, setFollowingAuthor] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [deletingPost, setDeletingPost] = useState(false);
  const [deletingCommentId, setDeletingCommentId] = useState<string | null>(null);

  const remainingChars = useMemo(() => 280 - commentText.length, [commentText]);

  useEffect(() => {
    if (!postId) {
      setError("Invalid post id");
      setLoading(false);
      return;
    }

    async function loadPage() {
      try {
        const [postResponse, commentsResponse, userResponse] = await Promise.all([
          fetch(`/api/posts/${postId}`, { cache: "no-store" }),
          fetch(`/api/posts/${postId}/comments`, { cache: "no-store" }),
          fetch("/api/users/me", { cache: "no-store" }),
        ]);

        const [postData, commentsData, userData] = await Promise.all([
          postResponse.json(),
          commentsResponse.json(),
          userResponse.json(),
        ]);

        if (!postResponse.ok || !postData.success) {
          setError(postData.message || "Unable to load post");
          return;
        }

        if (commentsResponse.ok && commentsData.success) {
          setComments(Array.isArray(commentsData.comments) ? commentsData.comments : []);
        }

        if (userResponse.ok && userData.success) {
          setCurrentUser(userData.user);

          const authorId = postData?.post?.author_id as string | undefined;
          if (authorId && userData.user.id && authorId !== userData.user.id) {
            const followingResponse = await fetch(`/api/users/${userData.user.id}/following`, {
              cache: "no-store",
            });

            if (followingResponse.ok) {
              const followingData = await followingResponse.json();
              if (followingData?.success && Array.isArray(followingData.following)) {
                const isFollowing = followingData.following.some(
                  (item: { following?: { id?: string } | null }) => item.following?.id === authorId,
                );
                setFollowingAuthor(isFollowing);
              }
            }
          }
        }

        setPost(postData.post);
      } catch {
        setError("Unable to load this post right now.");
      } finally {
        setLoading(false);
      }
    }

    loadPage();
  }, [postId]);

  async function handleFollowAuthor() {
    if (!post?.author_id || !currentUser || post.author_id === currentUser.id || followLoading) {
      return;
    }

    setFollowLoading(true);
    setError("");

    try {
      const response = await fetch(`/api/users/${post.author_id}/follow`, {
        method: followingAuthor ? "DELETE" : "POST",
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

      setFollowingAuthor((current) => !current);
    } catch {
      setError("Could not update follow state right now.");
    } finally {
      setFollowLoading(false);
    }
  }

  async function handleLike() {
    if (!postId || !currentUser || liking || liked) {
      return;
    }

    setLiking(true);
    setError("");

    try {
      const response = await fetch(`/api/posts/${postId}/like`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ user_id: currentUser.id }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.message || "Could not like post");
        return;
      }

      setLiked(true);
      setPost((current) =>
        current ? { ...current, like_count: current.like_count + 1 } : current,
      );
    } catch {
      setError("Could not like post right now.");
    } finally {
      setLiking(false);
    }
  }

  async function handleCommentSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!postId || !currentUser || !commentText.trim()) {
      return;
    }

    setPostingComment(true);
    setError("");

    try {
      const response = await fetch(`/api/posts/${postId}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: currentUser.id,
          content: commentText.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.message || "Could not add comment");
        return;
      }

      setComments((currentComments) => [data.comment, ...currentComments]);
      setPost((current) =>
        current ? { ...current, comment_count: current.comment_count + 1 } : current,
      );
      setCommentText("");
    } catch {
      setError("Could not add comment right now.");
    } finally {
      setPostingComment(false);
    }
  }

  async function handleDeletePost() {
    if (!postId || !currentUser || !post || post.author_id !== currentUser.id) {
      return;
    }

    if (!window.confirm("Delete this post? This cannot be undone.")) {
      return;
    }

    setDeletingPost(true);
    setError("");

    try {
      const response = await fetch(`/api/posts/${postId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.message || "Could not delete post");
        return;
      }

      router.push("/feed");
      router.refresh();
    } catch {
      setError("Could not delete post right now.");
    } finally {
      setDeletingPost(false);
    }
  }

  async function handleDeleteComment(commentId: string) {
    if (!postId || !currentUser || deletingCommentId) {
      return;
    }

    if (!window.confirm("Delete this comment?")) {
      return;
    }

    setDeletingCommentId(commentId);
    setError("");

    try {
      const response = await fetch(`/api/posts/${postId}/comments/${commentId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.message || "Could not delete comment");
        return;
      }

      setComments((currentComments) => currentComments.filter((comment) => comment.id !== commentId));
      setPost((current) =>
        current ? { ...current, comment_count: Math.max(current.comment_count - 1, 0) } : current,
      );
    } catch {
      setError("Could not delete comment right now.");
    } finally {
      setDeletingCommentId(null);
    }
  }

  const postAuthor = post?.profiles;
  const authorName = postAuthor ? `${postAuthor.first_name} ${postAuthor.last_name}`.trim() : "User";

  return (
    <main className="min-h-screen bg-white text-slate-950">
      <div className="mx-auto w-full max-w-2xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
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
              <p className="text-sm text-slate-600">Loading post...</p>
            </div>
          </div>
        ) : error && !post ? (
          <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center space-y-3">
            <p className="font-medium text-red-900">Unable to load post</p>
            <p className="text-sm text-red-700">{error}</p>
            <Button asChild variant="outline" size="sm" className="rounded-lg">
              <Link href="/feed">Return to feed</Link>
            </Button>
          </div>
        ) : post ? (
          <div className="space-y-6">
            {/* Post */}
            <article className="rounded-lg border border-slate-200 bg-white p-6 space-y-4">
              {/* Header */}
              <div className="flex items-start gap-4">
                <Avatar className="h-11 w-11 shrink-0">
                  <AvatarImage src={postAuthor?.avatar_url ?? undefined} alt={authorName} />
                  <AvatarFallback className="text-xs">
                    {initials(postAuthor?.first_name, postAuthor?.last_name)}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2 flex-wrap">
                    <p className="font-semibold text-sm text-slate-950">{authorName}</p>
                    <p className="text-xs text-slate-500">{postAuthor?.username ?? "@user"}</p>
                    <span className="text-slate-400">·</span>
                    <p className="text-xs text-slate-500">{formatDate(post.created_at)}</p>
                  </div>

                  {postAuthor?.id ? (
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <Button asChild variant="outline" size="sm" className="h-8 rounded-lg text-xs">
                        <Link href={`/profile/${postAuthor.id}`}>View profile</Link>
                      </Button>

                      {currentUser && currentUser.id !== postAuthor.id ? (
                        <Button
                          type="button"
                          variant={followingAuthor ? "outline" : "default"}
                          size="sm"
                          className="h-8 rounded-lg text-xs"
                          onClick={handleFollowAuthor}
                          disabled={followLoading}
                        >
                          {followLoading ? (
                            <>
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              Updating...
                            </>
                          ) : followingAuthor ? (
                            <>
                              <UserCheck className="h-3.5 w-3.5" />
                              Following
                            </>
                          ) : (
                            <>
                              <UserPlus className="h-3.5 w-3.5" />
                              Follow
                            </>
                          )}
                        </Button>
                      ) : null}

                      {currentUser && currentUser.id === postAuthor.id ? (
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="h-8 rounded-lg text-xs"
                          onClick={handleDeletePost}
                          disabled={deletingPost}
                        >
                          {deletingPost ? (
                            <>
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              Deleting...
                            </>
                          ) : (
                            <>
                              <Trash2 className="h-3.5 w-3.5" />
                              Delete post
                            </>
                          )}
                        </Button>
                      ) : null}
                    </div>
                  ) : null}
                </div>
              </div>

              {/* Content */}
              <p className="text-[15px] leading-7 text-slate-700 whitespace-pre-line wrap-break-word">
                {post.content}
              </p>

              {/* Image */}
              {post.image_url && (
                <div className="overflow-hidden rounded-lg border border-slate-200 bg-slate-100">
                  <img
                    src={post.image_url}
                    alt="Post attachment"
                    className="w-full max-h-96 object-cover"
                  />
                </div>
              )}

              {/* Stats & Actions */}
              <div className="space-y-4 border-t border-slate-200 pt-4">
                <div className="flex gap-6 text-xs text-slate-500 font-medium">
                  <span className="inline-flex items-center gap-1.5">
                    <Heart className="h-4 w-4" />
                    {post.like_count}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <MessageCircle className="h-4 w-4" />
                    {post.comment_count}
                  </span>
                </div>

                <div className="border-t border-slate-200 pt-4">
                  <Button
                    type="button"
                    variant={liked ? "default" : "outline"}
                    className="rounded-lg w-full"
                    onClick={handleLike}
                    disabled={liking || liked || !currentUser}
                  >
                    {liking ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Liking...
                      </>
                    ) : liked ? (
                      <>
                        <Heart className="h-4 w-4 fill-current" />
                        Liked
                      </>
                    ) : (
                      <>
                        <Heart className="h-4 w-4" />
                        Like this post
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </article>

            {/* Comment Form */}
            <div className="rounded-lg border border-slate-200 bg-white p-6 space-y-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Comments</p>
                <h2 className="mt-1 text-lg font-semibold tracking-tight">Join the discussion</h2>
              </div>

              <form onSubmit={handleCommentSubmit} className="space-y-3">
                <Textarea
                  value={commentText}
                  onChange={(event) => setCommentText(event.target.value.slice(0, 280))}
                  placeholder="What do you think?"
                  className="min-h-24 border-slate-300 bg-white rounded-lg"
                  required
                />

                {error && (
                  <div className="rounded-lg border border-red-200 bg-red-50 p-3">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <p className="text-xs text-slate-500">{remainingChars} characters left</p>
                  <Button 
                    type="submit" 
                    className="rounded-lg" 
                    disabled={postingComment || !commentText.trim()}
                    size="sm"
                  >
                    {postingComment ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Posting...
                      </>
                    ) : (
                      "Post comment"
                    )}
                  </Button>
                </div>
              </form>
            </div>

            {/* Comments List */}
            {comments.length === 0 ? (
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-8 text-center">
                <p className="text-sm text-slate-600">No comments yet. Be the first to reply.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {comments.map((comment) => {
                  const commentProfile = comment.profiles;
                  const isOwnComment = currentUser?.id === comment.user_id;
                  return (
                    <div key={comment.id} className="rounded-lg border border-slate-200 bg-white p-4 space-y-2">
                      <div className="flex items-start gap-3">
                        <Avatar className="h-8 w-8 shrink-0">
                          <AvatarImage src={commentProfile?.avatar_url ?? undefined} alt={commentProfile?.username ?? ""} />
                          <AvatarFallback className="text-xs">
                            {commentProfile?.username?.slice(0, 2).toUpperCase() ?? "SC"}
                          </AvatarFallback>
                        </Avatar>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-baseline gap-2 flex-wrap">
                            <p className="text-xs font-medium text-slate-950">@{commentProfile?.username ?? "user"}</p>
                            <span className="text-slate-400 text-xs">·</span>
                            <p className="text-xs text-slate-500">{formatDate(comment.created_at)}</p>
                          </div>
                          <p className="mt-1 text-sm leading-6 text-slate-700 whitespace-pre-line wrap-break-word">
                            {comment.content}
                          </p>
                        </div>

                        {isOwnComment ? (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-8 rounded-lg px-2 text-xs text-slate-500 hover:text-red-600"
                            onClick={() => handleDeleteComment(comment.id)}
                            disabled={deletingCommentId === comment.id}
                          >
                            {deletingCommentId === comment.id ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <Trash2 className="h-3.5 w-3.5" />
                            )}
                          </Button>
                        ) : null}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : null}
      </div>
    </main>
  );
}