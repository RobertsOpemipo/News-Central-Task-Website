"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { StatusBadge, type StatusType } from "@/components/ui/Badge";
import { TaskLoggerDrawer } from "@/app/dashboard/TaskLoggerDrawer";
import { AssignTaskModal } from "@/app/dashboard/AssignTaskModal";
import { CheckSquare, Calendar, ChevronRight, User } from "lucide-react";

interface TaskItem {
  id: string;
  title: string;
  description: string | null;
  dayOfWeek: string;
  status: StatusType;
  loggedSummary: string | null;
  loggedAt: Date | null;
  unitName: string;
  assigneeName: string | null;
  assigneeEmail: string | null;
}

interface OptionItem {
  id: string;
  name: string;
}

interface TaskDeckViewProps {
  initialTasks: TaskItem[];
  currentDay: string;
  availableUnits?: OptionItem[];
  availableUsers?: OptionItem[];
}

const DAYS_OF_WEEK = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function TaskDeckView({
  initialTasks,
  currentDay,
  availableUnits = [],
  availableUsers = [],
}: TaskDeckViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedTask, setSelectedTask] = useState<TaskItem | null>(null);

  const handleDayChange = (day: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("day", day);
    router.push(`/dashboard?${params.toString()}`);
  };

  const completedCount = initialTasks.filter((t) => t.status === "COMPLETED").length;
  const awaitingCount = initialTasks.filter((t) => t.status === "AWAITING_REVIEW").length;

  return (
    <div className="flex-1 flex flex-col min-w-0">
      {/* Top Header */}
      <header className="border-b border-slate-200 bg-white px-4 sm:px-8 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sticky top-0 z-10">
        <div>
          <h1 className="text-sm sm:text-base font-semibold tracking-tight text-slate-900">
            Daily Rundown & Execution
          </h1>
          <p className="text-[11px] sm:text-xs text-slate-500">
            Live filed stories, reporter proof submissions, and broadcast verification.
          </p>
        </div>

        {/* Action Controls: Modal & Day Selector */}
        <div className="flex flex-wrap items-center gap-2">
          {availableUnits.length > 0 && availableUsers.length > 0 && (
            <AssignTaskModal
              units={availableUnits}
              users={availableUsers}
              currentDay={currentDay}
            />
          )}

          {/* Horizontally scrollable day pills on small screens */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200/80 overflow-x-auto max-w-full">
            {DAYS_OF_WEEK.map((day) => (
              <button
                key={day}
                onClick={() => handleDayChange(day)}
                className={`px-2.5 py-1 text-xs font-mono font-medium rounded-lg transition-all shrink-0 ${
                  currentDay === day
                    ? "bg-white text-blue-600 shadow-2xs border border-slate-200/60 font-semibold"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                {day}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Content Body */}
      <div className="p-4 sm:p-6 lg:p-8 max-w-6xl w-full mx-auto space-y-4 sm:space-y-6">
        {/* Breaking Wire Ticker */}
        <div className="bg-slate-900 text-white rounded-2xl px-3.5 py-2.5 flex items-center justify-between shadow-xs border border-slate-800 text-xs">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <span className="px-1.5 py-0.5 rounded bg-rose-600 font-mono text-[9px] font-bold uppercase tracking-wider shrink-0 animate-pulse">
              LIVE WIRE
            </span>
            <p className="text-slate-300 font-mono truncate text-[11px] sm:text-xs">
              Rundown locked for scheduled telecasts. All units must clear remaining packages.
            </p>
          </div>
          <span className="hidden sm:inline font-mono text-[11px] text-slate-400 shrink-0 ml-2">
            UTC+1
          </span>
        </div>

        {/* Responsive KPI Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs">
            <p className="text-[11px] font-mono uppercase tracking-wider text-slate-400">Total Packages</p>
            <p className="text-2xl font-bold tracking-tight text-slate-900 mt-0.5">{initialTasks.length}</p>
          </div>
          <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs">
            <p className="text-[11px] font-mono uppercase tracking-wider text-amber-600">Awaiting Desk Review</p>
            <p className="text-2xl font-bold tracking-tight text-amber-600 mt-0.5">{awaitingCount}</p>
          </div>
          <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs">
            <p className="text-[11px] font-mono uppercase tracking-wider text-emerald-600">Sealed for Broadcast</p>
            <p className="text-2xl font-bold tracking-tight text-emerald-600 mt-0.5">{completedCount}</p>
          </div>
        </div>

        {/* Section Title */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-blue-600" />
            <h2 className="text-xs sm:text-sm font-semibold tracking-tight text-slate-800">
              Assignments for {currentDay}
            </h2>
          </div>
          <span className="text-[11px] font-mono text-slate-400">
            {initialTasks.length} {initialTasks.length === 1 ? "story" : "stories"}
          </span>
        </div>

        {/* Task List */}
        {initialTasks.length === 0 ? (
          <div className="text-center py-14 border border-dashed border-slate-200 rounded-2xl bg-white/60">
            <CheckSquare className="w-7 h-7 text-slate-300 mx-auto mb-1.5" />
            <p className="text-xs font-semibold text-slate-600">No news packages scheduled for {currentDay}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Use &quot;Assign Story&quot; above to schedule a package.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {initialTasks.map((task) => (
              <div
                key={task.id}
                className="flex flex-col sm:flex-row sm:items-start justify-between p-4 rounded-2xl border border-slate-200/90 bg-white hover:border-slate-300 transition-all shadow-2xs gap-3"
              >
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-800">{task.unitName}</span>
                    <span className="sm:hidden ml-auto">
                      <StatusBadge status={task.status} className="text-[9px] py-0.5" />
                    </span>
                  </div>

                  <h3 className="text-xs sm:text-sm font-semibold text-slate-900 leading-snug">
                    {task.title}
                  </h3>

                  {task.description && (
                    <p className="text-xs text-slate-500 leading-relaxed line-clamp-2 sm:line-clamp-none">
                      {task.description}
                    </p>
                  )}

                  <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-slate-400 font-mono">
                    <span className="flex items-center gap-1 text-slate-600">
                      <User className="w-3 h-3 text-slate-400" />
                      {task.assigneeName ?? "Unassigned"}
                    </span>
                    {task.loggedSummary && (
                      <>
                        <span>•</span>
                        <span className="text-slate-600 font-sans italic truncate max-w-[260px] sm:max-w-md">
                          &quot;{task.loggedSummary}&quot;
                        </span>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                  <div className="hidden sm:block">
                    <StatusBadge status={task.status} />
                  </div>
                  {task.status !== "COMPLETED" && (
                    <button
                      onClick={() => setSelectedTask(task)}
                      className="w-full sm:w-auto px-3 py-1.5 text-xs font-medium text-blue-600 hover:text-blue-700 bg-blue-50/70 hover:bg-blue-100 rounded-xl border border-blue-200 transition-colors text-center"
                    >
                      {task.status === "AWAITING_REVIEW" ? "Update Filing" : "File Work Proof"}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Slide-over Drawer */}
      {selectedTask && (
        <TaskLoggerDrawer
          task={{
            id: selectedTask.id,
            title: selectedTask.title,
            unit: selectedTask.unitName,
            assignee: selectedTask.assigneeName ?? "Correspondent",
            initialSummary: selectedTask.loggedSummary ?? "",
          }}
          onClose={() => setSelectedTask(null)}
        />
      )}
    </div>
  );
}