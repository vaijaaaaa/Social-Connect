"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Feather, ShieldCheck, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          username,
          first_name: firstName,
          last_name: lastName,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setErrorMessage(data.message || "Registration failed");
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
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.98),rgba(241,245,249,0.96)_35%,rgba(226,232,240,1))] text-slate-950">
      <div className="mx-auto grid min-h-screen w-full max-w-6xl gap-6 px-4 py-4 lg:grid-cols-[0.95fr_1.05fr] lg:px-6">
        <aside className="hidden overflow-hidden rounded-[2rem] border border-slate-200 bg-white/80 shadow-xl backdrop-blur lg:flex lg:flex-col lg:justify-between">
          <div className="p-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-950 px-3 py-1 text-sm text-white">
              <Sparkles className="h-4 w-4" />
              SocialConnect
            </div>

            <div className="mt-10 space-y-5">
              <h1 className="max-w-lg text-5xl font-semibold tracking-tight text-slate-950">
                Create your profile and start sharing in minutes.
              </h1>
              <p className="max-w-xl text-lg leading-8 text-slate-600">
                Keep your profile clean, post text and images, and build a feed that feels calm and easy to scan.
              </p>
            </div>
          </div>

          <div className="grid gap-3 border-t border-slate-200 p-8 sm:grid-cols-3">
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
              <ShieldCheck className="h-5 w-5 text-slate-700" />
              <p className="mt-3 text-sm font-medium text-slate-950">Secure sessions</p>
              <p className="mt-1 text-sm text-slate-500">JWT cookies handled server-side.</p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
              <Feather className="h-5 w-5 text-slate-700" />
              <p className="mt-3 text-sm font-medium text-slate-950">Fast posting</p>
              <p className="mt-1 text-sm text-slate-500">Simple text and image uploads.</p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
              <Sparkles className="h-5 w-5 text-slate-700" />
              <p className="mt-3 text-sm font-medium text-slate-950">Minimal UI</p>
              <p className="mt-1 text-sm text-slate-500">A calm, focused social experience.</p>
            </div>
          </div>
        </aside>

        <section className="flex items-center justify-center py-8 lg:py-0">
          <Card className="w-full max-w-md border-white/70 bg-white/85 shadow-xl backdrop-blur">
            <CardHeader className="space-y-2 p-6 pb-0">
              <CardTitle className="text-3xl tracking-tight">Create account</CardTitle>
              <p className="text-sm text-slate-500">
                Register with your email, username, and a password to get started.
              </p>
            </CardHeader>

            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-600">Email</label>
                  <Input
                    type="email"
                    placeholder="Email"
                    autoComplete="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    required
                    className="h-11 rounded-full border-slate-200 bg-white px-4"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-600">Username</label>
                  <Input
                    placeholder="Username"
                    autoComplete="username"
                    value={username}
                    onChange={(event) => setUsername(event.target.value)}
                    required
                    className="h-11 rounded-full border-slate-200 bg-white px-4"
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-600">First name</label>
                    <Input
                      placeholder="First name"
                      autoComplete="given-name"
                      value={firstName}
                      onChange={(event) => setFirstName(event.target.value)}
                      required
                      className="h-11 rounded-full border-slate-200 bg-white px-4"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-600">Last name</label>
                    <Input
                      placeholder="Last name"
                      autoComplete="family-name"
                      value={lastName}
                      onChange={(event) => setLastName(event.target.value)}
                      required
                      className="h-11 rounded-full border-slate-200 bg-white px-4"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-600">Password</label>
                  <Input
                    type="password"
                    placeholder="Password (min 8 chars)"
                    autoComplete="new-password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    required
                    className="h-11 rounded-full border-slate-200 bg-white px-4"
                  />
                </div>

                {errorMessage ? (
                  <p className="text-sm text-red-600">{errorMessage}</p>
                ) : null}

                {successMessage ? (
                  <p className="text-sm text-emerald-600">{successMessage}</p>
                ) : null}

                <Button type="submit" className="h-11 w-full rounded-full px-5" disabled={loading}>
                  {loading ? (
                    "Creating account..."
                  ) : (
                    <>
                      Register
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>

              <p className="mt-6 text-center text-sm text-slate-500">
                Already have an account?{" "}
                <Link href="/login" className="font-medium text-slate-950 hover:underline">
                  Login instead
                </Link>
              </p>
            </CardContent>
          </Card>
        </section>
      </div>
    </main>
  );
}