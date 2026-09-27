"use client";

import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import { Card, PageHeader } from "@/components/ui/layout";
import { useAdmitMind } from "@/lib/state/admitmind-store";
import type { ApplicationStatus, RecommendationStatus, ScholarshipTrackStatus } from "@/lib/types";
import { nowIso, uid } from "@/lib/utils";
import { useParams } from "next/navigation";

export default function ApplicationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { db, persist } = useAdmitMind();
  const app = db.applications.find((a) => a.id === id);
  const tasks = db.applicationTasks.filter((t) => t.applicationId === id);
  if (!app) return <p>Application not found.</p>;

  function patch(p: Partial<typeof app>) {
    persist((d) => {
      const row = d.applications.find((a) => a.id === id);
      if (row) Object.assign(row, p, { updatedAt: nowIso() });
    });
  }

  return (
    <div>
      <PageHeader title={app.universityName} description={app.program} />
      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="space-y-3">
          <Field label="Status">
            <Select value={app.status} onChange={(e) => patch({ status: e.target.value as ApplicationStatus })}>
              {["planning","preparing","ready_to_submit","submitted","interview","decision","accepted","rejected","waitlisted"].map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </Select>
          </Field>
          <Field label="Deadline">
            <Input type="date" value={app.deadline?.slice(0, 10) || ""} onChange={(e) => patch({ deadline: e.target.value ? new Date(e.target.value).toISOString() : null })} />
          </Field>
          <Field label="Submitted">
            <Input type="date" value={app.submittedAt?.slice(0, 10) || ""} onChange={(e) => patch({ submittedAt: e.target.value ? new Date(e.target.value).toISOString() : null })} />
          </Field>
          <Field label="Essay status">
            <Select value={app.essayStatus} onChange={(e) => patch({ essayStatus: e.target.value as typeof app.essayStatus })}>
              <option value="not_started">Not started</option>
              <option value="draft">Draft</option>
              <option value="needs_review">Needs review</option>
              <option value="ready">Ready</option>
            </Select>
          </Field>
          <Field label="Recommendation status">
            <Select value={app.recommendationStatus} onChange={(e) => patch({ recommendationStatus: e.target.value as RecommendationStatus })}>
              <option value="not_requested">Not requested</option>
              <option value="requested">Requested</option>
              <option value="accepted">Accepted</option>
              <option value="submitted">Submitted</option>
              <option value="follow_up_needed">Follow-up needed</option>
            </Select>
          </Field>
          <Field label="Test requirements">
            <Input value={app.testRequirements} onChange={(e) => patch({ testRequirements: e.target.value })} />
          </Field>
          <Field label="Scholarship status">
            <Select value={app.scholarshipStatus} onChange={(e) => patch({ scholarshipStatus: e.target.value as ScholarshipTrackStatus })}>
              <option value="saved">Saved</option>
              <option value="preparing">Preparing</option>
              <option value="submitted">Submitted</option>
              <option value="awarded">Awarded</option>
              <option value="not_awarded">Not awarded</option>
            </Select>
          </Field>
          <Field label="Notes">
            <Textarea value={app.notes} onChange={(e) => patch({ notes: e.target.value })} />
          </Field>
        </Card>
        <Card>
          <h3 className="font-semibold">Documents</h3>
          <ul className="mt-3 space-y-2 text-sm">
            {app.documents.map((d) => (
              <li key={d.id}>{d.name}</li>
            ))}
          </ul>
          <Button
            className="mt-3"
            variant="outline"
            onClick={() => {
              const name = window.prompt("Document name");
              if (!name) return;
              patch({ documents: [...app.documents, { id: uid(), name, addedAt: nowIso() }] });
            }}
          >
            Add document label
          </Button>
          <h3 className="mt-8 font-semibold">Tasks</h3>
          <ul className="mt-3 space-y-2">
            {tasks.map((t) => (
              <li key={t.id} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={t.done}
                  onChange={() =>
                    persist((d) => {
                      const row = d.applicationTasks.find((x) => x.id === t.id);
                      if (row) row.done = !row.done;
                    })
                  }
                />
                {t.title}
              </li>
            ))}
          </ul>
          <Button
            className="mt-3"
            variant="ghost"
            onClick={() => {
              const title = window.prompt("Task");
              if (!title) return;
              persist((d) => {
                d.applicationTasks.push({ id: uid(), applicationId: app.id, title, done: false });
              });
            }}
          >
            Add task
          </Button>
        </Card>
      </div>
    </div>
  );
}
