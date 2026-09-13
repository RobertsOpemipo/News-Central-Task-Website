import React from "react";
import { cn } from "@/lib/utils";
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  AlertTriangle,
  type LucideIcon,
} from "lucide-react";

export type StatusType = "PENDING" | "AWAITING_REVIEW" | "COMPLETED" | "FLAGGED";

interface BadgeProps {
  status: StatusType;
  className?: string;
}

export function StatusBadge({ status, className }: BadgeProps) {
  const configs: Record<StatusType, { label: string; icon: LucideIcon; style: string }> = {
    COMPLETED: {
      label: "Verified",
      icon: CheckCircle2,
      style: "bg-emerald-50 text-emerald-700 border-emerald-200",
    },
    AWAITING_REVIEW: {
      label: "Awaiting Review",
      icon: Clock,
      style: "bg-amber-50 text-amber-700 border-amber-200",
    },
    PENDING: {
      label: "Pending Log",
      icon: AlertCircle,
      style: "bg-slate-100 text-slate-600 border-slate-200",
    },
    FLAGGED: {
      label: "Needs Revision",
      icon: AlertTriangle,
      style: "bg-rose-50 text-rose-700 border-rose-200",
    },
  };

  const current = configs[status] || configs.PENDING;
  const Icon = current.icon;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border font-mono tracking-tight",
        current.style,
        className
      )}
    >
      <Icon className="w-3.5 h-3.5" />
      {current.label}
    </span>
  );
}