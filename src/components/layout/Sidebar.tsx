"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Radio,
  FileText,
  ShieldAlert,
  CalendarDays,
  Sliders,
  ChevronLeft,
  ChevronRight,
  Volume2,
  VolumeX,
  Eye,
  X,
  Sparkles,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { logout } from "@/app/actions/auth";

interface CurrentUserProfile {
  id: string;
  name: string;
  email: string;
  role: "MEMBER" | "UNIT_LEAD" | "ADMIN";
  unitName?: string | null;
}

interface SidebarProps {
  currentUser?: CurrentUserProfile | null;
}

const NAV_ITEMS = [
  { label: "Rundown & Daily Desk", shortLabel: "Daily Rundown", href: "/dashboard", icon: FileText },
  { label: "Lead Desk Oversight", shortLabel: "Oversight", href: "/dashboard/oversight", icon: ShieldAlert },
  { label: "Broadcast Schedule", shortLabel: "Schedule", href: "/dashboard/schedule", icon: CalendarDays },
];

function getInitials(name: string) {
  if (!name) return "US";
  const parts = name.trim().split(" ");
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function formatRoleLabel(role?: string) {
  switch (role) {
    case "ADMIN":
      return "Managing Editor";
    case "UNIT_LEAD":
      return "Desk Lead / Editor";
    default:
      return "Staff Correspondent";
  }
}

export function Sidebar({ currentUser }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  // Settings State
  const [liveAudioAlerts, setLiveAudioAlerts] = useState(true);
  const [compactMode, setCompactMode] = useState(false);
  const [wireFlash, setWireFlash] = useState(true);

  const pathname = usePathname();

  const userName = currentUser?.name || "Staff Member";
  const initials = getInitials(userName);
  const roleLabel = formatRoleLabel(currentUser?.role);
  const deskName = currentUser?.unitName || "General Newsroom";

  return (
    <>
      {/* ============================================================ */}
      {/* 1. MOBILE ONLY: TWO STACKED HORIZONTAL BARS                  */}
      {/* ============================================================ */}
      <header className="lg:hidden w-full bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
        {/* Tier 1: Brand, User Identity & Settings */}
        <div className="flex items-center justify-between px-4 h-13 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold shadow-xs">
              <Radio className="w-4 h-4" />
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-900 tracking-tight text-sm">
                NewsDeck
              </span>
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-rose-50 border border-rose-200 text-rose-600 font-mono text-[9px] font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                ON AIR
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setSettingsOpen(!settingsOpen)}
              className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors"
              aria-label="Toggle Newsroom Settings"
            >
              <Sliders className="w-4 h-4" />
            </button>
            <div
              className="w-7 h-7 rounded-full bg-slate-900 text-white font-mono text-[10px] font-bold flex items-center justify-center shadow-xs"
              title={`${userName} (${roleLabel})`}
            >
              {initials}
            </div>
          </div>
        </div>

        {/* Tier 2: Horizontal Nav Items */}
        <nav className="flex items-center gap-1.5 px-3 py-2 overflow-x-auto no-scrollbar bg-slate-50/70">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all shrink-0",
                  isActive
                    ? "bg-white text-blue-600 font-semibold shadow-xs border border-slate-200/80"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/80"
                )}
              >
                <Icon className={cn("w-3.5 h-3.5", isActive ? "text-blue-600" : "text-slate-400")} />
                <span>{item.shortLabel}</span>
              </Link>
            );
          })}
        </nav>
      </header>

      {/* ============================================================ */}
      {/* 2. DESKTOP ONLY: EXPANDABLE VERTICAL SIDEBAR                 */}
      {/* ============================================================ */}
      <motion.aside
        animate={{
          width: isCollapsed ? 72 : 256,
        }}
        transition={{ type: "spring", stiffness: 350, damping: 32 }}
        className={cn(
          "hidden lg:flex flex-col bg-white border-r border-slate-200 min-h-screen select-none relative z-30",
          isCollapsed ? "items-center" : "items-stretch"
        )}
      >
        {/* Brand Header */}
        <div
          className={cn(
            "h-16 flex items-center border-b border-slate-100 w-full transition-all",
            isCollapsed ? "justify-center px-0" : "justify-between px-4"
          )}
        >
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs shrink-0">
              <Radio className="w-4 h-4" />
            </div>

            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -6 }}
                className="overflow-hidden whitespace-nowrap"
              >
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-slate-900 tracking-tight text-sm">
                    NewsDeck
                  </span>
                  <span className="px-1.5 py-0.2 rounded bg-rose-50 border border-rose-200 text-rose-600 font-mono text-[9px] font-bold">
                    LIVE
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 font-mono truncate">{deskName}</p>
              </motion.div>
            )}
          </div>

          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={cn(
              "p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition-colors",
              isCollapsed && "mt-2 absolute -right-3 top-4 bg-white shadow-xs rounded-full p-1 z-40"
            )}
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Live Broadcast Indicator */}
        {!isCollapsed && (
          <div className="px-4 py-2 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between text-[11px] font-mono">
            <span className="text-slate-600 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Air Time: 18:00
            </span>
            <span className="text-slate-400 font-semibold">{currentUser?.role ?? "ACTIVE"}</span>
          </div>
        )}

        {/* Navigation List */}
        <nav className={cn("flex-1 space-y-1.5 p-3 w-full", isCollapsed && "px-2")}>
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                title={isCollapsed ? item.label : undefined}
                className={cn(
                  "relative flex items-center rounded-xl text-xs font-medium transition-all group",
                  isCollapsed ? "justify-center p-2.5 h-11 w-11 mx-auto" : "gap-3 px-3 py-2.5",
                  isActive
                    ? "bg-blue-50/80 text-blue-700 font-semibold border border-blue-100/90 shadow-2xs"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 border border-transparent"
                )}
              >
                {isActive && !isCollapsed && (
                  <motion.div
                    layoutId="activeSidePill"
                    className="absolute left-0 top-2 bottom-2 w-1 rounded-r-md bg-blue-600"
                  />
                )}

                <Icon
                  className={cn(
                    "w-4 h-4 shrink-0 transition-colors",
                    isActive ? "text-blue-600" : "text-slate-400 group-hover:text-slate-700"
                  )}
                />

                {!isCollapsed && (
                  <span className="truncate tracking-tight">{item.label}</span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Actions: Settings & Authenticated Profile */}
        <div className={cn("p-3 border-t border-slate-100 space-y-2 w-full", isCollapsed && "px-2")}>
          <button
            onClick={() => setSettingsOpen(!settingsOpen)}
            title={isCollapsed ? "Desk Settings" : undefined}
            className={cn(
              "w-full flex items-center rounded-xl text-xs font-medium transition-colors border",
              isCollapsed ? "justify-center p-2.5 h-11 w-11 mx-auto" : "gap-3 px-3 py-2",
              settingsOpen
                ? "bg-blue-50 text-blue-700 border-blue-200"
                : "text-slate-600 hover:bg-slate-50 border-transparent"
            )}
          >
            <Sliders className="w-4 h-4 shrink-0 text-slate-400" />
            {!isCollapsed && <span>Desk Settings</span>}
          </button>

          {/* User Profile Capsule */}
          <div
            className={cn(
              "flex items-center rounded-xl bg-slate-50 border border-slate-100",
              isCollapsed ? "justify-center p-2 w-11 h-11 mx-auto" : "justify-between p-2"
            )}
            title={isCollapsed ? `${userName} (${roleLabel})` : undefined}
          >
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-7 h-7 rounded-lg bg-slate-900 text-white flex items-center justify-center font-mono text-xs font-semibold shrink-0">
                {initials}
              </div>
              {!isCollapsed && (
                <div className="overflow-hidden">
                  <p className="text-xs font-semibold text-slate-800 truncate leading-tight">
                    {userName}
                  </p>
                  <p className="text-[10px] text-slate-400 font-mono truncate">{roleLabel}</p>
                </div>
              )}
            </div>

            {!isCollapsed && (
              <form action={logout}>
                <button
                  type="submit"
                  title="Sign out of station"
                  className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </form>
            )}
          </div>
        </div>
      </motion.aside>

      {/* ============================================================ */}
      {/* 3. SETTINGS FLYOUT                                           */}
      {/* ============================================================ */}
      <AnimatePresence>
        {settingsOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.15 }}
            className="fixed bottom-16 left-4 lg:left-20 z-50 w-76 bg-white rounded-2xl border border-slate-200 p-4 shadow-xl space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-blue-600" />
                <h4 className="text-xs font-semibold text-slate-800">Newsroom Desk Setup</h4>
              </div>
              <button
                onClick={() => setSettingsOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-700">
                  {liveAudioAlerts ? <Volume2 className="w-4 h-4 text-blue-600" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
                  <span>Wire Flash Chime</span>
                </div>
                <button
                  type="button"
                  onClick={() => setLiveAudioAlerts(!liveAudioAlerts)}
                  className={cn(
                    "w-8 h-4.5 rounded-full transition-colors p-0.5 relative",
                    liveAudioAlerts ? "bg-blue-600" : "bg-slate-200"
                  )}
                >
                  <div
                    className={cn(
                      "w-3.5 h-3.5 rounded-full bg-white transition-transform shadow-xs",
                      liveAudioAlerts ? "translate-x-3.5" : "translate-x-0"
                    )}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-700">
                  <Eye className="w-4 h-4 text-slate-500" />
                  <span>Compact Telecast View</span>
                </div>
                <button
                  type="button"
                  onClick={() => setCompactMode(!compactMode)}
                  className={cn(
                    "w-8 h-4.5 rounded-full transition-colors p-0.5 relative",
                    compactMode ? "bg-blue-600" : "bg-slate-200"
                  )}
                >
                  <div
                    className={cn(
                      "w-3.5 h-3.5 rounded-full bg-white transition-transform shadow-xs",
                      compactMode ? "translate-x-3.5" : "translate-x-0"
                    )}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-700">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>Highlight Approaching Air</span>
                </div>
                <button
                  type="button"
                  onClick={() => setWireFlash(!wireFlash)}
                  className={cn(
                    "w-8 h-4.5 rounded-full transition-colors p-0.5 relative",
                    wireFlash ? "bg-blue-600" : "bg-slate-200"
                  )}
                >
                  <div
                    className={cn(
                      "w-3.5 h-3.5 rounded-full bg-white transition-transform shadow-xs",
                      wireFlash ? "translate-x-3.5" : "translate-x-0"
                    )}
                  />
                </button>
              </div>
            </div>

            {/* Mobile Sign Out Button */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[10px] text-slate-400 font-mono">{currentUser?.email}</span>
              <form action={logout}>
                <button
                  type="submit"
                  className="text-xs font-semibold text-rose-600 hover:text-rose-700 flex items-center gap-1"
                >
                  <LogOut className="w-3 h-3" />
                  <span>Sign out</span>
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}