"use client";

import { Button } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/field";
import { Banner, Card, PageHeader } from "@/components/ui/layout";
import { localQuizFromText } from "@/lib/analysis/local-engines";
import { AIService } from "@/lib/ai/ai-service";
import { repositories, useAdmitMind } from "@/lib/state/admitmind-store";
import type { Quiz } from "@/lib/types";
import { nowIso, uid } from "@/lib/utils";
import { useState } from "react";

export default function QuizzesPage() {
  const { session, db, persist } = useAdmitMind();
  const quizzes = db.quizzes.filter((q) => q.userId === session!.userId);
  const [title, setTitle] = useState("Topic check");
  const [subject, setSubject] = useState("History");
  const [source, setSource] = useState("");
  const [active, setActive] = useState<Quiz | null>(null);
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [msg, setMsg] = useState("");
  const attempts = db.quizAttempts.filter((a) => a.userId === session!.userId);

  async function generate() {
    const ai = await AIService.generateQuiz({ source, subject });
    const raw = localQuizFromText(source || subject, subject);
    const quiz: Quiz = {
      id: uid(),
      userId: session!.userId,
      title,
      subject,
      createdAt: nowIso(),
      questions: raw.map((q) => ({ ...q, id: uid() })),
    };
    repositories.saveQuiz(persist, quiz);
    setActive(quiz);
    setMsg(ai.ok ? "Quiz from AI API." : `${ai.message} A local quiz was built from your notes.`);
  }

  function submit() {
    if (!active) return;
    const answers = active.questions.map((q) => {
      const response = responses[q.id] || "";
      const correct = response.trim().toLowerCase() === q.answer.trim().toLowerCase();
      return { questionId: q.id, response, correct };
    });
    const score = Math.round((answers.filter((a) => a.correct).length / Math.max(1, answers.length)) * 100);
    persist((d) => {
      d.quizAttempts.push({
        id: uid(),
        quizId: active.id,
        userId: session!.userId,
        startedAt: nowIso(),
        completedAt: nowIso(),
        score,
        answers,
      });
    });
    repositories.addStudyMinutes(persist, session!.userId, 15, active.subject, "quiz");
    setMsg(`Score ${score}%. Weak topics: ${active.questions.filter((q) => !answers.find((a) => a.questionId === q.id)?.correct).map((q) => q.topic).join(", ") || "none flagged"}`);
  }

  const avg = attempts.length ? Math.round(attempts.reduce((a, x) => a + x.score, 0) / attempts.length) : 0;

  return (
    <div>
      <PageHeader title="Practice quizzes" description={`Attempts: ${attempts.length} · average ${attempts.length ? avg : "—"}%`} />
      <Card className="mb-6 space-y-3">
        <div className="grid gap-3 md:grid-cols-2">
          <Field label="Title"><Input value={title} onChange={(e) => setTitle(e.target.value)} /></Field>
          <Field label="Subject"><Input value={subject} onChange={(e) => setSubject(e.target.value)} /></Field>
        </div>
        <Field label="Notes / topics / paste"><Textarea value={source} onChange={(e) => setSource(e.target.value)} /></Field>
        {msg ? <Banner>{msg}</Banner> : null}
        <Button onClick={generate}>Generate quiz</Button>
      </Card>
      {active ? (
        <Card className="space-y-4">
          {active.questions.map((q) => (
            <div key={q.id}>
              <p className="font-medium">{q.prompt}</p>
              {q.options ? (
                <div className="mt-2 space-y-1">
                  {q.options.map((o) => (
                    <label key={o} className="flex items-center gap-2 text-sm">
                      <input type="radio" name={q.id} onChange={() => setResponses({ ...responses, [q.id]: o })} />
                      {o}
                    </label>
                  ))}
                </div>
              ) : (
                <Input className="mt-2" onChange={(e) => setResponses({ ...responses, [q.id]: e.target.value })} />
              )}
            </div>
          ))}
          <Button onClick={submit}>Submit attempt</Button>
        </Card>
      ) : null}
      <div className="mt-6 space-y-2">
        {quizzes.map((q) => (
          <button key={q.id} className="block w-full text-left" onClick={() => setActive(q)}>
            <Card>{q.title} · {q.subject}</Card>
          </button>
        ))}
      </div>
    </div>
  );
}
