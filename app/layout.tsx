import type { Metadata } from "next";
import { Inconsolata, Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const inconsolata = Inconsolata({
  variable: "--font-mono-face",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "SocialConnect",
    template: "%s | SocialConnect",
  },
  description:
    "A clean and minimal social media app for sharing posts, comments, likes, and profiles.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${inter.variable} ${inconsolata.variable} h-full scroll-smooth antialiased`}
    >
      <body className="min-h-full bg-background text-foreground">{children}</body>
    </html>
  );
}
