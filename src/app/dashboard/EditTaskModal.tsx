"use client";

import React, { useState, useTransition } from "react";
import { updateTask } from "@/app/actions/tasks";
import { X, Loader2, Save } from "lucide-react";

interface OptionItem {
  id: string;
  name: string;
}

interface EditTaskModalProps {
  task: {
    id: string;
    title: string;
    description: string | null;
    dayOfWeek: string;
    unitId?: string;
    assignedToId?: string | null;
  };
  units: OptionItem[];
  users: OptionItem[];
  onClose: () => void;
}

export function EditTaskModal({ task, units, users, onClose }: EditTaskModalProps) {
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || "");
  const [dayOfWeek, setDayOfWeek] = useState(task.dayOfWeek);
  const [unitId, setUnitId] = useState(task.unitId || units[0]?.id || "");
  const [assignedToId, setAssignedToId] = useState(task.assignedToId || users[0]?.id || "");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    startTransition(async () => {
      const res = await updateTask({
        taskId: task.id,
        title,
        description,
        dayOfWeek: dayOfWeek as Parameters<typeof updateTask>[0]["dayOfWeek"],
        unitId,
        assignedToId: assignedToId || undefined,
      });

      if (!res.success) {
        setErrorMessage(res.message || "Failed to update story.");
        return;
      }

      onClose();
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
      <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-xl p-5 space-y-4 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h3 className="text-sm font-semibold text-slate-900">Edit News Package</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1">
            <X className="w-4 h-4" />
          </button>
        </div>

        {errorMessage && (
          <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleUpdate} className="space-y-3">
          <div>
            <label className="text-xs font-medium text-slate-700 block mb-1">Story Slug / Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-xs rounded-xl border border-slate-200 p-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-slate-700 block mb-1">Angle / Brief</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full text-xs rounded-xl border border-slate-200 p-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="text-xs font-medium text-slate-700 block mb-1">Day</label>
              <select
                value={dayOfWeek}
                onChange={(e) => setDayOfWeek(e.target.value)}
                className="w-full text-xs rounded-xl border border-slate-200 p-2 bg-white"
              >
                {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-700 block mb-1">Desk</label>
              <select
                value={unitId}
                onChange={(e) => setUnitId(e.target.value)}
                className="w-full text-xs rounded-xl border border-slate-200 p-2 bg-white"
              >
                {units.map((u) => (
                  <option key={u.id} value={u.id}>{u.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-700 block mb-1">Assignee</label>
              <select
                value={assignedToId}
                onChange={(e) => setAssignedToId(e.target.value)}
                className="w-full text-xs rounded-xl border border-slate-200 p-2 bg-white"
              >
                {users.map((usr) => (
                  <option key={usr.id} value={usr.id}>{usr.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              disabled={isPending}
              onClick={onClose}
              className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg border border-slate-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs"
            >
              {isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}