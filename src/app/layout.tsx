import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });

export const metadata: Metadata = {
  title: "TaskDeck — Unit Task Logging & Oversight",
  description: "Accountability and task verification console for units and team leads.",
  icons: {
    icon: "/favicon.ico", // Place your custom SVG or ICO here
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${mono.variable}`}>
      <body className="font-sans antialiased bg-slate-50 text-slate-900">
        {children}
      </body>
    </html>
  );
}