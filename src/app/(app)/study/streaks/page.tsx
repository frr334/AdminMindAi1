"use client";

import { Card, PageHeader, StatCard } from "@/components/ui/layout";
import { useAdmitMind } from "@/lib/state/admitmind-store";
import { xpToNext } from "@/lib/utils";

export default function StreaksPage() {
  const { gamification, db, session } = useAdmitMind();
  const g = gamification;
  const minutes = db.studySessions.filter((s) => s.userId === session!.userId).reduce((a, s) => a + s.minutes, 0);
  const quizzes = db.quizAttempts.filter((a) => a.userId === session!.userId);
  const cards = db.flashcards.filter((c) => db.decks.some((d) => d.id === c.deckId && d.userId === session!.userId)).reduce((a, c) => a + c.reviews, 0);
  const tasks = db.studyPlans.filter((p) => p.userId === session!.userId).flatMap((p) => p.tasks).filter((t) => t.done).length;

  return (
    <div>
      <PageHeader title="Streaks & progress" description="Tasteful motivation — XP for real study, not noise." />
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard tone="study" label="Streak" value={`${g?.streak ?? 0} days`} />
        <StatCard tone="study" label="Level" value={g?.level ?? 1} hint={`${g?.xp ?? 0} XP · ${xpToNext(g?.xp ?? 0)} to next`} />
        <StatCard tone="study" label="Study time" value={`${minutes} min`} />
      </div>
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <StatCard label="Tasks completed" value={tasks} />
        <StatCard label="Quiz attempts" value={quizzes.length} />
        <StatCard label="Cards reviewed" value={cards} />
      </div>
      <Card className="mt-8">
        <h3 className="font-display text-xl">Achievements</h3>
        {(g?.achievements.length || 0) === 0 ? (
          <p className="mt-2 text-sm text-ink-500">Study three days in a row or earn 500 XP to unlock the first badges.</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {g!.achievements.map((a) => (
              <li key={a.id}>
                <p className="font-semibold">{a.title}</p>
                <p className="text-sm text-ink-500">{a.description}</p>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
