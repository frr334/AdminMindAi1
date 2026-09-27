import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type { Profile } from "@/lib/types";

/**
 * Fetch profile from public.profiles in Supabase.
 */
export async function getProfile(userId: string): Promise<Profile | null> {
  const supabase = getSupabaseBrowserClient();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle();

      if (!error && data) return data as Profile;
    } catch {
      // Fallback
    }
  }

  if (typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem(`admitmind.profile.${userId}`);
      if (raw) return JSON.parse(raw);
    } catch {
      return null;
    }
  }
  return null;
}

/**
 * Update user profile in public.profiles.
 */
export async function updateProfile(
  userId: string,
  updates: Partial<Profile>
): Promise<{ ok: boolean; data?: Profile; error?: string }> {
  const supabase = getSupabaseBrowserClient();
  if (supabase) {
    try {
      const payload = {
        ...updates,
        id: userId,
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from("profiles")
        .upsert(payload)
        .select()
        .single();

      if (error) return { ok: false, error: error.message };
      return { ok: true, data: data as Profile };
    } catch (e: unknown) {
      return { ok: false, error: (e as Error).message };
    }
  }

  if (typeof window !== "undefined") {
    try {
      const existing = (await getProfile(userId)) || {
        id: userId,
        full_name: "",
        email: "",
        country: "",
        graduation_year: null,
        intended_major: "",
        target_countries: [],
        subscription_plan: "free",
        onboarding_completed: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      const merged: Profile = {
        ...existing,
        ...updates,
        id: userId,
        updated_at: new Date().toISOString(),
      };
      localStorage.setItem(`admitmind.profile.${userId}`, JSON.stringify(merged));
      return { ok: true, data: merged };
    } catch (e: unknown) {
      return { ok: false, error: (e as Error).message };
    }
  }

  return { ok: false, error: "Database unavailable" };
}

/**
 * Mark onboarding as completed with provided profile data.
 */
export async function completeOnboarding(
  userId: string,
  data: Partial<Profile>
): Promise<{ ok: boolean; data?: Profile; error?: string }> {
  return updateProfile(userId, {
    ...data,
    onboarding_completed: true,
  });
}
