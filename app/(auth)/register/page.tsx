"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function RegisterPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    const normalizedUsername = username.trim().replace(/^@+/, "");

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
          username: normalizedUsername,
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        const fieldErrors = data?.errors?.fieldErrors as Record<string, string[]> | undefined;
        const firstFieldError = fieldErrors
          ? Object.values(fieldErrors).find((messages) => Array.isArray(messages) && messages.length > 0)?.[0]
          : undefined;

        setErrorMessage(firstFieldError || data.message || "Registration failed");
        return;
      }

      setSuccessMessage("Registration successful. You can login now.");
      setEmail("");
      setUsername("");
      setFirstName("");
      setLastName("");
      setPassword("");

      setTimeout(() => {
        router.push("/login");
      }, 800);
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
            <h2 className="text-2xl font-semibold tracking-tight">Create account</h2>
            <p className="text-sm text-slate-600">Sign up to start sharing</p>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-slate-700">
                Email address
              </label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                className="h-11 rounded-xl border-slate-300 bg-white text-slate-950 placeholder:text-slate-400 focus-visible:ring-slate-300"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="username" className="text-sm font-medium text-slate-700">
                Username
              </label>
              <Input
                id="username"
                type="text"
                placeholder="yourname"
                autoComplete="username"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                required
                className="h-11 rounded-xl border-slate-300 bg-white text-slate-950 placeholder:text-slate-400 focus-visible:ring-slate-300"
              />
              <p className="text-xs text-slate-500">Letters, numbers, underscore only. You can type with or without @.</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <label htmlFor="firstName" className="text-sm font-medium text-slate-700">
                  First name
                </label>
                <Input
                  id="firstName"
                  type="text"
                  placeholder="First"
                  autoComplete="given-name"
                  value={firstName}
                  onChange={(event) => setFirstName(event.target.value)}
                  required
                  className="h-11 rounded-xl border-slate-300 bg-white text-slate-950 placeholder:text-slate-400 focus-visible:ring-slate-300"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="lastName" className="text-sm font-medium text-slate-700">
                  Last name
                </label>
                <Input
                  id="lastName"
                  type="text"
                  placeholder="Last"
                  autoComplete="family-name"
                  value={lastName}
                  onChange={(event) => setLastName(event.target.value)}
                  required
                  className="h-11 rounded-xl border-slate-300 bg-white text-slate-950 placeholder:text-slate-400 focus-visible:ring-slate-300"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-slate-700">
                Password
              </label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                autoComplete="new-password"
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

            {successMessage ? (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3">
                <p className="text-sm text-emerald-700">{successMessage}</p>
              </div>
            ) : null}

            <Button
              type="submit"
              disabled={loading}
              className="h-11 w-full rounded-xl bg-slate-950 text-white hover:bg-slate-800"
            >
              {loading ? "Creating account..." : "Create account"}
            </Button>
          </form>

          <div className="mt-6 border-t border-slate-200 pt-6 text-center">
            <p className="text-sm text-slate-600">
              Already have an account?{" "}
              <Link href="/login" className="font-medium text-slate-950 hover:underline">
                Log in instead
              </Link>
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}