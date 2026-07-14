"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";
import type { Job, JobsResponse, FacetItem } from "@/lib/types";
import { cn, formatSalary, timeAgo } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  Search,
  MapPin,
  Clock,
  Heart,
  Briefcase,
  ChevronLeft,
  ChevronRight,
  X,
  SlidersHorizontal,
  Building2,
} from "lucide-react";

// ─── Constants ───────────────────────────────────────────────────────────────

const JOB_TYPES = [
  { value: "FULL_TIME", label: "Full-time" },
  { value: "PART_TIME", label: "Part-time" },
  { value: "CONTRACT", label: "Contract" },
  { value: "FREELANCE", label: "Freelance" },
  { value: "INTERNSHIP", label: "Internship" },
];

const JOB_LEVELS = [
  { value: "ENTRY", label: "Entry" },
  { value: "JUNIOR", label: "Junior" },
  { value: "MID", label: "Mid" },
  { value: "SENIOR", label: "Senior" },
  { value: "MANAGER", label: "Manager" },
];

const POSTED_WITHIN_OPTIONS = [
  { value: "1", label: "24 jam" },
  { value: "3", label: "3 hari" },
  { value: "7", label: "7 hari" },
  { value: "30", label: "30 hari" },
];

const TYPE_BADGE_MAP: Record<string, string> = {
  FULL_TIME: "Full-time",
  PART_TIME: "Part-time",
  CONTRACT: "Contract",
  FREELANCE: "Freelance",
  INTERNSHIP: "Internship",
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

// ─── Sub-components ──────────────────────────────────────────────────────────

function JobCardSkeleton() {
  return (
    <Card className="p-4 space-y-3">
      <div className="flex items-start gap-3">
        <Skeleton className="h-12 w-12 rounded-lg shrink-0" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-5 w-20" />
        <Skeleton className="h-5 w-16" />
      </div>
      <Skeleton className="h-4 w-full" />
      <div className="flex gap-2">
        <Skeleton className="h-6 w-16" />
        <Skeleton className="h-6 w-20" />
        <Skeleton className="h-6 w-14" />
      </div>
    </Card>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <Briefcase className="h-16 w-16 text-muted-foreground/40 mb-4" />
      <h3 className="text-lg font-semibold mb-1">Tidak ada lowongan ditemukan</h3>
      <p className="text-sm text-muted-foreground max-w-sm">
        Coba ubah kata kunci atau filter pencarian Anda untuk menemukan lowongan yang sesuai.
      </p>
    </div>
  );
}

interface FilterSidebarProps {
  locations: FacetItem[];
  skills: FacetItem[];
  className?: string;
  onApply?: () => void;
}

function FilterSidebar({ locations, skills, className, onApply }: FilterSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const q = searchParams.get("q") || "";
  const location = searchParams.get("location") || "";
  const types = searchParams.get("type")?.split(",").filter(Boolean) || [];
  const levels = searchParams.get("level")?.split(",").filter(Boolean) || [];
  const salaryMin = searchParams.get("salaryMin") || "";
  const salaryMax = searchParams.get("salaryMax") || "";
  const selectedSkills = searchParams.get("skills")?.split(",").filter(Boolean) || [];
  const postedWithin = searchParams.get("postedWithin") || "";

  const [localLocation, setLocalLocation] = useState(location);
  const [localSalaryMin, setLocalSalaryMin] = useState(salaryMin);
  const [localSalaryMax, setLocalSalaryMax] = useState(salaryMax);

  useEffect(() => {
    setLocalLocation(location);
    setLocalSalaryMin(salaryMin);
    setLocalSalaryMax(salaryMax);
  }, [location, salaryMin, salaryMax]);

  const updateParam = useCallback(
    (key: string, value: string | null) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value === null || value === "") {
        params.delete(key);
      } else {
        params.set(key, value);
      }
      params.set("page", "1");
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
      onApply?.();
    },
    [router, pathname, searchParams, onApply]
  );

  const toggleMultiParam = useCallback(
    (key: string, value: string) => {
      const current = searchParams.get(key)?.split(",").filter(Boolean) || [];
      const next = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];
      updateParam(key, next.length > 0 ? next.join(",") : null);
    },
    [searchParams, updateParam]
  );

  const handleLocationSubmit = () => {
    updateParam("location", localLocation || null);
  };

  const handleSalaryApply = () => {
    const params = new URLSearchParams(searchParams.toString());
    if (localSalaryMin) params.set("salaryMin", localSalaryMin);
    else params.delete("salaryMin");
    if (localSalaryMax) params.set("salaryMax", localSalaryMax);
    else params.delete("salaryMax");
    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
    onApply?.();
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Location */}
      <div>
        <label className="text-sm font-medium mb-2 block">Lokasi</label>
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Kota atau provinsi"
            className="pl-9"
            value={localLocation}
            onChange={(e) => setLocalLocation(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLocationSubmit()}
            onBlur={handleLocationSubmit}
          />
        </div>
        {locations.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {locations.slice(0, 5).map((loc) => (
              <button
                key={loc.value}
                onClick={() => updateParam("location", loc.value)}
                className={cn(
                  "text-xs px-2 py-1 rounded-full border transition-colors",
                  location === loc.value
                    ? "bg-primary text-primary-foreground border-primary"
                    : "hover:bg-accent"
                )}
              >
                {loc.value} ({loc.count})
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Job Type */}
      <div>
        <label className="text-sm font-medium mb-2 block">Tipe Pekerjaan</label>
        <div className="space-y-2">
          {JOB_TYPES.map((t) => (
            <label key={t.value} className="flex items-center gap-2 cursor-pointer text-sm">
              <input
                type="checkbox"
                className="rounded border-input"
                checked={types.includes(t.value)}
                onChange={() => toggleMultiParam("type", t.value)}
              />
              {t.label}
            </label>
          ))}
        </div>
      </div>

      {/* Level */}
      <div>
        <label className="text-sm font-medium mb-2 block">Level</label>
        <div className="space-y-2">
          {JOB_LEVELS.map((l) => (
            <label key={l.value} className="flex items-center gap-2 cursor-pointer text-sm">
              <input
                type="checkbox"
                className="rounded border-input"
                checked={levels.includes(l.value)}
                onChange={() => toggleMultiParam("level", l.value)}
              />
              {l.label}
            </label>
          ))}
        </div>
      </div>

      {/* Salary Range */}
      <div>
        <label className="text-sm font-medium mb-2 block">Rentang Gaji</label>
        <div className="flex gap-2 items-center">
          <Input
            type="number"
            placeholder="Min"
            value={localSalaryMin}
            onChange={(e) => setLocalSalaryMin(e.target.value)}
            onBlur={handleSalaryApply}
            onKeyDown={(e) => e.key === "Enter" && handleSalaryApply()}
            className="text-sm"
          />
          <span className="text-muted-foreground text-xs">–</span>
          <Input
            type="number"
            placeholder="Max"
            value={localSalaryMax}
            onChange={(e) => setLocalSalaryMax(e.target.value)}
            onBlur={handleSalaryApply}
            onKeyDown={(e) => e.key === "Enter" && handleSalaryApply()}
            className="text-sm"
          />
        </div>
      </div>

      {/* Skills */}
      {skills.length > 0 && (
        <div>
          <label className="text-sm font-medium mb-2 block">Skills</label>
          <div className="flex flex-wrap gap-1.5">
            {skills.slice(0, 15).map((sk) => (
              <button
                key={sk.value}
                onClick={() => toggleMultiParam("skills", sk.value)}
                className={cn(
                  "text-xs px-2.5 py-1 rounded-full border transition-colors",
                  selectedSkills.includes(sk.value)
                    ? "bg-primary text-primary-foreground border-primary"
                    : "hover:bg-accent"
                )}
              >
                {sk.value}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Posted Within */}
      <div>
        <label className="text-sm font-medium mb-2 block">Diposting dalam</label>
        <div className="flex flex-wrap gap-1.5">
          {POSTED_WITHIN_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() =>
                updateParam("postedWithin", postedWithin === opt.value ? null : opt.value)
              }
              className={cn(
                "text-xs px-2.5 py-1 rounded-full border transition-colors",
                postedWithin === opt.value
                  ? "bg-primary text-primary-foreground border-primary"
                  : "hover:bg-accent"
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Active Filter Chips ─────────────────────────────────────────────────────

function ActiveFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const chips: { key: string; label: string; value?: string }[] = [];

  const types = searchParams.get("type")?.split(",").filter(Boolean) || [];
  types.forEach((t) => {
    const found = JOB_TYPES.find((j) => j.value === t);
    chips.push({ key: "type", label: found?.label || t, value: t });
  });

  const levels = searchParams.get("level")?.split(",").filter(Boolean) || [];
  levels.forEach((l) => {
    const found = JOB_LEVELS.find((j) => j.value === l);
    chips.push({ key: "level", label: found?.label || l, value: l });
  });

  const loc = searchParams.get("location");
  if (loc) chips.push({ key: "location", label: `📍 ${loc}` });

  const sMin = searchParams.get("salaryMin");
  const sMax = searchParams.get("salaryMax");
  if (sMin || sMax) {
    chips.push({
      key: "salary",
      label: `Gaji: ${sMin ? formatSalary(Number(sMin)) : "–"} – ${sMax ? formatSalary(Number(sMax)) : "–"}`,
    });
  }

  const selectedSkills = searchParams.get("skills")?.split(",").filter(Boolean) || [];
  selectedSkills.forEach((s) => chips.push({ key: "skills", label: s, value: s }));

  const posted = searchParams.get("postedWithin");
  if (posted) {
    const found = POSTED_WITHIN_OPTIONS.find((o) => o.value === posted);
    chips.push({ key: "postedWithin", label: `📅 ${found?.label || posted}` });
  }

  if (chips.length === 0) return null;

  const removeChip = (chip: (typeof chips)[number]) => {
    const params = new URLSearchParams(searchParams.toString());
    if (chip.key === "salary") {
      params.delete("salaryMin");
      params.delete("salaryMax");
    } else if (chip.key === "type" || chip.key === "level" || chip.key === "skills") {
      const current = params.get(chip.key)?.split(",").filter(Boolean) || [];
      const next = current.filter((v) => v !== chip.value);
      if (next.length > 0) params.set(chip.key, next.join(","));
      else params.delete(chip.key);
    } else {
      params.delete(chip.key);
    }
    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const clearAll = () => {
    const params = new URLSearchParams();
    const q = searchParams.get("q");
    if (q) params.set("q", q);
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      {chips.map((chip, i) => (
        <span
          key={`${chip.key}-${chip.value || i}`}
          className="inline-flex items-center gap-1 rounded-full bg-primary/10 text-primary text-xs px-2.5 py-1"
        >
          {chip.label}
          <button onClick={() => removeChip(chip)} className="hover:text-primary/70">
            <X className="h-3 w-3" />
          </button>
        </span>
      ))}
      <button onClick={clearAll} className="text-xs text-muted-foreground hover:text-foreground underline">
        Hapus semua
      </button>
    </div>
  );
}

// ─── Pagination ──────────────────────────────────────────────────────────────

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  const getPages = (): (number | "...")[] => {
    const pages: (number | "...")[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (page > 3) pages.push("...");
      for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) {
        pages.push(i);
      }
      if (page < totalPages - 2) pages.push("...");
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <div className="flex items-center justify-center gap-1.5 mt-6">
      <Button
        variant="outline"
        size="icon"
        className="h-9 w-9"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      {getPages().map((p, i) =>
        p === "..." ? (
          <span key={`e-${i}`} className="px-1 text-muted-foreground text-sm">…</span>
        ) : (
          <Button
            key={p}
            variant={p === page ? "default" : "outline"}
            size="icon"
            className="h-9 w-9"
            onClick={() => onPageChange(p)}
          >
            {p}
          </Button>
        )
      )}
      <Button
        variant="outline"
        size="icon"
        className="h-9 w-9"
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function JobSearchPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [data, setData] = useState<JobsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingIds, setSavingIds] = useState<Set<string>>(new Set());
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  const query = searchParams.get("q") || "";
  const page = Number(searchParams.get("page")) || 1;

  // ── Fetch jobs ──
  const fetchJobs = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      searchParams.forEach((v, k) => {
        if (v) params[k] = v;
      });
      if (!params.limit) params.limit = "20";
      const res = await api.get<JobsResponse>("/jobs", { params });
      setData(res.data);
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [searchParams]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  // ── Search submit ──
  const [searchInput, setSearchInput] = useState(query);
  useEffect(() => setSearchInput(query), [query]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (searchInput) params.set("q", searchInput);
    else params.delete("q");
    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  // ── Pagination ──
  const goToPage = (p: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(p));
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ── Save / Unsave ──
  const toggleSave = async (job: Job) => {
    if (savingIds.has(job.id)) return;
    setSavingIds((prev) => new Set(prev).add(job.id));
    try {
      if (job.isSaved) {
        await api.delete(`/jobs/${job.id}/save`);
      } else {
        await api.post(`/jobs/${job.id}/save`);
      }
      setData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          jobs: prev.jobs.map((j) =>
            j.id === job.id ? { ...j, isSaved: !j.isSaved } : j
          ),
        };
      });
    } catch {
      // silently fail
    } finally {
      setSavingIds((prev) => {
        const next = new Set(prev);
        next.delete(job.id);
        return next;
      });
    }
  };

  const totalResults = data?.total ?? 0;

  return (
    <div className="flex flex-col lg:flex-row gap-6 p-4 md:p-6 lg:p-8 max-w-7xl mx-auto w-full">
      {/* Mobile filter toggle */}
      <div className="lg:hidden">
        <Button
          variant="outline"
          className="w-full gap-2"
          onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filter
        </Button>
      </div>

      {/* Mobile filter overlay */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setMobileFilterOpen(false)}
          />
          <div className="absolute bottom-0 left-0 right-0 bg-background rounded-t-2xl max-h-[80vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-lg">Filter</h3>
              <button onClick={() => setMobileFilterOpen(false)}>
                <X className="h-5 w-5" />
              </button>
            </div>
            <FilterSidebar
              locations={data?.facets.locations || []}
              skills={data?.facets.skills || []}
              onApply={() => setMobileFilterOpen(false)}
            />
            <Button
              className="w-full mt-4"
              onClick={() => setMobileFilterOpen(false)}
            >
              Terapkan Filter
            </Button>
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-72 shrink-0">
        <div className="sticky top-24">
          <FilterSidebar
            locations={data?.facets.locations || []}
            skills={data?.facets.skills || []}
          />
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 min-w-0">
        {/* Search bar */}
        <form onSubmit={handleSearch} className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Cari lowongan kerja..."
              className="pl-10 h-12 text-base"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </div>
        </form>

        {/* Active filters */}
        <ActiveFilters />

        {/* Result count */}
        <div className="flex items-center justify-between mb-4 mt-2">
          {loading ? (
            <Skeleton className="h-5 w-48" />
          ) : (
            <p className="text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">
                {totalResults.toLocaleString("id-ID")}
              </span>{" "}
              lowongan ditemukan
            </p>
          )}
        </div>

        {/* Results */}
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <JobCardSkeleton key={i} />
            ))}
          </div>
        ) : !data || data.jobs.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            <div className="space-y-3">
              {data.jobs.map((job) => (
                <Link key={job.id} href={`/jobs/${job.id}`} className="block group">
                  <Card className="p-4 transition-shadow hover:shadow-md">
                    <div className="flex items-start gap-3">
                      {/* Company logo */}
                      <Avatar className="h-12 w-12 rounded-lg shrink-0">
                        <AvatarImage src={job.company?.logoUrl} alt={job.company?.name} />
                        <AvatarFallback className="rounded-lg bg-muted text-sm font-medium">
                          {job.company?.name?.charAt(0) || "K"}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <h3 className="font-semibold text-sm group-hover:text-primary transition-colors line-clamp-1">
                              {job.title}
                            </h3>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-0.5">
                              {job.company?.name && (
                                <span className="flex items-center gap-1">
                                  <Building2 className="h-3.5 w-3.5" />
                                  {job.company.name}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Save button */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              toggleSave(job);
                            }}
                            className="shrink-0 p-1.5 rounded-full hover:bg-accent transition-colors"
                            disabled={savingIds.has(job.id)}
                          >
                            <Heart
                              className={cn(
                                "h-5 w-5 transition-colors",
                                job.isSaved
                                  ? "fill-red-500 text-red-500"
                                  : "text-muted-foreground"
                              )}
                            />
                          </button>
                        </div>

                        {/* Meta row */}
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-xs text-muted-foreground">
                          {job.location && (
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3.5 w-3.5" />
                              {job.location}
                            </span>
                          )}
                          {(job.salaryMin || job.salaryMax) && (
                            <span className="font-medium text-foreground">
                              {job.salaryMin && job.salaryMax
                                ? `${formatSalary(job.salaryMin)} – ${formatSalary(job.salaryMax)}`
                                : formatSalary(job.salaryMax || job.salaryMin)}
                            </span>
                          )}
                          {job.postedAt && (
                            <span className="flex items-center gap-1">
                              <Clock className="h-3.5 w-3.5" />
                              {timeAgo(job.postedAt)}
                            </span>
                          )}
                        </div>

                        {/* Badges & skills */}
                        <div className="flex flex-wrap items-center gap-1.5 mt-2">
                          <Badge variant="secondary" className="text-xs">
                            {TYPE_BADGE_MAP[job.type] || job.type}
                          </Badge>
                          {job.skills.slice(0, 4).map((sk) => (
                            <Badge key={sk} variant="outline" className="text-xs">
                              {sk}
                            </Badge>
                          ))}
                          {job.skills.length > 4 && (
                            <span className="text-xs text-muted-foreground">
                              +{job.skills.length - 4}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>

            <Pagination page={data.page} totalPages={data.totalPages} onPageChange={goToPage} />
          </>
        )}
      </div>
    </div>
  );
}
