"use client";

import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <span className="relative flex h-9 w-9 items-center justify-center rounded-2xl bg-ink-500 text-white shadow-soft">
        <span className="font-display text-lg leading-none">A</span>
        <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-gold-300" />
      </span>
      <span className="leading-tight">
        <span className="block font-display text-lg text-ink-800">AdmitMind</span>
        <span className="block text-[10px] font-semibold uppercase tracking-[0.22em] text-gold-500">AI</span>
      </span>
    </div>
  );
}
