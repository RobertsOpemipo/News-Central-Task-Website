import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

// Resolve the live URL properly for production crawlers
const getSiteUrl = () => {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL;
  }
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return "http://localhost:3000";
};

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "TaskDeck Newsroom OS — Real-Time Broadcast & Story Oversight",
    template: "%s | TaskDeck Newsroom",
  },
  description:
    "High-tempo editorial workflow engine for broadcast desks. Continuous story filing, verification oversight, and telecast scheduling.",
  keywords: [
    "Newsroom OS",
    "Broadcast Rundown",
    "Editorial Oversight",
    "Telecast Schedule",
    "Story Dispatch",
    "Next.js App Router",
  ],
  authors: [{ name: "NewsDeck Operations" }],
  creator: "NewsDeck Operations",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    title: "TaskDeck Newsroom OS — Real-Time Broadcast & Story Oversight",
    description:
      "Continuous story filing, verification oversight, and telecast scheduling for modern newsrooms.",
    siteName: "TaskDeck News",
  },
  twitter: {
    card: "summary_large_image",
    title: "TaskDeck Newsroom OS — Real-Time Broadcast & Story Oversight",
    description:
      "Continuous story filing, verification oversight, and telecast scheduling for modern newsrooms.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="antialiased min-h-screen bg-[#07090E] text-slate-100 font-sans">
        {children}
      </body>
    </html>
  );
}