// src/components/ui/BrandLogo.tsx
import React from "react";
import Link from "next/link";
import { Radio } from "lucide-react";
import { cn } from "@/lib/utils";

interface BrandLogoProps {
  href?: string;
  className?: string;
  isDark?: boolean;
}

export function BrandLogo({ href = "/", className, isDark = true }: BrandLogoProps) {
  return (
    <Link
      href={href}
      className={cn("inline-flex items-center gap-2.5 group select-none", className)}
    >
      <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-mono font-bold shadow-md shadow-blue-500/20 group-hover:scale-95 transition-transform">
        <Radio className="w-4 h-4" />
      </div>
      <div className="flex flex-col">
        <span
          className={cn(
            "font-bold text-sm tracking-tight leading-none",
            isDark ? "text-white" : "text-slate-900"
          )}
        >
          TaskDeck<span className="text-blue-500">.News</span>
        </span>
        <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider mt-0.5">
          Broadcast OS
        </span>
      </div>
    </Link>
  );
}