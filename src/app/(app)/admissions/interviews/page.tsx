"use client";

import { Button } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/field";
import { Banner, Card, EmptyState, PageHeader } from "@/components/ui/layout";
import { INTERVIEW_BANK, localInterviewFeedback } from "@/lib/analysis/local-engines";
import { AIService } from "@/lib/ai/ai-service";
import { repositories, useAdmitMind } from "@/lib/state/admitmind-store";
import type { InterviewSession } from "@/lib/types";
import { nowIso, uid } from "@/lib/utils";
import { useState } from "react";

export default function InterviewsPage() {
  const { session, db, persist } = useAdmitMind();
  const past = db.interviews.filter((i) => i.userId === session!.userId);
  const [universityName, setUni] = useState("");
  const [program, setProgram] = useState("");
  const [active, setActive] = useState<InterviewSession | null>(null);
  const [note, setNote] = useState("");

  function start() {
    if (!universityName.trim()) return;
    const s: InterviewSession = {
      id: uid(),
      userId: session!.userId,
      universityName,
      program,
      startedAt: nowIso(),
      questions: INTERVIEW_BANK.slice(0, 4).map((prompt) => ({ id: uid(), prompt, answer: "", feedback: null })),
    };
    setActive(s);
    repositories.saveInterview(persist, s);
  }

  function setAnswer(qid: string, answer: string) {
    if (!active) return;
    const next = {
      ...active,
      questions: active.questions.map((q) => (q.id === qid ? { ...q, answer } : q)),
    };
    setActive(next);
    repositories.saveInterview(persist, next);
  }

  async function feedback(qid: string) {
    if (!active) return;
    const q = active.questions.find((x) => x.id === qid);
    if (!q || q.answer.trim().length < 12) return setNote("Type a fuller answer first.");
    const ai = await AIService.analyzeInterview({ question: q.prompt, answer: q.answer });
    const fb = localInterviewFeedback(q.answer);
    if (ai.ok) fb.source = "ai_api";
    const next = {
      ...active,
      questions: active.questions.map((x) => (x.id === qid ? { ...x, feedback: fb } : x)),
    };
    setActive(next);
    repositories.saveInterview(persist, next);
    setNote(ai.ok ? "AI backend feedback stored." : `${ai.message} Local coaching notes were added instead.`);
  }

  return (
    <div>
      <PageHeader
        title="Interview practice"
        description="Typed mock interviews now. Recording can plug into the same session model later. Feedback is not an admissions verdict."
      />
      {!active ? (
        <Card className="mb-6 grid gap-3 md:grid-cols-3">
          <Field label="University / program">
            <Input value={universityName} onChange={(e) => setUni(e.target.value)} />
          </Field>
          <Field label="Program">
            <Input value={program} onChange={(e) => setProgram(e.target.value)} />
          </Field>
          <div className="flex items-end">
            <Button className="w-full" onClick={start}>
              Start mock interview
            </Button>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {note ? <Banner tone="warn">{note}</Banner> : null}
          {active.questions.map((q, i) => (
            <Card key={q.id}>
              <p className="text-xs uppercase tracking-wide text-ink-400">Question {i + 1}</p>
              <p className="mt-1 font-semibold">{q.prompt}</p>
              <Textarea className="mt-3" value={q.answer} onChange={(e) => setAnswer(q.id, e.target.value)} />
              <Button className="mt-3" variant="outline" onClick={() => feedback(q.id)}>
                Get feedback
              </Button>
              {q.feedback ? (
                <ul className="mt-3 space-y-1 text-sm text-ink-600">
                  <li>Clarity: {q.feedback.clarity}</li>
                  <li>Structure: {q.feedback.structure}</li>
                  <li>Relevance: {q.feedback.relevance}</li>
                  <li>Specificity: {q.feedback.specificity}</li>
                  <li>Confidence: {q.feedback.confidence}</li>
                </ul>
              ) : null}
            </Card>
          ))}
          <Button
            onClick={() => {
              repositories.saveInterview(persist, { ...active, completedAt: nowIso() });
              setActive(null);
            }}
          >
            Finish session
          </Button>
        </div>
      )}
      <h3 className="mb-3 mt-10 font-display text-2xl">Previous interviews</h3>
      {past.length === 0 ? (
        <EmptyState title="No sessions yet" body="Start a mock interview to build a review library." />
      ) : (
        <div className="space-y-2">
          {past.map((p) => (
            <Card key={p.id} className="cursor-pointer" >
              <button className="w-full text-left" onClick={() => setActive(p)}>
                <p className="font-semibold">{p.universityName}</p>
                <p className="text-sm text-ink-500">{p.program} · {new Date(p.startedAt).toLocaleString()}</p>
              </button>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
