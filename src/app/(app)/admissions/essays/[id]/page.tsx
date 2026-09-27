"use client";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/field";
import { Banner, Card, PageHeader } from "@/components/ui/layout";
import { localEssayReview } from "@/lib/analysis/local-engines";
import { useAdmitMind } from "@/lib/state/admitmind-store";
import { nowIso, uid } from "@/lib/utils";
import { useParams } from "next/navigation";
import { useState } from "react";

export default function EssayDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { db, persist } = useAdmitMind();
  const essay = db.essays.find((e) => e.id === id);
  const [draft, setDraft] = useState(essay?.body || "");
  if (!essay) return <p>Essay not found.</p>;
  const latest = essay.reviews[0];

  function saveRevision() {
    persist((d) => {
      const row = d.essays.find((e) => e.id === essay!.id);
      if (!row) return;
      row.body = draft;
      row.updatedAt = nowIso();
      row.revisions.unshift({ id: uid(), body: draft, savedAt: nowIso(), note: "Manual revision" });
    });
  }

  function runLocal() {
    persist((d) => {
      const row = d.essays.find((e) => e.id === essay!.id);
      if (!row) return;
      const r = localEssayReview(draft);
      r.essayId = row.id;
      row.reviews.unshift(r);
    });
  }

  return (
    <div>
      <PageHeader eyebrow="Essay" title={essay.title} description="Original writing remains yours. Suggestions are optional." />
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <p className="text-xs font-semibold uppercase text-ink-400">Original / current draft</p>
          <Textarea className="mt-3 min-h-80" value={draft} onChange={(e) => setDraft(e.target.value)} />
          <div className="mt-3 flex gap-2">
            <Button onClick={saveRevision}>Save revision</Button>
            <Button variant="outline" onClick={runLocal}>
              Local analysis
            </Button>
          </div>
        </Card>
        <Card>
          {!latest ? <Banner>No reviews yet.</Banner> : (
            <div className="space-y-3 text-sm">
              <p className="text-xs uppercase tracking-wide text-gold-500">{latest.source === "ai_api" ? "AI API" : "Local heuristic"}</p>
              {Object.entries({
                Structure: latest.structure,
                Clarity: latest.clarity,
                Grammar: latest.grammar,
                Storytelling: latest.storytelling,
                Specificity: latest.specificity,
                Authenticity: latest.authenticity,
              }).map(([k, v]) => (
                <div key={k}>
                  <p className="font-semibold">{k}</p>
                  <p className="text-ink-600">{v}</p>
                </div>
              ))}
              <p className="font-semibold">Strengths</p>
              <ul className="list-disc pl-5">{latest.strengths.map((s) => <li key={s}>{s}</li>)}</ul>
              <p className="font-semibold">Weak points</p>
              <ul className="list-disc pl-5">{latest.weaknesses.map((s) => <li key={s}>{s}</li>)}</ul>
              <p className="font-semibold">Suggestions</p>
              <ul className="list-disc pl-5">{latest.suggestions.map((s) => <li key={s}>{s}</li>)}</ul>
            </div>
          )}
        </Card>
      </div>
      <Card className="mt-6">
        <h3 className="font-semibold">Revision history</h3>
        <ul className="mt-3 space-y-2 text-sm">
          {essay.revisions.map((r) => (
            <li key={r.id} className="rounded-xl bg-mist p-3">
              {new Date(r.savedAt).toLocaleString()} · {r.note} · {r.body.slice(0, 80)}…
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
