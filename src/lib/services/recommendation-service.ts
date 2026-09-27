import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type { Recommendation } from "@/lib/types";

/**
 * Fetch all recommendations for a user from Supabase.
 */
export async function getRecommendations(userId: string): Promise<Recommendation[]> {
  const supabase = getSupabaseBrowserClient();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("recommendations")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (!error && data) return data as Recommendation[];
    } catch {
      // Fallback
    }
  }

  if (typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem(`admitmind.recs.${userId}`);
      if (raw) return JSON.parse(raw);
    } catch {
      return [];
    }
  }
  return [];
}

/**
 * Create a new recommendation.
 */
export async function createRecommendation(
  userId: string,
  data: Partial<Recommendation>
): Promise<{ ok: boolean; data?: Recommendation; error?: string }> {
  const supabase = getSupabaseBrowserClient();
  if (supabase) {
    try {
      const payload = {
        user_id: userId,
        recommender_name: data.recommender_name?.trim() || "Recommender",
        institution: data.institution || null,
        email: data.email || null,
        requested_at: data.requested_at || null,
        deadline: data.deadline || null,
        status: data.status || "not_requested",
        notes: data.notes || null,
      };

      const { data: created, error } = await supabase
        .from("recommendations")
        .insert(payload)
        .select()
        .single();

      if (error) return { ok: false, error: error.message };
      return { ok: true, data: created as Recommendation };
    } catch (e: unknown) {
      return { ok: false, error: (e as Error).message };
    }
  }

  if (typeof window !== "undefined") {
    try {
      const key = `admitmind.recs.${userId}`;
      const recs = await getRecommendations(userId);
      const newRec: Recommendation = {
        id: crypto.randomUUID ? crypto.randomUUID() : `rec_${Date.now()}`,
        user_id: userId,
        recommender_name: data.recommender_name?.trim() || "Recommender",
        institution: data.institution || null,
        email: data.email || null,
        requested_at: data.requested_at || null,
        deadline: data.deadline || null,
        status: data.status || "not_requested",
        notes: data.notes || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      recs.unshift(newRec);
      localStorage.setItem(key, JSON.stringify(recs));
      return { ok: true, data: newRec };
    } catch (e: unknown) {
      return { ok: false, error: (e as Error).message };
    }
  }

  return { ok: false, error: "Database unavailable" };
}

/**
 * Update an existing recommendation.
 */
export async function updateRecommendation(
  id: string,
  userId: string,
  updates: Partial<Recommendation>
): Promise<{ ok: boolean; data?: Recommendation; error?: string }> {
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
        .from("recommendations")
        .update(payload)
        .eq("id", id)
        .eq("user_id", userId)
        .select()
        .single();

      if (error) return { ok: false, error: error.message };
      return { ok: true, data: data as Recommendation };
    } catch (e: unknown) {
      return { ok: false, error: (e as Error).message };
    }
  }

  if (typeof window !== "undefined") {
    try {
      const key = `admitmind.recs.${userId}`;
      const recs = await getRecommendations(userId);
      const idx = recs.findIndex((r) => r.id === id);
      if (idx >= 0) {
        recs[idx] = { ...recs[idx], ...updates, updated_at: new Date().toISOString() };
        localStorage.setItem(key, JSON.stringify(recs));
        return { ok: true, data: recs[idx] };
      }
    } catch (e: unknown) {
      return { ok: false, error: (e as Error).message };
    }
  }
  return { ok: false, error: "Not found" };
}

/**
 * Delete a recommendation.
 */
export async function deleteRecommendation(id: string, userId: string): Promise<{ ok: boolean; error?: string }> {
  const supabase = getSupabaseBrowserClient();
  if (supabase) {
    try {
      const { error } = await supabase
        .from("recommendations")
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
      const key = `admitmind.recs.${userId}`;
      const recs = (await getRecommendations(userId)).filter((r) => r.id !== id);
      localStorage.setItem(key, JSON.stringify(recs));
      return { ok: true };
    } catch (e: unknown) {
      return { ok: false, error: (e as Error).message };
    }
  }
  return { ok: true };
}
