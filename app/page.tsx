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
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.9),rgba(241,245,249,0.9)_40%,rgba(226,232,240,1))] text-slate-950">
      <section className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-6 sm:px-6 lg:px-8">
        <header className="flex items-center justify-between rounded-full border border-white/70 bg-white/70 px-4 py-3 shadow-sm backdrop-blur">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-950 text-white">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold tracking-tight">SocialConnect</p>
              <p className="text-xs text-slate-500">Minimal social experience</p>
            </div>
          </Link>

          <div className="hidden items-center gap-2 sm:flex">
            <Button asChild variant="ghost">
              <Link href="/login">Login</Link>
            </Button>
            <Button asChild className="rounded-full px-5">
              <Link href="/register">
                Get started
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </header>

        <div className="grid flex-1 items-center gap-10 py-10 lg:grid-cols-[1.15fr_0.85fr] lg:py-16">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-sm text-slate-600 shadow-sm">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Built for thoughtful sharing
            </div>

            <div className="space-y-5">
              <h1 className="max-w-2xl text-5xl font-semibold tracking-tight text-slate-950 sm:text-6xl lg:text-7xl">
                A clean social space for posts, profiles, and real engagement.
              </h1>
              <p className="max-w-xl text-lg leading-8 text-slate-600 sm:text-xl">
                SocialConnect is a minimal social media app with posts, avatars,
                comments, likes, and a feed that stays fast and focused.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" className="rounded-full px-7">
                <Link href="/register">
                  Create account
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="rounded-full px-7">
                <Link href="/feed">Explore feed</Link>
              </Button>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              {stats.map((stat) => (
                <Card key={stat.label} className="border-white/70 bg-white/80 shadow-sm backdrop-blur">
                  <CardContent className="p-5">
                    <p className="text-2xl font-semibold tracking-tight">{stat.value}</p>
                    <p className="mt-1 text-sm text-slate-500">{stat.label}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 -z-10 rounded-[2rem] bg-slate-950/5 blur-3xl" />
            <Card className="overflow-hidden border-slate-200/80 bg-white/85 shadow-2xl backdrop-blur">
              <CardContent className="space-y-6 p-6 sm:p-8">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-500">Live preview</p>
                    <h2 className="text-2xl font-semibold tracking-tight">Today&apos;s highlights</h2>
                  </div>
                  <div className="rounded-full bg-slate-950 px-3 py-1 text-xs font-medium text-white">
                    Feed
                  </div>
                </div>

                <div className="space-y-4">
                  {previewPosts.map((post) => (
                    <div key={post.handle} className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="font-medium text-slate-950">{post.author}</p>
                          <p className="text-sm text-slate-500">
                            {post.handle} · {post.time}
                          </p>
                        </div>
                        <div className="h-11 w-11 rounded-2xl bg-linear-to-br from-slate-900 to-slate-600" />
                      </div>

                      <p className="mt-4 text-sm leading-6 text-slate-700">{post.text}</p>

                      <div className="mt-4 flex items-center gap-4 text-sm text-slate-500">
                        <span className="inline-flex items-center gap-1.5">
                          <Heart className="h-4 w-4" /> {post.likes}
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                          <MessageCircle className="h-4 w-4" /> {post.comments}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="grid gap-4 pb-6 md:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon;

            return (
              <Card key={feature.title} className="border-white/70 bg-white/80 shadow-sm backdrop-blur">
                <CardContent className="space-y-3 p-5">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-white">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-lg font-semibold tracking-tight">{feature.title}</h3>
                  <p className="text-sm leading-6 text-slate-600">{feature.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>
    </main>
  );
}
