import { Analytics } from "@vercel/analytics/next";
import type { Metadata } from "next";
import { Bricolage_Grotesque, Geist, Geist_Mono } from "next/font/google";
import { PUBLIC_URL } from "@/lib/urls";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AI Visibility Tracker: ChatGPT, Perplexity, Gemini | Seenlense",
  description:
    "Seenlense is an AI visibility tracker: see how often ChatGPT, Perplexity, Gemini and Claude recommend your brand vs competitors, and what to fix. From $20/month.",
  metadataBase: new URL(PUBLIC_URL),
  openGraph: { siteName: "Seenlense", type: "website", locale: "en_US" },
  twitter: { card: "summary_large_image" },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${bricolage.variable} antialiased`}
    >
      <body className="min-h-dvh font-sans">
        {children}
        {/* Vercel Web Analytics: visitors, pages and referrers, no cookies. */}
        <Analytics />
      </body>
    </html>
  );
}
