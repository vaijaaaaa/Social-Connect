"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
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
    <main className="min-h-screen bg-[#f7f7f5] text-slate-950">
      <div className="mx-auto flex min-h-screen w-full max-w-6xl items-center justify-center px-4 py-10 sm:px-6 lg:px-8">
        <section className="w-full max-w-md rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-[0_18px_60px_rgba(15,23,42,0.06)] sm:p-8">
          <div className="space-y-2 text-center">
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 text-sm font-semibold tracking-tight text-slate-950"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-950 text-white">S</span>
              SocialConnect
            </Link>
            <h2 className="text-2xl font-semibold tracking-tight">Log in</h2>
            <p className="text-sm text-slate-600">Use your account to continue</p>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <div className="space-y-2">
              <label htmlFor="identifier" className="text-sm font-medium text-slate-700">
                Email or username
              </label>
              <Input
                id="identifier"
                type="text"
                placeholder="you@example.com"
                autoComplete="username"
                value={identifier}
                onChange={(event) => setIdentifier(event.target.value)}
                required
                className="h-11 rounded-xl border-slate-300 bg-white text-slate-950 placeholder:text-slate-400 focus-visible:ring-slate-300"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-slate-700">
                Password
              </label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                className="h-11 rounded-xl border-slate-300 bg-white text-slate-950 placeholder:text-slate-400 focus-visible:ring-slate-300"
              />
            </div>

            {errorMessage ? (
              <div className="rounded-xl border border-red-200 bg-red-50 p-3">
                <p className="text-sm text-red-700">{errorMessage}</p>
              </div>
            ) : null}

            <Button
              type="submit"
              disabled={loading}
              className="h-11 w-full rounded-xl bg-slate-950 text-white hover:bg-slate-800"
            >
              {loading ? "Logging in..." : "Log in"}
            </Button>
          </form>

          <div className="mt-6 border-t border-slate-200 pt-6 text-center">
            <p className="text-sm text-slate-600">
              Don't have an account?{" "}
              <Link href="/register" className="font-medium text-slate-950 hover:underline">
                Create one now
              </Link>
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}