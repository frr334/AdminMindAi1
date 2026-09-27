"use client";

import { useEffect, useState, useCallback, useTransition } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/field";
import { Badge, Card, CardSkeleton, EmptyState, PageHeader } from "@/components/ui/layout";
import { useAdmitMind } from "@/lib/state/admitmind-store";
import {
  getUniversities,
  getSavedUniversities,
  saveUniversity,
  removeSavedUniversity,
} from "@/lib/services/university-service";
import { createApplication } from "@/lib/services/application-service";
import type { University } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import {
  Bookmark,
  ExternalLink,
  GraduationCap,
  PlusCircle,
  Search,
  SlidersHorizontal,
  Trophy,
} from "lucide-react";

export default function UniversitiesPage() {
  const { session, refresh: refreshStore } = useAdmitMind();
  const [unis, setUnis] = useState<University[]>([]);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & sorting
  const [search, setSearch] = useState("");
  const [country, setCountry] = useState("all");
  const [city, setCity] = useState("all");
  const [sortBy, setSortBy] = useState<"ranking" | "tuition_usd" | "acceptance_rate" | "name">("ranking");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(1);
  const pageSize = 12;

  const [savingId, setSavingId] = useState<string | null>(null);
  const [actionNotice, setActionNotice] = useState<{ id: string; msg: string } | null>(null);
  const [, startTransition] = useTransition();

  // Distinct countries and cities from loaded/catalog data
  const countries = [
    "United States",
    "United Kingdom",
    "Canada",
    "Switzerland",
    "Singapore",
    "Australia",
    "Germany",
    "Japan",
    "China",
    "South Korea",
  ];

  const fetchList = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getUniversities({
        search,
        country: country !== "all" ? country : undefined,
        city: city !== "all" ? city : undefined,
        sortBy,
        sortOrder,
        page,
        limit: pageSize,
      });

      setUnis(res.data);
      setTotalCount(res.total);
    } catch {
      setError("Couldn't load universities from the database. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [search, country, city, sortBy, sortOrder, page]);

  const loadSaved = useCallback(async () => {
    if (!session?.userId) return;
    try {
      const saved = await getSavedUniversities(session.userId);
      setSavedIds(new Set(saved.map((u) => u.id)));
    } catch {
      // no-op
    }
  }, [session?.userId]);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  useEffect(() => {
    loadSaved();
  }, [loadSaved]);

  async function handleToggleSave(u: University) {
    if (!session?.userId) return;
    setSavingId(u.id);
    const isCurrentlySaved = savedIds.has(u.id);

    try {
      if (isCurrentlySaved) {
        await removeSavedUniversity(session.userId, u.id);
        setSavedIds((prev) => {
          const next = new Set(prev);
          next.delete(u.id);
          return next;
        });
        setActionNotice({ id: u.id, msg: "Removed from bookmarks" });
      } else {
        await saveUniversity(session.userId, u.id);
        setSavedIds((prev) => new Set(prev).add(u.id));
        setActionNotice({ id: u.id, msg: "Saved to bookmarks" });
      }
      void refreshStore();
      setTimeout(() => setActionNotice(null), 3000);
    } catch {
      setActionNotice({ id: u.id, msg: "Action failed" });
    } finally {
      setSavingId(null);
    }
  }

  async function handleAddToTracker(u: University) {
    if (!session?.userId) return;
    try {
      const res = await createApplication(session.userId, {
        university_name: u.name,
        country: u.country,
        degree_type: "Bachelor",
        application_status: "Planning",
        notes: `Selected from university catalog. Ranking: #${u.ranking ?? "—"}`,
      });
      if (res.ok) {
        setActionNotice({ id: u.id, msg: "Added to Application Tracker!" });
        void refreshStore();
        setTimeout(() => setActionNotice(null), 3500);
      }
    } catch {
      setActionNotice({ id: u.id, msg: "Could not add application." });
    }
  }

  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Global Catalog"
        title="Universities"
        description="Explore top institutions worldwide with verified tuition, rankings, and acceptance metrics. Bookmark favorites or add directly to your application tracker."
      />

      {/* Filter and Search Bar */}
      <Card className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
            <Input
              placeholder="Search by name, city, country..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="pl-9"
            />
          </div>

          <Select
            value={country}
            onChange={(e) => {
              setCountry(e.target.value);
              setPage(1);
            }}
          >
            <option value="all">All Countries</option>
            {countries.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Select>

          <Select
            value={sortBy}
            onChange={(e) => {
              setSortBy(e.target.value as typeof sortBy);
              setPage(1);
            }}
          >
            <option value="ranking">Sort by World Ranking</option>
            <option value="tuition_usd">Sort by Tuition</option>
            <option value="acceptance_rate">Sort by Acceptance Rate</option>
            <option value="name">Sort by Alphabetical Name</option>
          </Select>

          <Select
            value={sortOrder}
            onChange={(e) => {
              setSortOrder(e.target.value as "asc" | "desc");
              setPage(1);
            }}
          >
            <option value="asc">Ascending (Low to High)</option>
            <option value="desc">Descending (High to Low)</option>
          </Select>
        </div>

        <div className="flex flex-wrap items-center justify-between text-xs text-ink-500 pt-1">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="h-3.5 w-3.5 text-ink-400" />
            <span>Showing {unis.length} of {totalCount} verified universities</span>
          </div>
          {(search || country !== "all") && (
            <button
              onClick={() => {
                setSearch("");
                setCountry("all");
                setPage(1);
              }}
              className="font-medium text-ink-600 hover:text-ink-800 underline"
            >
              Reset filters
            </button>
          )}
        </div>
      </Card>

      {/* Error state */}
      {error && (
        <Card className="border-rose-200 bg-rose-50 text-center py-6 text-rose-800">
          <p className="font-semibold">{error}</p>
          <Button variant="outline" className="mt-3" onClick={() => fetchList()}>
            Retry
          </Button>
        </Card>
      )}

      {/* Loading skeleton */}
      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : unis.length === 0 ? (
        <EmptyState
          icon={GraduationCap}
          title="No universities matched your search"
          body="Try broadening your search query or removing country filters to see more results."
          action={
            <Button
              variant="outline"
              onClick={() => {
                setSearch("");
                setCountry("all");
                setPage(1);
              }}
            >
              Clear filters
            </Button>
          }
        />
      ) : (
        /* University Grid */
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {unis.map((u) => {
            const isSaved = savedIds.has(u.id);
            const notice = actionNotice?.id === u.id ? actionNotice.msg : null;

            return (
              <Card
                key={u.id}
                className="flex flex-col justify-between border-ink-100/70 hover:border-ink-200"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <Link
                        href={`/admissions/universities/${u.id}`}
                        className="group focus:outline-none"
                      >
                        <h2 className="font-display text-xl font-bold text-ink-800 group-hover:text-ink-500 transition-colors line-clamp-1">
                          {u.name}
                        </h2>
                      </Link>
                      <p className="text-sm text-ink-500">
                        {u.city ? `${u.city}, ` : ""}
                        {u.country}
                      </p>
                    </div>

                    {u.ranking && (
                      <Badge tone="gold" className="shrink-0 flex items-center gap-1 font-semibold">
                        <Trophy className="h-3 w-3" />
                        #{u.ranking}
                      </Badge>
                    )}
                  </div>

                  <p className="text-xs text-ink-600 line-clamp-2 leading-relaxed">
                    {u.description || "Leading global higher education institution."}
                  </p>

                  <div className="grid grid-cols-2 gap-2 rounded-xl bg-paper/60 p-2.5 text-xs">
                    <div>
                      <span className="text-ink-400 block text-[10px] uppercase font-bold">
                        Annual Tuition
                      </span>
                      <strong className="text-ink-800">
                        {u.tuition_usd !== null ? formatCurrency(u.tuition_usd) : "Public / Varies"}
                      </strong>
                    </div>
                    <div>
                      <span className="text-ink-400 block text-[10px] uppercase font-bold">
                        Acceptance Rate
                      </span>
                      <strong className="text-ink-800">
                        {u.acceptance_rate !== null
                          ? `${Math.round(u.acceptance_rate * 100)}%`
                          : "Competitive"}
                      </strong>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-ink-50 space-y-2">
                  {notice && (
                    <p className="text-center text-xs font-semibold text-emerald-700 animate-fadeIn">
                      {notice}
                    </p>
                  )}

                  <div className="flex items-center gap-2">
                    <Link
                      href={`/admissions/universities/${u.id}`}
                      className="flex-1"
                    >
                      <Button variant="outline" className="w-full text-xs py-2">
                        Details
                      </Button>
                    </Link>

                    <Button
                      variant={isSaved ? "gold" : "outline"}
                      className="text-xs px-3"
                      disabled={savingId === u.id}
                      onClick={() => handleToggleSave(u)}
                      title={isSaved ? "Remove bookmark" : "Save university"}
                    >
                      <Bookmark
                        className={cn("h-4 w-4", isSaved && "fill-current")}
                      />
                    </Button>

                    <Button
                      variant="primary"
                      className="text-xs px-3"
                      onClick={() => handleAddToTracker(u)}
                      title="Add to Application Tracker"
                    >
                      <PlusCircle className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Pagination controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-6">
          <Button
            variant="outline"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="text-xs"
          >
            Previous
          </Button>
          <span className="text-xs text-ink-500 font-medium px-2">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            className="text-xs"
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
