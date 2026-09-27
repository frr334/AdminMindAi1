"use client";

import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import { Badge, Card, EmptyState, PageHeader } from "@/components/ui/layout";
import { repositories, useAdmitMind } from "@/lib/state/admitmind-store";
import type { Application, ApplicationStatus } from "@/lib/types";
import { formatDate, nowIso, titleCaseStatus, uid } from "@/lib/utils";
import Link from "next/link";
import { useState } from "react";

const STATUSES: ApplicationStatus[] = [
  "planning",
  "preparing",
  "ready_to_submit",
  "submitted",
  "interview",
  "decision",
  "accepted",
  "rejected",
  "waitlisted",
];

export default function ApplicationsPage() {
  const { session, db, persist } = useAdmitMind();
  const apps = db.applications.filter((a) => a.userId === session!.userId);
  const [view, setView] = useState<"list" | "timeline">("list");
  const [form, setForm] = useState({ universityName: "", program: "", deadline: "" });

  function add() {
    if (!form.universityName.trim()) return;
    const app: Application = {
      id: uid(),
      userId: session!.userId,
      universityName: form.universityName,
      program: form.program || "Undeclared",
      status: "planning",
      deadline: form.deadline ? new Date(form.deadline).toISOString() : null,
      essayStatus: "not_started",
      recommendationStatus: "not_requested",
      testRequirements: "",
      scholarshipStatus: "saved",
      notes: "",
      documents: [],
      createdAt: nowIso(),
      updatedAt: nowIso(),
    };
    repositories.upsertApplication(persist, app);
    if (app.deadline) {
      persist((d) => {
        d.deadlines.push({
          id: uid(),
          userId: session!.userId,
          title: `${app.universityName} application`,
          kind: "university",
          dueAt: app.deadline!,
          relatedId: app.id,
          reminderHoursBefore: 48,
          completed: false,
        });
      });
    }
    setForm({ universityName: "", program: "", deadline: "" });
  }

  return (
    <div>
      <PageHeader
        eyebrow="Tracker"
        title="Applications"
        description="Manage every file from planning through decision."
        actions={
          <div className="flex gap-2">
            <Button variant={view === "list" ? "primary" : "outline"} onClick={() => setView("list")}>
              List
            </Button>
            <Button variant={view === "timeline" ? "primary" : "outline"} onClick={() => setView("timeline")}>
              Timeline
            </Button>
          </div>
        }
      />
      <Card className="mb-6 grid gap-3 md:grid-cols-4">
        <Field label="University">
          <Input value={form.universityName} onChange={(e) => setForm({ ...form, universityName: e.target.value })} />
        </Field>
        <Field label="Program">
          <Input value={form.program} onChange={(e) => setForm({ ...form, program: e.target.value })} />
        </Field>
        <Field label="Deadline">
          <Input type="date" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} />
        </Field>
        <div className="flex items-end">
          <Button className="w-full" onClick={add}>
            Add application
          </Button>
        </div>
      </Card>
      {apps.length === 0 ? (
        <EmptyState title="No applications yet" body="Add a university or save one from the catalog." />
      ) : view === "list" ? (
        <div className="space-y-3">
          {apps.map((a) => (
            <Card key={a.id} className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-semibold">{a.universityName}</p>
                <p className="text-sm text-ink-500">
                  {a.program} · due {formatDate(a.deadline)}
                </p>
              </div>
              <Badge>{titleCaseStatus(a.status)}</Badge>
              <Link href={`/admissions/applications/${a.id}`}>
                <Button variant="outline">Open</Button>
              </Link>
            </Card>
          ))}
        </div>
      ) : (
        <div className="relative space-y-6 border-l-2 border-ink-100 pl-6">
          {STATUSES.map((status) => (
            <div key={status}>
              <p className="font-semibold">{titleCaseStatus(status)}</p>
              <div className="mt-2 space-y-2">
                {apps.filter((a) => a.status === status).map((a) => (
                  <Card key={a.id}>
                    <Link href={`/admissions/applications/${a.id}`}>{a.universityName}</Link>
                  </Card>
                ))}
                {apps.filter((a) => a.status === status).length === 0 ? (
                  <p className="text-xs text-ink-400">None</p>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
