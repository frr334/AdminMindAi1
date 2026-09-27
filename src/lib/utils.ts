import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function uid() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return `id_${Math.random().toString(36).slice(2)}${Date.now()}`;
}

export function nowIso() {
  return new Date().toISOString();
}

export function greeting(name: string, date = new Date()) {
  const h = date.getHours();
  const part = h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
  const first = name.trim().split(" ")[0] || "student";
  return `${part}, ${first}`;
}

export function formatDate(iso?: string | null) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

export function formatCurrency(amount?: number | null) {
  if (amount === null || amount === undefined) return "—";
  return `$${Math.round(amount).toLocaleString()}`;
}

export function daysUntil(iso?: string | null) {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  return Math.round((target.getTime() - today.getTime()) / 86400000);
}

export function isOverdue(iso?: string | null) {
  const days = daysUntil(iso);
  return days !== null && days < 0;
}

export function isDueThisWeek(iso?: string | null) {
  const days = daysUntil(iso);
  return days !== null && days >= 0 && days <= 7;
}

export function isDueThisMonth(iso?: string | null) {
  const days = daysUntil(iso);
  return days !== null && days >= 0 && days <= 30;
}

export function titleCaseStatus(value: string) {
  return value.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export async function sha256(text: string) {
  const data = new TextEncoder().encode(text);
  const buf = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export function levelFromXp(xp: number) {
  return Math.max(1, Math.floor(xp / 250) + 1);
}

export function xpToNext(xp: number) {
  const level = levelFromXp(xp);
  return level * 250 - xp;
}
