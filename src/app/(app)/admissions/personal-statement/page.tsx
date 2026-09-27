"use client";

import { Button } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/field";
import { Banner, Card, PageHeader } from "@/components/ui/layout";
import { localEssayReview } from "@/lib/analysis/local-engines";
import { repositories, useAdmitMind } from "@/lib/state/admitmind-store";
import type { Essay } from "@/lib/types";
import { nowIso, uid } from "@/lib/utils";
import { useMemo, useState } from "react";

export default function PersonalStatementPage() {
  const { session, db, persist } = useAdmitMind();
  const existing = useMemo(
    () => db.essays.find((e) => e.userId === session!.userId && e.type === "personal_statement"),
    [db.essays, session],
  );
  const [title, setTitle] = useState(existing?.title || "Personal statement");
  const [body, setBody] = useState(existing?.body || "");
  const [msg, setMsg] = useState("");
  const review = existing?.reviews[0];

  function persistEssay() {
    const essay: Essay = existing
      ? { ...existing, title, body, updatedAt: nowIso(), revisions: [{ id: uid(), body, savedAt: nowIso() }, ...existing.revisions] }
      : {
          id: uid(),
          userId: session!.userId,
          title,
          type: "personal_statement",
          body,
          savedAt: nowIso(),
          updatedAt: nowIso(),
          reviews: [],
          revisions: [{ id: uid(), body, savedAt: nowIso(), note: "Created" }],
        };
    repositories.saveEssay(persist, essay);
    setMsg("Saved.");
    return essay;
  }

  function analyze() {
    const essay = persistEssay();
    const r = localEssayReview(body);
    r.essayId = essay.id;
    persist((d) => {
      const row = d.essays.find((e) => e.id === essay.id);
      if (row) row.reviews.unshift(r);
    });
    setMsg("Local structure analysis added. Connect an AI API for model feedback.");
  }

  return (
    <div>
      <PageHeader
        eyebrow="Writing"
        title="Personal statement"
        description="Create or upload a statement, keep the original visible, and track revisions."
      />
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="space-y-4">
          <Field label="Title">
            <Input value={title} onChange={(e) => setTitle(e.target.value)} />
          </Field>
          <Field label="Statement">
            <Textarea className="min-h-72" value={body} onChange={(e) => setBody(e.target.value)} />
          </Field>
          <Field label="Upload existing statement">
            <Input type="file" accept=".txt,.md" onChange={(e) => e.target.files?.[0]?.text().then(setBody)} />
          </Field>
          {msg ? <Banner tone="ok">{msg}</Banner> : null}
          <div className="flex gap-2">
            <Button onClick={persistEssay}>Save</Button>
            <Button variant="outline" onClick={analyze}>
              Analyze structure
            </Button>
          </div>
        </Card>
        <Card>
          <h3 className="font-display text-xl">Feedback</h3>
          {!review ? (
            <p className="mt-3 text-sm text-ink-500">No analysis yet. Weak sections will appear here after you run a review.</p>
          ) : (
            <div className="mt-4 space-y-2 text-sm">
              <p>{review.structure}</p>
              <p className="font-semibold">Weaker areas</p>
              <ul className="list-disc pl-5">
                {review.weaknesses.map((w) => (
                  <li key={w}>{w}</li>
                ))}
              </ul>
            </div>
          )}
          <h3 className="mt-6 font-semibold">Revisions</h3>
          <ul className="mt-2 space-y-1 text-xs text-ink-500">
            {(existing?.revisions || []).slice(0, 8).map((r) => (
              <li key={r.id}>{new Date(r.savedAt).toLocaleString()}</li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}
