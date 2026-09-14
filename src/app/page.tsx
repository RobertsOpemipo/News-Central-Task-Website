"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowUpRight,
  Radio,
  ChevronRight,
  Command,
  Calendar,
  ShieldCheck,
  FileCheck2,
  Move,
  Search,
  CheckCircle2,
  Sparkles,
} from "lucide-react";

const transitions = {
  spring: { type: "spring" as const, stiffness: 380, damping: 30 },
  smooth: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const },
};

export default function LandingPage() {
  const [activeTab, setActiveTab] = useState<"calendar" | "oversight" | "ingest">("calendar");

  const pillars = [
    {
      id: "01",
      tag: "Dynamic Engine",
      title: "iOS Master Calendar & Admin Drag-and-Drop.",
      description:
        "Switch seamlessly between Day, Week, and full Multi-Year Month matrices. Managing editors can grab any scheduled package and drag it onto any date to reschedule in seconds.",
      metric: "Multi-Year + D&D",
      accent: "from-blue-500/20 via-cyan-500/10 to-transparent",
    },
    {
      id: "02",
      tag: "Desk Verification",
      title: "High-Volume Oversight with Beat Filtering & Search.",
      description:
        "Built to handle 100+ incoming telecasts without endless scrolling. Features snappy pagination, live headline search, desk beat pills, and one-click package sealing.",
      metric: "Zero-Lag Clearance",
      accent: "from-emerald-500/20 via-teal-500/10 to-transparent",
    },
    {
      id: "03",
      tag: "Live Execution",
      title: "Real-Time Ingest & Instant Proof Verification.",
      description:
        "Correspondents file source links and soundbite logs directly into the lineup with feedback modals confirming handoff to the clearance desk.",
      metric: "100% Accountable",
      accent: "from-purple-500/20 via-indigo-500/10 to-transparent",
    },
  ];

  return (
    <div className="min-h-screen bg-[#07090E] text-slate-100 selection:bg-blue-600 selection:text-white flex flex-col font-sans overflow-x-hidden antialiased">
      {/* Background Glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-15%] left-1/2 -translate-x-1/2 w-[850px] h-[500px] bg-blue-600/15 blur-[160px] rounded-full" />
      </div>

      {/* Floating Glass Navigation */}
      <header className="fixed top-0 inset-x-0 z-50 px-4 sm:px-8 py-5">
        <div className="max-w-6xl mx-auto flex items-center justify-between backdrop-blur-xl bg-white/[0.03] border border-white/[0.08] px-5 py-2.5 rounded-full shadow-2xl">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-7 h-7 rounded-lg bg-white text-black flex items-center justify-center font-bold text-xs group-hover:scale-95 transition-transform">
              <Radio className="w-3.5 h-3.5 text-black" />
            </div>
            <span className="font-semibold text-sm tracking-tight text-white/90">
              TaskDeck <span className="text-white/40 font-normal">Newsroom</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-6 text-xs text-white/60 font-medium">
            <a href="#preview" className="hover:text-white transition-colors">
              Interface Preview
            </a>
            <a href="#pillars" className="hover:text-white transition-colors">
              Core Capabilities
            </a>
            <a href="#workflow" className="hover:text-white transition-colors">
              Workflow
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
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold bg-white text-black hover:bg-white/90 transition-all shadow-sm hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>Launch Terminal</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 pt-36 sm:pt-44 pb-20 px-4 sm:px-8 max-w-6xl mx-auto w-full relative z-10 space-y-24">
        <section className="space-y-8 text-center max-w-3xl mx-auto">
          {/* Micro Status Chip */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={transitions.smooth}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.05] border border-white/[0.08] text-white/80 text-xs font-mono"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Built for Modern Broadcast Telecasts</span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...transitions.smooth, delay: 0.1 }}
            className="text-4xl sm:text-7xl font-bold tracking-tighter text-white leading-[1.05]"
          >
            Every story filed. <br />
            Every broadcast cleared.
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...transitions.smooth, delay: 0.2 }}
            className="text-sm sm:text-base text-white/50 max-w-xl mx-auto font-normal leading-relaxed"
          >
            A high-tempo broadcast control platform. Features an iOS-style calendar matrix, 
            instant drag-and-drop rescheduling, and a high-volume editorial clearance desk.
          </motion.p>

          {/* CTAs */}
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
              <span>Enter Daily Rundown</span>
              <ArrowUpRight className="w-4 h-4" />
            </Link>
            <Link
              href="/dashboard/schedule"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-white/[0.04] border border-white/[0.08] text-white/80 font-medium text-xs hover:bg-white/[0.08] transition-all"
            >
              <Calendar className="w-3.5 h-3.5 text-blue-400" />
              <span>Explore Master Schedule</span>
            </Link>
          </motion.div>
        </section>

        {/* INTERACTIVE WORKSPACE PREVIEW TERMINAL */}
        <section id="preview" className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2">
            <div>
              <p className="text-xs font-mono uppercase tracking-widest text-blue-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Live System Preview
              </p>
              <h3 className="text-xl font-bold text-white mt-0.5">Explore The Newsroom Interfaces</h3>
            </div>

            {/* Interactive Switcher Tabs */}
            <div className="flex items-center bg-white/[0.04] p-1 rounded-2xl border border-white/[0.08]">
              <button
                onClick={() => setActiveTab("calendar")}
                className={`px-3.5 py-1.5 text-xs font-medium rounded-xl transition-all ${
                  activeTab === "calendar"
                    ? "bg-blue-600 text-white shadow-xs font-semibold"
                    : "text-white/60 hover:text-white"
                }`}
              >
                iOS Master Grid
              </button>
              <button
                onClick={() => setActiveTab("oversight")}
                className={`px-3.5 py-1.5 text-xs font-medium rounded-xl transition-all ${
                  activeTab === "oversight"
                    ? "bg-blue-600 text-white shadow-xs font-semibold"
                    : "text-white/60 hover:text-white"
                }`}
              >
                Clearance Oversight
              </button>
              <button
                onClick={() => setActiveTab("ingest")}
                className={`px-3.5 py-1.5 text-xs font-medium rounded-xl transition-all ${
                  activeTab === "ingest"
                    ? "bg-blue-600 text-white shadow-xs font-semibold"
                    : "text-white/60 hover:text-white"
                }`}
              >
                Daily Ingest
              </button>
            </div>
          </div>

          {/* Terminal Mockup Window */}
          <div className="rounded-3xl border border-white/[0.1] bg-[#0C1017] p-5 sm:p-7 shadow-2xl overflow-hidden relative min-h-[320px]">
            {/* Window Dots */}
            <div className="flex items-center gap-1.5 pb-4 border-b border-white/[0.06]">
              <div className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
              <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
              <span className="text-[11px] font-mono text-white/30 ml-2">
                newsroom://production.internal/{activeTab}
              </span>
            </div>

            <div className="pt-5">
              <AnimatePresence mode="wait">
                {activeTab === "calendar" && (
                  <motion.div
                    key="cal"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={transitions.smooth}
                    className="space-y-4"
                  >
                    <div className="flex items-center justify-between text-xs font-mono">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-blue-400" />
                        <span className="font-bold text-white">September 2026</span>
                        <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 text-[10px]">
                          iOS Calendar Matrix
                        </span>
                      </div>
                      <span className="text-white/40 flex items-center gap-1">
                        <Move className="w-3 h-3 text-amber-400" /> Drag & drop enabled
                      </span>
                    </div>

                    <div className="grid grid-cols-7 gap-1.5 text-center font-mono text-xs">
                      {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                        <div key={d} className="text-white/40 py-1 text-[11px]">
                          {d}
                        </div>
                      ))}
                      {[13, 14, 15, 16, 17, 18, 19].map((dayNum, i) => (
                        <div
                          key={dayNum}
                          className={`p-2 rounded-xl border text-left flex flex-col justify-between h-16 ${
                            i === 1
                              ? "border-blue-500 bg-blue-500/10 text-white"
                              : "border-white/[0.06] bg-white/[0.02] text-white/70"
                          }`}
                        >
                          <span className="text-[11px] font-bold">{dayNum}</span>
                          <span className="text-[9px] truncate bg-white/[0.05] px-1 py-0.5 rounded border border-white/[0.08]">
                            {i === 1 ? "G7 Summit" : i === 2 ? "Fed Preview" : "Story Slot"}
                          </span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {activeTab === "oversight" && (
                  <motion.div
                    key="over"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={transitions.smooth}
                    className="space-y-4"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-emerald-400" />
                        <span className="text-xs font-bold text-white font-mono">
                          Editorial Clearance Desk
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono bg-white/[0.05] px-2 py-1 rounded text-white/50 flex items-center gap-1">
                          <Search className="w-3 h-3" /> Live Query
                        </span>
                        <span className="text-[10px] font-mono bg-white/[0.05] px-2 py-1 rounded text-white/50">
                          15 per page
                        </span>
                      </div>
                    </div>

                    <div className="border border-white/[0.08] rounded-2xl overflow-hidden divide-y divide-white/[0.06] text-xs font-mono">
                      <div className="p-3 bg-white/[0.02] flex items-center justify-between">
                        <span className="text-white/80 font-sans font-medium">
                          Federal Reserve Rate Policy Preview
                        </span>
                        <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px]">
                          AWAITING REVIEW
                        </span>
                      </div>
                      <div className="p-3 bg-white/[0.02] flex items-center justify-between">
                        <span className="text-white/80 font-sans font-medium">
                          Tech Monopolies Senate Hearing Brief
                        </span>
                        <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px]">
                          COMPLETED
                        </span>
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeTab === "ingest" && (
                  <motion.div
                    key="ing"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={transitions.smooth}
                    className="space-y-4"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FileCheck2 className="w-4 h-4 text-purple-400" />
                        <span className="text-xs font-bold text-white font-mono">
                          Slide-Out Proof Ingest
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Transmit Confirmed
                      </span>
                    </div>

                    <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-4 space-y-2">
                      <p className="text-xs text-white/60 font-mono">Proof Summary & Soundbites</p>
                      <div className="p-2.5 rounded-xl bg-black/40 border border-white/[0.06] text-xs font-mono text-white/80">
                        &quot;Interview tape logged with Chief Economist at 10:15 AM. B-roll transferred to Wire pool.&quot;
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </section>

        {/* Feature Pillars */}
        <section id="pillars" className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-white/[0.08]">
            <div>
              <p className="text-xs font-mono uppercase tracking-widest text-blue-400">Core Architecture</p>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mt-1">
                Engineered for continuous broadcast cycles.
              </h2>
            </div>
            <p className="text-xs text-white/40 max-w-xs font-mono">
              Cohesive state coordination across reporters, desk leads, and executive producers.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {pillars.map((item) => (
              <motion.div
                key={item.id}
                whileHover={{ y: -4 }}
                transition={transitions.spring}
                className="group relative rounded-3xl p-6 sm:p-8 border border-white/[0.07] bg-white/[0.02] hover:border-white/20 transition-all duration-300 flex flex-col justify-between overflow-hidden"
              >
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

                  <h3 className="text-lg sm:text-xl font-bold tracking-tight text-white leading-snug">
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

        {/* 3-Stage Workflow */}
        <section
          id="workflow"
          className="rounded-3xl border border-white/[0.08] bg-white/[0.02] p-6 sm:p-12 relative overflow-hidden space-y-10"
        >
          <div className="max-w-md space-y-2">
            <span className="text-xs font-mono text-blue-400 uppercase tracking-wider">
              Verification Engine
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              The 3-stage newsroom loop.
            </h2>
            <p className="text-xs text-white/50 leading-relaxed">
              Every broadcast package moves through a verified handoff between reporters and desk leads.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2.5 p-5 rounded-2xl bg-white/[0.02] border border-white/[0.05]">
              <span className="w-6 h-6 rounded-full bg-white/[0.08] text-white text-xs font-mono font-bold flex items-center justify-center">
                1
              </span>
              <h4 className="text-sm font-semibold text-white">Ingest & Evidence</h4>
              <p className="text-xs text-white/50 leading-relaxed">
                Correspondents submit work proof with attached links or soundbite notes via the drawer.
              </p>
            </div>

            <div className="space-y-2.5 p-5 rounded-2xl bg-white/[0.02] border border-white/[0.05]">
              <span className="w-6 h-6 rounded-full bg-white/[0.08] text-white text-xs font-mono font-bold flex items-center justify-center">
                2
              </span>
              <h4 className="text-sm font-semibold text-white">Oversight Clearance</h4>
              <p className="text-xs text-white/50 leading-relaxed">
                Desk leads inspect proof in a paginated oversight table. One click seals the package or flags a rewrite.
              </p>
            </div>

            <div className="space-y-2.5 p-5 rounded-2xl bg-white/[0.02] border border-white/[0.05]">
              <span className="w-6 h-6 rounded-full bg-white/[0.08] text-white text-xs font-mono font-bold flex items-center justify-center">
                3
              </span>
              <h4 className="text-sm font-semibold text-white">Airtime Rundown</h4>
              <p className="text-xs text-white/50 leading-relaxed">
                Producers monitor day, week, and month boards, drag-and-drop to reschedule, and dispatch anchor pings.
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
            Operate your newsroom with certainty.
          </h2>
          <div>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white text-black font-semibold text-xs hover:bg-white/90 transition-all shadow-xl"
            >
              <span>Launch Live Terminal</span>
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/[0.06] py-6 px-4 sm:px-8 text-center text-xs font-mono text-white/30">
        TaskDeck Newsroom OS • Broadcast Telecast Integrity & Clearance
      </footer>
    </div>
  );
}