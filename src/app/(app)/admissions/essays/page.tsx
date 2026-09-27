"use client";

import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import { Banner, Card, EmptyState, PageHeader } from "@/components/ui/layout";
import { localEssayReview } from "@/lib/analysis/local-engines";
import { AIService } from "@/lib/ai/ai-service";
import { repositories, useAdmitMind } from "@/lib/state/admitmind-store";
import type { Essay, EssayType } from "@/lib/types";
import { nowIso, uid } from "@/lib/utils";
import Link from "next/link";
import { useState } from "react";

export default function EssaysPage() {
  const { session, db, persist } = useAdmitMind();
  const essays = db.essays.filter((e) => e.userId === session!.userId);
  const [title, setTitle] = useState("Untitled essay");
  const [type, setType] = useState<EssayType>("common_app");
  const [body, setBody] = useState("");
  const [notice, setNotice] = useState("");

  function saveDraft(): Essay {
    const essay: Essay = {
      id: uid(),
      userId: session!.userId,
      title,
      type,
      body,
      savedAt: nowIso(),
      updatedAt: nowIso(),
      reviews: [],
      revisions: [{ id: uid(), body, savedAt: nowIso(), note: "Original" }],
    };
    repositories.saveEssay(persist, essay);
    return essay;
  }

  async function review() {
    setNotice("");
    if (body.trim().length < 40) return setNotice("Paste a longer draft before requesting a review.");
    const essay = saveDraft();
    const ai = await AIService.reviewEssay({ essay: body, type });
    const review = localEssayReview(body);
    review.essayId = essay.id;
    if (ai.ok) review.source = "ai_api";
    persist((db) => {
      const row = db.essays.find((e) => e.id === essay.id);
      if (row) row.reviews.unshift(review);
    });
    if (!ai.ok) setNotice(`${ai.message} A local writing analysis was saved instead — it is not a model review.`);
    else setNotice("AI backend returned a review. Local analysis is also stored.");
  }

  function onFile(file: File | undefined) {
    if (!file) return;
    file.text().then((t) => setBody(t)).catch(() => setNotice("Could not read that file."));
  }

  return (
    <div>
      <PageHeader eyebrow="Writing" title="Essay review" description="Your original text stays visible. Nothing is auto-rewritten." />
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="space-y-4">
          <Field label="Title">
            <Input value={title} onChange={(e) => setTitle(e.target.value)} />
          </Field>
          <Field label="Essay type">
            <Select value={type} onChange={(e) => setType(e.target.value as EssayType)}>
              <option value="common_app">Common App</option>
              <option value="supplemental">Supplemental</option>
              <option value="personal_statement">Personal statement</option>
              <option value="scholarship">Scholarship</option>
              <option value="why_us">Why us</option>
              <option value="other">Other</option>
            </Select>
          </Field>
          <Field label="Draft">
            <Textarea className="min-h-56" value={body} onChange={(e) => setBody(e.target.value)} />
          </Field>
          <Field label="Upload a document">
            <Input type="file" accept=".txt,.md,.doc,.docx" onChange={(e) => onFile(e.target.files?.[0])} />
          </Field>
          {notice ? <Banner tone="warn">{notice}</Banner> : null}
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={() => saveDraft()}>
              Save essay
            </Button>
            <Button type="button" onClick={review}>
              Submit for review
            </Button>
          </div>
        </Card>
        <div>
          {essays.length === 0 ? (
            <EmptyState title="No essays yet" body="Save a draft to build revision history." />
          ) : (
            <div className="space-y-3">
              {essays.map((e) => (
                <Card key={e.id}>
                  <p className="font-semibold">{e.title}</p>
                  <p className="text-xs text-ink-400">
                    {e.type} · {e.reviews.length} reviews
                  </p>
                  <Link className="mt-2 inline-block text-sm font-semibold" href={`/admissions/essays/${e.id}`}>
                    Open →
                  </Link>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
