"use client";

import { Button } from "@/components/ui/button";
import { Card, PageHeader, StatCard } from "@/components/ui/layout";
import { SAMPLE_SCHOLARSHIPS } from "@/lib/data/catalog";
import { useAdmitMind } from "@/lib/state/admitmind-store";
import { daysUntil, formatDate, greeting } from "@/lib/utils";
import Link from "next/link";

export default function DashboardPage() {
  const { session, profile, db, gamification } = useAdmitMind();
  const uid = session!.userId;
  const apps = db.applications.filter((a) => a.userId === uid);
  const essays = db.essays.filter((e) => e.userId === uid);
  const savedUnis = db.savedUniversities.filter((s) => s.userId === uid);
  const recs = db.recommendations.filter((r) => r.userId === uid);
  const deadlines = db.deadlines
    .filter((d) => d.userId === uid && !d.completed)
    .sort((a, b) => a.dueAt.localeCompare(b.dueAt));
  const dueCards = db.flashcards.filter((c) => {
    const deck = db.decks.find((d) => d.id === c.deckId);
    return deck?.userId === uid && new Date(c.nextReviewAt) <= new Date();
  });
  const today = new Date().toISOString().slice(0, 10);
  const todayMinutes = db.studySessions
    .filter((s) => s.userId === uid && s.date.slice(0, 10) === today)
    .reduce((a, s) => a + s.minutes, 0);
  const upcomingExams = db.exams.filter((e) => e.userId === uid);
  const attempts = db.quizAttempts.filter((a) => a.userId === uid);
  const avgQuiz =
    attempts.length > 0 ? Math.round(attempts.reduce((a, x) => a + x.score, 0) / attempts.length) : null;
  const essaysNeedReview = essays.filter((e) => e.reviews.length === 0);
  const recPending = recs.filter((r) => r.status !== "submitted");

  return (
    <div>
      <PageHeader
        eyebrow="Dashboard"
        title={`${greeting(profile?.fullName || "student")} 👋`}
        description="Here’s your university and study progress."
      />
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Applications in progress" value={apps.filter((a) => !["accepted", "rejected"].includes(a.status)).length} />
        <StatCard label="Upcoming deadlines" value={deadlines.length} tone="gold" hint={deadlines[0] ? `Next: ${deadlines[0].title} · ${formatDate(deadlines[0].dueAt)}` : "None yet"} />
        <StatCard label="Study streak" value={`${gamification?.streak ?? 0} days`} tone="study" />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Card>
          <h2 className="font-display text-2xl">Admissions</h2>
          <ul className="mt-4 space-y-3 text-sm">
            <li className="flex justify-between"><span>Universities saved</span><strong>{savedUnis.length}</strong></li>
            <li className="flex justify-between"><span>Essays needing review</span><strong>{essaysNeedReview.length}</strong></li>
            <li className="flex justify-between"><span>Sample scholarships available</span><strong>{SAMPLE_SCHOLARSHIPS.length}</strong></li>
            <li className="flex justify-between"><span>Recommendation letters pending</span><strong>{recPending.length}</strong></li>
          </ul>
        </Card>
        <Card className="border-study-100 bg-study-50/40">
          <h2 className="font-display text-2xl">Study</h2>
          <ul className="mt-4 space-y-3 text-sm">
            <li className="flex justify-between"><span>Today’s study time</span><strong>{todayMinutes} min</strong></li>
            <li className="flex justify-between"><span>Flashcards due</span><strong>{dueCards.length}</strong></li>
            <li className="flex justify-between"><span>Upcoming exams</span><strong>{upcomingExams.length}</strong></li>
            <li className="flex justify-between"><span>Quiz average</span><strong>{avgQuiz === null ? "—" : `${avgQuiz}%`}</strong></li>
          </ul>
        </Card>
      </div>

      {deadlines.slice(0, 3).length > 0 ? (
        <Card className="mt-6">
          <h3 className="font-semibold">Closest deadlines</h3>
          <ul className="mt-3 space-y-2 text-sm">
            {deadlines.slice(0, 3).map((d) => (
              <li key={d.id} className="flex justify-between">
                <span>{d.title}</span>
                <span className="text-ink-500">{daysUntil(d.dueAt)}d · {formatDate(d.dueAt)}</span>
              </li>
            ))}
          </ul>
        </Card>
      ) : null}

      <h3 className="mb-3 mt-10 text-sm font-semibold uppercase tracking-widest text-ink-400">Quick actions</h3>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {[
          ["/admissions/essays", "Review an essay"],
          ["/admissions/universities", "Find universities"],
          ["/admissions/scholarships", "Find scholarships"],
          ["/study/flashcards", "Create flashcards"],
          ["/study/tutor", "Ask AI Tutor"],
          ["/study/planner", "Create study plan"],
        ].map(([href, label]) => (
          <Link key={href} href={href}>
            <Button variant="outline" className="w-full rounded-2xl">
              {label}
            </Button>
          </Link>
        ))}
      </div>
    </div>
  );
}
