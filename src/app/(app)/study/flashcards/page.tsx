"use client";

import { Button } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/field";
import { Banner, Card, EmptyState, PageHeader } from "@/components/ui/layout";
import { localFlashcardsFromText } from "@/lib/analysis/local-engines";
import { AIService } from "@/lib/ai/ai-service";
import { repositories, useAdmitMind } from "@/lib/state/admitmind-store";
import { nowIso, uid } from "@/lib/utils";
import Link from "next/link";
import { useState } from "react";

export default function FlashcardsPage() {
  const { session, db, persist } = useAdmitMind();
  const decks = db.decks.filter((d) => d.userId === session!.userId);
  const [name, setName] = useState("Biology deck");
  const [subject, setSubject] = useState("Biology");
  const [source, setSource] = useState("");
  const [note, setNote] = useState("");

  function createDeck() {
    const deck = { id: uid(), userId: session!.userId, name, subject, createdAt: nowIso() };
    repositories.saveDeck(persist, deck);
    return deck;
  }

  async function generate() {
    if (source.trim().length < 20) return setNote("Paste more notes or a document.");
    const deck = createDeck();
    const ai = await AIService.generateFlashcards({ source });
    const cards = ai.ok ? ai.data.cards : localFlashcardsFromText(source);
    persist((d) => {
      cards.forEach((c) => {
        d.flashcards.push({
          id: uid(),
          deckId: deck.id,
          front: c.front,
          back: c.back,
          difficulty: "medium",
          nextReviewAt: nowIso(),
          intervalDays: 1,
          ease: 2.5,
          reviews: 0,
        });
      });
    });
    setNote(ai.ok ? "Generated via AI API." : `${ai.message} Cards were split locally from your notes.`);
  }

  return (
    <div>
      <PageHeader title="Flashcards" description="Organize decks, edit cards, and review with a simple spaced interval." />
      <Card className="mb-6 space-y-3">
        <div className="grid gap-3 md:grid-cols-2">
          <Field label="Deck name"><Input value={name} onChange={(e) => setName(e.target.value)} /></Field>
          <Field label="Subject"><Input value={subject} onChange={(e) => setSubject(e.target.value)} /></Field>
        </div>
        <Field label="Notes or pasted text">
          <Textarea value={source} onChange={(e) => setSource(e.target.value)} />
        </Field>
        <Field label="Upload PDF/text">
          <Input type="file" accept=".txt,.md,.pdf" onChange={(e) => {
            const f = e.target.files?.[0];
            if (!f) return;
            if (f.type === "application/pdf") setNote("PDF text extraction needs a backend. Upload .txt for now or connect storage later.");
            else f.text().then(setSource);
          }} />
        </Field>
        {note ? <Banner>{note}</Banner> : null}
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => createDeck()}>Empty deck</Button>
          <Button onClick={generate}>Generate cards</Button>
        </div>
      </Card>
      {decks.length === 0 ? <EmptyState title="No decks" body="Create a deck from notes." /> : (
        <div className="grid gap-3 md:grid-cols-2">
          {decks.map((d) => {
            const count = db.flashcards.filter((c) => c.deckId === d.id).length;
            return (
              <Card key={d.id}>
                <p className="font-semibold">{d.name}</p>
                <p className="text-sm text-ink-500">{d.subject} · {count} cards</p>
                <Link href={`/study/flashcards/${d.id}`}><Button className="mt-3" variant="outline">Open</Button></Link>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
