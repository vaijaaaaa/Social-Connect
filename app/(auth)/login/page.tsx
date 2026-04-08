"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, MessageCircle, ShieldCheck, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  const router = useRouter();

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setErrorMessage("");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          identifier,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setErrorMessage(data.message || "Login failed");
        return;
      }

      router.push("/feed");
      router.refresh();
    } catch {
      setErrorMessage("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.98),rgba(241,245,249,0.96)_35%,rgba(226,232,240,1))] text-slate-950">
      <div className="mx-auto grid min-h-screen w-full max-w-6xl gap-6 px-4 py-4 lg:grid-cols-[1.05fr_0.95fr] lg:px-6">
        <aside className="hidden overflow-hidden rounded-[2rem] border border-slate-200 bg-slate-950 text-white shadow-2xl lg:flex lg:flex-col lg:justify-between">
          <div className="p-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm text-white/80">
              <Sparkles className="h-4 w-4" />
              SocialConnect
            </div>

            <div className="mt-10 space-y-5">
              <h1 className="max-w-lg text-5xl font-semibold tracking-tight">
                Log in to a clean, focused social space.
              </h1>
              <p className="max-w-xl text-lg leading-8 text-white/70">
                Pick up your feed, reply to conversations, and keep your profile up to date in a minimal interface.
              </p>
            </div>
          </div>

          <div className="grid gap-3 border-t border-white/10 p-8 sm:grid-cols-3">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
              <ShieldCheck className="h-5 w-5 text-white/80" />
              <p className="mt-3 text-sm font-medium">JWT auth</p>
              <p className="mt-1 text-sm text-white/60">Secure cookie-based sessions.</p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
              <MessageCircle className="h-5 w-5 text-white/80" />
              <p className="mt-3 text-sm font-medium">Real conversations</p>
              <p className="mt-1 text-sm text-white/60">Comments, likes, and social replies.</p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
              <Sparkles className="h-5 w-5 text-white/80" />
              <p className="mt-3 text-sm font-medium">Minimal UI</p>
              <p className="mt-1 text-sm text-white/60">Focused on clarity and speed.</p>
            </div>
          </div>
        </aside>

        <section className="flex items-center justify-center py-8 lg:py-0">
          <Card className="w-full max-w-md border-white/70 bg-white/85 shadow-xl backdrop-blur">
            <CardHeader className="space-y-2 p-6 pb-0">
              <CardTitle className="text-3xl tracking-tight">Welcome back</CardTitle>
              <p className="text-sm text-slate-500">
                Enter your email or username and continue to your feed.
              </p>
            </CardHeader>

            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-600">Email or username</label>
                  <Input
                    placeholder="Email or Username"
                    autoComplete="username"
                    value={identifier}
                    onChange={(event) => setIdentifier(event.target.value)}
                    required
                    className="h-11 rounded-full border-slate-200 bg-white px-4"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-600">Password</label>
                  <Input
                    type="password"
                    placeholder="Password"
                    autoComplete="current-password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    required
                    className="h-11 rounded-full border-slate-200 bg-white px-4"
                  />
                </div>

                {errorMessage ? (
                  <p className="text-sm text-red-600">{errorMessage}</p>
                ) : null}

                <Button type="submit" className="h-11 w-full rounded-full px-5" disabled={loading}>
                  {loading ? (
                    "Logging in..."
                  ) : (
                    <>
                      Login
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>

              <p className="mt-6 text-center text-sm text-slate-500">
                New here?{" "}
                <Link href="/register" className="font-medium text-slate-950 hover:underline">
                  Create an account
                </Link>
              </p>
            </CardContent>
          </Card>
        </section>
      </div>
    </main>
  );
}