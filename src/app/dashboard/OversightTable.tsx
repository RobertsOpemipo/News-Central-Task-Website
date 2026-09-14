"use client";

import React, { useState, useTransition, useMemo } from "react";
import { verifyTaskAction } from "@/app/actions/tasks";
import { StatusBadge, type StatusType } from "@/components/ui/Badge";
import {
  Check,
  Flag,
  FileText,
  User,
  Calendar,
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Filter,
} from "lucide-react";

export interface TaskRecord {
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

export interface OversightTableProps {
  tasks: TaskRecord[];
  isAdmin?: boolean;
}

export function OversightTable({ tasks, isAdmin = false }: OversightTableProps) {
  const [filter, setFilter] = useState<string>("ALL");
  const [deskFilter, setDeskFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(15);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Extract unique desk names for the secondary filter
  const deskNames = useMemo(() => {
    return Array.from(new Set(tasks.map((t) => t.unitName))).sort();
  }, [tasks]);

  const handleVerify = (taskId: string, approved: boolean) => {
    setLoadingId(taskId);
    startTransition(async () => {
      await verifyTaskAction({ taskId, approved });
      setLoadingId(null);
    });
  };

  // 1. Compound Filter: Status Pill + Desk Dropdown + Live Text Search
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const matchesStatus = filter === "ALL" || task.status === filter;
      const matchesDesk = deskFilter === "ALL" || task.unitName === deskFilter;
      const query = searchQuery.toLowerCase().trim();

      if (!query) return matchesStatus && matchesDesk;

      const matchesQuery =
        task.title.toLowerCase().includes(query) ||
        task.unitName.toLowerCase().includes(query) ||
        Boolean(task.assigneeName && task.assigneeName.toLowerCase().includes(query)) ||
        Boolean(task.loggedSummary && task.loggedSummary.toLowerCase().includes(query));

      return matchesStatus && matchesDesk && matchesQuery;
    });
  }, [tasks, filter, deskFilter, searchQuery]);

  // Reset page to 1 whenever filters change
  const handleFilterChange = (st: string) => {
    setFilter(st);
    setCurrentPage(1);
  };

  const handleDeskChange = (desk: string) => {
    setDeskFilter(desk);
    setCurrentPage(1);
  };

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    setCurrentPage(1);
  };

  // 2. Pagination Math
  const totalItems = filteredTasks.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const validCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (validCurrentPage - 1) * pageSize;
  const paginatedTasks = filteredTasks.slice(startIndex, startIndex + pageSize);

  // Status Tab Badges
  const counts = useMemo(() => {
    return {
      ALL: tasks.length,
      AWAITING_REVIEW: tasks.filter((t) => t.status === "AWAITING_REVIEW").length,
      COMPLETED: tasks.filter((t) => t.status === "COMPLETED").length,
      FLAGGED: tasks.filter((t) => t.status === "FLAGGED").length,
      PENDING: tasks.filter((t) => t.status === "PENDING").length,
    };
  }, [tasks]);

  return (
    <div className="space-y-4">
      {/* Control Bar: Status Tabs, Beat Filter & Live Search */}
      <div className="bg-white p-3.5 sm:p-4 rounded-3xl border border-slate-200/90 shadow-sm space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Status Tabs with Live Badges */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 lg:pb-0 text-xs">
            {(["ALL", "AWAITING_REVIEW", "COMPLETED", "FLAGGED", "PENDING"] as const).map((st) => {
              const count = counts[st];
              const isSelected = filter === st;
              return (
                <button
                  key={st}
                  onClick={() => handleFilterChange(st)}
                  className={`px-3 py-1.5 rounded-xl font-medium transition-all shrink-0 flex items-center gap-1.5 ${
                    isSelected
                      ? "bg-slate-900 text-white font-semibold shadow-xs"
                      : "bg-slate-100/70 text-slate-600 hover:bg-slate-200/60"
                  }`}
                >
                  <span>{st.replace("_", " ")}</span>
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                      isSelected ? "bg-slate-800 text-slate-200" : "bg-white text-slate-500"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Desk Filter Dropdown & Search Input */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <select
                value={deskFilter}
                onChange={(e) => handleDeskChange(e.target.value)}
                className="text-xs rounded-xl border border-slate-200 pl-7 pr-8 py-2 bg-slate-50 hover:bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 appearance-none font-sans cursor-pointer transition-colors"
              >
                <option value="ALL">All Desks</option>
                {deskNames.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
              <Filter className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {isAdmin && (
              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  placeholder="Search headline, desk, anchor..."
                  className="w-full text-xs rounded-xl border border-slate-200 pl-8 pr-8 py-2 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-sans"
                />
                {searchQuery && (
                  <button
                    onClick={() => handleSearchChange("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-mono"
                  >
                    ✕
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MOBILE CARDS VIEW */}
      <div className="block lg:hidden space-y-3">
        {paginatedTasks.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-3xl border border-slate-200 text-slate-400 text-xs font-mono">
            No packages match this query.
          </div>
        ) : (
          paginatedTasks.map((task) => (
            <div
              key={task.id}
              className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-3"
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
                  &ldquo;{task.loggedSummary}&rdquo;
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

      {/* DESKTOP TABLE VIEW */}
      <div className="hidden lg:block bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-mono text-[11px]">
            <tr>
              <th className="py-3 px-4">Story & Submitted Proof</th>
              <th className="py-3 px-4">Desk Beat</th>
              <th className="py-3 px-4">Correspondent</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Clearance Sign-off</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {paginatedTasks.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-slate-400 font-mono">
                  No editorial records match filter.
                </td>
              </tr>
            ) : (
              paginatedTasks.map((task) => (
                <tr key={task.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3.5 px-4 max-w-md">
                    <p className="font-semibold text-slate-900">{task.title}</p>
                    {task.loggedSummary ? (
                      <p className="text-slate-500 italic mt-1 line-clamp-2 leading-relaxed">
                        &ldquo;{task.loggedSummary}&rdquo;
                      </p>
                    ) : (
                      <p className="text-slate-400 text-[11px] font-mono mt-0.5">No filing submitted</p>
                    )}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-slate-600 font-medium">{task.unitName}</td>
                  <td className="py-3.5 px-4 font-mono text-slate-600">
                    {task.assigneeName ?? <span className="text-amber-600">Unassigned</span>}
                  </td>
                  <td className="py-3.5 px-4">
                    <StatusBadge status={task.status} />
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="inline-flex items-center gap-1.5">
                      <button
                        disabled={isPending && loadingId === task.id}
                        onClick={() => handleVerify(task.id, true)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium transition-colors shadow-xs disabled:opacity-50"
                        title="Seal for broadcast"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Seal</span>
                      </button>
                      <button
                        disabled={isPending && loadingId === task.id}
                        onClick={() => handleVerify(task.id, false)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-medium transition-colors disabled:opacity-50"
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

        {/* PAGINATION BAR */}
        <div className="px-5 py-3.5 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono text-slate-500">
          <div className="flex items-center gap-3">
            <span>
              Showing{" "}
              <strong className="text-slate-900 font-sans">
                {totalItems === 0 ? 0 : startIndex + 1}
              </strong>{" "}
              to{" "}
              <strong className="text-slate-900 font-sans">
                {Math.min(startIndex + pageSize, totalItems)}
              </strong>{" "}
              of <strong className="text-slate-900 font-sans">{totalItems}</strong> packages
            </span>

            <div className="flex items-center gap-1.5 pl-2 border-l border-slate-200">
              <span>Per page:</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="bg-white border border-slate-200 rounded-lg px-2 py-0.5 text-xs text-slate-800 focus:outline-none"
              >
                <option value={10}>10</option>
                <option value={15}>15</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-1 self-end sm:self-auto">
            <button
              onClick={() => setCurrentPage(1)}
              disabled={validCurrentPage === 1}
              className="p-1 rounded-lg hover:bg-slate-200/60 disabled:opacity-30 disabled:pointer-events-none transition-colors"
              title="First Page"
            >
              <ChevronsLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={validCurrentPage === 1}
              className="p-1 rounded-lg hover:bg-slate-200/60 disabled:opacity-30 disabled:pointer-events-none transition-colors"
              title="Previous Page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="px-2 font-semibold text-slate-900 font-sans">
              Page {validCurrentPage} of {totalPages}
            </span>

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={validCurrentPage === totalPages}
              className="p-1 rounded-lg hover:bg-slate-200/60 disabled:opacity-30 disabled:pointer-events-none transition-colors"
              title="Next Page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentPage(totalPages)}
              disabled={validCurrentPage === totalPages}
              className="p-1 rounded-lg hover:bg-slate-200/60 disabled:opacity-30 disabled:pointer-events-none transition-colors"
              title="Last Page"
            >
              <ChevronsRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}