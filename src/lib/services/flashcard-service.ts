import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type { Flashcard } from "@/lib/types";

// Curated starter cards for quick onboarding
export const STARTER_FLASHCARDS: Omit<Flashcard, "id" | "user_id" | "created_at" | "updated_at">[] = [
  {
    question: "What is the difference between Early Action (EA) and Early Decision (ED)?",
    answer: "Early Decision (ED) is binding—if admitted, you must enroll and withdraw other applications. Early Action (EA) is non-binding—you receive an early decision but can compare offers until May 1.",
    subject: "Admissions Prep",
  },
  {
    question: "What is the FAFSA and who is eligible to submit it?",
    answer: "Free Application for Federal Student Aid. US citizens and eligible non-citizens file it annually to qualify for federal grants, loans, and work-study.",
    subject: "Financial Aid",
  },
  {
    question: "What does holistic admissions review mean?",
    answer: "Admissions committees evaluate grades, rigorous course selection, standardized test scores, essays, extracurricular engagement, recommendation letters, and personal context rather than test scores alone.",
    subject: "Admissions Prep",
  },
  {
    question: "What is the Common App Personal Essay word count limit?",
    answer: "Between 250 and 650 words. Essays under 250 words cannot be submitted, and text over 650 words will be cut off by the portal.",
    subject: "Essays",
  },
  {
    question: "What is an apostille and when is it required?",
    answer: "A specialized certificate issued by a designated authority verifying the authenticity of an official document (such as a diploma or transcript) for international recognition under the Hague Convention.",
    subject: "Visa & Docs",
  },
];

/**
 * Fetch all flashcards for a user, optionally filtered by subject.
 */
export async function getFlashcards(userId: string, subject?: string): Promise<Flashcard[]> {
  const supabase = getSupabaseBrowserClient();
  if (supabase) {
    try {
      let query = supabase
        .from("flashcards")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (subject && subject !== "All") {
        query = query.eq("subject", subject);
      }

      const { data, error } = await query;
      if (!error && data && data.length > 0) {
        return data as Flashcard[];
      }
    } catch {
      // Fallback
    }
  }

  if (typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem(`admitmind.cards.${userId}`);
      if (raw) {
        let cards: Flashcard[] = JSON.parse(raw);
        if (subject && subject !== "All") {
          cards = cards.filter((c) => c.subject === subject);
        }
        return cards;
      }
    } catch {
      // Fallback
    }
  }

  // Provide initial starter cards
  return STARTER_FLASHCARDS.map((c, i) => ({
    id: `starter_${i + 1}`,
    user_id: userId,
    question: c.question,
    answer: c.answer,
    subject: c.subject,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }));
}

/**
 * Fetch all unique subjects for a user's flashcards.
 */
export async function getFlashcardSubjects(userId: string): Promise<string[]> {
  const cards = await getFlashcards(userId);
  const subjects = Array.from(new Set(cards.map((c) => c.subject).filter(Boolean))) as string[];
  return ["All", ...subjects.sort()];
}

/**
 * Create a new flashcard.
 */
export async function createFlashcard(
  userId: string,
  data: { question: string; answer: string; subject?: string }
): Promise<{ ok: boolean; data?: Flashcard; error?: string }> {
  const supabase = getSupabaseBrowserClient();
  if (supabase) {
    try {
      const payload = {
        user_id: userId,
        question: data.question.trim(),
        answer: data.answer.trim(),
        subject: data.subject?.trim() || "General",
      };

      const { data: created, error } = await supabase
        .from("flashcards")
        .insert(payload)
        .select()
        .single();

      if (error) return { ok: false, error: error.message };
      return { ok: true, data: created as Flashcard };
    } catch (e: unknown) {
      return { ok: false, error: (e as Error).message };
    }
  }

  if (typeof window !== "undefined") {
    try {
      const key = `admitmind.cards.${userId}`;
      const cards = await getFlashcards(userId);
      const newCard: Flashcard = {
        id: crypto.randomUUID ? crypto.randomUUID() : `card_${Date.now()}`,
        user_id: userId,
        question: data.question.trim(),
        answer: data.answer.trim(),
        subject: data.subject?.trim() || "General",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      cards.unshift(newCard);
      localStorage.setItem(key, JSON.stringify(cards));
      return { ok: true, data: newCard };
    } catch (e: unknown) {
      return { ok: false, error: (e as Error).message };
    }
  }

  return { ok: false, error: "Database unavailable" };
}

/**
 * Update an existing flashcard.
 */
export async function updateFlashcard(
  id: string,
  userId: string,
  updates: Partial<Flashcard>
): Promise<{ ok: boolean; data?: Flashcard; error?: string }> {
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
        .from("flashcards")
        .update(payload)
        .eq("id", id)
        .eq("user_id", userId)
        .select()
        .single();

      if (error) return { ok: false, error: error.message };
      return { ok: true, data: data as Flashcard };
    } catch (e: unknown) {
      return { ok: false, error: (e as Error).message };
    }
  }

  if (typeof window !== "undefined") {
    try {
      const key = `admitmind.cards.${userId}`;
      const cards = await getFlashcards(userId);
      const idx = cards.findIndex((c) => c.id === id);
      if (idx >= 0) {
        cards[idx] = { ...cards[idx], ...updates, updated_at: new Date().toISOString() };
        localStorage.setItem(key, JSON.stringify(cards));
        return { ok: true, data: cards[idx] };
      }
    } catch (e: unknown) {
      return { ok: false, error: (e as Error).message };
    }
  }
  return { ok: false, error: "Not found" };
}

/**
 * Delete a flashcard.
 */
export async function deleteFlashcard(id: string, userId: string): Promise<{ ok: boolean; error?: string }> {
  const supabase = getSupabaseBrowserClient();
  if (supabase) {
    try {
      const { error } = await supabase
        .from("flashcards")
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
      const key = `admitmind.cards.${userId}`;
      const cards = (await getFlashcards(userId)).filter((c) => c.id !== id);
      localStorage.setItem(key, JSON.stringify(cards));
      return { ok: true };
    } catch (e: unknown) {
      return { ok: false, error: (e as Error).message };
    }
  }
  return { ok: true };
}
