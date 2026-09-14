// src/app/dashboard/TaskLoggerDrawer.tsx
"use client";

import React, { useState, useTransition } from "react";
import { submitDailyLog } from "@/app/actions/tasks";
import {
  X,
  Send,
  FileCheck2,
  AlertCircle,
  Loader2,
  CheckCircle2,
  XCircle,
  ArrowRight,
  RotateCcw,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface TaskLoggerDrawerProps {
  task: {
    id: string;
    title: string;
    unit: string;
    assignee: string;
    initialSummary?: string;
  };
  onClose: () => void;
}

type ModalState = "IDLE" | "SUCCESS" | "FAILED";

export function TaskLoggerDrawer({ task, onClose }: TaskLoggerDrawerProps) {
  const [summary, setSummary] = useState(task.initialSummary || "");
  const [modalState, setModalState] = useState<ModalState>("IDLE");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!summary.trim()) return;

    startTransition(async () => {
      try {
        const response = await submitDailyLog({
          taskId: task.id,
          loggedSummary: summary.trim(),
        });

        if (response.success) {
          setModalState("SUCCESS");
        } else {
          setErrorMessage(response.message || "Failed to transmit filing to editorial desk.");
          setModalState("FAILED");
        }
      } catch (err: unknown) {
        setErrorMessage(
          err instanceof Error ? err.message : "A network connection error occurred while logging proof."
        );
        setModalState("FAILED");
      }
    });
  };

  const handleCloseAll = () => {
    setModalState("IDLE");
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={modalState === "IDLE" ? onClose : undefined}
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-40 transition-opacity"
      />

      {/* Slide-over Drawer Panel */}
      <div className="fixed inset-y-0 right-0 z-50 w-full max-w-lg bg-white shadow-2xl flex flex-col justify-between border-l border-slate-200">
        <div>
          {/* Header */}
          <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <FileCheck2 className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-900">File Package Proof</h3>
                <p className="text-xs text-slate-500 font-mono">Editorial Verification Queue</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form Context Info */}
          <div className="p-6 space-y-5">
            <div className="space-y-1">
              <span className="text-[10px] font-mono font-bold text-blue-600 uppercase tracking-wider bg-blue-50 px-2 py-0.5 rounded">
                {task.unit}
              </span>
              <h2 className="text-base font-bold text-slate-900 mt-1">{task.title}</h2>
              <p className="text-xs text-slate-500 font-mono">Assigned Anchor: {task.assignee}</p>
            </div>

            <form id="proof-form" onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700">
                  Execution Proof & Filing Summary
                </label>
                <textarea
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  placeholder="Paste run order breakdown, live tape links, or soundbite timestamps for editorial lead sign-off..."
                  rows={6}
                  required
                  className="w-full text-xs rounded-2xl border border-slate-200 p-3.5 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none leading-relaxed transition-all resize-none bg-slate-50/30 focus:bg-white"
                />
                <p className="text-[11px] text-slate-400">
                  Submitting transitions this package status to{" "}
                  <strong className="text-amber-600 font-mono">AWAITING_REVIEW</strong>.
                </p>
              </div>
            </form>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="proof-form"
            disabled={isPending || !summary.trim()}
            className="inline-flex items-center gap-2 px-5 py-2 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-colors disabled:opacity-50"
          >
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Transmitting...</span>
              </>
            ) : (
              <>
                <Send className="w-3.5 h-3.5" />
                <span>Transmit Filing</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* FEEDBACK POPUP MODAL (Success & Error States) */}
      <AnimatePresence>
        {modalState !== "IDLE" && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border border-slate-100 space-y-4 text-center"
            >
              {modalState === "SUCCESS" ? (
                <>
                  <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto ring-8 ring-emerald-50/50">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-base font-bold text-slate-900">Proof Filed Successfully</h4>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Package is routed to <strong className="text-slate-800">Clearance Oversight</strong>. The Desk Lead will review your copy for broadcast seal.
                    </p>
                  </div>
                  <div className="pt-2">
                    <button
                      onClick={handleCloseAll}
                      className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
                    >
                      <span>Return to Rundown</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto ring-8 ring-rose-50/50">
                    <XCircle className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-base font-bold text-slate-900">Transmission Failed</h4>
                    <p className="text-xs text-rose-600/90 leading-relaxed bg-rose-50 p-2.5 rounded-xl border border-rose-100 font-mono">
                      {errorMessage}
                    </p>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => setModalState("IDLE")}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Edit & Retry</span>
                    </button>
                    <button
                      onClick={handleCloseAll}
                      className="flex-1 py-2.5 px-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl text-xs font-medium transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}