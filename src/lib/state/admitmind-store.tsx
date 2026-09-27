"use client";

import { getSession, signOut as authSignOut } from "@/lib/services/auth-service";
import { getProfile, updateProfile } from "@/lib/services/profile-service";
import { getApplications } from "@/lib/services/application-service";
import { getDeadlines } from "@/lib/services/deadline-service";
import { getSavedUniversities } from "@/lib/services/university-service";
import { getSavedScholarships } from "@/lib/services/scholarship-service";
import { getFlashcards } from "@/lib/services/flashcard-service";
import { getEssays } from "@/lib/services/essay-service";
import { getRecommendations } from "@/lib/services/recommendation-service";
import type {
  Application,
  DeadlineItem,
  EssayReview,
  Flashcard,
  ID,
  Profile,
  Recommendation,
  Session,
  University,
  Scholarship,
} from "@/lib/types";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

type Status = "booting" | "ready";

// Unified state representation
export interface AdmitMindContextValue {
  status: Status;
  session: Session | null;
  profile: (Profile & { onboardingComplete: boolean }) | null;
  applications: Application[];
  deadlines: DeadlineItem[];
  savedUniversities: University[];
  savedScholarships: Scholarship[];
  flashcards: Flashcard[];
  essays: EssayReview[];
  recommendations: Recommendation[];
  refresh: () => Promise<void>;
  logout: () => Promise<void>;
  // Backward compatibility legacy accessors
  db: {
    applications: Application[];
    deadlines: DeadlineItem[];
    savedUniversities: { id: string; userId: string; universityId: string }[];
    scholarshipsSaved: { id: string; userId: string; scholarshipId: string }[];
    flashcards: Flashcard[];
    essays: EssayReview[];
    recommendations: Recommendation[];
    compareIds: string[];
    decks: { id: string; userId: string; name: string; subject: string }[];
    studySessions: { id: string; userId: string; date: string; minutes: number; subject: string; source: string }[];
    exams: { id: string; userId: string; name: string }[];
    quizAttempts: { id: string; userId: string; score: number }[];
    interviews: { id: string; userId: string; universityName: string; program: string; startedAt: string; questions: unknown[] }[];
  };
  gamification: {
    streak: number;
    xp: number;
    level: number;
  };
  persist: (mutator: (db: unknown) => void) => void;
}

const Ctx = createContext<AdmitMindContextValue | null>(null);

export function AdmitMindProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<Status>("booting");
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<(Profile & { onboardingComplete: boolean }) | null>(null);

  const [applications, setApplications] = useState<Application[]>([]);
  const [deadlines, setDeadlines] = useState<DeadlineItem[]>([]);
  const [savedUniversities, setSavedUniversities] = useState<University[]>([]);
  const [savedScholarships, setSavedScholarships] = useState<Scholarship[]>([]);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [essays, setEssays] = useState<EssayReview[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);

  // Compare IDs list for university comparison tool
  const [compareIds, setCompareIds] = useState<string[]>([]);

  const refresh = useCallback(async () => {
    try {
      const s = await getSession();
      setSession(s);

      if (s?.userId) {
        // Fetch real profile from Supabase
        const p = await getProfile(s.userId);
        if (p) {
          setProfile({
            ...p,
            onboardingComplete: Boolean(p.onboarding_completed),
          });
        } else {
          // Profile row not found yet; create starter profile
          const created = await updateProfile(s.userId, {
            email: s.email,
            onboarding_completed: false,
            subscription_plan: "free",
          });
          if (created.data) {
            setProfile({
              ...created.data,
              onboardingComplete: false,
            });
          }
        }

        // Fetch user data across all tables concurrently
        const [apps, dls, unis, schols, cards, ess, recs] = await Promise.all([
          getApplications(s.userId).catch(() => []),
          getDeadlines(s.userId).catch(() => []),
          getSavedUniversities(s.userId).catch(() => []),
          getSavedScholarships(s.userId).catch(() => []),
          getFlashcards(s.userId).catch(() => []),
          getEssays(s.userId).catch(() => []),
          getRecommendations(s.userId).catch(() => []),
        ]);

        setApplications(apps);
        setDeadlines(dls);
        setSavedUniversities(unis);
        setSavedScholarships(schols);
        setFlashcards(cards);
        setEssays(ess);
        setRecommendations(recs);
      } else {
        setProfile(null);
        setApplications([]);
        setDeadlines([]);
        setSavedUniversities([]);
        setSavedScholarships([]);
        setFlashcards([]);
        setEssays([]);
        setRecommendations([]);
      }
    } catch {
      // Set ready even on error so UI doesn't hang
    } finally {
      setStatus("ready");
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const logout = useCallback(async () => {
    await authSignOut();
    setSession(null);
    setProfile(null);
    await refresh();
  }, [refresh]);

  // Backward compatibility adapter for legacy components
  const db = useMemo(
    () => ({
      applications,
      deadlines,
      savedUniversities: savedUniversities.map((u) => ({
        id: u.id,
        userId: session?.userId || "",
        universityId: u.id,
      })),
      scholarshipsSaved: savedScholarships.map((s) => ({
        id: s.id,
        userId: session?.userId || "",
        scholarshipId: s.id,
      })),
      flashcards,
      essays,
      recommendations,
      compareIds,
      decks: [],
      studySessions: [],
      exams: [],
      quizAttempts: [],
      interviews: [],
    }),
    [applications, deadlines, savedUniversities, savedScholarships, flashcards, essays, recommendations, compareIds, session]
  );

  const gamification = useMemo(
    () => ({
      streak: flashcards.length > 0 || applications.length > 0 ? 3 : 1,
      xp: (applications.length * 50) + (flashcards.length * 15) + (essays.length * 100),
      level: Math.max(1, Math.floor(((applications.length * 50) + (flashcards.length * 15)) / 200) + 1),
    }),
    [applications, flashcards, essays]
  );

  const persist = useCallback(
    (mutator: (target: unknown) => void) => {
      // Support legacy mutator functions
      try {
        const fakeTarget = {
          compareIds: [...compareIds],
        };
        mutator(fakeTarget);
        if (fakeTarget.compareIds) {
          setCompareIds(fakeTarget.compareIds);
        }
      } catch {
        // no-op
      }
      void refresh();
    },
    [compareIds, refresh]
  );

  const value = useMemo(
    () => ({
      status,
      session,
      profile,
      applications,
      deadlines,
      savedUniversities,
      savedScholarships,
      flashcards,
      essays,
      recommendations,
      refresh,
      logout,
      db,
      gamification,
      persist,
    }),
    [
      status,
      session,
      profile,
      applications,
      deadlines,
      savedUniversities,
      savedScholarships,
      flashcards,
      essays,
      recommendations,
      refresh,
      logout,
      db,
      gamification,
      persist,
    ]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAdmitMind() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAdmitMind must be used within AdmitMindProvider");
  return ctx;
}

// Global repositories helper
export const repositories = {
  updateProfile: async (
    _persist: unknown,
    userId: ID,
    patch: Partial<Profile>
  ) => {
    return updateProfile(userId, patch);
  },
};
