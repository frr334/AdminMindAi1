"use client";

import { Button } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/field";
import { Card, EmptyState, PageHeader } from "@/components/ui/layout";
import { repositories, useAdmitMind } from "@/lib/state/admitmind-store";
import { nowIso, uid } from "@/lib/utils";
import Link from "next/link";
import { useState } from "react";

const ICONS = ["🚪", "🍳", "🛏️", "🌿", "📚", "🧪", "🪟", "🪜"];

export default function PalacesPage() {
  const { session, db, persist } = useAdmitMind();
  const palaces = db.palaces.filter((p) => p.userId === session!.userId);
  const [name, setName] = useState("House");
  const [description, setDescription] = useState("Walk through rooms to recall topics.");

  return (
    <div>
      <PageHeader
        eyebrow="Distinctive"
        title="Memory Palace"
        description="Place ideas in rooms. Review by walking the path — Harborview’s quiet analog to flashcards."
      />
      <Card className="mb-6 space-y-3">
        <Field label="Palace name"><Input value={name} onChange={(e) => setName(e.target.value)} /></Field>
        <Field label="Description"><Textarea className="min-h-20" value={description} onChange={(e) => setDescription(e.target.value)} /></Field>
        <Button onClick={() => repositories.savePalace(persist, { id: uid(), userId: session!.userId, name, description, createdAt: nowIso() })}>
          Create palace
        </Button>
      </Card>
      {palaces.length === 0 ? <EmptyState title="No palaces yet" body="Start with a house, campus, or street you know well." /> : (
        <div className="grid gap-3 md:grid-cols-2">
          {palaces.map((p) => (
            <Card key={p.id}>
              <p className="font-display text-2xl">{p.name}</p>
              <p className="text-sm text-ink-500">{p.description}</p>
              <Link href={`/study/memory-palace/${p.id}`}><Button className="mt-3" variant="outline">Enter</Button></Link>
            </Card>
          ))}
        </div>
      )}
      <p className="mt-8 text-xs text-ink-400">Icons used in rooms: {ICONS.join(" ")}</p>
    </div>
  );
}
