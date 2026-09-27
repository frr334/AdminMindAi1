import { getSupabaseBrowserClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { loadDatabase, saveDatabase } from "@/lib/data/local-db";
import type { Profile, Session, UserSettings } from "@/lib/types";
import { nowIso, sha256, uid } from "@/lib/utils";

const LOCAL_PEPPER = "admitmind-local-dev-only";

export type AuthResult =
  | { ok: true; session: Session }
  | { ok: false; message: string };

export async function getSession(): Promise<Session | null> {
  if (isSupabaseConfigured()) {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return null;
    const { data } = await supabase.auth.getSession();
    const s = data.session;
    if (!s?.user) return null;
    return {
      userId: s.user.id,
      email: s.user.email || "",
      createdAt: s.user.created_at,
      expiresAt: new Date((s.expires_at || 0) * 1000).toISOString(),
    };
  }
  const db = loadDatabase();
  if (!db.session) return null;
  if (new Date(db.session.expiresAt).getTime() < Date.now()) {
    db.session = null;
    saveDatabase(db);
    return null;
  }
  return db.session;
}

export async function signIn(email: string, password: string): Promise<AuthResult> {
  if (isSupabaseConfigured()) {
    const supabase = getSupabaseBrowserClient()!;
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error || !data.user) return { ok: false, message: error?.message || "Unable to sign in." };
    return {
      ok: true,
      session: {
        userId: data.user.id,
        email: data.user.email || email,
        createdAt: data.user.created_at,
        expiresAt: new Date((data.session?.expires_at || 0) * 1000).toISOString(),
      },
    };
  }
  const db = loadDatabase();
  const hash = await sha256(`${password}:${LOCAL_PEPPER}`);
  const user = db.users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
  if (!user || user.passwordHash !== hash) {
    return { ok: false, message: "Invalid email or password." };
  }
  const session: Session = {
    userId: user.id,
    email: user.email,
    createdAt: nowIso(),
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString(),
  };
  db.session = session;
  saveDatabase(db);
  return { ok: true, session };
}

export async function signUp(email: string, password: string, fullName: string): Promise<AuthResult> {
  if (isSupabaseConfigured()) {
    const supabase = getSupabaseBrowserClient()!;
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });
    if (error || !data.user) return { ok: false, message: error?.message || "Unable to create account." };
    if (!data.session) {
      return {
        ok: false,
        message: "Account created. Check your email to confirm, then sign in.",
      };
    }
    return {
      ok: true,
      session: {
        userId: data.user.id,
        email: data.user.email || email,
        createdAt: data.user.created_at,
        expiresAt: new Date((data.session.expires_at || 0) * 1000).toISOString(),
      },
    };
  }
  const db = loadDatabase();
  if (db.users.some((u) => u.email.toLowerCase() === email.trim().toLowerCase())) {
    return { ok: false, message: "An account with this email already exists." };
  }
  const user = {
    id: uid(),
    email: email.trim().toLowerCase(),
    passwordHash: await sha256(`${password}:${LOCAL_PEPPER}`),
    createdAt: nowIso(),
  };
  db.users.push(user);
  const session: Session = {
    userId: user.id,
    email: user.email,
    createdAt: nowIso(),
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString(),
  };
  db.session = session;
  const profile: Profile = {
    userId: user.id,
    fullName,
    country: "",
    educationLevel: "high_school",
    intendedUniversityCountry: "",
    intendedMajor: "",
    testScores: {},
    preferredSize: "no_preference",
    preferredLocation: "",
    academicInterests: [],
    careerInterests: [],
    interestedCountries: [],
    consideringUniversities: [],
    desiredDegree: "bachelor",
    enrollTerm: "",
    onboardingComplete: false,
    updatedAt: nowIso(),
  };
  db.profiles.push(profile);
  const settings: UserSettings = {
    userId: user.id,
    notificationsEnabled: true,
    deadlineReminders: true,
    streakReminders: true,
    appearance: "system",
    aiTone: "detailed",
    shareAnalytics: false,
    updatedAt: nowIso(),
  };
  db.settings.push(settings);
  db.subscriptions.push({
    userId: user.id,
    plan: "free",
    status: "inactive",
    provider: "none",
  });
  db.gamification.push({
    userId: user.id,
    xp: 0,
    level: 1,
    streak: 0,
    lastStudyDate: null,
    achievements: [],
  });
  saveDatabase(db);
  return { ok: true, session };
}

export async function signOut() {
  if (isSupabaseConfigured()) {
    await getSupabaseBrowserClient()?.auth.signOut();
  }
  const db = loadDatabase();
  db.session = null;
  saveDatabase(db);
}

export async function requestPasswordReset(email: string): Promise<{ ok: boolean; message: string }> {
  if (isSupabaseConfigured()) {
    const { error } = await getSupabaseBrowserClient()!.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) return { ok: false, message: error.message };
    return { ok: true, message: "If an account exists, a reset email is on its way." };
  }
  const db = loadDatabase();
  const exists = db.users.some((u) => u.email.toLowerCase() === email.trim().toLowerCase());
  if (!exists) {
    return { ok: true, message: "If an account exists, you can reset the password on the next screen." };
  }
  if (typeof window !== "undefined") {
    sessionStorage.setItem("admitmind.reset.email", email.trim().toLowerCase());
  }
  return { ok: true, message: "Continue to set a new password. (Local mode — no email is sent.)" };
}

export async function completePasswordReset(
  email: string,
  password: string,
): Promise<{ ok: boolean; message: string }> {
  if (isSupabaseConfigured()) {
    const { error } = await getSupabaseBrowserClient()!.auth.updateUser({ password });
    if (error) return { ok: false, message: error.message };
    return { ok: true, message: "Password updated." };
  }
  const db = loadDatabase();
  const user = db.users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
  if (!user) return { ok: false, message: "No local account found for that email." };
  user.passwordHash = await sha256(`${password}:${LOCAL_PEPPER}`);
  saveDatabase(db);
  return { ok: true, message: "Password updated. You can sign in." };
}
