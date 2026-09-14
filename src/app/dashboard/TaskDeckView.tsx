// src/app/dashboard/TaskDeckView.tsx
"use client";

import React, { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { StatusBadge, type StatusType } from "@/components/ui/Badge";
import { TaskLoggerDrawer } from "@/app/dashboard/TaskLoggerDrawer";
import { AssignTaskModal } from "@/app/dashboard/AssignTaskModal";
import { EditTaskModal } from "@/app/dashboard/EditTaskModal";
import { deleteTask } from "@/app/actions/tasks";
import { getTodayDayOfWeek } from "@/lib/date-utils";
import {
  CheckSquare,
  Calendar,
  User,
  Trash2,
  Edit2,
  AlertCircle,
} from "lucide-react";

export interface TaskItem {
  id: string;
  title: string;
  description: string | null;
  dayOfWeek: "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun";
  status: StatusType;
  loggedSummary: string | null;
  loggedAt: Date | null;
  unitName: string;
  assigneeName: string | null;
  assigneeEmail: string | null;
}

export interface OptionItem {
  id: string;
  name: string;
}

interface TaskDeckViewProps {
  initialTasks: TaskItem[];
  currentDay: "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun" | string;
  availableUnits?: OptionItem[];
  availableUsers?: OptionItem[];
  isAdmin?: boolean;
}

const DAYS_OF_WEEK: Array<"Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun"> = [
  "Mon",
  "Tue",
  "Wed",
  "Thu",
  "Fri",
  "Sat",
  "Sun",
];

export function TaskDeckView({
  initialTasks,
  currentDay,
  availableUnits = [],
  availableUsers = [],
  isAdmin = false,
}: TaskDeckViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const actualToday = getTodayDayOfWeek();

  const [selectedTaskForLog, setSelectedTaskForLog] = useState<TaskItem | null>(null);
  const [editingTask, setEditingTask] = useState<TaskItem | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleDayChange = (day: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("day", day);
    router.push(`/dashboard?${params.toString()}`);
  };

  const handleDelete = (taskId: string) => {
    if (!confirm("Are you sure you want to purge this package from the broadcast rundown?")) {
      return;
    }

    setActionError(null);
    setIsDeletingId(taskId);

    startTransition(async () => {
      const res = await deleteTask(taskId);
      setIsDeletingId(null);

      if (!res.success) {
        setActionError(res.message || "Failed to purge package.");
      }
    });
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
          {isAdmin && (
            <AssignTaskModal
              units={availableUnits}
              users={availableUsers}
              currentDay={currentDay}
            />
          )}

          {/* Horizontally scrollable day pills on small screens */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200/80 overflow-x-auto max-w-full">
            {DAYS_OF_WEEK.map((day) => {
              const isSelected = currentDay === day;
              const isToday = actualToday === day;

              return (
                <button
                  key={day}
                  onClick={() => handleDayChange(day)}
                  className={`relative px-2.5 py-1 text-xs font-mono font-medium rounded-lg transition-all shrink-0 flex items-center gap-1 ${
                    isSelected
                      ? "bg-white text-blue-600 shadow-2xs border border-slate-200/60 font-semibold"
                      : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  <span>{day}</span>
                  {isToday && (
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        isSelected ? "bg-blue-600" : "bg-emerald-500"
                      }`}
                      title="Today"
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* Content Body */}
      <div className="p-4 sm:p-6 lg:p-8 max-w-6xl w-full mx-auto space-y-4 sm:space-y-6">
        {actionError && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{actionError}</span>
          </div>
        )}

        {/* Live Wire Banner */}
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
            <p className="text-[11px] text-slate-400 mt-0.5">
              {isAdmin
                ? 'Use "Assign Story" above to schedule a package.'
                : "No packages have been dispatched for this cycle."}
            </p>
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

                {/* Card Actions */}
                <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                  <div className="hidden sm:block">
                    <StatusBadge status={task.status} />
                  </div>

                  {task.status !== "COMPLETED" && (
                    <button
                      onClick={() => setSelectedTaskForLog(task)}
                      className="px-2.5 py-1.5 text-xs font-medium text-blue-600 hover:text-blue-700 bg-blue-50/70 hover:bg-blue-100 rounded-xl border border-blue-200 transition-colors"
                    >
                      {task.status === "AWAITING_REVIEW" ? "Update Filing" : "File Work Proof"}
                    </button>
                  )}

                  {isAdmin && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setEditingTask(task)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                        title="Edit story details"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        disabled={isPending && isDeletingId === task.id}
                        onClick={() => handleDelete(task.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors disabled:opacity-50"
                        title="Purge package"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Slide-over Drawer for Filing Proof */}
      {selectedTaskForLog && (
        <TaskLoggerDrawer
          task={{
            id: selectedTaskForLog.id,
            title: selectedTaskForLog.title,
            unit: selectedTaskForLog.unitName,
            assignee: selectedTaskForLog.assigneeName ?? "Correspondent",
            initialSummary: selectedTaskForLog.loggedSummary ?? "",
          }}
          onClose={() => setSelectedTaskForLog(null)}
        />
      )}

      {/* Edit Story Modal */}
      {editingTask && (
        <EditTaskModal
          task={{
            id: editingTask.id,
            title: editingTask.title,
            description: editingTask.description,
            dayOfWeek: editingTask.dayOfWeek,
            unitId: availableUnits.find((u) => u.name === editingTask.unitName)?.id,
            assignedToId: availableUsers.find((u) => u.name === editingTask.assigneeName)?.id,
          }}
          units={availableUnits}
          users={availableUsers}
          onClose={() => setEditingTask(null)}
        />
      )}
    </div>
  );
}