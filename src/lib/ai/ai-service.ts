import { isAiConfigured, getPublicEnv } from "@/lib/supabase/client";

export type AiOk<T> = { ok: true; data: T; source: "ai_api" };
export type AiErr = { ok: false; code: "not_configured" | "network" | "error"; message: string };
export type AiResult<T> = AiOk<T> | AiErr;

/**
 * Universal safe request helper for AI services.
 * Gracefully handles unconfigured backend without throwing or breaking UI.
 */
async function post<T>(path: string, body: unknown): Promise<AiResult<T>> {
  if (!isAiConfigured()) {
    return {
      ok: false,
      code: "not_configured",
      message:
        "AI service backend is not connected. Configure NEXT_PUBLIC_AI_API_URL or server API keys to enable live model inference.",
    };
  }

  const { aiApiUrl } = getPublicEnv();
  const base = aiApiUrl.replace(/\/$/, "");

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000); // 15s timeout

    const res = await fetch(`${base}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      return {
        ok: false,
        code: "error",
        message: text || `AI service returned error status (${res.status}).`,
      };
    }

    const data = (await res.json()) as T;
    return { ok: true, data, source: "ai_api" };
  } catch (err: unknown) {
    const isAbort = (err as { name?: string })?.name === "AbortError";
    return {
      ok: false,
      code: "network",
      message: isAbort
        ? "AI request timed out. Please try again."
        : "Could not reach the AI service gateway. Ensure the endpoint is operational.",
    };
  }
}

export const AIService = {
  isAvailable: () => isAiConfigured(),

  reviewEssay: (payload: { essay: string; type: string; tone?: string }) =>
    post<{ feedback: string; score?: number }>("/essay-review", payload),

  generateFlashcards: (payload: { source: string; count?: number; subject?: string }) =>
    post<{ cards: { front: string; back: string }[] }>("/flashcards", payload),

  tutor: (payload: { subject: string; difficulty: string; messages: { role: string; content: string }[] }) =>
    post<{ reply: string }>("/tutor", payload),

  generateStudyPlan: (payload: unknown) =>
    post<{ plan: string }>("/study-plan", payload),

  generateQuiz: (payload: { source: string; subject: string }) =>
    post<{ questions: { question: string; options: string[]; answer: string }[] }>("/quiz", payload),

  analyzeInterview: (payload: { question: string; answer: string }) =>
    post<{
      clarity: string;
      structure: string;
      relevance: string;
      specificity: string;
      confidence: string;
    }>("/interview-feedback", payload),

  universityMatching: (payload: unknown) =>
    post<{ recommendations: unknown[] }>("/university-match", payload),

  scholarshipRecommendations: (payload: unknown) =>
    post<{ scholarships: unknown[] }>("/scholarship-match", payload),
};
