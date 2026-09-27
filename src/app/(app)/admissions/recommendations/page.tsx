"use client";

import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import { Badge, Card, EmptyState, PageHeader } from "@/components/ui/layout";
import { repositories, useAdmitMind } from "@/lib/state/admitmind-store";
import type { Recommendation, RecommendationStatus } from "@/lib/types";
import { nowIso, titleCaseStatus, uid } from "@/lib/utils";
import { useState } from "react";

export default function RecommendationsPage() {
  const { session, db, persist } = useAdmitMind();
  const recs = db.recommendations.filter((r) => r.userId === session!.userId);
  const [form, setForm] = useState({ recommenderName: "", institution: "", email: "", deadline: "" });

  function add() {
    if (!form.recommenderName.trim() || !form.email.includes("@")) return;
    const rec: Recommendation = {
      id: uid(),
      userId: session!.userId,
      recommenderName: form.recommenderName,
      institution: form.institution,
      email: form.email,
      requestedAt: null,
      deadline: form.deadline ? new Date(form.deadline).toISOString() : null,
      status: "not_requested",
      notes: "",
    };
    repositories.saveRecommendation(persist, rec);
    setForm({ recommenderName: "", institution: "", email: "", deadline: "" });
  }

  return (
    <div>
      <PageHeader title="Recommendation letters" description="Track each recommender from first ask to submitted letter." />
      <Card className="mb-6 grid gap-3 md:grid-cols-2">
        <Field label="Recommender name">
          <Input value={form.recommenderName} onChange={(e) => setForm({ ...form, recommenderName: e.target.value })} />
        </Field>
        <Field label="Institution">
          <Input value={form.institution} onChange={(e) => setForm({ ...form, institution: e.target.value })} />
        </Field>
        <Field label="Email">
          <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        </Field>
        <Field label="Deadline">
          <Input type="date" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} />
        </Field>
        <Button onClick={add}>Add recommender</Button>
      </Card>
      {recs.length === 0 ? (
        <EmptyState title="No recommenders yet" body="Add a teacher, counselor, or supervisor." />
      ) : (
        <div className="space-y-3">
          {recs.map((r) => (
            <Card key={r.id} className="space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold">{r.recommenderName}</p>
                  <p className="text-sm text-ink-500">
                    {r.institution} · {r.email}
                  </p>
                </div>
                <Badge>{titleCaseStatus(r.status)}</Badge>
              </div>
              <Select
                value={r.status}
                onChange={(e) =>
                  persist((d) => {
                    const row = d.recommendations.find((x) => x.id === r.id);
                    if (!row) return;
                    row.status = e.target.value as RecommendationStatus;
                    if (row.status === "requested" && !row.requestedAt) row.requestedAt = nowIso();
                  })
                }
              >
                <option value="not_requested">Not requested</option>
                <option value="requested">Requested</option>
                <option value="accepted">Accepted</option>
                <option value="submitted">Submitted</option>
                <option value="follow_up_needed">Follow-up needed</option>
              </Select>
              <Field label="Notes">
                <Textarea
                  value={r.notes}
                  onChange={(e) =>
                    persist((d) => {
                      const row = d.recommendations.find((x) => x.id === r.id);
                      if (row) row.notes = e.target.value;
                    })
                  }
                />
              </Field>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
