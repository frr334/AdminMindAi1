"use client";

import { Button } from "@/components/ui/button";
import { Field, Select } from "@/components/ui/field";
import { Banner, Card, PageHeader, SampleMark } from "@/components/ui/layout";
import { SAMPLE_SCHOLARSHIPS } from "@/lib/data/catalog";
import { useAdmitMind } from "@/lib/state/admitmind-store";
import type { ScholarshipTrackStatus } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import { useParams } from "next/navigation";

export default function ScholarshipDetailPage() {
  const { id } = useParams<{ id: string }>();
  const s = SAMPLE_SCHOLARSHIPS.find((x) => x.id === id);
  const { session, db, persist } = useAdmitMind();
  if (!s) return <p>Sample scholarship not found.</p>;
  const saved = db.scholarshipsSaved.find((x) => x.userId === session!.userId && x.scholarshipId === s.id);

  return (
    <div>
      <PageHeader title={s.name} description={`${s.country}${s.university ? ` · ${s.university}` : ""}`} actions={<SampleMark />} />
      <Banner tone="warn">Not a real scholarship. Do not treat eligibility, amounts, or deadlines as official.</Banner>
      <Card className="mt-6 space-y-3 text-sm">
        <p>{s.description}</p>
        <p>Field: {s.field}</p>
        <p>Degree: {s.degreeLevel}</p>
        <p>Eligibility: {s.eligibility}</p>
        <p>Deadline: {formatDate(s.deadline)}</p>
        <p>Funding: {s.fundingAmount}</p>
        <a className="font-semibold underline" href={s.officialUrl}>
          Placeholder official link
        </a>
        {saved ? (
          <Field label="Application status">
            <Select
              value={saved.status}
              onChange={(e) =>
                persist((d) => {
                  const row = d.scholarshipsSaved.find((x) => x.id === saved.id);
                  if (row) row.status = e.target.value as ScholarshipTrackStatus;
                })
              }
            >
              <option value="saved">Saved</option>
              <option value="preparing">Preparing</option>
              <option value="submitted">Submitted</option>
              <option value="awarded">Awarded</option>
              <option value="not_awarded">Not awarded</option>
            </Select>
          </Field>
        ) : (
          <Button
            onClick={() =>
              persist((d) => {
                d.scholarshipsSaved.push({
                  id: crypto.randomUUID(),
                  userId: session!.userId,
                  scholarshipId: s.id,
                  status: "saved",
                  createdAt: new Date().toISOString(),
                });
              })
            }
          >
            Save and track
          </Button>
        )}
      </Card>
    </div>
  );
}
