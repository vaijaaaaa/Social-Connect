import Link from "next/link";
import { ArrowRight, Heart, MessageCircle, Sparkles, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const stats = [
  { label: "Creators joined", value: "18k+" },
  { label: "Posts shared daily", value: "240k" },
  { label: "Average engagement", value: "4.8x" },
];

const features = [
  {
    icon: Sparkles,
    title: "Clean posting flow",
    description:
      "Share text posts, attach a single image, and keep the experience focused and fast.",
  },
  {
    icon: Users,
    title: "Profiles that feel personal",
    description:
      "Simple profile cards with avatar, bio, website, and social counts for quick discovery.",
  },
  {
    icon: Heart,
    title: "Likes and comments",
    description:
      "Lightweight engagement tools that make the feed feel alive without becoming noisy.",
  },
];

const previewPosts = [
  {
    author: "Ava Kim",
    handle: "@avak",
    time: "2m ago",
    text: "Built a small UI system for my side project and the whole app finally feels coherent.",
    likes: "128",
    comments: "19",
  },
  {
    author: "Noah Patel",
    handle: "@noahp",
    time: "12m ago",
    text: "Minimal interfaces work best when the typography and spacing do most of the heavy lifting.",
    likes: "86",
    comments: "11",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-white text-slate-950">
      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Navigation */}
        <header className="flex items-center justify-between py-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-950 text-white">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold tracking-tight">SocialConnect</p>
            </div>
          </Link>

          <nav className="hidden items-center gap-2 sm:flex">
            <Button asChild variant="ghost" className="rounded-lg">
              <Link href="/login">Log in</Link>
            </Button>
            <Button asChild className="rounded-lg">
              <Link href="/register">Sign up</Link>
            </Button>
          </nav>
        </header>

        {/* Hero Section */}
        <section className="grid gap-12 py-16 lg:grid-cols-2 lg:items-center lg:py-24">
          <div className="space-y-8">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1 text-sm">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                <span className="text-slate-600">For thoughtful creators</span>
              </div>

              <h1 className="text-5xl font-semibold leading-tight tracking-tight sm:text-6xl">
                Social media that doesn't shout
              </h1>
              <p className="text-lg leading-8 text-slate-600">
                A minimal space for posts, profiles, and genuine conversations. No algorithms, no noise—just your thoughts and the people you follow.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Button asChild size="lg" className="rounded-lg">
                <Link href="/register">Get started</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="rounded-lg">
                <Link href="/login">Sign in</Link>
              </Button>
            </div>

            {/* Stats */}
            <div className="grid gap-6 pt-8 sm:grid-cols-3">
              {stats.map((stat) => (
                <div key={stat.label} className="space-y-1">
                  <p className="text-2xl font-semibold">{stat.value}</p>
                  <p className="text-sm text-slate-600">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right side preview */}
          <div className="relative order-first lg:order-last">
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg">
              <div className="border-b border-slate-200 bg-slate-50 px-6 py-4">
                <p className="text-sm font-medium text-slate-600">Latest posts</p>
              </div>

              <div className="space-y-0 divide-y divide-slate-200">
                {previewPosts.map((post) => (
                  <div key={post.handle} className="px-6 py-5 transition-colors hover:bg-slate-50">
                    <div className="flex gap-4">
                      <div className="min-w-max">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-300" />
                      </div>

                      <div className="flex-1 space-y-2">
                        <div className="flex items-baseline gap-2">
                          <p className="font-medium text-slate-950">{post.author}</p>
                          <p className="text-sm text-slate-500">{post.handle}</p>
                          <p className="text-sm text-slate-400">·</p>
                          <p className="text-sm text-slate-500">{post.time}</p>
                        </div>

                        <p className="text-sm leading-6 text-slate-700">{post.text}</p>

                        <div className="flex gap-6 pt-2 text-sm text-slate-500">
                          <span className="inline-flex items-center gap-1.5">
                            <Heart className="h-4 w-4" /> {post.likes}
                          </span>
                          <span className="inline-flex items-center gap-1.5">
                            <MessageCircle className="h-4 w-4" /> {post.comments}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="space-y-12 border-t border-slate-200 py-16">
          <div className="space-y-4">
            <p className="text-sm font-medium text-slate-600">Key features</p>
            <h2 className="text-3xl font-semibold">Built for creators and communities</h2>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div key={feature.title} className="space-y-4 rounded-xl border border-slate-200 bg-slate-50 p-6">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-950 text-white">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-lg font-semibold">{feature.title}</h3>
                  <p className="text-sm leading-6 text-slate-600">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* CTA Section */}
        <section className="space-y-8 rounded-2xl border border-slate-200 bg-slate-950 px-8 py-16 text-white sm:px-12 sm:py-20">
          <div className="space-y-4">
            <h2 className="text-3xl font-semibold">Ready to join?</h2>
            <p className="max-w-lg text-lg text-slate-300">
              Create your account in minutes and start building your community today
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg" className="rounded-lg bg-white text-slate-950 hover:bg-slate-100">
              <Link href="/register">Create free account</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="rounded-lg border-slate-700 text-white hover:bg-slate-800">
              <Link href="/login">Already a member?</Link>
            </Button>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-slate-200 py-8 text-center text-sm text-slate-600">
          <p>© 2024 SocialConnect. Minimal social media.</p>
        </footer>
      </div>
    </main>
  );
}
