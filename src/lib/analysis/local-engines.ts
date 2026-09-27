import type { EssayReview, InterviewFeedback, Profile, University } from "@/lib/types";
import { nowIso, uid } from "@/lib/utils";

export function localEssayReview(body: string): EssayReview {
  const words = body.trim().split(/\s+/).filter(Boolean);
  const sentences = body.split(/[.!?]+/).filter((s) => s.trim().length > 0);
  const paragraphs = body.split(/\n\s*\n/).filter((p) => p.trim());
  const avgSentence = sentences.length ? words.length / sentences.length : 0;
  const firstPerson = (body.match(/\b(I|my|me)\b/gi) || []).length;
  const vague = (body.match(/\b(very|really|things|stuff|always|never)\b/gi) || []).length;

  const clamp = (n: number) => Math.max(1, Math.min(10, Math.round(n)));

  return {
    id: uid(),
    essayId: "",
    createdAt: nowIso(),
    source: "local_heuristic",
    structure:
      paragraphs.length >= 4
        ? "You have multiple paragraphs, which is a good skeleton. Check that each paragraph has one job."
        : "Consider a clearer arc: opening, development, turning point, and close.",
    clarity:
      avgSentence > 28
        ? "Several sentences run long. Split complex thoughts so a reader can follow you."
        : "Sentence length looks manageable. Read aloud once to catch leftover fog.",
    grammar: "This pass does not run a grammar model. Use a dedicated checker or connect an AI API.",
    storytelling:
      firstPerson > 8
        ? "The draft is grounded in your voice. Make sure scenes show change, not only traits."
        : "Add a concrete moment so the reader can see you, not only hear claims.",
    specificity:
      vague > 6
        ? "A few filler words are doing too much work. Replace them with names, numbers, or scenes."
        : "Specificity looks promising. Add one sensory detail in the opening.",
    authenticity:
      "Keep your wording. This tool will not auto-rewrite the essay. Suggestions are optional.",
    strengths: [
      words.length >= 250 ? "Length is in a workable range." : "You have a starting draft to shape.",
      paragraphs.length > 1 ? "There is visible structure." : "You captured a core idea.",
    ],
    weaknesses: [
      words.length < 150 ? "The draft is short for most university essays." : "Watch repetition of the same claim.",
      vague > 4 ? "Vague intensifiers appear more than once." : "Transitions could be sharper.",
    ],
    suggestions: [
      "Highlight the moment of change in one sentence.",
      "Cut one sentence that restates the thesis without new evidence.",
      "Ask a teacher if the opening sounds like you.",
    ],
    scores: {
      structure: clamp(4 + paragraphs.length),
      clarity: clamp(10 - Math.max(0, avgSentence - 22) / 4),
      specificity: clamp(9 - vague),
      voice: clamp(4 + Math.min(6, firstPerson / 3)),
    },
  };
}

export function localInterviewFeedback(answer: string): InterviewFeedback {
  const words = answer.trim().split(/\s+/).filter(Boolean).length;
  return {
    source: "local_heuristic",
    clarity: words < 40 ? "The answer is brief. Add one example." : "Length is enough to be clear. Tighten the last sentence.",
    structure: answer.includes("because") || answer.includes("first")
      ? "There is a hint of structure. Try situation → action → result."
      : "Lead with the point, then support it.",
    relevance: "Without a live model, relevance is estimated only from length and keywords.",
    specificity: /\d/.test(answer) ? "A number or date helps. Keep that habit." : "Name a project, class, or outcome.",
    confidence: words > 120 ? "You may be over-explaining. End on a clean takeaway." : "Steady. Avoid hedging openers like 'I guess'.",
  };
}

export interface MatchResult {
  university: University;
  score: number;
  reasons: string[];
  caveats: string[];
}

export function matchUniversities(profile: Profile, universities: University[]): MatchResult[] {
  return universities
    .map((university) => {
      const reasons: string[] = [];
      const caveats: string[] = ["A match score is not an admission prediction."];
      let score = 40;
      const countries = [
        profile.intendedUniversityCountry,
        ...profile.interestedCountries,
      ]
        .map((c) => c.toLowerCase())
        .filter(Boolean);
      if (countries.some((c) => university.country.toLowerCase().includes(c) || c.includes(university.country.toLowerCase()))) {
        score += 18;
        reasons.push(`Location aligns with your interest in ${university.country}.`);
      }
      const major = profile.intendedMajor.toLowerCase();
      if (major && university.programs.some((p) => p.toLowerCase().includes(major) || major.includes(p.toLowerCase()))) {
        score += 20;
        reasons.push(`${university.name} lists a program related to ${profile.intendedMajor}.`);
      } else if (profile.academicInterests.some((i) => university.programs.some((p) => p.toLowerCase().includes(i.toLowerCase())))) {
        score += 12;
        reasons.push("One of your academic interests appears in the sample program list.");
      }
      if (profile.preferredSize !== "no_preference" && university.size === profile.preferredSize) {
        score += 8;
        reasons.push("Campus size matches your preference.");
      }
      if (profile.budgetUsd && university.tuitionUsdRange.toLowerCase().includes("low")) {
        score += 8;
        reasons.push("The sample tuition note suggests a relatively lower cost setting.");
      }
      if (!reasons.length) {
        reasons.push("Limited overlap with your current profile — still useful as a research option.");
        caveats.push("Update your major, countries, and budget for a sharper local ranking.");
      }
      return { university, score: Math.min(98, score), reasons, caveats };
    })
    .sort((a, b) => b.score - a.score);
}

export function localFlashcardsFromText(source: string, count = 8) {
  const chunks = source
    .split(/[\n.]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 24);
  return chunks.slice(0, count).map((chunk) => {
    const words = chunk.split(" ");
    const term = words.slice(0, 6).join(" ");
    return {
      front: `What should you remember about: ${term}?`,
      back: chunk,
    };
  });
}

export function localQuizFromText(source: string, subject: string) {
  const lines = source
    .split(/[\n.]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 20)
    .slice(0, 6);
  return lines.map((line, i) => {
    if (i % 3 === 0) {
      return {
        type: "true_false" as const,
        prompt: `True or false: ${line}`,
        options: ["True", "False"],
        answer: "True",
        topic: subject,
      };
    }
    if (i % 3 === 1) {
      return {
        type: "multiple_choice" as const,
        prompt: `Which statement matches your notes?`,
        options: [line, "An unrelated distractor (demo)", "A second distractor (demo)", "None of these"],
        answer: line,
        topic: subject,
      };
    }
    return {
      type: "short_answer" as const,
      prompt: `Summarize: ${line.slice(0, 80)}…`,
      answer: line,
      topic: subject,
    };
  });
}

export function buildStudyPlan(input: {
  examDate: string;
  subject: string;
  hoursPerWeek: number;
  topics: string[];
}) {
  const start = new Date();
  const end = new Date(input.examDate);
  const days = Math.max(7, Math.ceil((end.getTime() - start.getTime()) / 86400000));
  const dailyMinutes = Math.max(25, Math.round((input.hoursPerWeek * 60) / 7));
  const topics = input.topics.length ? input.topics : [input.subject];
  const tasks: { date: string; title: string; kind: "study" | "revision" | "practice" | "rest"; minutes: number }[] = [];
  for (let i = 0; i < Math.min(days, 42); i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    const iso = d.toISOString();
    const dow = d.getDay();
    if (dow === 0) {
      tasks.push({ date: iso, title: "Rest day — light recap only if you want", kind: "rest", minutes: 0 });
      continue;
    }
    const topic = topics[i % topics.length];
    if (dow === 6) {
      tasks.push({ date: iso, title: `Practice set · ${topic}`, kind: "practice", minutes: dailyMinutes });
    } else if (i % 5 === 0) {
      tasks.push({ date: iso, title: `Revision · ${topic}`, kind: "revision", minutes: dailyMinutes });
    } else {
      tasks.push({ date: iso, title: `Learn · ${topic}`, kind: "study", minutes: dailyMinutes });
    }
  }
  return tasks;
}

export const INTERVIEW_BANK = [
  "Why this university and this program?",
  "Tell us about a challenge you turned into progress.",
  "What will you contribute to the campus community?",
  "Describe a project that shows how you think.",
  "Where do you want to be in five years, and how does this degree help?",
  "What is a weakness you are actively working on?",
];
