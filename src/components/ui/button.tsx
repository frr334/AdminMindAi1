import { cn } from "@/lib/utils";
import type { ButtonHTMLAttributes } from "react";

const styles = {
  primary:
    "bg-ink-500 text-white hover:bg-ink-600 shadow-soft disabled:opacity-50",
  gold: "bg-gold-300 text-ink-800 hover:bg-gold-400 disabled:opacity-50",
  ghost: "bg-transparent text-ink-600 hover:bg-ink-50",
  outline: "border border-ink-200 bg-white text-ink-700 hover:border-ink-400",
  danger: "bg-red-700 text-white hover:bg-red-800",
};

export function Button({
  className,
  variant = "primary",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: keyof typeof styles }) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold transition",
        styles[variant],
        className,
      )}
      {...props}
    />
  );
}
