"use client";

import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import { Card, PageHeader } from "@/components/ui/layout";
import { repositories, useAdmitMind } from "@/lib/state/admitmind-store";
import { uid } from "@/lib/utils";
import { useParams } from "next/navigation";
import { useState } from "react";

const ICONS = ["🚪", "🍳", "🛏️", "🌿", "📚", "🧪", "🪟", "🪜", "🪞", "🕯️"];

export default function PalaceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { db, persist, session } = useAdmitMind();
  const palace = db.palaces.find((p) => p.id === id);
  const rooms = db.palaceLocations.filter((l) => l.palaceId === id).sort((a, b) => a.order - b.order);
  const [name, setName] = useState("Entrance");
  const [concept, setConcept] = useState("Biology");
  const [notes, setNotes] = useState("");
  const [icon, setIcon] = useState(ICONS[0]);
  const [walk, setWalk] = useState(0);
  if (!palace) return <p>Palace not found.</p>;

  function addRoom() {
    persist((d) => {
      d.palaceLocations.push({
        id: uid(),
        palaceId: id,
        name,
        concept,
        notes,
        icon,
        order: rooms.length,
      });
    });
  }

  return (
    <div>
      <PageHeader title={palace.name} description={palace.description} />
      <div className="mb-8 overflow-x-auto">
        <div className="flex min-w-max items-stretch gap-3">
          {rooms.length === 0 ? <p className="text-sm text-ink-500">Add rooms to build a path.</p> : rooms.map((r, i) => (
            <div key={r.id} className="relative w-48 rounded-3xl border border-study-200 bg-study-50 p-4">
              <p className="text-3xl">{r.icon}</p>
              <p className="mt-2 font-semibold">{r.name}</p>
              <p className="text-sm text-study-500">{r.concept}</p>
              {i < rooms.length - 1 ? <span className="absolute -right-3 top-1/2 text-ink-300">→</span> : null}
            </div>
          ))}
        </div>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="space-y-3">
          <Field label="Room / location"><Input value={name} onChange={(e) => setName(e.target.value)} /></Field>
          <Field label="Concept"><Input value={concept} onChange={(e) => setConcept(e.target.value)} /></Field>
          <Field label="Notes"><Textarea value={notes} onChange={(e) => setNotes(e.target.value)} /></Field>
          <Field label="Icon">
            <Select value={icon} onChange={(e) => setIcon(e.target.value)}>
              {ICONS.map((ic) => <option key={ic}>{ic}</option>)}
            </Select>
          </Field>
          <Button onClick={addRoom}>Add location</Button>
        </Card>
        <Card>
          <h3 className="font-display text-xl">Walk the palace</h3>
          {rooms[walk] ? (
            <div className="mt-4 text-center">
              <p className="text-5xl">{rooms[walk].icon}</p>
              <p className="mt-3 font-display text-2xl">{rooms[walk].name}</p>
              <p className="text-study-500">{rooms[walk].concept}</p>
              <p className="mt-3 text-sm text-ink-600">{rooms[walk].notes}</p>
              <div className="mt-6 flex justify-center gap-2">
                <Button variant="outline" onClick={() => setWalk(Math.max(0, walk - 1))}>Back</Button>
                <Button onClick={() => {
                  repositories.addStudyMinutes(persist, session!.userId, 4, rooms[walk].concept, "palace");
                  setWalk(Math.min(rooms.length - 1, walk + 1));
                }}>Next room</Button>
              </div>
            </div>
          ) : <p className="mt-3 text-sm">Add a room to begin a walkthrough.</p>}
        </Card>
      </div>
    </div>
  );
}
