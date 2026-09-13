"use client";

import React, { useState, useTransition } from "react";
import { submitDailyLog } from "@/app/actions/tasks";
import { X, Send, Loader2, FileCheck } from "lucide-react";

interface DrawerProps {
  task: {
    id: string;
    title: string;
    unit: string;
    assignee: string;
    initialSummary?: string;
  };
  onClose: () => void;
}

export function TaskLoggerDrawer({ task, onClose }: DrawerProps) {
  const [summary, setSummary] = useState(task.initialSummary || "");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    startTransition(async () => {
      const res = await submitDailyLog({
        taskId: task.id,
        loggedSummary: summary,
      });

      if (!res.success) {
        setErrorMessage(res.message || "Failed to submit task log.");
        return;
      }

      onClose();
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/20 backdrop-blur-xs">
      <div className="w-full max-w-md bg-white h-full shadow-2xl p-6 flex flex-col border-l border-slate-200 animate-in slide-in-from-right duration-200">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2 text-slate-800">
            <FileCheck className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold text-sm tracking-tight">Log Daily Task</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 flex flex-col justify-between pt-6">
          <div className="space-y-4">
            <div>
              <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">
                Task Name
              </span>
              <p className="text-sm font-medium text-slate-900 mt-1">{task.title}</p>
            </div>

            <div>
              <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">
                Assigned Unit
              </span>
              <p className="text-xs text-slate-600 mt-1">
                {task.unit} — {task.assignee}
              </p>
            </div>

            {errorMessage && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg">
                {errorMessage}
              </div>
            )}

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                Work Summary & Execution Proof
              </label>
              <textarea
                rows={6}
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder="Detail what was completed, key decisions made, or deliverable links..."
                className="w-full text-xs rounded-lg border border-slate-200 p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent leading-relaxed"
                required
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Submitting this changes task status to <span className="font-mono text-amber-600">AWAITING_REVIEW</span>.
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex gap-3">
            <button
              type="button"
              disabled={isPending}
              onClick={onClose}
              className="flex-1 px-4 py-2 text-xs font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-sm transition-colors disabled:opacity-50"
            >
              {isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" /> Submit Log
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}