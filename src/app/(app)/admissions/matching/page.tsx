"use client";

import { Button } from "@/components/ui/button";
import { Banner, Card, PageHeader } from "@/components/ui/layout";
import { matchUniversities } from "@/lib/analysis/local-engines";
import { SAMPLE_UNIVERSITIES } from "@/lib/data/catalog";
import { useAdmitMind } from "@/lib/state/admitmind-store";
import { AIService } from "@/lib/ai/ai-service";
import Link from "next/link";
import { useMemo, useState } from "react";

export default function MatchingPage() {
  const { profile, persist, db } = useAdmitMind();
  const [aiNote, setAiNote] = useState("");
  const results = useMemo(() => (profile ? matchUniversities(profile, SAMPLE_UNIVERSITIES) : []), [profile]);
  const compare = db.compareIds;

  function toggleCompare(id: string) {
    persist((d) => {
      if (d.compareIds.includes(id)) d.compareIds = d.compareIds.filter((x) => x !== id);
      else if (d.compareIds.length < 3) d.compareIds = [...d.compareIds, id];
    });
  }

  async function tryAi() {
    const res = await AIService.universityMatching({ profile });
    if (!res.ok) setAiNote(res.message);
    else setAiNote("AI match payload received from your backend.");
  }

  return (
    <div>
      <PageHeader
        eyebrow="Matching"
        title="University matching"
        description="Local profile scoring ranks the sample catalog. It does not predict admission. Connect an AI API for model-based matching later."
        actions={
          <Button variant="outline" onClick={tryAi}>
            Request AI match
          </Button>
        }
      />
      {aiNote ? <div className="mb-4"><Banner tone="warn">{aiNote}</Banner></div> : null}
      <div className="mb-6 flex flex-wrap gap-2 text-sm">
        <Link className="rounded-full bg-ink-50 px-3 py-1" href="/admissions/universities">
          Saved catalog
        </Link>
        <span className="rounded-full bg-gold-50 px-3 py-1">Comparing {compare.length}/3</span>
      </div>
      <div className="space-y-4">
        {results.map((r) => (
          <Card key={r.university.id}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-display text-2xl">{r.university.name}</p>
                <p className="text-sm text-ink-500">Fit score {r.score}/100 · sample record</p>
              </div>
              <Button variant={compare.includes(r.university.id) ? "gold" : "outline"} onClick={() => toggleCompare(r.university.id)}>
                Compare
              </Button>
            </div>
            <p className="mt-3 text-sm font-semibold">Why this university may fit your profile</p>
            <ul className="mt-2 list-disc pl-5 text-sm text-ink-600">
              {r.reasons.map((x) => (
                <li key={x}>{x}</li>
              ))}
            </ul>
            <p className="mt-2 text-xs text-ink-400">{r.caveats.join(" ")}</p>
            <Link className="mt-3 inline-block text-sm font-semibold" href={`/admissions/universities/${r.university.id}`}>
              View university →
            </Link>
          </Card>
        ))}
      </div>
      {compare.length >= 2 ? (
        <Card className="mt-8 overflow-x-auto">
          <h3 className="font-display text-xl">Compare</h3>
          <table className="mt-4 w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr>
                <th className="p-2">Field</th>
                {compare.map((id) => {
                  const u = SAMPLE_UNIVERSITIES.find((x) => x.id === id);
                  return (
                    <th key={id} className="p-2">
                      {u?.name}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {["country", "size", "tuitionUsdRange", "programs"].map((field) => (
                <tr key={field} className="border-t border-ink-50">
                  <td className="p-2 font-medium capitalize">{field}</td>
                  {compare.map((id) => {
                    const u = SAMPLE_UNIVERSITIES.find((x) => x.id === id) as unknown as Record<string, unknown>;
                    const v = u?.[field];
                    return (
                      <td key={id} className="p-2">
                        {Array.isArray(v) ? v.join(", ") : String(v ?? "—")}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      ) : null}
    </div>
  );
}
