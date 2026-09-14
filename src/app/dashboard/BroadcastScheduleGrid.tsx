"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { StatusBadge, type StatusType } from "@/components/ui/Badge";
import { rescheduleTaskAction } from "@/app/actions/tasks";
import {
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
  isAdmin?: boolean;
}

type CalendarViewMode = "day" | "week" | "month";
type DayName = "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun";

const DAYS_SHORT: DayName[] = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const DATES_MOCK: Record<DayName, number> = {
  Mon: 14,
  Tue: 15,
  Wed: 16,
  Thu: 17,
  Fri: 18,
  Sat: 19,
  Sun: 13,
};

export function BroadcastScheduleGrid({ tasks: initialTasks, isAdmin = false }: GridProps) {
  const [tasksList, setTasksList] = useState<ScheduledTask[]>(initialTasks);
  const [viewMode, setViewMode] = useState<CalendarViewMode>("week");
  const [selectedDay, setSelectedDay] = useState<DayName>("Sun");
  const [activeTask, setActiveTask] = useState<ScheduledTask | null>(null);
  const [alertSentId, setAlertSentId] = useState<string | null>(null);
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [activeDropTarget, setActiveDropTarget] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  // Optimistic drag and drop update
  const handleDropOnDay = (targetDay: DayName) => {
    if (!draggedTaskId || !isAdmin) return;

    const sourceTask = tasksList.find((t) => t.id === draggedTaskId);
    if (!sourceTask || sourceTask.dayOfWeek === targetDay) {
      setActiveDropTarget(null);
      setDraggedTaskId(null);
      return;
    }

    // Optimistic UI state update
    setTasksList((prev) =>
      prev.map((t) => (t.id === draggedTaskId ? { ...t, dayOfWeek: targetDay } : t))
    );

    setActiveDropTarget(null);
    const movedId = draggedTaskId;
    setDraggedTaskId(null);

    startTransition(async () => {
      await rescheduleTaskAction({
        taskId: movedId,
        targetDay,
      });
    });
  };

  const handleTriggerAlert = (task: ScheduledTask) => {
    setAlertSentId(task.id);
    setTimeout(() => setAlertSentId(null), 3200);
  };

  const selectedDayTasks = tasksList.filter((t) => t.dayOfWeek === selectedDay);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Top Header & View Mode Switcher */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-3.5 sm:p-4 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
            September 2026
          </span>
          <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-100">
            Week 38
          </span>
          {isAdmin && (
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 font-semibold">
              ADMIN: Drag stories across days to reschedule
            </span>
          )}
        </div>

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

      {/* WEEK VIEW: Interactive 7-Day Dropzone Board */}
      {viewMode === "week" && (
        <div className="space-y-4">
          {/* Day Capsule Strip (Also serves as drop targets) */}
          <div className="grid grid-cols-7 gap-1 sm:gap-2 bg-white p-2 sm:p-3 rounded-2xl border border-slate-200/80 shadow-2xs">
            {DAYS_SHORT.map((day) => {
              const isSelected = selectedDay === day;
              const isDropHovered = activeDropTarget === day;
              const dayTasksCount = tasksList.filter((t) => t.dayOfWeek === day).length;

              return (
                <div
                  key={day}
                  onDragOver={(e) => {
                    if (isAdmin) {
                      e.preventDefault();
                      setActiveDropTarget(day);
                    }
                  }}
                  onDragLeave={() => setActiveDropTarget(null)}
                  onDrop={() => handleDropOnDay(day)}
                  onClick={() => setSelectedDay(day)}
                  className={cn(
                    "flex flex-col items-center py-2 sm:py-3 rounded-xl transition-all cursor-pointer border",
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
                    {day}
                  </span>
                  <span className="text-xs sm:text-base font-bold font-mono mt-0.5">
                    {DATES_MOCK[day]}
                  </span>
                  <div className="flex gap-0.5 mt-1 h-1.5 items-center">
                    {dayTasksCount > 0 && (
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

          {/* Agenda List for Selected Day */}
          <div
            onDragOver={(e) => {
              if (isAdmin) {
                e.preventDefault();
                setActiveDropTarget(selectedDay);
              }
            }}
            onDrop={() => handleDropOnDay(selectedDay)}
            className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-2xs space-y-3"
          >
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
              <div className="py-12 text-center text-slate-400 font-mono text-xs border border-dashed border-slate-200 rounded-xl">
                No telecasts scheduled for this date. {isAdmin && "Drag a story here to assign."}
              </div>
            ) : (
              <div className="space-y-2.5">
                {selectedDayTasks.map((task) => (
                  <motion.div
                    key={task.id}
                    layoutId={task.id}
                    draggable={isAdmin}
                    onDragStart={() => setDraggedTaskId(task.id)}
                    onDragEnd={() => setDraggedTaskId(null)}
                    onClick={() => setActiveTask(task)}
                    className={cn(
                      "p-3.5 rounded-xl border border-slate-100 bg-slate-50/70 hover:bg-slate-50 hover:border-slate-300 transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 group",
                      draggedTaskId === task.id && "opacity-40 border-dashed border-blue-400",
                      isAdmin && "cursor-grab active:cursor-grabbing"
                    )}
                  >
                    <div className="flex items-start gap-2.5 min-w-0">
                      {isAdmin && (
                        <div className="text-slate-300 group-hover:text-slate-500 pt-0.5 shrink-0" title="Drag to reschedule">
                          <GripVertical className="w-4 h-4" />
                        </div>
                      )}
                      <div className="space-y-1 min-w-0">
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
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

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