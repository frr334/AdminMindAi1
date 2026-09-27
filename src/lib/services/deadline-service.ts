import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type { DeadlineItem } from "@/lib/types";

/**
 * Fetch all deadlines for a user from Supabase.
 */
export async function getDeadlines(userId: string): Promise<DeadlineItem[]> {
  const supabase = getSupabaseBrowserClient();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("deadlines")
        .select("*")
        .eq("user_id", userId)
        .order("due_at", { ascending: true });

      if (!error && data) {
        return data as DeadlineItem[];
      }
    } catch {
      // Fallback
    }
  }

  if (typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem(`admitmind.deadlines.${userId}`);
      if (raw) return JSON.parse(raw);
    } catch {
      return [];
    }
  }
  return [];
}

/**
 * Create a new deadline.
 */
export async function createDeadline(
  userId: string,
  data: { title: string; kind?: string; due_at: string; notes?: string }
): Promise<{ ok: boolean; data?: DeadlineItem; error?: string }> {
  const supabase = getSupabaseBrowserClient();
  if (supabase) {
    try {
      const payload = {
        user_id: userId,
        title: data.title.trim(),
        kind: data.kind || "personal",
        due_at: data.due_at,
        notes: data.notes || null,
      };

      const { data: created, error } = await supabase
        .from("deadlines")
        .insert(payload)
        .select()
        .single();

      if (error) return { ok: false, error: error.message };
      return { ok: true, data: created as DeadlineItem };
    } catch (e: unknown) {
      return { ok: false, error: (e as Error).message };
    }
  }

  if (typeof window !== "undefined") {
    try {
      const key = `admitmind.deadlines.${userId}`;
      const items = await getDeadlines(userId);
      const newItem: DeadlineItem = {
        id: crypto.randomUUID ? crypto.randomUUID() : `dl_${Date.now()}`,
        user_id: userId,
        title: data.title.trim(),
        kind: data.kind || "personal",
        due_at: data.due_at,
        notes: data.notes || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      items.push(newItem);
      items.sort((a, b) => a.due_at.localeCompare(b.due_at));
      localStorage.setItem(key, JSON.stringify(items));
      return { ok: true, data: newItem };
    } catch (e: unknown) {
      return { ok: false, error: (e as Error).message };
    }
  }

  return { ok: false, error: "Database unavailable" };
}

/**
 * Update a deadline.
 */
export async function updateDeadline(
  id: string,
  userId: string,
  updates: Partial<DeadlineItem>
): Promise<{ ok: boolean; data?: DeadlineItem; error?: string }> {
  const supabase = getSupabaseBrowserClient();
  if (supabase) {
    try {
      const payload = {
        ...updates,
        updated_at: new Date().toISOString(),
      };
      delete payload.id;
      delete payload.user_id;

      const { data, error } = await supabase
        .from("deadlines")
        .update(payload)
        .eq("id", id)
        .eq("user_id", userId)
        .select()
        .single();

      if (error) return { ok: false, error: error.message };
      return { ok: true, data: data as DeadlineItem };
    } catch (e: unknown) {
      return { ok: false, error: (e as Error).message };
    }
  }

  if (typeof window !== "undefined") {
    try {
      const key = `admitmind.deadlines.${userId}`;
      const items = await getDeadlines(userId);
      const idx = items.findIndex((d) => d.id === id);
      if (idx >= 0) {
        items[idx] = { ...items[idx], ...updates, updated_at: new Date().toISOString() };
        localStorage.setItem(key, JSON.stringify(items));
        return { ok: true, data: items[idx] };
      }
    } catch (e: unknown) {
      return { ok: false, error: (e as Error).message };
    }
  }
  return { ok: false, error: "Not found" };
}

/**
 * Delete a deadline.
 */
export async function deleteDeadline(id: string, userId: string): Promise<{ ok: boolean; error?: string }> {
  const supabase = getSupabaseBrowserClient();
  if (supabase) {
    try {
      const { error } = await supabase
        .from("deadlines")
        .delete()
        .eq("id", id)
        .eq("user_id", userId);

      if (error) return { ok: false, error: error.message };
      return { ok: true };
    } catch (e: unknown) {
      return { ok: false, error: (e as Error).message };
    }
  }

  if (typeof window !== "undefined") {
    try {
      const key = `admitmind.deadlines.${userId}`;
      const items = (await getDeadlines(userId)).filter((d) => d.id !== id);
      localStorage.setItem(key, JSON.stringify(items));
      return { ok: true };
    } catch (e: unknown) {
      return { ok: false, error: (e as Error).message };
    }
  }
  return { ok: true };
}
