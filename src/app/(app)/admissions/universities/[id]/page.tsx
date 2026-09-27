"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge, Banner, Card, CardSkeleton, PageHeader } from "@/components/ui/layout";
import { useAdmitMind } from "@/lib/state/admitmind-store";
import {
  getUniversityById,
  isUniversitySaved,
  saveUniversity,
  removeSavedUniversity,
} from "@/lib/services/university-service";
import { createApplication } from "@/lib/services/application-service";
import type { University } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import {
  ArrowLeft,
  Bookmark,
  CheckCircle2,
  ExternalLink,
  GraduationCap,
  PlusCircle,
  Trophy,
} from "lucide-react";

export default function UniversityDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { session, refresh: refreshStore } = useAdmitMind();

  const [uni, setUni] = useState<University | null>(null);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const fetchUni = useCallback(async () => {
    if (!params.id) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getUniversityById(params.id);
      if (!data) {
        setError("University record not found.");
      } else {
        setUni(data);
        if (session?.userId) {
          const isSaved = await isUniversitySaved(session.userId, data.id);
          setSaved(isSaved);
        }
      }
    } catch {
      setError("Failed to load university details.");
    } finally {
      setLoading(false);
    }
  }, [params.id, session?.userId]);

  useEffect(() => {
    fetchUni();
  }, [fetchUni]);

  async function handleToggleSave() {
    if (!session?.userId || !uni) return;
    try {
      if (saved) {
        await removeSavedUniversity(session.userId, uni.id);
        setSaved(false);
        setNotice("Removed from saved list.");
      } else {
        await saveUniversity(session.userId, uni.id);
        setSaved(true);
        setNotice("University saved to your bookmarks.");
      }
      void refreshStore();
      setTimeout(() => setNotice(null), 3000);
    } catch {
      setNotice("Could not update bookmark.");
    }
  }

  async function handleAddToTracker() {
    if (!session?.userId || !uni) return;
    try {
      const res = await createApplication(session.userId, {
        university_name: uni.name,
        country: uni.country,
        degree_type: "Bachelor",
        application_status: "Planning",
        notes: `Directly added from ${uni.name} catalog page. Ranking: #${uni.ranking ?? "—"}`,
      });
      if (res.ok) {
        setNotice("Application created in tracker! Opening tracker...");
        void refreshStore();
        setTimeout(() => router.push("/admissions/applications"), 1200);
      }
    } catch {
      setNotice("Could not create application.");
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Link
          href="/admissions/universities"
          className="inline-flex items-center gap-1.5 text-xs text-ink-500 hover:text-ink-800"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Universities
        </Link>
        <CardSkeleton />
      </div>
    );
  }

  if (error || !uni) {
    return (
      <div className="space-y-6">
        <Link
          href="/admissions/universities"
          className="inline-flex items-center gap-1.5 text-xs text-ink-500 hover:text-ink-800"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Universities
        </Link>
        <Card className="py-12 text-center space-y-4">
          <p className="font-display text-2xl text-ink-800">University Not Found</p>
          <p className="text-sm text-ink-500">
            {error || "The requested university could not be located."}
          </p>
          <Link href="/admissions/universities">
            <Button variant="outline">Browse All Universities</Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <Link
          href="/admissions/universities"
          className="inline-flex items-center gap-1.5 text-xs text-ink-500 hover:text-ink-800 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Universities
        </Link>

        {uni.ranking && (
          <Badge tone="gold" className="flex items-center gap-1.5 px-3 py-1 font-semibold">
            <Trophy className="h-3.5 w-3.5" />
            Global Rank #{uni.ranking}
          </Badge>
        )}
      </div>

      <PageHeader
        eyebrow="Institution Profile"
        title={uni.name}
        description={`${uni.city ? `${uni.city}, ` : ""}${uni.country}`}
        actions={
          <div className="flex flex-wrap gap-2">
            <Button
              variant={saved ? "gold" : "outline"}
              onClick={handleToggleSave}
              className="flex items-center gap-2"
            >
              <Bookmark className={saved ? "fill-current h-4 w-4" : "h-4 w-4"} />
              {saved ? "Saved to Bookmarks" : "Save University"}
            </Button>

            <Button
              variant="primary"
              onClick={handleAddToTracker}
              className="flex items-center gap-2"
            >
              <PlusCircle className="h-4 w-4" />
              Add to Applications
            </Button>
          </div>
        }
      />

      {notice && <Banner tone="ok">{notice}</Banner>}

      {/* Key Metric Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border-ink-100 bg-white">
          <p className="text-xs uppercase font-bold text-ink-400">Acceptance Rate</p>
          <p className="mt-1 font-display text-2xl font-bold text-ink-800">
            {uni.acceptance_rate !== null
              ? `${Math.round(uni.acceptance_rate * 100)}%`
              : "Selective"}
          </p>
          <p className="mt-1 text-xs text-ink-500">Holistic admissions criteria</p>
        </Card>

        <Card className="border-ink-100 bg-white">
          <p className="text-xs uppercase font-bold text-ink-400">Estimated Tuition</p>
          <p className="mt-1 font-display text-2xl font-bold text-ink-800">
            {uni.tuition_usd !== null ? formatCurrency(uni.tuition_usd) : "Varies / Public"}
          </p>
          <p className="mt-1 text-xs text-ink-500">Per academic year</p>
        </Card>

        <Card className="border-ink-100 bg-white">
          <p className="text-xs uppercase font-bold text-ink-400">Official Portal</p>
          <div className="mt-2">
            {uni.website ? (
              <a
                href={uni.website}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink-600 hover:text-ink-900 underline"
              >
                <span>Visit Official Site</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            ) : (
              <span className="text-sm text-ink-400">Not listed</span>
            )}
          </div>
        </Card>
      </div>

      {/* Main Details */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2 space-y-5">
          <div>
            <h2 className="font-display text-xl font-bold text-ink-800">Overview</h2>
            <p className="mt-2 text-sm text-ink-600 leading-relaxed whitespace-pre-line">
              {uni.description ||
                "This institution is one of the world's most recognized centers of higher learning, distinguished by premier faculty, cutting-edge research infrastructure, and strong graduate outcomes."}
            </p>
          </div>

          <div className="border-t border-ink-100 pt-4 space-y-3">
            <h3 className="font-semibold text-ink-800 text-sm">Admissions Highlights</h3>
            <ul className="space-y-2 text-sm text-ink-600">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  Requires academic transcripts, letters of recommendation, and personal statements.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  International applicants typically submit standardized test scores and English language proficiency (TOEFL / IELTS).
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  Merit and need-based financial aid programs are administered directly by the university financial aid office.
                </span>
              </li>
            </ul>
          </div>
        </Card>

        {/* Action Sidebar */}
        <div className="space-y-4">
          <Card className="space-y-4 bg-gradient-to-br from-paper to-white">
            <h3 className="font-display text-lg font-bold text-ink-800">Next Steps</h3>
            <p className="text-xs text-ink-500 leading-relaxed">
              Track deadlines, essay drafts, and recommendation letters for {uni.name}.
            </p>
            <div className="space-y-2">
              <Button
                variant="primary"
                className="w-full justify-center"
                onClick={handleAddToTracker}
              >
                Track this Application
              </Button>
              {uni.website && (
                <a
                  href={uni.website}
                  target="_blank"
                  rel="noreferrer"
                  className="block"
                >
                  <Button variant="outline" className="w-full justify-center gap-1.5">
                    <span>Admissions Website</span>
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </a>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
