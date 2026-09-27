"use client";

import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/field";
import { Card, EmptyState, PageHeader, SampleMark } from "@/components/ui/layout";
import { SAMPLE_SCHOLARSHIPS } from "@/lib/data/catalog";
import { repositories, useAdmitMind } from "@/lib/state/admitmind-store";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import { useMemo, useState } from "react";

export default function ScholarshipsPage() {
  const { session, db, persist } = useAdmitMind();
  const [q, setQ] = useState("");
  const [country, setCountry] = useState("all");
  const [field, setField] = useState("all");
  const [level, setLevel] = useState("all");
  const saved = new Set(db.scholarshipsSaved.filter((s) => s.userId === session!.userId).map((s) => s.scholarshipId));

  const list = useMemo(() => {
    return SAMPLE_SCHOLARSHIPS.filter((s) => {
      if (q && !`${s.name} ${s.field}`.toLowerCase().includes(q.toLowerCase())) return false;
      if (country !== "all" && s.country !== country) return false;
      if (field !== "all" && s.field !== field) return false;
      if (level !== "all" && s.degreeLevel !== level) return false;
      return true;
    });
  }, [q, country, field, level]);

  return (
    <div>
      <PageHeader
        eyebrow="Funding"
        title="Scholarship finder"
        description="Every listing is a fictional sample so we never invent real awards as facts. Replace this catalog with a verified database later."
      />
      <div className="mb-6 grid gap-3 md:grid-cols-4">
        <Input placeholder="Search" value={q} onChange={(e) => setQ(e.target.value)} />
        <Select value={country} onChange={(e) => setCountry(e.target.value)}>
          <option value="all">Country</option>
          {Array.from(new Set(SAMPLE_SCHOLARSHIPS.map((s) => s.country))).map((c) => (
            <option key={c}>{c}</option>
          ))}
        </Select>
        <Select value={field} onChange={(e) => setField(e.target.value)}>
          <option value="all">Field</option>
          {Array.from(new Set(SAMPLE_SCHOLARSHIPS.map((s) => s.field))).map((c) => (
            <option key={c}>{c}</option>
          ))}
        </Select>
        <Select value={level} onChange={(e) => setLevel(e.target.value)}>
          <option value="all">Degree</option>
          <option value="bachelor">Bachelor</option>
          <option value="master">Master</option>
        </Select>
      </div>
      {list.length === 0 ? (
        <EmptyState title="No sample matches" body="Widen filters. Real scholarships require a future data source." />
      ) : (
        <div className="grid gap-4">
          {list.map((s) => (
            <Card key={s.id} className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-display text-xl">{s.name}</p>
                  <SampleMark />
                </div>
                <p className="text-sm text-ink-500">
                  {s.country} · {s.field} · {s.fundingAmount} · due {formatDate(s.deadline)}
                </p>
              </div>
              <div className="flex gap-2">
                <Link href={`/admissions/scholarships/${s.id}`}>
                  <Button variant="outline">Details</Button>
                </Link>
                <Button onClick={() => repositories.toggleSavedScholarship(persist, session!.userId, s.id)}>
                  {saved.has(s.id) ? "Saved" : "Save"}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
