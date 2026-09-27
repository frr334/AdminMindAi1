"use client";

import { Button } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/field";
import { Card, EmptyState, PageHeader } from "@/components/ui/layout";
import { repositories, useAdmitMind } from "@/lib/state/admitmind-store";
import { nowIso, uid } from "@/lib/utils";
import { useParams } from "next/navigation";
import { useState } from "react";

export default function DeckPage() {
  const { id } = useParams<{ id: string }>();
  const { db, persist, session } = useAdmitMind();
  const deck = db.decks.find((d) => d.id === id);
  const cards = db.flashcards.filter((c) => c.deckId === id);
  const [front, setFront] = useState("");
  const [back, setBack] = useState("");
  const [idx, setIdx] = useState(0);
  const [show, setShow] = useState(false);
  const [mode, setMode] = useState<"edit" | "study">("edit");
  if (!deck) return <p>Deck not found.</p>;
  const card = cards[idx];

  function add() {
    if (!front.trim()) return;
    persist((d) => {
      d.flashcards.push({
        id: uid(),
        deckId: id,
        front,
        back,
        difficulty: "medium",
        nextReviewAt: nowIso(),
        intervalDays: 1,
        ease: 2.5,
        reviews: 0,
      });
    });
    setFront("");
    setBack("");
  }

  function grade(q: "easy" | "medium" | "hard") {
    if (!card) return;
    persist((d) => {
      const row = d.flashcards.find((c) => c.id === card.id);
      if (!row) return;
      row.reviews += 1;
      row.difficulty = q;
      const add = q === "easy" ? 4 : q === "medium" ? 2 : 1;
      row.intervalDays = add;
      const n = new Date();
      n.setDate(n.getDate() + add);
      row.nextReviewAt = n.toISOString();
    });
    repositories.addStudyMinutes(persist, session!.userId, 3, deck.subject, "flashcards");
    setShow(false);
    setIdx((i) => (i + 1) % Math.max(1, cards.length));
  }

  return (
    <div>
      <PageHeader title={deck.name} description={`${cards.length} cards · ${deck.subject}`} actions={
        <Button variant="outline" onClick={() => setMode(mode === "edit" ? "study" : "edit")}>{mode === "edit" ? "Study" : "Edit"}</Button>
      } />
      {mode === "edit" ? (
        <>
          <Card className="mb-6 grid gap-3 md:grid-cols-2">
            <Field label="Front / question"><Input value={front} onChange={(e) => setFront(e.target.value)} /></Field>
            <Field label="Back / answer"><Textarea className="min-h-[46px]" value={back} onChange={(e) => setBack(e.target.value)} /></Field>
            <Button onClick={add}>Add card</Button>
          </Card>
          {cards.length === 0 ? <EmptyState title="Empty deck" body="Add cards or generate from notes." /> : cards.map((c) => (
            <Card key={c.id} className="mb-2 flex justify-between gap-3">
              <div>
                <p className="font-medium">{c.front}</p>
                <p className="text-sm text-ink-500">{c.back}</p>
              </div>
              <Button variant="ghost" onClick={() => persist((d) => { d.flashcards = d.flashcards.filter((x) => x.id !== c.id); })}>Delete</Button>
            </Card>
          ))}
        </>
      ) : !card ? <EmptyState title="No cards" body="Add cards first." /> : (
        <Card className="mx-auto max-w-xl py-12 text-center">
          <p className="text-xs uppercase text-ink-400">{show ? "Answer" : "Question"}</p>
          <p className="mt-4 font-display text-3xl">{show ? card.back : card.front}</p>
          <div className="mt-8 flex justify-center gap-2">
            {!show ? <Button onClick={() => setShow(true)}>Show answer</Button> : (
              <>
                <Button variant="outline" onClick={() => grade("hard")}>Hard</Button>
                <Button onClick={() => grade("medium")}>Good</Button>
                <Button variant="gold" onClick={() => grade("easy")}>Easy</Button>
              </>
            )}
          </div>
          <p className="mt-4 text-xs text-ink-400">{idx + 1} / {cards.length} · reviews {card.reviews}</p>
        </Card>
      )}
    </div>
  );
}
