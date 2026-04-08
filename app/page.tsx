import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Heart,
  MessageCircle,
  ShieldCheck,
  Sparkles,
  Users,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const trustStats = [
  { label: "Active creators", value: "18,400+" },
  { label: "Posts this week", value: "241,000" },
  { label: "Weekly retention", value: "74%" },
  { label: "Avg. session", value: "12m 40s" },
];

const features = [
  {
    icon: Sparkles,
    title: "Fast publishing",
    description:
      "Write, attach one image, publish. The compose flow is intentionally frictionless.",
  },
  {
    icon: Users,
    title: "Profiles with context",
    description:
      "People can quickly understand who you are with bio, links, and social proof.",
  },
  {
    icon: Zap,
    title: "Meaningful engagement",
    description:
      "Likes and comments stay lightweight so conversations remain focused and useful.",
  },
  {
    icon: ShieldCheck,
    title: "Reliable auth",
    description:
      "Secure session handling and protected API routes keep user actions trustworthy.",
  },
];

const previewPosts = [
  {
    author: "Ava Kim",
    handle: "@avak",
    time: "2m ago",
    text: "Just shipped our onboarding rewrite. Completion jumped from 58% to 81% after simplifying the first screen.",
    likes: "128",
    comments: "19",
  },
  {
    author: "Noah Patel",
    handle: "@noahp",
    time: "14m ago",
    text: "Hot take: the best social features are boringly obvious. If people need instructions, the flow is already broken.",
    likes: "86",
    comments: "11",
  },
];

const testimonials = [
  {
    name: "Rhea S.",
    role: "Product Designer",
    quote:
      "SocialConnect feels calm. We replaced noisy channels with focused updates and got better discussions.",
  },
  {
    name: "Marcus L.",
    role: "Indie Founder",
    quote:
      "Our product community moved here for launch notes and feedback. It's simple enough that people actually post.",
  },
];

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-x-hidden bg-slate-50 text-slate-950">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-30 -top-35 h-90 w-90 rounded-full bg-cyan-100/80 blur-3xl" />
        <div className="absolute -right-30 top-30 h-85 w-85 rounded-full bg-indigo-100/70 blur-3xl" />
      </div>

      <div className="relative mx-auto w-full max-w-7xl px-4 pb-14 pt-6 sm:px-6 lg:px-8">
        <header className="sticky top-0 z-20 mb-8 flex items-center justify-between rounded-2xl border border-slate-200/70 bg-white/80 px-4 py-3 backdrop-blur sm:px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-950 text-white shadow-sm">
              <Sparkles className="h-5 w-5" />
            </div>
            <div className="leading-tight">
              <p className="text-sm font-semibold tracking-tight">SocialConnect</p>
              <p className="text-xs text-slate-500">Thoughtful social networking</p>
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

        <section className="grid gap-10 py-8 lg:grid-cols-2 lg:items-start lg:py-12">
          <div className="space-y-8">
            <div className="space-y-5">
              <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-sm text-slate-700 shadow-sm">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                Built for calm, high-signal conversations
              </div>

              <h1 className="max-w-xl text-4xl font-semibold leading-tight tracking-tight sm:text-5xl md:text-6xl">
                A realistic social feed for people who want depth, not noise.
              </h1>

              <p className="max-w-xl text-lg leading-8 text-slate-600">
                Share updates, post visuals, and build connections through profiles, follows, likes, and comments.
                SocialConnect keeps the product simple so your community can stay active.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Button asChild size="lg" className="h-11 rounded-xl px-5">
                <Link href="/register" className="inline-flex items-center gap-2">
                  Create free account
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>

              <Button asChild size="lg" variant="outline" className="h-11 rounded-xl border-slate-300 bg-white px-5">
                <Link href="/login">Sign in</Link>
              </Button>
            </div>

            <div className="grid gap-3 pt-2 sm:grid-cols-2">
              {trustStats.map((item) => (
                <div key={item.label} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                  <p className="text-xl font-semibold tracking-tight">{item.value}</p>
                  <p className="text-sm text-slate-600">{item.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="order-first lg:order-last">
            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-300/30">
              <div className="border-b border-slate-200 bg-slate-50 px-5 py-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-slate-700">Live feed preview</p>
                  <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">
                    updated now
                  </span>
                </div>
              </div>

              <div className="space-y-0 divide-y divide-slate-200 bg-white">
                {previewPosts.map((post) => (
                  <div key={post.handle} className="px-5 py-5 transition-colors hover:bg-slate-50">
                    <div className="flex gap-4">
                      <div className="min-w-max">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-linear-to-br from-slate-300 to-slate-400 text-xs font-semibold text-white">
                          {post.author
                            .split(" ")
                            .slice(0, 2)
                            .map((part) => part[0])
                            .join("")}
                        </div>
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

              <div className="border-t border-slate-200 bg-slate-50 px-5 py-4">
                <p className="text-xs uppercase tracking-wide text-slate-500">Trending now</p>
                <div className="mt-2 flex flex-wrap gap-2 text-xs">
                  <span className="rounded-full bg-white px-2.5 py-1 text-slate-600 ring-1 ring-slate-200">#product</span>
                  <span className="rounded-full bg-white px-2.5 py-1 text-slate-600 ring-1 ring-slate-200">#designsystems</span>
                  <span className="rounded-full bg-white px-2.5 py-1 text-slate-600 ring-1 ring-slate-200">#buildinpublic</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-8 border-t border-slate-200 py-16">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div className="space-y-3">
              <p className="text-sm font-medium text-slate-600">What you can do</p>
              <h2 className="text-3xl font-semibold tracking-tight">Everything needed for a real social loop</h2>
            </div>
            <p className="max-w-md text-sm leading-6 text-slate-600">
              From first profile setup to ongoing conversations, the core flow is optimized for consistency and speed.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div key={feature.title} className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-950 text-white">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-lg font-semibold">{feature.title}</h3>
                  <p className="text-sm leading-6 text-slate-600">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </section>

        <section className="grid gap-6 border-t border-slate-200 py-16 lg:grid-cols-[1.35fr_1fr] lg:items-stretch">
          <div className="space-y-7 rounded-3xl bg-slate-950 px-8 py-10 text-white sm:px-10 sm:py-12">
            <div className="space-y-3">
              <p className="text-sm text-slate-300">Ready to launch your profile?</p>
              <h2 className="text-3xl font-semibold tracking-tight">Start posting in under 2 minutes.</h2>
              <p className="max-w-xl text-slate-300">
                Join creators sharing product updates, ideas, and community conversations in one clean feed.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Button asChild size="lg" className="h-11 rounded-xl bg-white px-5 text-slate-950 hover:bg-slate-100">
                <Link href="/register">Create free account</Link>
              </Button>

              <Button
                asChild
                size="lg"
                className="h-11 rounded-xl border border-white/35 bg-transparent px-5 text-white hover:bg-white/10"
              >
                <Link href="/login" className="inline-flex items-center gap-2">
                  Already a member? Sign in
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>

          <div className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-slate-600">Loved by early communities</p>

            <div className="space-y-3">
              {testimonials.map((item) => (
                <div key={item.name} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-sm leading-6 text-slate-700">"{item.quote}"</p>
                  <p className="mt-2 text-xs font-medium text-slate-900">{item.name} · {item.role}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <footer className="border-t border-slate-200 py-8 text-center text-sm text-slate-600">
          <p>© 2026 SocialConnect. Minimal social media.</p>
        </footer>
      </div>
    </main>
  );
}
