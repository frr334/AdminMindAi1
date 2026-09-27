"use client";

import { Button } from "@/components/ui/button";
import { Card, PageHeader, StatCard } from "@/components/ui/layout";
import { SAMPLE_SCHOLARSHIPS } from "@/lib/data/catalog";
import { useAdmitMind } from "@/lib/state/admitmind-store";
import { daysUntil, formatDate, greeting } from "@/lib/utils";
import Link from "next/link";

export default function DashboardPage() {
  const { session, profile, applications, deadlines, flashcards, essays, recommendations, gamification } = useAdmitMind();
  const uid = session!.userId;

  // Filter user's data
  const apps = applications.filter((a) => a.user_id === uid);
  const userDeadlines = deadlines.filter((d) => d.user_id === uid).sort((a, b) => a.due_at.localeCompare(b.due_at));
  const userEssays = essays.filter((e) => e.user_id === uid);
  const userFlashcards = flashcards.filter((c) => c.user_id === uid);
  const userRecs = recommendations.filter((r) => r.user_id === uid);

  // Compute statistics
  const appsInProgress = apps.filter((a) => !["Accepted", "Rejected"].includes(a.application_status)).length;
  const essaysNeedingReview = userEssays.filter((e) => !e.ai_feedback).length;
  const recsPending = userRecs.filter((r) => r.status !== "submitted").length;

  return (
    <div>
      <PageHeader
        eyebrow="Dashboard"
        title={`${greeting(profile?.full_name || "student")} 👋`}
        description="Here's your university and study progress."
      />
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Applications in progress" value={appsInProgress} />
        <StatCard 
          label="Upcoming deadlines" 
          value={userDeadlines.length} 
          tone="gold" 
          hint={userDeadlines[0] ? `Next: ${userDeadlines[0].title} · ${formatDate(userDeadlines[0].due_at)}` : "None yet"} 
        />
        <StatCard label="Study streak" value={`${gamification?.streak ?? 0} days`} tone="study" />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Card>
          <h2 className="font-display text-2xl">Admissions</h2>
          <ul className="mt-4 space-y-3 text-sm">
            <li className="flex justify-between"><span>Active applications</span><strong>{apps.length}</strong></li>
            <li className="flex justify-between"><span>Essays created</span><strong>{userEssays.length}</strong></li>
            <li className="flex justify-between"><span>Essays needing review</span><strong>{essaysNeedingReview}</strong></li>
            <li className="flex justify-between"><span>Recommendation letters pending</span><strong>{recsPending}</strong></li>
          </ul>
        </Card>
        <Card className="border-study-100 bg-study-50/40">
          <h2 className="font-display text-2xl">Study</h2>
          <ul className="mt-4 space-y-3 text-sm">
            <li className="flex justify-between"><span>Flashcards created</span><strong>{userFlashcards.length}</strong></li>
            <li className="flex justify-between"><span>Upcoming deadlines</span><strong>{userDeadlines.length}</strong></li>
            <li className="flex justify-between"><span>Study streak</span><strong>{gamification?.streak ?? 0} days</strong></li>
            <li className="flex justify-between"><span>XP earned</span><strong>{gamification?.xp ?? 0}</strong></li>
          </ul>
        </Card>
      </div>

      {userDeadlines.slice(0, 3).length > 0 ? (
        <Card className="mt-6">
          <h3 className="font-semibold">Closest deadlines</h3>
          <ul className="mt-3 space-y-2 text-sm">
            {userDeadlines.slice(0, 3).map((d) => (
              <li key={d.id} className="flex justify-between">
                <span>{d.title}</span>
                <span className="text-ink-500">{daysUntil(d.due_at)}d · {formatDate(d.due_at)}</span>
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
          ["/admissions/applications", "Manage applications"],
          ["/study/flashcards", "Create flashcards"],
          ["/admissions/deadlines", "Track deadlines"],
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
