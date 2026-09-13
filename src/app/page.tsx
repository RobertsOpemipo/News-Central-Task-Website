"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowUpRight,
  Radio,
  Sparkles,
  ShieldCheck,
  Clock,
  Layers,
  ChevronRight,
  Command,
} from "lucide-react";

const transitions = {
  spring: { type: "spring" as const, stiffness: 380, damping: 30 },
  smooth: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const },
};

export default function LandingPage() {
  const [activeFeature, setActiveFeature] = useState(0);

  const pillars = [
    {
      id: "01",
      tag: "Live Ingest",
      title: "Field beats to broadcast desk in real time.",
      description:
        "Field correspondents file work logs, source evidence, and interview tapes straight into the live telecast pipeline. No lost files, zero communication lag.",
      metric: "Sub-second sync",
      accent: "from-blue-500/20 via-indigo-500/10 to-transparent",
    },
    {
      id: "02",
      tag: "Oversight",
      title: "Editorial clearance before the red light turns on.",
      description:
        "Desk editors and leads review incoming packages on a dedicated oversight board. Approve packages for air or flag revisions with one click.",
      metric: "100% Verified Proof",
      accent: "from-emerald-500/20 via-teal-500/10 to-transparent",
    },
    {
      id: "03",
      tag: "Telecast Sync",
      title: "iOS-inspired master rundown board.",
      description:
        "Inspect hour-by-hour airtime slots, program packages across 7-day cycles, and dispatch instant audible reminders to lead anchors on set.",
      metric: "24/7 Grid View",
      accent: "from-rose-500/20 via-amber-500/10 to-transparent",
    },
  ];

  return (
    <div className="min-h-screen bg-[#07090E] text-slate-100 selection:bg-blue-600 selection:text-white flex flex-col font-sans overflow-x-hidden antialiased">
      {/* Subtle Background Glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[750px] h-[450px] bg-blue-600/15 blur-[140px] rounded-full" />
      </div>

      {/* Top Floating Glass Navigation */}
      <header className="fixed top-0 inset-x-0 z-50 px-4 sm:px-8 py-5">
        <div className="max-w-6xl mx-auto flex items-center justify-between backdrop-blur-xl bg-white/[0.03] border border-white/[0.08] px-5 py-2.5 rounded-full shadow-2xl">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-7 h-7 rounded-lg bg-white text-black flex items-center justify-center font-bold text-xs group-hover:scale-95 transition-transform">
              <Radio className="w-3.5 h-3.5 text-black" />
            </div>
            <span className="font-semibold text-sm tracking-tight text-white/90">
              TaskDeck <span className="text-white/40 font-normal">News</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-6 text-xs text-white/60 font-medium">
            <a href="#how-it-works" className="hover:text-white transition-colors">
              How It Operates
            </a>
            <a href="#pillars" className="hover:text-white transition-colors">
              Pillars
            </a>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-xs font-medium text-white/70 hover:text-white transition-colors hidden sm:block"
            >
              Sign In
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-white text-black hover:bg-white/90 transition-all shadow-sm"
            >
              <span>Launch Terminal</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 pt-36 sm:pt-48 pb-20 px-4 sm:px-8 max-w-6xl mx-auto w-full relative z-10 space-y-24">
        <section className="space-y-8 text-center max-w-3xl mx-auto">
          {/* Micro Status Chip */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={transitions.smooth}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.05] border border-white/[0.08] text-white/80 text-xs font-mono"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Digital Newsroom & Telecast OS</span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...transitions.smooth, delay: 0.1 }}
            className="text-4xl sm:text-7xl font-bold tracking-tighter text-white leading-[1.05]"
          >
            Every story filed. <br />
            Every telecast sealed.
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...transitions.smooth, delay: 0.2 }}
            className="text-base sm:text-lg text-white/50 max-w-xl mx-auto font-normal leading-relaxed"
          >
            A high-tempo operational workspace designed for broadcast media. Correspondents file
            proof, desk leads clear packages, and anchors run on time.
          </motion.p>

          {/* Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...transitions.smooth, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2"
          >
            <Link
              href="/dashboard"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-white text-black font-semibold text-xs hover:bg-white/90 shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>Open Live Rundown</span>
              <ArrowUpRight className="w-4 h-4" />
            </Link>
            <Link
              href="/dashboard/schedule"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-white/[0.04] border border-white/[0.08] text-white/80 font-medium text-xs hover:bg-white/[0.08] transition-all"
            >
              <span>Explore Master Board</span>
            </Link>
          </motion.div>
        </section>

        {/* Persona-Style Interactive Pillar Showcase */}
        <section id="pillars" className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-white/[0.08]">
            <div>
              <p className="text-xs font-mono uppercase tracking-widest text-blue-400">The News Engine</p>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mt-1">
                Built for the speed of broadcast.
              </h2>
            </div>
            <p className="text-xs text-white/40 max-w-xs font-mono">
              Three synchronized touchpoints between news beats, oversight, and studio telecast.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {pillars.map((item, idx) => (
              <motion.div
                key={item.id}
                onMouseEnter={() => setActiveFeature(idx)}
                whileHover={{ y: -4 }}
                transition={transitions.spring}
                className={`group relative rounded-3xl p-6 sm:p-8 border transition-all duration-300 flex flex-col justify-between overflow-hidden cursor-pointer ${
                  activeFeature === idx
                    ? "bg-white/[0.05] border-white/20 shadow-2xl"
                    : "bg-white/[0.02] border-white/[0.07] hover:border-white/15"
                }`}
              >
                {/* Gradient Wash */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${item.accent} opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`}
                />

                <div className="space-y-4 relative z-10">
                  <div className="flex items-center justify-between text-xs font-mono text-white/40">
                    <span>{item.id}</span>
                    <span className="px-2 py-0.5 rounded-full bg-white/[0.05] border border-white/[0.08] text-white/70">
                      {item.tag}
                    </span>
                  </div>

                  <h3 className="text-lg sm:text-xl font-bold tracking-tight text-white group-hover:text-white transition-colors leading-snug">
                    {item.title}
                  </h3>

                  <p className="text-xs text-white/50 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="pt-8 relative z-10 flex items-center justify-between border-t border-white/[0.06] mt-6">
                  <span className="text-[11px] font-mono text-white/40">{item.metric}</span>
                  <div className="w-7 h-7 rounded-full bg-white/[0.06] flex items-center justify-center group-hover:bg-white group-hover:text-black transition-colors">
                    <ChevronRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* How It Operates Walkthrough */}
        <section
          id="how-it-works"
          className="rounded-3xl border border-white/[0.08] bg-white/[0.02] p-6 sm:p-12 relative overflow-hidden space-y-12"
        >
          <div className="max-w-md space-y-2">
            <span className="text-xs font-mono text-blue-400 uppercase tracking-wider">
              Walkthrough
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              The 3-stage newsroom cycle.
            </h2>
            <p className="text-xs text-white/50 leading-relaxed">
              Step through the exact flow reporters, editors, and producers take every production day.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2.5 p-4 rounded-2xl bg-white/[0.02] border border-white/[0.05]">
              <span className="w-6 h-6 rounded-full bg-white/[0.08] text-white text-xs font-mono font-bold flex items-center justify-center">
                1
              </span>
              <h4 className="text-sm font-semibold text-white">Rundown & Daily Desk</h4>
              <p className="text-xs text-white/50 leading-relaxed">
                Reporters review their daily assignments, file execution logs, and attach notes via the slide drawer.
              </p>
            </div>

            <div className="space-y-2.5 p-4 rounded-2xl bg-white/[0.02] border border-white/[0.05]">
              <span className="w-6 h-6 rounded-full bg-white/[0.08] text-white text-xs font-mono font-bold flex items-center justify-center">
                2
              </span>
              <h4 className="text-sm font-semibold text-white">Editorial Oversight</h4>
              <p className="text-xs text-white/50 leading-relaxed">
                Desk leads inspect proof submissions. One tap seals the package for prime airtime or flags it for rewrite.
              </p>
            </div>

            <div className="space-y-2.5 p-4 rounded-2xl bg-white/[0.02] border border-white/[0.05]">
              <span className="w-6 h-6 rounded-full bg-white/[0.08] text-white text-xs font-mono font-bold flex items-center justify-center">
                3
              </span>
              <h4 className="text-sm font-semibold text-white">Broadcast Board</h4>
              <p className="text-xs text-white/50 leading-relaxed">
                Producers switch between Day, Week, and Month telecast slots and trigger live alert pings to set anchors.
              </p>
            </div>
          </div>
        </section>

        {/* Minimal Bottom Banner */}
        <section className="text-center py-12 border-t border-white/[0.08] space-y-6">
          <div className="w-10 h-10 rounded-2xl bg-white text-black flex items-center justify-center mx-auto shadow-lg shadow-white/10">
            <Command className="w-5 h-5" />
          </div>
          <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-white">
            Experience TaskDeck live.
          </h2>
          <div>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white text-black font-semibold text-xs hover:bg-white/90 transition-all shadow-xl"
            >
              <span>Enter The Newsroom</span>
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>
        </section>
      </main>

      {/* Clean Footer */}
      <footer className="border-t border-white/[0.06] py-6 px-4 sm:px-8 text-center text-xs font-mono text-white/30">
        TaskDeck Newsroom OS • Continuous Broadcast Accountability
      </footer>
    </div>
  );
}