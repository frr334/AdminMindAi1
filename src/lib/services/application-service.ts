import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type { Application, ApplicationTask } from "@/lib/types";

/**
 * Fetch all applications for a user, including their tasks.
 */
export async function getApplications(userId: string): Promise<Application[]> {
  const supabase = getSupabaseBrowserClient();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("applications")
        .select("*, tasks:application_tasks(*)")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (!error && data) {
        return data as Application[];
      }
    } catch {
      // Fallback
    }
  }

  if (typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem(`admitmind.apps.${userId}`);
      if (raw) return JSON.parse(raw);
    } catch {
      return [];
    }
  }
  return [];
}

/**
 * Fetch a single application by ID with its tasks.
 */
export async function getApplicationById(id: string, userId: string): Promise<Application | null> {
  const supabase = getSupabaseBrowserClient();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("applications")
        .select("*, tasks:application_tasks(*)")
        .eq("id", id)
        .eq("user_id", userId)
        .maybeSingle();

      if (!error && data) return data as Application;
    } catch {
      // Fallback
    }
  }

  const all = await getApplications(userId);
  return all.find((a) => a.id === id) || null;
}

/**
 * Create a new application for a user.
 */
export async function createApplication(
  userId: string,
  data: Partial<Application>
): Promise<{ ok: boolean; data?: Application; error?: string }> {
  const supabase = getSupabaseBrowserClient();
  if (supabase) {
    try {
      const payload = {
        user_id: userId,
        university_name: data.university_name || "Untitled University",
        country: data.country || "Not specified",
        degree_type: data.degree_type || "Bachelor",
        application_deadline: data.application_deadline || (data.deadline ? data.deadline.slice(0, 10) : null),
        application_status: data.application_status || "Planning",
        notes: data.notes || "",
        priority_level: data.priority_level ?? 2,
        deadline: data.deadline || null,
      };

      const { data: created, error } = await supabase
        .from("applications")
        .insert(payload)
        .select()
        .single();

      if (error) return { ok: false, error: error.message };

      // If deadline was provided, also sync to deadlines table
      if (created && (created.deadline || created.application_deadline)) {
        const dueAt = created.deadline || new Date(created.application_deadline).toISOString();
        await supabase.from("deadlines").insert({
          user_id: userId,
          title: `${created.university_name} application deadline`,
          kind: "university",
          due_at: dueAt,
          notes: `Auto-created from Application tracker`,
        });
      }

      return { ok: true, data: created as Application };
    } catch (e: unknown) {
      return { ok: false, error: (e as Error).message };
    }
  }

  // Local storage fallback
  if (typeof window !== "undefined") {
    try {
      const key = `admitmind.apps.${userId}`;
      const apps = await getApplications(userId);
      const newApp: Application = {
        id: crypto.randomUUID ? crypto.randomUUID() : `app_${Date.now()}`,
        user_id: userId,
        university_name: data.university_name || "Untitled University",
        country: data.country || "",
        degree_type: data.degree_type || "Bachelor",
        application_deadline: data.application_deadline || null,
        application_status: data.application_status || "Planning",
        notes: data.notes || "",
        priority_level: data.priority_level ?? 2,
        deadline: data.deadline || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        tasks: [],
      };
      apps.unshift(newApp);
      localStorage.setItem(key, JSON.stringify(apps));
      return { ok: true, data: newApp };
    } catch (e: unknown) {
      return { ok: false, error: (e as Error).message };
    }
  }

  return { ok: false, error: "Database unavailable" };
}

/**
 * Update an existing application.
 */
export async function updateApplication(
  id: string,
  userId: string,
  updates: Partial<Application>
): Promise<{ ok: boolean; data?: Application; error?: string }> {
  const supabase = getSupabaseBrowserClient();
  if (supabase) {
    try {
      const payload: Record<string, unknown> = {
        ...updates,
        updated_at: new Date().toISOString(),
      };
      delete payload.tasks;
      delete payload.id;
      delete payload.user_id;

      const { data, error } = await supabase
        .from("applications")
        .update(payload)
        .eq("id", id)
        .eq("user_id", userId)
        .select()
        .single();

      if (error) return { ok: false, error: error.message };
      return { ok: true, data: data as Application };
    } catch (e: unknown) {
      return { ok: false, error: (e as Error).message };
    }
  }

  if (typeof window !== "undefined") {
    try {
      const key = `admitmind.apps.${userId}`;
      const apps = await getApplications(userId);
      const idx = apps.findIndex((a) => a.id === id);
      if (idx >= 0) {
        apps[idx] = { ...apps[idx], ...updates, updated_at: new Date().toISOString() };
        localStorage.setItem(key, JSON.stringify(apps));
        return { ok: true, data: apps[idx] };
      }
    } catch (e: unknown) {
      return { ok: false, error: (e as Error).message };
    }
  }
  return { ok: false, error: "Not found" };
}

/**
 * Delete an application.
 */
export async function deleteApplication(id: string, userId: string): Promise<{ ok: boolean; error?: string }> {
  const supabase = getSupabaseBrowserClient();
  if (supabase) {
    try {
      const { error } = await supabase
        .from("applications")
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
      const key = `admitmind.apps.${userId}`;
      const apps = (await getApplications(userId)).filter((a) => a.id !== id);
      localStorage.setItem(key, JSON.stringify(apps));
      return { ok: true };
    } catch (e: unknown) {
      return { ok: false, error: (e as Error).message };
    }
  }
  return { ok: true };
}

/**
 * Create a task for an application.
 */
export async function createApplicationTask(
  applicationId: string,
  title: string,
  dueDate?: string | null
): Promise<{ ok: boolean; data?: ApplicationTask; error?: string }> {
  const supabase = getSupabaseBrowserClient();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("application_tasks")
        .insert({
          application_id: applicationId,
          title,
          completed: false,
          due_date: dueDate ? dueDate.slice(0, 10) : null,
        })
        .select()
        .single();

      if (error) return { ok: false, error: error.message };
      return { ok: true, data: data as ApplicationTask };
    } catch (e: unknown) {
      return { ok: false, error: (e as Error).message };
    }
  }

  return { ok: true, data: { id: `task_${Date.now()}`, application_id: applicationId, title, completed: false, due_date: dueDate || null, created_at: new Date().toISOString() } };
}

/**
 * Toggle completed state of a task.
 */
export async function toggleApplicationTask(
  taskId: string,
  completed: boolean
): Promise<{ ok: boolean; error?: string }> {
  const supabase = getSupabaseBrowserClient();
  if (supabase) {
    try {
      const { error } = await supabase
        .from("application_tasks")
        .update({ completed })
        .eq("id", taskId);

      if (error) return { ok: false, error: error.message };
      return { ok: true };
    } catch (e: unknown) {
      return { ok: false, error: (e as Error).message };
    }
  }

  return { ok: true };
}

/**
 * Delete a task.
 */
export async function deleteApplicationTask(taskId: string): Promise<{ ok: boolean; error?: string }> {
  const supabase = getSupabaseBrowserClient();
  if (supabase) {
    try {
      const { error } = await supabase
        .from("application_tasks")
        .delete()
        .eq("id", taskId);

      if (error) return { ok: false, error: error.message };
      return { ok: true };
    } catch (e: unknown) {
      return { ok: false, error: (e as Error).message };
    }
  }

  return { ok: true };
}
