"use client";

import { useState, useTransition } from "react";
import { submitDailyLog } from "@/app/actions/tasks";
import { Send, Loader2 } from "lucide-react";

interface DrawerProps {
  task: { id: string; title: string; unit: string; assignee: string };
  onClose: () => void;
}

export function TaskLoggerDrawer({ task, onClose }: DrawerProps) {
  const [summary, setSummary] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    startTransition(async () => {
      const response = await submitDailyLog({
        taskId: task.id,
        loggedSummary: summary,
      });

      if (!response.success) {
        setErrorMsg(response.message || "Something went wrong");
        return;
      }

      onClose();
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {errorMsg && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg">
          {errorMsg}
        </div>
      )}

      <div>
        <label className="text-xs font-medium text-slate-700 block mb-2">
          Work Summary / Proof of Execution
        </label>
        <textarea
          rows={5}
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          placeholder="Explain what was accomplished, add links or references..."
          className="w-full text-sm rounded-lg border border-slate-200 p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          required
        />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full flex items-center justify-center gap-2 px-4 py-2 text-xs font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
      >
        {isPending ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <>
            <Send className="w-3.5 h-3.5" /> Submit Log
          </>
        )}
      </button>
    </form>
  );
}