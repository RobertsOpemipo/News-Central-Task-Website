"use client";

import React, { useState, useTransition } from "react";
import { createAssignedTask } from "@/app/actions/tasks";
import { Plus, X, Loader2, Send } from "lucide-react";

interface UnitOption {
  id: string;
  name: string;
}

interface UserOption {
  id: string;
  name: string;
}

interface AssignTaskModalProps {
  units: UnitOption[];
  users: UserOption[];
  currentDay: string;
}

type DayOfWeek = "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun";

export function AssignTaskModal({ units, users, currentDay }: AssignTaskModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dayOfWeek, setDayOfWeek] = useState<DayOfWeek>(
    currentDay as DayOfWeek,
  );
  const [unitId, setUnitId] = useState(units[0]?.id || "");
  const [assignedToId, setAssignedToId] = useState(users[0]?.id || "");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    startTransition(async () => {
      const res = await createAssignedTask({
        title,
        description,
        dayOfWeek,
        unitId,
        assignedToId,
      });

      if (!res.success) {
        setErrorMessage(res.message || "Failed to schedule story.");
        return;
      }

      setIsOpen(false);
      setTitle("");
      setDescription("");
    });
  };

  return (
    <>
      <button
  onClick={() => setIsOpen(true)}
  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium shadow-xs transition-colors"
>
  <Plus className="w-3.5 h-3.5" />
  <span>Assign Story</span>
</button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg bg-white rounded-2xl border border-slate-200 shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-semibold text-slate-900">
                Schedule & Assign News Package
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3.5">
              {errorMessage && (
                <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg">
                  {errorMessage}
                </div>
              )}

              <div>
                <label className="text-xs font-medium text-slate-700 block mb-1">
                  Story Title / Slug
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Breaking: Port authority press brief on cargo delays"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full text-xs rounded-lg border border-slate-200 p-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-700 block mb-1">
                  Instructions & Angle
                </label>
                <textarea
                  rows={3}
                  placeholder="Include required graphics, interviews, or airtime requirements..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full text-xs rounded-lg border border-slate-200 p-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-700 block mb-1">Rundown Day</label>
                  <select
                    value={dayOfWeek}
                    onChange={(e) => setDayOfWeek(e.target.value as DayOfWeek)}
                    className="w-full text-xs rounded-lg border border-slate-200 p-2 bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
                      <option key={day} value={day}>{day}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-700 block mb-1">Desk</label>
                  <select
                    value={unitId}
                    onChange={(e) => setUnitId(e.target.value)}
                    className="w-full text-xs rounded-lg border border-slate-200 p-2 bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    {units.map((u) => (
                      <option key={u.id} value={u.id}>{u.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-700 block mb-1">Correspondent</label>
                  <select
                    value={assignedToId}
                    onChange={(e) => setAssignedToId(e.target.value)}
                    className="w-full text-xs rounded-lg border border-slate-200 p-2 bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    {users.map((usr) => (
                      <option key={usr.id} value={usr.id}>{usr.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => setIsOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors disabled:opacity-50"
                >
                  {isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                  <span>Assign Story</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}