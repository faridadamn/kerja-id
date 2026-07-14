"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";
import type { Job, JobsResponse } from "@/lib/types";
import { cn, formatSalary, timeAgo } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  MapPin,
  Clock,
  Heart,
  Share2,
  Building2,
  Briefcase,
  ChevronLeft,
  ExternalLink,
} from "lucide-react";

// ─── Constants ───────────────────────────────────────────────────────────────

const TYPE_BADGE_MAP: Record<string, string> = {
  FULL_TIME: "Full-time",
  PART_TIME: "Part-time",
  CONTRACT: "Contract",
  FREELANCE: "Freelance",
  INTERNSHIP: "Internship",
};

const LEVEL_LABELS: Record<string, string> = {
  ENTRY: "Entry Level",
  JUNIOR: "Junior",
  MID: "Mid Level",
  SENIOR: "Senior",
  MANAGER: "Manager",
  DIRECTOR: "Director",
};

// ─── Skeleton ────────────────────────────────────────────────────────────────

function JobDetailSkeleton() {
  return (
    <div className="max-w-4xl mx-auto w-full p-4 md:p-6 lg:p-8 space-y-6">
      <Skeleton className="h-8 w-32" />
      <Card className="p-6 space-y-4">
        <div className="flex items-start gap-4">
          <Skeleton className="h-16 w-16 rounded-lg shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-7 w-3/4" />
            <Skeleton className="h-5 w-1/3" />
            <div className="flex gap-2">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-5 w-28" />
            </div>
          </div>
        </div>
        <div className="flex gap-3">
          <Skeleton className="h-10 w-40" />
          <Skeleton className="h-10 w-28" />
          <Skeleton className="h-10 w-28" />
        </div>
      </Card>
      <Card className="p-6 space-y-3">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
      </Card>
      <Card className="p-6 space-y-3">
        <Skeleton className="h-6 w-36" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </Card>
    </div>
  );
}

// ─── Company Mini Card ───────────────────────────────────────────────────────

function CompanyMiniCard({ company }: { company: NonNullable<Job["company"]> }) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Tentang Perusahaan</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-3">
          <Avatar className="h-12 w-12 rounded-lg">
            <AvatarImage src={company.logoUrl} alt={company.name} />
            <AvatarFallback className="rounded-lg bg-muted font-medium">
              {company.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold">{company.name}</p>
            {company.industry && (
              <p className="text-sm text-muted-foreground">{company.industry}</p>
            )}
          </div>
        </div>
        {company.description && (
          <p className="text-sm text-muted-foreground line-clamp-4">{company.description}</p>
        )}
        <div className="flex flex-col gap-1.5 text-sm">
          {company.size && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Building2 className="h-4 w-4" />
              <span>{company.size} karyawan</span>
            </div>
          )}
          {company.location && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>{company.location}</span>
            </div>
          )}
          {company.website && (
            <a
              href={company.website}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-primary hover:underline"
            >
              <ExternalLink className="h-4 w-4" />
              <span>Kunjungi website</span>
            </a>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Related Job Card ────────────────────────────────────────────────────────

function RelatedJobCard({ job }: { job: Job }) {
  return (
    <Link href={`/jobs/${job.id}`} className="block group">
      <Card className="p-4 h-full transition-shadow hover:shadow-md">
        <div className="flex items-start gap-3">
          <Avatar className="h-10 w-10 rounded-lg shrink-0">
            <AvatarImage src={job.company?.logoUrl} alt={job.company?.name} />
            <AvatarFallback className="rounded-lg bg-muted text-xs font-medium">
              {job.company?.name?.charAt(0) || "K"}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <h4 className="font-medium text-sm group-hover:text-primary transition-colors line-clamp-1">
              {job.title}
            </h4>
            <p className="text-xs text-muted-foreground mt-0.5">{job.company?.name}</p>
            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-1.5 text-xs text-muted-foreground">
              {job.location && (
                <span className="flex items-center gap-0.5">
                  <MapPin className="h-3 w-3" />
                  {job.location}
                </span>
              )}
              {job.postedAt && (
                <span className="flex items-center gap-0.5">
                  <Clock className="h-3 w-3" />
                  {timeAgo(job.postedAt)}
                </span>
              )}
            </div>
            <div className="flex flex-wrap gap-1 mt-2">
              <Badge variant="secondary" className="text-xs">
                {TYPE_BADGE_MAP[job.type] || job.type}
              </Badge>
              {(job.salaryMin || job.salaryMax) && (
                <span className="text-xs font-medium text-foreground">
                  {formatSalary(job.salaryMin || job.salaryMax)}
                </span>
              )}
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function JobDetailPage() {
  const params = useParams();
  const router = useRouter();
  const jobId = params.id as string;

  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [copied, setCopied] = useState(false);

  const fetchJob = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get<Job>(`/jobs/${jobId}`);
      setJob(res.data);
      setIsSaved(!!res.data.isSaved);
    } catch {
      setError("Gagal memuat detail lowongan.");
    } finally {
      setLoading(false);
    }
  }, [jobId]);

  useEffect(() => {
    fetchJob();
  }, [fetchJob]);

  // ── Save / Unsave ──
  const toggleSave = async () => {
    if (isSaving) return;
    setIsSaving(true);
    try {
      if (isSaved) {
        await api.delete(`/jobs/${jobId}/save`);
      } else {
        await api.post(`/jobs/${jobId}/save`);
      }
      setIsSaved(!isSaved);
    } catch {
      // silently fail
    } finally {
      setIsSaving(false);
    }
  };

  // ── Share ──
  const handleShare = async () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    if (navigator.share) {
      try {
        await navigator.share({ title: job?.title, url });
      } catch {
        // user cancelled
      }
    } else {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // ── Render ──
  if (loading) return <JobDetailSkeleton />;

  if (error || !job) {
    return (
      <div className="max-w-4xl mx-auto w-full p-4 md:p-6 lg:p-8">
        <Button variant="ghost" size="sm" className="gap-1 mb-6" onClick={() => router.back()}>
          <ChevronLeft className="h-4 w-4" />
          Kembali
        </Button>
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Briefcase className="h-16 w-16 text-muted-foreground/40 mb-4" />
          <h3 className="text-lg font-semibold mb-1">
            {error || "Lowongan tidak ditemukan"}
          </h3>
          <p className="text-sm text-muted-foreground">
            Lowongan mungkin sudah tidak tersedia atau telah dihapus.
          </p>
        </div>
      </div>
    );
  }

  const salaryText =
    job.salaryMin && job.salaryMax
      ? `${formatSalary(job.salaryMin)} – ${formatSalary(job.salaryMax)}`
      : job.salaryMin
        ? formatSalary(job.salaryMin)
        : job.salaryMax
          ? formatSalary(job.salaryMax)
          : null;

  return (
    <div className="max-w-4xl mx-auto w-full p-4 md:p-6 lg:p-8 space-y-6">
      {/* Back button */}
      <Button variant="ghost" size="sm" className="gap-1" onClick={() => router.back()}>
        <ChevronLeft className="h-4 w-4" />
        Kembali
      </Button>

      {/* Header card */}
      <Card className="p-6">
        <div className="flex flex-col sm:flex-row items-start gap-4">
          <Avatar className="h-16 w-16 rounded-lg shrink-0">
            <AvatarImage src={job.company?.logoUrl} alt={job.company?.name} />
            <AvatarFallback className="rounded-lg bg-muted text-lg font-semibold">
              {job.company?.name?.charAt(0) || "K"}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <h1 className="text-xl md:text-2xl font-bold">{job.title}</h1>

            <div className="flex items-center gap-2 mt-1 text-muted-foreground">
              {job.company?.name && (
                <span className="flex items-center gap-1 text-sm">
                  <Building2 className="h-4 w-4" />
                  {job.company.name}
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-3 text-sm text-muted-foreground">
              {job.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {job.location}
                </span>
              )}
              {salaryText && (
                <span className="font-semibold text-foreground">{salaryText}</span>
              )}
              {job.postedAt && (
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {timeAgo(job.postedAt)}
                </span>
              )}
            </div>

            <div className="flex flex-wrap gap-2 mt-3">
              <Badge variant="secondary">{TYPE_BADGE_MAP[job.type] || job.type}</Badge>
              <Badge variant="outline">{LEVEL_LABELS[job.level] || job.level}</Badge>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <Separator className="my-4" />
        <div className="flex flex-wrap gap-3">
          <Button className="gap-2">
            <Briefcase className="h-4 w-4" />
            Lamar Sekarang
          </Button>
          <Button
            variant="outline"
            className="gap-2"
            onClick={toggleSave}
            disabled={isSaving}
          >
            <Heart
              className={cn(
                "h-4 w-4",
                isSaved ? "fill-red-500 text-red-500" : ""
              )}
            />
            {isSaved ? "Tersimpan" : "Simpan"}
          </Button>
          <Button variant="outline" className="gap-2" onClick={handleShare}>
            <Share2 className="h-4 w-4" />
            {copied ? "Tersalin!" : "Bagikan"}
          </Button>
        </div>
      </Card>

      {/* Description */}
      {job.description && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Deskripsi Pekerjaan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none text-muted-foreground whitespace-pre-line">
              {job.description}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Requirements */}
      {job.requirements && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Persyaratan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none text-muted-foreground whitespace-pre-line">
              {job.requirements}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Skills */}
      {job.skills.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Skills yang Dibutuhkan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {job.skills.map((sk) => (
                <Badge key={sk} variant="outline" className="text-sm">
                  {sk}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Company card + related jobs side by side on desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Company mini-card */}
        <div className="lg:col-span-1">
          {job.company && <CompanyMiniCard company={job.company} />}
        </div>

        {/* Related jobs */}
        <div className="lg:col-span-2">
          {job.relatedJobs && job.relatedJobs.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold mb-4">Lowongan Serupa</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {job.relatedJobs.slice(0, 6).map((rj) => (
                  <RelatedJobCard key={rj.id} job={rj} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
