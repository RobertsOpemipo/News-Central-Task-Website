// src/app/dashboard/BroadcastScheduleGrid.tsx (or src/components/dashboard/BroadcastScheduleGrid.tsx)
"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { StatusBadge, type StatusType } from "@/components/ui/Badge";
import { rescheduleTaskToDateAction } from "@/app/actions/tasks";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Bell,
  BellRing,
  X,
  Radio,
  ArrowUpRight,
  User,
  GripVertical,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface ScheduledTask {
  id: string;
  title: string;
  description: string | null;
  dayOfWeek: string;
  scheduledFor?: string | null; // "YYYY-MM-DD"
  status: StatusType;
  unitName: string;
  assigneeName: string | null;
}

interface GridProps {
  tasks: ScheduledTask[];
  isAdmin?: boolean;
}

type CalendarViewMode = "day" | "week" | "month";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const WEEKDAY_HEADERS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function BroadcastScheduleGrid({ tasks: initialTasks, isAdmin = false }: GridProps) {
  const [tasksList, setTasksList] = useState<ScheduledTask[]>(initialTasks);
  const [viewMode, setViewMode] = useState<CalendarViewMode>("month");

 // AFTER (Dynamic to real current time):
const today = new Date();
const todayISO = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

const [currentYear, setCurrentYear] = useState<number>(today.getFullYear());
const [currentMonth, setCurrentMonth] = useState<number>(today.getMonth());
const [selectedDateStr, setSelectedDateStr] = useState<string>(todayISO);

  const [activeTask, setActiveTask] = useState<ScheduledTask | null>(null);
  const [alertSentId, setAlertSentId] = useState<string | null>(null);
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [activeDropTarget, setActiveDropTarget] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  // Navigation handlers
  const handlePrev = () => {
    if (viewMode === "day") {
      const d = new Date(selectedDateStr);
      d.setDate(d.getDate() - 1);
      const iso = d.toISOString().split("T")[0];
      setSelectedDateStr(iso);
      setCurrentMonth(d.getMonth());
      setCurrentYear(d.getFullYear());
    } else {
      if (currentMonth === 0) {
        setCurrentMonth(11);
        setCurrentYear((y) => y - 1);
      } else {
        setCurrentMonth((m) => m - 1);
      }
    }
  };

  const handleNext = () => {
    if (viewMode === "day") {
      const d = new Date(selectedDateStr);
      d.setDate(d.getDate() + 1);
      const iso = d.toISOString().split("T")[0];
      setSelectedDateStr(iso);
      setCurrentMonth(d.getMonth());
      setCurrentYear(d.getFullYear());
    } else {
      if (currentMonth === 11) {
        setCurrentMonth(0);
        setCurrentYear((y) => y + 1);
      } else {
        setCurrentMonth((m) => m + 1);
      }
    }
  };

  const handleToday = () => {
    const today = new Date();
    setCurrentYear(today.getFullYear());
    setCurrentMonth(today.getMonth());
    const iso = today.toISOString().split("T")[0];
    setSelectedDateStr(iso);
  };

  // Build Calendar Matrix for Month View
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayWeekday = new Date(currentYear, currentMonth, 1).getDay();
  const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate();

  const monthGridCells = [];
  for (let i = firstDayWeekday - 1; i >= 0; i--) {
    const dayNum = daysInPrevMonth - i;
    const prevM = currentMonth === 0 ? 11 : currentMonth - 1;
    const prevY = currentMonth === 0 ? currentYear - 1 : currentYear;
    const dateStr = `${prevY}-${String(prevM + 1).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`;
    monthGridCells.push({ dayNum, dateStr, isCurrentMonth: false });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    monthGridCells.push({ dayNum: d, dateStr, isCurrentMonth: true });
  }
  const remainingCells = (7 - (monthGridCells.length % 7)) % 7;
  for (let d = 1; d <= remainingCells; d++) {
    const nextM = currentMonth === 11 ? 0 : currentMonth + 1;
    const nextY = currentMonth === 11 ? currentYear + 1 : currentYear;
    const dateStr = `${nextY}-${String(nextM + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    monthGridCells.push({ dayNum: d, dateStr, isCurrentMonth: false });
  }

  // Build 7-day strip for Week View around the selected date
  const currSelected = new Date(selectedDateStr);
  const currentDayOfWeek = currSelected.getDay();
  const weekCells = [];
  for (let i = 0; i < 7; i++) {
    const tempDate = new Date(currSelected);
    tempDate.setDate(currSelected.getDate() - currentDayOfWeek + i);
    const dateStr = tempDate.toISOString().split("T")[0];
    weekCells.push({
      dayName: WEEKDAY_HEADERS[i],
      dayNum: tempDate.getDate(),
      dateStr,
    });
  }

  // Handle Drag and Drop
  const handleDropOnDate = (targetDateStr: string) => {
    if (!draggedTaskId || !isAdmin) return;

    const sourceTask = tasksList.find((t) => t.id === draggedTaskId);
    if (!sourceTask || sourceTask.scheduledFor === targetDateStr) {
      setActiveDropTarget(null);
      setDraggedTaskId(null);
      return;
    }

    setTasksList((prev) =>
      prev.map((t) => (t.id === draggedTaskId ? { ...t, scheduledFor: targetDateStr } : t))
    );

    setActiveDropTarget(null);
    const movedId = draggedTaskId;
    setDraggedTaskId(null);

    startTransition(async () => {
      await rescheduleTaskToDateAction({
        taskId: movedId,
        targetDate: targetDateStr,
      });
    });
  };

  const handleTriggerAlert = (task: ScheduledTask) => {
    setAlertSentId(task.id);
    setTimeout(() => setAlertSentId(null), 3200);
  };

  const selectedDateTasks = tasksList.filter((t) => t.scheduledFor && t.scheduledFor.startsWith(selectedDateStr));

  return (
    <div className="space-y-5">
      {/* Top Header Controls: Mode Selector & Navigation */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-4 sm:p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 font-sans">
            {MONTH_NAMES[currentMonth]}{" "}
            <span className="text-slate-400 font-normal">{currentYear}</span>
          </h2>
          {isAdmin && (
            <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 font-medium">
              Admin: Drag cards to reschedule
            </span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* iOS-Style Day / Week / Month Segmented Switch */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200/70">
            {(["day", "week", "month"] as CalendarViewMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={cn(
                  "px-3.5 py-1 text-xs font-medium rounded-lg capitalize transition-all",
                  viewMode === mode
                    ? "bg-white text-slate-900 shadow-xs font-semibold"
                    : "text-slate-500 hover:text-slate-900"
                )}
              >
                {mode}
              </button>
            ))}
          </div>

          <button
            onClick={handleToday}
            className="px-3.5 py-1 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors font-sans"
          >
            Today
          </button>

          <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden bg-slate-50">
            <button
              onClick={handlePrev}
              className="p-1.5 hover:bg-slate-100 text-slate-600 transition-colors"
              title="Previous"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="w-[1px] h-4 bg-slate-200" />
            <button
              onClick={handleNext}
              className="p-1.5 hover:bg-slate-100 text-slate-600 transition-colors"
              title="Next"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 1. DAY VIEW */}
      {viewMode === "day" && (
        <div className="bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <CalendarIcon className="w-4 h-4 text-blue-600" />
              <h3 className="text-sm sm:text-base font-bold text-slate-900">
                Single Day Rundown: {selectedDateStr}
              </h3>
            </div>
            <span className="text-xs font-mono text-slate-400">
              {selectedDateTasks.length} {selectedDateTasks.length === 1 ? "package" : "packages"}
            </span>
          </div>

          {selectedDateTasks.length === 0 ? (
            <div className="py-14 text-center text-slate-400 font-mono text-xs border border-dashed border-slate-200 rounded-2xl">
              No telecast packages scheduled for this date.
            </div>
          ) : (
            <div className="space-y-3">
              {selectedDateTasks.map((task) => (
                <div
                  key={task.id}
                  onClick={() => setActiveTask(task)}
                  className="p-4 rounded-2xl border border-slate-100 bg-slate-50/70 hover:bg-slate-50 transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-slate-800">{task.unitName}</span>
                      <StatusBadge status={task.status} className="text-[9px] py-0.2" />
                    </div>
                    <p className="text-xs sm:text-sm font-semibold text-slate-900">{task.title}</p>
                    <p className="text-xs text-slate-400 font-mono flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      Lead: {task.assigneeName ?? "Unassigned"}
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleTriggerAlert(task);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 self-end sm:self-center"
                  >
                    <Bell className="w-3.5 h-3.5 text-amber-500" />
                    <span>Send Alert</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 2. WEEK VIEW */}
      {viewMode === "week" && (
        <div className="space-y-4">
          <div className="grid grid-cols-7 gap-1.5 sm:gap-2 bg-white p-3 rounded-3xl border border-slate-200/90 shadow-sm">
            {weekCells.map((cell) => {
              const isSelected = selectedDateStr === cell.dateStr;
              const isDropHovered = activeDropTarget === cell.dateStr;
              const cellTasksCount = tasksList.filter(
                (t) => t.scheduledFor && t.scheduledFor.startsWith(cell.dateStr)
              ).length;

              return (
                <div
                  key={cell.dateStr}
                  onDragOver={(e) => {
                    if (isAdmin) {
                      e.preventDefault();
                      setActiveDropTarget(cell.dateStr);
                    }
                  }}
                  onDragLeave={() => setActiveDropTarget(null)}
                  onDrop={() => handleDropOnDate(cell.dateStr)}
                  onClick={() => setSelectedDateStr(cell.dateStr)}
                  className={cn(
                    "flex flex-col items-center py-3 rounded-2xl transition-all cursor-pointer border",
                    isSelected
                      ? "bg-blue-600 text-white shadow-xs font-bold border-blue-600"
                      : "hover:bg-slate-50 text-slate-700 border-transparent",
                    isDropHovered && "ring-2 ring-blue-500 bg-blue-50 border-blue-400 scale-[1.03]"
                  )}
                >
                  <span
                    className={cn(
                      "text-[10px] sm:text-[11px] uppercase font-mono tracking-wider",
                      isSelected ? "text-blue-100" : "text-slate-400"
                    )}
                  >
                    {cell.dayName}
                  </span>
                  <span className="text-sm sm:text-base font-bold font-mono mt-0.5">
                    {cell.dayNum}
                  </span>
                  <div className="flex gap-0.5 mt-1 h-1.5 items-center">
                    {cellTasksCount > 0 && (
                      <span
                        className={cn(
                          "w-1.5 h-1.5 rounded-full",
                          isSelected ? "bg-white" : "bg-blue-600"
                        )}
                      />
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Agenda view for the week-selected day */}
          <div
            onDragOver={(e) => {
              if (isAdmin) {
                e.preventDefault();
                setActiveDropTarget(selectedDateStr);
              }
            }}
            onDrop={() => handleDropOnDate(selectedDateStr)}
            className="bg-white rounded-3xl border border-slate-200/90 p-5 shadow-sm space-y-3"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 text-blue-600" />
                <h3 className="text-sm font-semibold text-slate-900">
                  Rundown for {selectedDateStr}
                </h3>
              </div>
              <span className="text-xs font-mono text-slate-400">
                {selectedDateTasks.length} {selectedDateTasks.length === 1 ? "story" : "stories"}
              </span>
            </div>

            {selectedDateTasks.length === 0 ? (
              <div className="py-12 text-center text-slate-400 font-mono text-xs border border-dashed border-slate-200 rounded-2xl">
                No telecasts scheduled for this date. {isAdmin && "Drag a story here to assign."}
              </div>
            ) : (
              <div className="space-y-2.5">
                {selectedDateTasks.map((task) => (
                  <motion.div
                    key={task.id}
                    layoutId={task.id}
                    draggable={isAdmin}
                    onDragStart={() => setDraggedTaskId(task.id)}
                    onDragEnd={() => setDraggedTaskId(null)}
                    onClick={() => setActiveTask(task)}
                    className={cn(
                      "p-3.5 rounded-2xl border border-slate-100 bg-slate-50/70 hover:bg-slate-50 transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 group",
                      draggedTaskId === task.id && "opacity-40 border-dashed border-blue-400",
                      isAdmin && "cursor-grab active:cursor-grabbing"
                    )}
                  >
                    <div className="flex items-start gap-2.5 min-w-0">
                      {isAdmin && (
                        <div className="text-slate-300 group-hover:text-slate-500 pt-0.5 shrink-0">
                          <GripVertical className="w-4 h-4" />
                        </div>
                      )}
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-slate-800">{task.unitName}</span>
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
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleTriggerAlert(task);
                      }}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-mono border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 self-end sm:self-center"
                    >
                      <Bell className="w-3 h-3 text-amber-500" />
                      <span>Send Alert</span>
                    </button>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. MONTH VIEW */}
      {viewMode === "month" && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200/90 rounded-3xl shadow-sm overflow-hidden">
            <div className="grid grid-cols-7 border-b border-slate-100 bg-slate-50/70">
              {WEEKDAY_HEADERS.map((day, idx) => (
                <div
                  key={day}
                  className={cn(
                    "py-2.5 text-center text-xs font-semibold uppercase tracking-wider font-mono",
                    idx === 0 || idx === 6 ? "text-slate-400" : "text-slate-600"
                  )}
                >
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 border-b border-slate-100 divide-x divide-y divide-slate-100">
              {monthGridCells.map((cell) => {
                const isSelected = selectedDateStr === cell.dateStr;
                const isDropHovered = activeDropTarget === cell.dateStr;
                const cellTasks = tasksList.filter(
                  (t) => t.scheduledFor && t.scheduledFor.startsWith(cell.dateStr)
                );

                return (
                  <div
                    key={cell.dateStr}
                    onClick={() => setSelectedDateStr(cell.dateStr)}
                    onDragOver={(e) => {
                      if (isAdmin) {
                        e.preventDefault();
                        setActiveDropTarget(cell.dateStr);
                      }
                    }}
                    onDragLeave={() => setActiveDropTarget(null)}
                    onDrop={() => handleDropOnDate(cell.dateStr)}
                    className={cn(
                      "min-h-[90px] sm:min-h-[110px] p-2 transition-all cursor-pointer flex flex-col justify-between group",
                      cell.isCurrentMonth ? "bg-white" : "bg-slate-50/40 text-slate-400",
                      isSelected && "bg-blue-50/40 ring-2 ring-inset ring-blue-500",
                      isDropHovered && "bg-blue-100/60 ring-2 ring-blue-600 scale-[1.01]"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={cn(
                          "w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center text-xs font-semibold font-mono transition-transform",
                          isSelected
                            ? "bg-blue-600 text-white font-bold shadow-xs scale-105"
                            : cell.isCurrentMonth
                            ? "text-slate-700 group-hover:bg-slate-100"
                            : "text-slate-400"
                        )}
                      >
                        {cell.dayNum}
                      </span>

                      {cellTasks.length > 0 && (
                        <span className="hidden sm:inline-block text-[10px] font-mono text-slate-400">
                          {cellTasks.length} {cellTasks.length === 1 ? "pkg" : "pkgs"}
                        </span>
                      )}
                    </div>

                    <div className="space-y-1 mt-1">
                      <div className="hidden sm:block space-y-1">
                        {cellTasks.slice(0, 2).map((t) => (
                          <div
                            key={t.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveTask(t);
                            }}
                            className="text-[10px] truncate px-2 py-0.5 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-200/80 font-medium text-slate-800 transition-colors"
                          >
                            {t.title}
                          </div>
                        ))}
                        {cellTasks.length > 2 && (
                          <span className="text-[9px] font-mono text-blue-600 font-semibold pl-1 block">
                            +{cellTasks.length - 2} more
                          </span>
                        )}
                      </div>

                      <div className="flex sm:hidden items-center justify-center gap-0.5 pt-1">
                        {cellTasks.slice(0, 3).map((t) => (
                          <span
                            key={t.id}
                            className={cn(
                              "w-1.5 h-1.5 rounded-full",
                              t.status === "COMPLETED" ? "bg-emerald-500" : "bg-blue-500"
                            )}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Agenda for Date Selected in Month */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <CalendarIcon className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900">
                    Scheduled Telecasts for {selectedDateStr}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {selectedDateTasks.length}{" "}
                    {selectedDateTasks.length === 1 ? "story assigned" : "stories assigned"}
                  </p>
                </div>
              </div>
            </div>

            {selectedDateTasks.length === 0 ? (
              <div className="py-12 text-center text-slate-400 font-mono text-xs border border-dashed border-slate-200 rounded-2xl">
                No telecasts scheduled for this date. {isAdmin && "Drag a story here to assign."}
              </div>
            ) : (
              <div className="space-y-3">
                {selectedDateTasks.map((task) => (
                  <motion.div
                    key={task.id}
                    layoutId={task.id}
                    draggable={isAdmin}
                    onDragStart={() => setDraggedTaskId(task.id)}
                    onDragEnd={() => setDraggedTaskId(null)}
                    onClick={() => setActiveTask(task)}
                    className={cn(
                      "p-4 rounded-2xl border border-slate-100 bg-slate-50/70 hover:bg-slate-50 hover:border-slate-300 transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 group",
                      draggedTaskId === task.id && "opacity-40 border-dashed border-blue-400",
                      isAdmin && "cursor-grab active:cursor-grabbing"
                    )}
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      {isAdmin && (
                        <div className="text-slate-300 group-hover:text-slate-500 pt-1 shrink-0">
                          <GripVertical className="w-4 h-4" />
                        </div>
                      )}
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-slate-800">{task.unitName}</span>
                          <StatusBadge status={task.status} className="text-[9px] py-0.2" />
                        </div>
                        <p className="text-sm font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                          {task.title}
                        </p>
                        <p className="text-xs text-slate-400 font-mono flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-slate-400" />
                          Anchor: {task.assigneeName ?? "Unassigned"}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleTriggerAlert(task);
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 self-end sm:self-center transition-colors"
                    >
                      <Bell className="w-3.5 h-3.5 text-amber-500" />
                      <span>Send Alert</span>
                    </button>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Alert Notification Toast */}
      <AnimatePresence>
        {alertSentId && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed top-6 right-6 z-50 flex items-center gap-2 bg-slate-900 text-white px-4 py-2.5 rounded-2xl shadow-xl border border-slate-800 text-xs font-mono"
          >
            <BellRing className="w-4 h-4 text-amber-400 animate-bounce" />
            <span>Airtime dispatch ping sent to correspondent</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Detail Slideover Modal */}
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
                <h3 className="text-sm font-semibold text-slate-900 leading-snug">
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