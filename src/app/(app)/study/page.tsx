"use client";

import { Button } from "@/components/ui/button";
import { Card, PageHeader, StatCard } from "@/components/ui/layout";
import { useAdmitMind } from "@/lib/state/admitmind-store";
import { formatDate } from "@/lib/utils";
import Link from "next/link";

export default function StudyHomePage() {
  const { session, db, gamification } = useAdmitMind();
  const uid = session!.userId;
  const today = new Date().toISOString().slice(0, 10);
  const todayMinutes = db.studySessions.filter((s) => s.userId === uid && s.date.slice(0, 10) === today).reduce((a, s) => a + s.minutes, 0);
  const due = db.flashcards.filter((c) => {
    const deck = db.decks.find((d) => d.id === c.deckId);
    return deck?.userId === uid && new Date(c.nextReviewAt) <= new Date();
  }).length;
  const plans = db.studyPlans.filter((p) => p.userId === uid);
  const exams = db.exams.filter((e) => e.userId === uid);
  const attempts = db.quizAttempts.filter((a) => a.userId === uid);
  const lastScore = attempts.at(-1)?.score;

  return (
    <div>
      <PageHeader
        eyebrow="Study"
        title="Study home"
        description="A quieter workspace for exams, memory, and daily focus — still AdmitMind."
      />
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard tone="study" label="Today’s minutes" value={todayMinutes} hint="Log time from any study tool" />
        <StatCard tone="study" label="Streak" value={`${gamification?.streak ?? 0} days`} />
        <StatCard tone="study" label="Flashcards due" value={due} />
      </div>
      <div className="mt-8 grid gap-4 lg:grid-cols-2">
        <Card>
          <h3 className="font-display text-xl">Upcoming exams</h3>
          {exams.length === 0 ? <p className="mt-2 text-sm text-ink-500">None scheduled.</p> : exams.map((e) => (
            <p key={e.id} className="mt-2 text-sm">{e.examName} · {formatDate(e.examDate)}</p>
          ))}
          <Link href="/study/exams"><Button className="mt-4" variant="outline">Exam prep</Button></Link>
        </Card>
        <Card>
          <h3 className="font-display text-xl">Plans & quizzes</h3>
          <p className="mt-2 text-sm">Active plans: {plans.length}</p>
          <p className="text-sm">Latest quiz score: {lastScore == null ? "—" : `${lastScore}%`}</p>
          <div className="mt-4 flex gap-2">
            <Link href="/study/planner"><Button variant="outline">Planner</Button></Link>
            <Link href="/study/quizzes"><Button variant="outline">Quizzes</Button></Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
