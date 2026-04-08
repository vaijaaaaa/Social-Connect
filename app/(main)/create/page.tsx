"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ImageIcon,
  Loader2,
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

export default function CreatePostPage() {
  const router = useRouter();

  const [user, setUser] = useState<CurrentUser | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
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

  async function handleImageUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    setUploadingImage(true);
    setError("");
    setMessage("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/posts/image", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.message || "Could not upload image");
        return;
      }

      setImageUrl(data.image_url);
      setMessage("Image uploaded successfully.");
    } catch {
      setError("Could not upload image right now.");
    } finally {
      event.target.value = "";
      setUploadingImage(false);
    }
  }

  const initials = `${user?.first_name?.[0] ?? "S"}${user?.last_name?.[0] ?? "C"}`.toUpperCase();

  return (
    <main className="min-h-screen bg-white text-slate-950">
      <div className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Create</p>
            <h1 className="text-3xl font-semibold tracking-tight">New post</h1>
          </div>
          <Button asChild variant="outline" className="rounded-lg" size="sm">
            <Link href="/feed">Back</Link>
          </Button>
        </div>

        {loadingUser ? (
          <div className="flex items-center justify-center rounded-lg border border-slate-200 bg-slate-50 py-20">
            <div className="text-center space-y-3">
              <Loader2 className="h-6 w-6 animate-spin text-slate-400 mx-auto" />
              <p className="text-sm text-slate-600">Loading your profile...</p>
            </div>
          </div>
        ) : error && !user ? (
          <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center space-y-3">
            <p className="font-medium text-red-900">Unable to open composer</p>
            <p className="text-sm text-red-700">{error}</p>
            <Button asChild variant="outline" size="sm" className="rounded-lg">
              <Link href="/login">Go to login</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Author info */}
            <div className="flex items-center gap-3">
              <Avatar className="h-11 w-11 shrink-0">
                <AvatarImage src={user?.avatar_url ?? undefined} alt={user?.username ?? "SocialConnect user"} />
                <AvatarFallback className="text-xs">{initials}</AvatarFallback>
              </Avatar>

              <div>
                <p className="font-semibold text-sm text-slate-950">
                  {user ? `${user.first_name} ${user.last_name}`.trim() : "SocialConnect user"}
                </p>
                <p className="text-xs text-slate-500">{user?.username ? `@${user.username}` : "Ready to post"}</p>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Textarea
                  value={content}
                  onChange={(event) => setContent(event.target.value.slice(0, 280))}
                  placeholder="What's on your mind?"
                  className="min-h-32 border-slate-300 bg-white rounded-lg text-base placeholder:text-slate-400"
                  required
                />
                <div className="flex items-center justify-between px-1">
                  <p className="text-xs text-slate-500">{remainingChars} characters left</p>
                  <p className="text-xs font-medium text-slate-500">280 max</p>
                </div>
              </div>

              {/* Image URL input */}
              <div className="space-y-2">
                <label htmlFor="imageUrl" className="flex items-center gap-2 text-sm font-medium text-slate-700">
                  <ImageIcon className="h-4 w-4" />
                  Image URL (optional)
                </label>
                <Input
                  id="imageUrl"
                  value={imageUrl}
                  onChange={(event) => setImageUrl(event.target.value)}
                  placeholder="https://example.com/image.jpg"
                  className="h-10 border-slate-300 bg-white rounded-lg"
                />
                <div className="flex flex-wrap items-center gap-3">
                  <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50">
                    {uploadingImage ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Upload className="h-3.5 w-3.5" />
                    )}
                    {uploadingImage ? "Uploading..." : "Upload image"}
                    <input
                      type="file"
                      accept="image/jpeg,image/png"
                      className="hidden"
                      onChange={handleImageUpload}
                      disabled={uploadingImage}
                    />
                  </label>
                  <p className="text-xs text-slate-500">Max 2MB. JPG or PNG only.</p>
                </div>
              </div>

              {/* Messages */}
              {message ? (
                <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3">
                  <p className="text-sm text-emerald-700">{message}</p>
                </div>
              ) : null}
              {error ? (
                <div className="rounded-lg border border-red-200 bg-red-50 p-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              ) : null}

              {/* Preview */}
              {content || imageUrl ? (
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 space-y-3">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Preview</p>
                  <div className="rounded-lg bg-white border border-slate-200 p-4 space-y-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9 shrink-0">
                        <AvatarImage src={user?.avatar_url ?? undefined} alt={user?.username ?? ""} />
                        <AvatarFallback className="text-xs">{initials}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-semibold text-slate-950">
                          {user ? `${user.first_name} ${user.last_name}`.trim() : "Your profile"}
                        </p>
                        <p className="text-xs text-slate-500">{user?.username ? `@${user.username}` : "@handle"}</p>
                      </div>
                    </div>

                    {content && (
                      <p className="text-sm leading-6 text-slate-700 whitespace-pre-line wrap-break-word">
                        {content}
                      </p>
                    )}

                    {imageUrl && (
                      <div className="overflow-hidden rounded-lg border border-slate-200 bg-slate-100">
                        <img src={imageUrl} alt="Preview" className="h-48 w-full object-cover" />
                      </div>
                    )}
                  </div>
                </div>
              ) : null}

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-slate-200">
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
                  disabled={submitting || uploadingImage || !content.trim()}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Publishing...
                    </>
                  ) : (
                    "Publish post"
                  )}
                </Button>
              </div>
            </form>
          </div>
        )}
      </div>
    </main>
  );
}