"use client";

import { Button } from "@/components/ui/button";
import { Field, Input, Select } from "@/components/ui/field";
import { Banner, Card, EmptyState, PageHeader } from "@/components/ui/layout";
import { repositories, useAdmitMind } from "@/lib/state/admitmind-store";
import type { DeadlineKind } from "@/lib/types";
import { daysUntil, formatDate, nowIso, uid } from "@/lib/utils";
import { useMemo, useState } from "react";

export default function DeadlinesPage() {
  const { session, db, persist, settings } = useAdmitMind();
  const items = db.deadlines.filter((d) => d.userId === session!.userId);
  const [title, setTitle] = useState("");
  const [kind, setKind] = useState<DeadlineKind>("personal");
  const [due, setDue] = useState("");
  const [view, setView] = useState<"upcoming" | "calendar">("upcoming");
  const [notice, setNotice] = useState("");

  const upcoming = items.filter((d) => !d.completed && daysUntil(d.dueAt)! >= 0).sort((a, b) => a.dueAt.localeCompare(b.dueAt));
  const overdue = items.filter((d) => !d.completed && daysUntil(d.dueAt)! < 0);

  const monthDays = useMemo(() => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const days = [];
    for (let i = 1; i <= end.getDate(); i++) {
      const d = new Date(now.getFullYear(), now.getMonth(), i);
      const iso = d.toISOString().slice(0, 10);
      days.push({ n: i, items: items.filter((x) => x.dueAt.slice(0, 10) === iso) });
    }
    return { start, days };
  }, [items]);

  async function remind() {
    if (!settings?.deadlineReminders) return setNotice("Enable deadline reminders in Settings.");
    if (typeof Notification === "undefined") return setNotice("Notifications are not available in this browser.");
    const perm = await Notification.requestPermission();
    if (perm !== "granted") return setNotice("Permission not granted.");
    const next = upcoming[0];
    if (!next) return setNotice("No upcoming deadlines.");
    new Notification("AdmitMind reminder", { body: `${next.title} · ${formatDate(next.dueAt)}` });
    setNotice("Browser notification sent for the next deadline.");
  }

  return (
    <div>
      <PageHeader
        title="Deadlines"
        description="University, scholarship, tests, recommendations, and personal tasks."
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setView(view === "upcoming" ? "calendar" : "upcoming")}>
              {view === "upcoming" ? "Calendar" : "Upcoming"}
            </Button>
            <Button onClick={remind}>Send reminder</Button>
          </div>
        }
      />
      {notice ? <div className="mb-4"><Banner>{notice}</Banner></div> : null}
      <Card className="mb-6 grid gap-3 md:grid-cols-4">
        <Field label="Title">
          <Input value={title} onChange={(e) => setTitle(e.target.value)} />
        </Field>
        <Field label="Type">
          <Select value={kind} onChange={(e) => setKind(e.target.value as DeadlineKind)}>
            <option value="university">University</option>
            <option value="scholarship">Scholarship</option>
            <option value="test">Test</option>
            <option value="recommendation">Recommendation</option>
            <option value="personal">Personal</option>
          </Select>
        </Field>
        <Field label="Due">
          <Input type="date" value={due} onChange={(e) => setDue(e.target.value)} />
        </Field>
        <div className="flex items-end">
          <Button
            className="w-full"
            onClick={() => {
              if (!title || !due) return;
              repositories.saveDeadline(persist, {
                id: uid(),
                userId: session!.userId,
                title,
                kind,
                dueAt: new Date(due).toISOString(),
                reminderHoursBefore: 48,
                completed: false,
              });
              setTitle("");
              setDue("");
            }}
          >
            Add
          </Button>
        </div>
      </Card>
      {overdue.length > 0 ? (
        <Card className="mb-4 border-red-200">
          <p className="font-semibold text-red-800">Overdue</p>
          {overdue.map((d) => (
            <p key={d.id} className="text-sm">
              {d.title} · {formatDate(d.dueAt)}
            </p>
          ))}
        </Card>
      ) : null}
      {view === "upcoming" ? (
        upcoming.length === 0 ? (
          <EmptyState title="Nothing upcoming" body="Add a deadline or import one from an application." />
        ) : (
          <div className="space-y-2">
            {upcoming.map((d) => (
              <Card key={d.id} className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{d.title}</p>
                  <p className="text-xs text-ink-400">
                    {d.kind} · {daysUntil(d.dueAt)} days · {formatDate(d.dueAt)}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  onClick={() =>
                    persist((x) => {
                      const row = x.deadlines.find((i) => i.id === d.id);
                      if (row) row.completed = true;
                    })
                  }
                >
                  Done
                </Button>
              </Card>
            ))}
          </div>
        )
      ) : (
        <Card>
          <p className="mb-3 text-sm text-ink-500">{monthDays.start.toLocaleString(undefined, { month: "long", year: "numeric" })}</p>
          <div className="grid grid-cols-7 gap-2">
            {monthDays.days.map((d) => (
              <div key={d.n} className="min-h-16 rounded-lg bg-mist p-1 text-xs">
                <span className="font-semibold">{d.n}</span>
                {d.items.map((i) => (
                  <p key={i.id} className="truncate text-gold-500">
                    {i.title}
                  </p>
                ))}
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
