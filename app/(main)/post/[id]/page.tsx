"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Heart,
  Loader2,
  MessageCircle,
  Send,
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

  const postAuthor = post?.profiles;
  const authorName = postAuthor ? `${postAuthor.first_name} ${postAuthor.last_name}`.trim() : "SocialConnect user";

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.96),rgba(241,245,249,0.92)_35%,rgba(226,232,240,1))] text-slate-950">
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
              <p className="text-sm text-slate-500">Post</p>
              <h1 className="text-2xl font-semibold tracking-tight">Conversation</h1>
            </div>
          </header>

          {loading ? (
            <Card className="border-white/70 bg-white/80 shadow-sm backdrop-blur">
              <CardContent className="flex min-h-72 items-center justify-center p-8 text-slate-500">
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Loading post...
              </CardContent>
            </Card>
          ) : error && !post ? (
            <Card className="border-white/70 bg-white/80 shadow-sm backdrop-blur">
              <CardContent className="space-y-4 p-8 text-center">
                <p className="text-lg font-medium text-slate-950">Unable to load post</p>
                <p className="text-sm text-slate-500">{error}</p>
                <Button asChild className="rounded-full">
                  <Link href="/feed">Return to feed</Link>
                </Button>
              </CardContent>
            </Card>
          ) : post ? (
            <>
              <Card className="overflow-hidden border-white/70 bg-white/85 shadow-sm backdrop-blur">
                <CardContent className="space-y-5 p-5 sm:p-6">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="size-11">
                        <AvatarImage src={postAuthor?.avatar_url ?? undefined} alt={authorName} />
                        <AvatarFallback>{initials(postAuthor?.first_name, postAuthor?.last_name)}</AvatarFallback>
                      </Avatar>

                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-semibold tracking-tight text-slate-950">{authorName}</p>
                          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-500">
                            {postAuthor?.username ?? "@user"}
                          </span>
                        </div>
                        <p className="text-sm text-slate-500">{formatDate(post.created_at)}</p>
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
                    <div className="overflow-hidden rounded-[1.75rem] border border-slate-200 bg-slate-100">
                      <img
                        src={post.image_url}
                        alt="Post attachment"
                        className="h-80 w-full object-cover"
                      />
                    </div>
                  ) : null}

                  <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-4">
                    <div className="flex items-center gap-5 text-sm text-slate-500">
                      <span className="inline-flex items-center gap-1.5">
                        <Heart className="h-4 w-4" /> {post.like_count}
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <MessageCircle className="h-4 w-4" /> {post.comment_count}
                      </span>
                    </div>

                    <Button
                      type="button"
                      variant="outline"
                      className="rounded-full px-5"
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
                          Like post
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-white/70 bg-white/85 shadow-sm backdrop-blur">
                <CardContent className="space-y-5 p-5 sm:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-500">Write a comment</p>
                      <h2 className="text-xl font-semibold tracking-tight">Join the discussion</h2>
                    </div>
                    <Sparkles className="h-5 w-5 text-slate-400" />
                  </div>

                  <form onSubmit={handleCommentSubmit} className="space-y-4">
                    <Textarea
                      value={commentText}
                      onChange={(event) => setCommentText(event.target.value.slice(0, 280))}
                      placeholder="Share a thoughtful reply..."
                      className="min-h-28 rounded-[1.5rem] border-slate-200 bg-white px-4 py-4 text-base"
                      required
                    />

                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span>{remainingChars} characters left</span>
                      <Button type="submit" className="rounded-full px-5" disabled={postingComment || !commentText.trim()}>
                        {postingComment ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Posting...
                          </>
                        ) : (
                          <>
                            <Send className="h-4 w-4" />
                            Comment
                          </>
                        )}
                      </Button>
                    </div>
                  </form>

                  {error ? <p className="text-sm text-red-600">{error}</p> : null}
                </CardContent>
              </Card>

              <div className="space-y-3">
                {comments.length === 0 ? (
                  <Card className="border-white/70 bg-white/80 shadow-sm backdrop-blur">
                    <CardContent className="p-8 text-center text-sm text-slate-500">
                      No comments yet. Be the first to reply.
                    </CardContent>
                  </Card>
                ) : (
                  comments.map((comment) => {
                    const commentProfile = comment.profiles;

                    return (
                      <Card key={comment.id} className="border-white/70 bg-white/85 shadow-sm backdrop-blur">
                        <CardContent className="space-y-4 p-5 sm:p-6">
                          <div className="flex items-center gap-3">
                            <Avatar className="size-9">
                              <AvatarImage src={commentProfile?.avatar_url ?? undefined} alt={commentProfile?.username ?? "Commenter"} />
                              <AvatarFallback>
                                {commentProfile?.username?.slice(0, 2).toUpperCase() ?? "SC"}
                              </AvatarFallback>
                            </Avatar>

                            <div>
                              <p className="text-sm font-medium text-slate-950">
                                @{commentProfile?.username ?? "user"}
                              </p>
                              <p className="text-xs text-slate-500">{formatDate(comment.created_at)}</p>
                            </div>
                          </div>

                          <p className="whitespace-pre-line text-sm leading-6 text-slate-700">
                            {comment.content}
                          </p>
                        </CardContent>
                      </Card>
                    );
                  })
                )}
              </div>
            </>
          ) : null}
        </section>

        <aside className="space-y-4">
          <Card className="border-white/70 bg-white/80 shadow-sm backdrop-blur">
            <CardContent className="space-y-4 p-5">
              <p className="text-sm text-slate-500">About this post</p>
              <div className="space-y-2 text-sm text-slate-600">
                <p className="rounded-2xl bg-slate-100 px-3 py-2">Likes and comments are stored separately</p>
                <p className="rounded-2xl bg-slate-100 px-3 py-2">The feed stays chronological by default</p>
                <p className="rounded-2xl bg-slate-100 px-3 py-2">This detail view is built for discussion</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-white/70 bg-white/80 shadow-sm backdrop-blur">
            <CardContent className="space-y-4 p-5">
              <p className="text-sm text-slate-500">Next steps</p>
              <div className="space-y-3 text-sm">
                <Link href="/create" className="block rounded-2xl bg-slate-100 px-3 py-2 text-slate-700 hover:bg-slate-200">
                  Create a new post
                </Link>
                <Link href="/feed" className="block rounded-2xl bg-slate-100 px-3 py-2 text-slate-700 hover:bg-slate-200">
                  Return to feed
                </Link>
                <Button asChild variant="ghost" className="h-auto w-full justify-start rounded-2xl bg-slate-100 px-3 py-2 text-sm text-slate-700 hover:bg-slate-200">
                  <Link href="/me">Open my profile</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </aside>
      </div>
    </main>
  );
}