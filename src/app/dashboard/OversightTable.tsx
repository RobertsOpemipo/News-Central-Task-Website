"use client";

import React, { useState, useTransition } from "react";
import { verifyTaskAction } from "@/app/actions/tasks";
import { StatusBadge, type StatusType } from "@/components/ui/Badge";
import { Check, Flag, Loader2, FileText, User, Calendar } from "lucide-react";

interface TaskRecord {
  id: string;
  title: string;
  description: string | null;
  dayOfWeek: string;
  status: StatusType;
  loggedSummary: string | null;
  loggedAt: Date | null;
  unitName: string;
  assigneeName: string | null;
}

interface OversightTableProps {
  tasks: TaskRecord[];
}

export function OversightTable({ tasks }: OversightTableProps) {
  const [filter, setFilter] = useState<string>("ALL");
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleVerify = (taskId: string, approved: boolean) => {
    setLoadingId(taskId);
    startTransition(async () => {
      await verifyTaskAction({ taskId, approved });
      setLoadingId(null);
    });
  };

  const filteredTasks = filter === "ALL" 
    ? tasks 
    : tasks.filter((t) => t.status === filter);

  return (
    <div className="space-y-4">
      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 text-xs">
        {["ALL", "AWAITING_REVIEW", "COMPLETED", "FLAGGED", "PENDING"].map((st) => (
          <button
            key={st}
            onClick={() => setFilter(st)}
            className={`px-3 py-1.5 rounded-xl font-medium transition-all shrink-0 ${
              filter === st
                ? "bg-slate-900 text-white font-semibold shadow-2xs"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            {st.replace("_", " ")}
          </button>
        ))}
      </div>

      {/* MOBILE VIEW: Card Stack (hidden on desktop) */}
      <div className="block lg:hidden space-y-3">
        {filteredTasks.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-400 text-xs font-mono">
            No packages match this filter.
          </div>
        ) : (
          filteredTasks.map((task) => (
            <div
              key={task.id}
              className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs space-y-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-[10px] font-mono font-bold text-slate-500 uppercase">
                    {task.unitName}
                  </span>
                  <h3 className="text-xs font-semibold text-slate-900 mt-0.5">{task.title}</h3>
                </div>
                <StatusBadge status={task.status} className="text-[9px] py-0.5 shrink-0" />
              </div>

              {task.loggedSummary && (
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-xs text-slate-600 leading-relaxed">
                  <div className="flex items-center gap-1 text-[10px] font-mono text-slate-400 mb-1">
                    <FileText className="w-3 h-3 text-blue-600" />
                    <span>Submitted Proof:</span>
                  </div>
                  &quot;{task.loggedSummary}&quot;
                </div>
              )}

              <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-1">
                <span className="flex items-center gap-1 text-slate-600">
                  <User className="w-3 h-3 text-slate-400" />
                  {task.assigneeName ?? "Unassigned"}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-slate-400" />
                  {task.dayOfWeek}
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                <button
                  disabled={isPending && loadingId === task.id}
                  onClick={() => handleVerify(task.id, true)}
                  className="flex-1 inline-flex items-center justify-center gap-1 py-1.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium transition-colors disabled:opacity-50"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Seal Package</span>
                </button>
                <button
                  disabled={isPending && loadingId === task.id}
                  onClick={() => handleVerify(task.id, false)}
                  className="flex-1 inline-flex items-center justify-center gap-1 py-1.5 px-3 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-medium transition-colors disabled:opacity-50"
                >
                  <Flag className="w-3.5 h-3.5" />
                  <span>Flag Rewrite</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* DESKTOP VIEW: Full Structured Table (hidden on mobile) */}
      <div className="hidden lg:block bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-mono text-[11px]">
            <tr>
              <th className="py-3 px-4">Story & Filing</th>
              <th className="py-3 px-4">Desk</th>
              <th className="py-3 px-4">Correspondent</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Clearance</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredTasks.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-slate-400 font-mono">
                  No editorial records match filter.
                </td>
              </tr>
            ) : (
              filteredTasks.map((task) => (
                <tr key={task.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-4 max-w-sm">
                    <p className="font-semibold text-slate-900">{task.title}</p>
                    {task.loggedSummary ? (
                      <p className="text-slate-500 italic mt-0.5 line-clamp-1">
                        &quot;{task.loggedSummary}&quot;
                      </p>
                    ) : (
                      <p className="text-slate-400 text-[11px] font-mono mt-0.5">No filing submitted</p>
                    )}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-slate-600">{task.unitName}</td>
                  <td className="py-3.5 px-4 font-mono text-slate-600">
                    {task.assigneeName ?? "Unassigned"}
                  </td>
                  <td className="py-3.5 px-4">
                    <StatusBadge status={task.status} />
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="inline-flex items-center gap-1.5">
                      <button
                        disabled={isPending && loadingId === task.id}
                        onClick={() => handleVerify(task.id, true)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium transition-colors disabled:opacity-50"
                        title="Seal for broadcast"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Seal</span>
                      </button>
                      <button
                        disabled={isPending && loadingId === task.id}
                        onClick={() => handleVerify(task.id, false)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-medium transition-colors disabled:opacity-50"
                        title="Flag for rewrite"
                      >
                        <Flag className="w-3.5 h-3.5" />
                        <span>Flag</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}