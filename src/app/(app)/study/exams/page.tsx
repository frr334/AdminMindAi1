"use client";

import { Button } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/field";
import { Card, PageHeader } from "@/components/ui/layout";
import { repositories, useAdmitMind } from "@/lib/state/admitmind-store";
import { formatDate, nowIso, uid } from "@/lib/utils";

export default function ExamsPage() {
  const { session, db, persist } = useAdmitMind();
  const exams = db.exams.filter((e) => e.userId === session!.userId);

  return (
    <div>
      <PageHeader title="Exam preparation" description="Track SAT, ACT, IELTS, TOEFL, and school exams. Premium study packs will attach here later." />
      <Card className="mb-6">
        <form
          className="grid gap-3 md:grid-cols-2"
          onSubmit={(e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            repositories.saveExam(persist, {
              id: uid(),
              userId: session!.userId,
              examName: String(fd.get("examName") || ""),
              examDate: new Date(String(fd.get("examDate"))).toISOString(),
              subject: String(fd.get("subject") || ""),
              notes: String(fd.get("notes") || ""),
            });
            persist((d) => {
              d.deadlines.push({
                id: uid(),
                userId: session!.userId,
                title: String(fd.get("examName")),
                kind: "test",
                dueAt: new Date(String(fd.get("examDate"))).toISOString(),
                reminderHoursBefore: 72,
                completed: false,
              });
            });
            e.currentTarget.reset();
          }}
        >
          <Field label="Exam name"><Input name="examName" required placeholder="IELTS Academic" /></Field>
          <Field label="Date"><Input name="examDate" type="date" required /></Field>
          <Field label="Subject / section"><Input name="subject" placeholder="Reading" /></Field>
          <Field label="Notes"><Textarea name="notes" className="min-h-16" /></Field>
          <Button type="submit">Add exam</Button>
        </form>
      </Card>
      {exams.map((e) => (
        <Card key={e.id} className="mb-3">
          <p className="font-semibold">{e.examName}</p>
          <p className="text-sm text-ink-500">{e.subject} · {formatDate(e.examDate)}</p>
          <p className="mt-2 text-sm">{e.notes}</p>
        </Card>
      ))}
    </div>
  );
}
