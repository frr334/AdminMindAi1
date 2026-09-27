import { cn } from "@/lib/utils";
import type { InputHTMLAttributes, TextareaHTMLAttributes, SelectHTMLAttributes } from "react";

export function Field({ label, hint, error, children }: { label: string; hint?: string; error?: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-sm font-medium text-ink-700">{label}</span>
      {children}
      {hint && !error ? <p className="text-xs text-ink-400">{hint}</p> : null}
      {error ? <p className="text-xs text-red-700">{error}</p> : null}
    </label>
  );
}

const box = "w-full rounded-xl border border-ink-100 bg-white px-3 py-2.5 text-sm text-ink-800 outline-none ring-gold-300/40 focus:ring-2";

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(box, props.className)} {...props} />;
}

export function Textarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn(box, "min-h-32", props.className)} {...props} />;
}

export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={cn(box, props.className)} {...props} />;
}
