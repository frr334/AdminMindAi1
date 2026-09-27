import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { AIService } from "@/lib/ai/ai-service";
import type { EssayReview } from "@/lib/types";

/**
 * Local heuristic analysis for an essay.
 * Never breaks, works offline, and produces realistic writing metrics and actionable advice.
 */
export function analyzeEssayLocally(text: string): {
  score: number;
  wordCount: number;
  charCount: number;
  paragraphCount: number;
  avgSentenceLength: number;
  feedback: string;
} {
  const trimmed = text.trim();
  if (!trimmed) {
    return {
      score: 0,
      wordCount: 0,
      charCount: 0,
      paragraphCount: 0,
      avgSentenceLength: 0,
      feedback: "Draft is empty. Begin typing or paste your personal statement or essay.",
    };
  }

  const words = trimmed.split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  const charCount = text.length;
  const paragraphs = text.split(/\n\s*\n/).filter((p) => p.trim().length > 0);
  const paragraphCount = Math.max(1, paragraphs.length);
  const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0);
  const avgSentenceLength = sentences.length > 0 ? Math.round(wordCount / sentences.length) : wordCount;

  // Compute a balanced heuristic score (0 - 100)
  let score = 50;

  // Length factor (most college essays target 250 - 650 words)
  if (wordCount >= 250 && wordCount <= 650) score += 20;
  else if (wordCount > 150) score += 12;
  else score -= 15;

  // Paragraph structure factor
  if (paragraphCount >= 3 && paragraphCount <= 6) score += 15;
  else if (paragraphCount > 1) score += 8;

  // Sentence length balance
  if (avgSentenceLength >= 14 && avgSentenceLength <= 24) score += 15;
  else if (avgSentenceLength > 28) score -= 5; // run-on sentences

  score = Math.max(20, Math.min(95, score));

  // Construct structured feedback
  const observations: string[] = [];
  if (wordCount < 250) {
    observations.push(`• Length: At ${wordCount} words, this draft is relatively concise. Most university admissions essays aim for 400–650 words to allow sufficient narrative depth.`);
  } else if (wordCount > 700) {
    observations.push(`• Length: At ${wordCount} words, watch out for Common App or supplemental word caps (often strictly limited to 500 or 650 words).`);
  } else {
    observations.push(`• Length: Solid volume (${wordCount} words). Fits standard university application specifications.`);
  }

  if (paragraphCount < 3) {
    observations.push(`• Structure: Consider organizing into an opening hook, 2-3 body paragraphs illustrating concrete turning points, and a forward-looking resolution.`);
  } else {
    observations.push(`• Structure: Well-segmented across ${paragraphCount} paragraphs.`);
  }

  if (avgSentenceLength > 25) {
    observations.push(`• Cadence: Average sentence length is ${avgSentenceLength} words. Vary your sentence rhythm by breaking up long multi-clause statements.`);
  } else {
    observations.push(`• Cadence: Natural conversational flow with balanced sentence cadence (avg ~${avgSentenceLength} words/sentence).`);
  }

  observations.push(`• Voice & Specificity: Anchor your assertions with vivid, specific memories—names, challenges overcome, and the specific intellectual curiosity driving your major.`);

  return {
    score,
    wordCount,
    charCount,
    paragraphCount,
    avgSentenceLength,
    feedback: observations.join("\n\n"),
  };
}

/**
 * Fetch all essay reviews for a user from Supabase.
 */
export async function getEssays(userId: string): Promise<EssayReview[]> {
  const supabase = getSupabaseBrowserClient();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("essay_reviews")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (!error && data) {
        return data as EssayReview[];
      }
    } catch {
      // Fallback
    }
  }

  if (typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem(`admitmind.essays.${userId}`);
      if (raw) return JSON.parse(raw);
    } catch {
      return [];
    }
  }
  return [];
}

/**
 * Fetch single essay review by ID.
 */
export async function getEssayById(id: string, userId: string): Promise<EssayReview | null> {
  const supabase = getSupabaseBrowserClient();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("essay_reviews")
        .select("*")
        .eq("id", id)
        .eq("user_id", userId)
        .maybeSingle();

      if (!error && data) return data as EssayReview;
    } catch {
      // Fallback
    }
  }

  const all = await getEssays(userId);
  return all.find((e) => e.id === id) || null;
}

/**
 * Create a new essay draft / review.
 */
export async function createEssay(
  userId: string,
  data: { title?: string; essay_text: string }
): Promise<{ ok: boolean; data?: EssayReview; error?: string }> {
  const analysis = analyzeEssayLocally(data.essay_text);
  const supabase = getSupabaseBrowserClient();
  if (supabase) {
    try {
      const payload = {
        user_id: userId,
        title: data.title?.trim() || "Untitled Essay Draft",
        essay_text: data.essay_text,
        ai_feedback: analysis.feedback,
        overall_score: analysis.score,
      };

      const { data: created, error } = await supabase
        .from("essay_reviews")
        .insert(payload)
        .select()
        .single();

      if (error) return { ok: false, error: error.message };
      return { ok: true, data: created as EssayReview };
    } catch (e: unknown) {
      return { ok: false, error: (e as Error).message };
    }
  }

  if (typeof window !== "undefined") {
    try {
      const key = `admitmind.essays.${userId}`;
      const items = await getEssays(userId);
      const newItem: EssayReview = {
        id: crypto.randomUUID ? crypto.randomUUID() : `essay_${Date.now()}`,
        user_id: userId,
        title: data.title?.trim() || "Untitled Essay Draft",
        essay_text: data.essay_text,
        ai_feedback: analysis.feedback,
        overall_score: analysis.score,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      items.unshift(newItem);
      localStorage.setItem(key, JSON.stringify(items));
      return { ok: true, data: newItem };
    } catch (e: unknown) {
      return { ok: false, error: (e as Error).message };
    }
  }

  return { ok: false, error: "Database unavailable" };
}

/**
 * Update an existing essay draft.
 */
export async function updateEssay(
  id: string,
  userId: string,
  updates: { title?: string; essay_text?: string; ai_feedback?: string; overall_score?: number }
): Promise<{ ok: boolean; data?: EssayReview; error?: string }> {
  const supabase = getSupabaseBrowserClient();
  if (supabase) {
    try {
      const payload = {
        ...updates,
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from("essay_reviews")
        .update(payload)
        .eq("id", id)
        .eq("user_id", userId)
        .select()
        .single();

      if (error) return { ok: false, error: error.message };
      return { ok: true, data: data as EssayReview };
    } catch (e: unknown) {
      return { ok: false, error: (e as Error).message };
    }
  }

  if (typeof window !== "undefined") {
    try {
      const key = `admitmind.essays.${userId}`;
      const items = await getEssays(userId);
      const idx = items.findIndex((e) => e.id === id);
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
 * Delete an essay.
 */
export async function deleteEssay(id: string, userId: string): Promise<{ ok: boolean; error?: string }> {
  const supabase = getSupabaseBrowserClient();
  if (supabase) {
    try {
      const { error } = await supabase
        .from("essay_reviews")
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
      const key = `admitmind.essays.${userId}`;
      const items = (await getEssays(userId)).filter((e) => e.id !== id);
      localStorage.setItem(key, JSON.stringify(items));
      return { ok: true };
    } catch (e: unknown) {
      return { ok: false, error: (e as Error).message };
    }
  }
  return { ok: true };
}

/**
 * Request an AI review for an essay.
 * Gracefully falls back to heuristic review if AI backend is unconfigured.
 */
export async function requestEssayReview(
  id: string,
  userId: string,
  text: string,
  type: string = "Personal Statement"
): Promise<{ ok: boolean; feedback: string; score: number; source: "ai_api" | "local_heuristic"; message?: string }> {
  const localAnalysis = analyzeEssayLocally(text);

  try {
    const aiResult = await AIService.reviewEssay({ essay: text, type });
    if (aiResult.ok && aiResult.data) {
      const feedbackStr = typeof aiResult.data === "string" ? aiResult.data : JSON.stringify(aiResult.data);
      await updateEssay(id, userId, {
        ai_feedback: feedbackStr,
        overall_score: localAnalysis.score,
      });
      return {
        ok: true,
        feedback: feedbackStr,
        score: localAnalysis.score,
        source: "ai_api",
        message: "AI model review complete.",
      };
    }
  } catch {
    // Graceful fallback
  }

  // Update with comprehensive local review
  await updateEssay(id, userId, {
    ai_feedback: localAnalysis.feedback,
    overall_score: localAnalysis.score,
  });

  return {
    ok: true,
    feedback: localAnalysis.feedback,
    score: localAnalysis.score,
    source: "local_heuristic",
    message: "Structured writing analysis stored. Connect AI backend for full LLM commentary.",
  };
}
