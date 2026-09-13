"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { StatusBadge, type StatusType } from "@/components/ui/Badge";
import {
  Calendar as CalendarIcon,
  Bell,
  BellRing,
  X,
  Radio,
  ArrowUpRight,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ScheduledTask {
  id: string;
  title: string;
  description: string | null;
  dayOfWeek: string;
  status: StatusType;
  unitName: string;
  assigneeName: string | null;
}

interface GridProps {
  tasks: ScheduledTask[];
}

type CalendarViewMode = "day" | "week" | "month";

const DAYS_SHORT = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const DATES_MOCK: Record<string, number> = {
  Mon: 14,
  Tue: 15,
  Wed: 16,
  Thu: 17,
  Fri: 18,
  Sat: 19,
  Sun: 13,
};

export function BroadcastScheduleGrid({ tasks }: GridProps) {
  const [viewMode, setViewMode] = useState<CalendarViewMode>("week");
  const [selectedDay, setSelectedDay] = useState<string>("Sun");
  const [activeTask, setActiveTask] = useState<ScheduledTask | null>(null);
  const [alertSentId, setAlertSentId] = useState<string | null>(null);

  const handleTriggerAlert = (task: ScheduledTask) => {
    setAlertSentId(task.id);
    setTimeout(() => setAlertSentId(null), 3200);
  };

  const selectedDayTasks = tasks.filter((t) => t.dayOfWeek === selectedDay);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* View Switcher Header */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-3.5 sm:p-4 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center justify-between sm:justify-start gap-3">
          <span className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
            September 2026
          </span>
          <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-100">
            Week 38
          </span>
        </div>

        {/* iOS-Style Pill Switcher */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200/60 w-full sm:w-auto">
          {(["day", "week", "month"] as CalendarViewMode[]).map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={cn(
                "flex-1 sm:flex-initial sm:px-5 py-1 text-xs font-medium rounded-lg capitalize transition-all",
                viewMode === mode
                  ? "bg-white text-slate-900 shadow-2xs font-semibold"
                  : "text-slate-500 hover:text-slate-900"
              )}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      {/* Alert Notification Toast */}
      <AnimatePresence>
        {alertSentId && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed top-4 sm:top-6 right-4 sm:right-6 z-50 flex items-center gap-2 bg-slate-900 text-white px-3.5 py-2.5 rounded-2xl shadow-xl border border-slate-800 text-xs font-mono"
          >
            <BellRing className="w-4 h-4 text-amber-400 animate-bounce" />
            <span>Airtime dispatch ping sent to correspondent</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 1. WEEK VIEW */}
      {viewMode === "week" && (
        <div className="space-y-4">
          {/* Day Capsule Strip */}
          <div className="grid grid-cols-7 gap-1 sm:gap-2 bg-white p-2 sm:p-3 rounded-2xl border border-slate-200/80 shadow-2xs">
            {DAYS_SHORT.map((day) => {
              const isSelected = selectedDay === day;
              const count = tasks.filter((t) => t.dayOfWeek === day).length;
              return (
                <button
                  key={day}
                  onClick={() => setSelectedDay(day)}
                  className={cn(
                    "flex flex-col items-center py-2 sm:py-3 rounded-xl transition-all",
                    isSelected
                      ? "bg-blue-600 text-white shadow-xs font-bold"
                      : "hover:bg-slate-50 text-slate-700"
                  )}
                >
                  <span
                    className={cn(
                      "text-[10px] sm:text-[11px] uppercase font-mono tracking-wider",
                      isSelected ? "text-blue-100" : "text-slate-400"
                    )}
                  >
                    {day}
                  </span>
                  <span className="text-xs sm:text-base font-bold font-mono mt-0.5">
                    {DATES_MOCK[day]}
                  </span>
                  <div className="flex gap-0.5 mt-1 h-1">
                    {count > 0 && (
                      <span
                        className={cn(
                          "w-1 h-1 rounded-full",
                          isSelected ? "bg-white" : "bg-rose-500"
                        )}
                      />
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Agenda List */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-2xs space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 text-blue-600" />
                <h3 className="text-xs sm:text-sm font-semibold text-slate-900">
                  Rundown for {selectedDay} (Sep {DATES_MOCK[selectedDay]})
                </h3>
              </div>
              <span className="text-[11px] font-mono text-slate-400">
                {selectedDayTasks.length} {selectedDayTasks.length === 1 ? "story" : "stories"}
              </span>
            </div>

            {selectedDayTasks.length === 0 ? (
              <div className="py-10 text-center text-slate-400 font-mono text-xs">
                No telecasts scheduled for this date.
              </div>
            ) : (
              <div className="space-y-2.5">
                {selectedDayTasks.map((task) => (
                  <div
                    key={task.id}
                    onClick={() => setActiveTask(task)}
                    className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/70 hover:bg-slate-50 hover:border-slate-300 transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-slate-800">
                          {task.unitName}
                        </span>
                        <StatusBadge status={task.status} className="text-[9px] py-0.2" />
                      </div>
                      <p className="text-xs font-medium text-slate-900 group-hover:text-blue-600 transition-colors">
                        {task.title}
                      </p>
                      <p className="text-[11px] text-slate-400 font-mono flex items-center gap-1.5">
                        <User className="w-3 h-3 text-slate-400" />
                        Anchor: {task.assigneeName ?? "Unassigned"}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleTriggerAlert(task);
                        }}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-mono border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 transition-colors"
                      >
                        <Bell className="w-3 h-3 text-amber-500" />
                        <span>Send Alert</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. DAY VIEW */}
      {viewMode === "day" && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">
                Hourly Rundown: {selectedDay}
              </h3>
              <p className="text-[11px] text-slate-400 font-mono">Telecast airtime slots</p>
            </div>
            <div className="flex items-center gap-1 overflow-x-auto bg-slate-100 p-1 rounded-xl">
              {DAYS_SHORT.map((day) => (
                <button
                  key={day}
                  onClick={() => setSelectedDay(day)}
                  className={cn(
                    "px-2.5 py-1 text-xs font-mono rounded-lg shrink-0",
                    selectedDay === day ? "bg-white text-blue-600 font-bold shadow-2xs" : "text-slate-500"
                  )}
                >
                  {day}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            {[
              { slot: "08:00 AM", label: "Morning News Digest" },
              { slot: "12:00 PM", label: "Midday Live Studio Bulletin" },
              { slot: "04:00 PM", label: "Package Clearances" },
              { slot: "06:00 PM", label: "Prime Telecast Rundown" },
              { slot: "09:00 PM", label: "Nightly Recap" },
            ].map((timeItem, index) => {
              const matchedTask = selectedDayTasks[index % selectedDayTasks.length];

              return (
                <div key={timeItem.slot} className="flex items-start gap-3 sm:gap-4 py-2 border-b border-slate-50">
                  <span className="w-16 sm:w-20 font-mono text-[11px] sm:text-xs font-semibold text-slate-400 shrink-0 mt-1">
                    {timeItem.slot}
                  </span>
                  <div className="flex-1 min-w-0">
                    {matchedTask ? (
                      <div
                        onClick={() => setActiveTask(matchedTask)}
                        className="p-3 rounded-xl border border-blue-100 bg-blue-50/40 hover:bg-blue-50/80 transition-colors cursor-pointer"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono font-bold text-blue-700 uppercase">
                            {matchedTask.unitName}
                          </span>
                          <StatusBadge status={matchedTask.status} className="text-[9px] py-0.2" />
                        </div>
                        <p className="text-xs font-semibold text-slate-900 mt-0.5">{matchedTask.title}</p>
                        <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                          Anchor: {matchedTask.assigneeName ?? "Staff Member"}
                        </p>
                      </div>
                    ) : (
                      <div className="h-9 rounded-xl border border-dashed border-slate-200 flex items-center px-3 text-slate-300 font-mono text-[11px]">
                        Open Telecast Slot
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. MONTH VIEW */}
      {viewMode === "month" && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-3 sm:p-5 shadow-2xs space-y-3">
          <div className="grid grid-cols-7 text-center font-mono text-[10px] sm:text-xs text-slate-400 pb-2 border-b border-slate-100 font-medium">
            {["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"].map((d) => (
              <div key={d}>{d}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
            {Array.from({ length: 28 }).map((_, i) => {
              const dayNum = i + 1;
              const hasTask = dayNum >= 13 && dayNum <= 19;
              const isToday = dayNum === 13;

              return (
                <div
                  key={i}
                  onClick={() => {
                    if (hasTask) setSelectedDay("Sun");
                  }}
                  className={cn(
                    "min-h-14 sm:min-h-20 p-1.5 sm:p-2 rounded-xl border flex flex-col justify-between transition-all cursor-pointer",
                    isToday
                      ? "border-blue-600 bg-blue-50/20"
                      : "border-slate-100 hover:border-slate-200 bg-slate-50/40"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={cn(
                        "w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center rounded-full text-[10px] sm:text-xs font-mono font-semibold",
                        isToday ? "bg-blue-600 text-white" : "text-slate-700"
                      )}
                    >
                      {dayNum}
                    </span>
                    {hasTask && <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />}
                  </div>

                  {hasTask && (
                    <div className="hidden sm:block mt-1">
                      <p className="text-[9px] font-mono text-blue-700 truncate font-medium">
                        Telecast Active
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* EVENT INSPECTOR MODAL: Full dialog on desktop, bottom sheet on mobile */}
      <AnimatePresence>
        {activeTask && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/40 backdrop-blur-xs p-0 sm:p-4">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 30 }}
              className="w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-3xl border border-slate-200 shadow-2xl p-5 sm:p-6 space-y-4 max-h-[85vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Radio className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-mono font-bold text-slate-800 uppercase">
                      {activeTask.unitName}
                    </h4>
                    <p className="text-[10px] text-slate-400 font-mono">Telecast Package Card</p>
                  </div>
                </div>
                <button
                  onClick={() => setActiveTask(null)}
                  className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3">
                <h3 className="text-xs sm:text-sm font-semibold text-slate-900 leading-snug">
                  {activeTask.title}
                </h3>

                {activeTask.description && (
                  <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                    {activeTask.description}
                  </p>
                )}

                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-[10px] font-mono text-slate-400 uppercase block">
                      Lead Anchor
                    </span>
                    <span className="text-xs font-semibold text-slate-800">
                      {activeTask.assigneeName ?? "Unassigned"}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-[10px] font-mono text-slate-400 uppercase block">
                      Status
                    </span>
                    <div className="mt-0.5">
                      <StatusBadge status={activeTask.status} className="text-[9px] py-0.2" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex gap-2">
                <button
                  onClick={() => {
                    handleTriggerAlert(activeTask);
                    setActiveTask(null);
                  }}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-medium border border-amber-200 transition-colors"
                >
                  <Bell className="w-3.5 h-3.5 text-amber-600" />
                  <span>Send Alert</span>
                </button>
                <Link
                  href={`/dashboard?day=${activeTask.dayOfWeek}`}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium shadow-xs transition-colors"
                >
                  <span>Open Rundown</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}