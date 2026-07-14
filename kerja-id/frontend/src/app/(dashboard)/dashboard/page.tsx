"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import api from "@/lib/api";
import type { Application, Job, JobsResponse } from "@/lib/types";
import { formatSalary, formatDate, timeAgo } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Briefcase,
  FileText,
  GitBranch,
  Search,
  Clock,
  TrendingUp,
  CheckCircle2,
  Calendar,
  ArrowRight,
  MapPin,
  Building2,
  Sparkles,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface ApplicationStats {
  total: number;
  active?: number;
  interviews?: number;
  offers?: number;
  byStatus: {
    SAVED: number;
    APPLIED: number;
    SCREENING: number;
    INTERVIEW: number;
    OFFER: number;
    ACCEPTED: number;
    REJECTED: number;
  };
}

const EMPTY_STATUS_COUNTS: ApplicationStats["byStatus"] = {
  SAVED: 0,
  APPLIED: 0,
  SCREENING: 0,
  INTERVIEW: 0,
  OFFER: 0,
  ACCEPTED: 0,
  REJECTED: 0,
};

/* ------------------------------------------------------------------ */
/*  Status helpers                                                     */
/* ------------------------------------------------------------------ */

const STATUS_LABEL: Record<string, string> = {
  SAVED: "Tersimpan",
  APPLIED: "Dilamar",
  SCREENING: "Screening",
  INTERVIEW: "Interview",
  OFFER: "Offer",
  ACCEPTED: "Diterima",
  REJECTED: "Ditolak",
  WITHDRAWN: "Ditarik",
};

const STATUS_VARIANT: Record<string, "default" | "secondary" | "success" | "warning" | "destructive" | "outline"> = {
  SAVED: "secondary",
  APPLIED: "default",
  SCREENING: "default",
  INTERVIEW: "warning",
  OFFER: "success",
  ACCEPTED: "success",
  REJECTED: "destructive",
  WITHDRAWN: "outline",
};

/* ------------------------------------------------------------------ */
/*  Skeleton placeholders                                              */
/* ------------------------------------------------------------------ */

function StatCardSkeleton() {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-16" />
          </div>
          <Skeleton className="h-12 w-12 rounded-full" />
        </div>
      </CardContent>
    </Card>
  );
}

function ApplicationRowSkeleton() {
  return (
    <div className="flex items-center gap-4 py-3">
      <Skeleton className="h-10 w-10 rounded-full" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-3 w-28" />
      </div>
      <Skeleton className="h-6 w-20 rounded-full" />
    </div>
  );
}

function JobCardSkeleton() {
  return (
    <Card>
      <CardContent className="p-4 space-y-3">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <div className="flex gap-2">
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>
      </CardContent>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function DashboardPage() {
  const { user } = useAuth();

  const [stats, setStats] = useState<ApplicationStats | null>(null);
  const [recentApps, setRecentApps] = useState<Application[]>([]);
  const [recommendedJobs, setRecommendedJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchData() {
      setLoading(true);
      setError(null);

      try {
        const [statsRes, appsRes, jobsRes] = await Promise.allSettled([
          api.get<ApplicationStats>("/applications/stats"),
          api.get<{ applications?: Application[]; data?: Application[] }>("/applications", {
            params: { limit: 5 },
          }),
          api.get<JobsResponse>("/jobs", {
            params: { limit: 4, sort: "relevance" },
          }),
        ]);

        if (cancelled) return;

        if (statsRes.status === "fulfilled") {
          setStats(statsRes.value.data);
        }

        if (appsRes.status === "fulfilled") {
          const d = appsRes.value.data;
          setRecentApps(d.applications ?? d.data ?? []);
        }

        if (jobsRes.status === "fulfilled") {
          setRecommendedJobs(jobsRes.value.data.jobs ?? []);
        }
      } catch {
        if (!cancelled) setError("Gagal memuat data dashboard.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchData();
    return () => { cancelled = true; };
  }, []);

  /* Derived values */
  const profile = user?.profile;
  const displayName = profile?.fullName ?? user?.email?.split("@")[0] ?? "User";
  const completion = profile?.profileCompletion ?? 0;
  const skills = profile?.skills?.map((s) => s.name) ?? [];
  const statusCounts = stats?.byStatus ?? EMPTY_STATUS_COUNTS;

  const activeCount =
    stats?.active ??
    statusCounts.APPLIED + statusCounts.SCREENING + statusCounts.INTERVIEW;

  const interviewCount = stats?.interviews ?? statusCounts.INTERVIEW;
  const offerCount = stats?.offers ?? statusCounts.OFFER;

  /* Greeting based on time of day */
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Selamat Pagi" : hour < 17 ? "Selamat Siang" : "Selamat Malam";

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto">
      {/* ---------------------------------------------------------- */}
      {/*  Welcome header                                             */}
      {/* ---------------------------------------------------------- */}
      <section>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
          {greeting}, {displayName}! 👋
        </h1>
        <p className="text-muted-foreground mt-1">
          Berikut ringkasan aktivitas pencarian kerja kamu hari ini.
        </p>
      </section>

      {/* ---------------------------------------------------------- */}
      {/*  Error banner                                               */}
      {/* ---------------------------------------------------------- */}
      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* ---------------------------------------------------------- */}
      {/*  Stats cards                                                */}
      {/* ---------------------------------------------------------- */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)
        ) : (
          <>
            <StatCard
              label="Total Lamaran"
              value={stats?.total ?? 0}
              icon={<Briefcase className="h-6 w-6" />}
              color="text-blue-600 bg-blue-100"
            />
            <StatCard
              label="Aktif"
              value={activeCount}
              icon={<TrendingUp className="h-6 w-6" />}
              color="text-amber-600 bg-amber-100"
            />
            <StatCard
              label="Interview Terjadwal"
              value={interviewCount}
              icon={<Calendar className="h-6 w-6" />}
              color="text-purple-600 bg-purple-100"
            />
            <StatCard
              label="Offer"
              value={offerCount}
              icon={<CheckCircle2 className="h-6 w-6" />}
              color="text-green-600 bg-green-100"
            />
          </>
        )}
      </section>

      {/* ---------------------------------------------------------- */}
      {/*  Quick actions                                              */}
      {/* ---------------------------------------------------------- */}
      <section className="flex flex-wrap gap-3">
        <Button asChild size="lg">
          <Link href="/jobs/search">
            <Search className="mr-2 h-4 w-4" />
            Cari Lowongan
          </Link>
        </Button>
        <Button asChild variant="outline" size="lg">
          <Link href="/cv">
            <FileText className="mr-2 h-4 w-4" />
            Buat CV
          </Link>
        </Button>
        <Button asChild variant="outline" size="lg">
          <Link href="/tracker">
            <GitBranch className="mr-2 h-4 w-4" />
            Lihat Pipeline
          </Link>
        </Button>
      </section>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* -------------------------------------------------------- */}
        {/*  Left column (2/3)                                        */}
        {/* -------------------------------------------------------- */}
        <div className="lg:col-span-2 space-y-6">
          {/* ---- Recent Activity ---- */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-lg">Aktivitas Terbaru</CardTitle>
              <Button asChild variant="ghost" size="sm">
                <Link href="/tracker">
                  Lihat Semua <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="divide-y">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <ApplicationRowSkeleton key={i} />
                  ))}
                </div>
              ) : recentApps.length === 0 ? (
                <EmptyState
                  message="Belum ada lamaran. Mulai cari lowongan sekarang!"
                  actionHref="/jobs/search"
                  actionLabel="Cari Lowongan"
                />
              ) : (
                <div className="divide-y">
                  {recentApps.map((app) => (
                    <div
                      key={app.id}
                      className="flex items-center gap-4 py-3 first:pt-0 last:pb-0"
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <Briefcase className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">
                          {app.position}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {app.company} · {timeAgo(app.createdAt)}
                        </p>
                      </div>
                      <Badge variant={STATUS_VARIANT[app.status]}>
                        {STATUS_LABEL[app.status] ?? app.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* ---- Recommended Jobs ---- */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-amber-500" />
                Rekomendasi Lowongan
              </CardTitle>
              <Button asChild variant="ghost" size="sm">
                <Link href="/jobs/search">
                  Lihat Semua <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="grid sm:grid-cols-2 gap-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <JobCardSkeleton key={i} />
                  ))}
                </div>
              ) : recommendedJobs.length === 0 ? (
                <EmptyState
                  message="Lengkapi profil dan skill kamu untuk mendapatkan rekomendasi."
                  actionHref="/profile/edit"
                  actionLabel="Lengkapi Profil"
                />
              ) : (
                <div className="grid sm:grid-cols-2 gap-4">
                  {recommendedJobs.map((job) => (
                    <JobCard key={job.id} job={job} />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* -------------------------------------------------------- */}
        {/*  Right column (1/3)                                       */}
        {/* -------------------------------------------------------- */}
        <div className="space-y-6">
          {/* ---- Profile Completion ---- */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Profil Kamu</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {loading ? (
                <>
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-6 w-full" />
                </>
              ) : (
                <>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Kelengkapan Profil</span>
                    <span className="font-semibold">{completion}%</span>
                  </div>
                  <Progress value={completion} />
                  {completion < 100 && (
                    <p className="text-xs text-muted-foreground">
                      Profil yang lengkap meningkatkan peluang kamu ditemukan oleh recruiter.
                    </p>
                  )}
                  <Button asChild variant="outline" size="sm" className="w-full">
                    <Link href="/profile/edit">
                      {completion < 100 ? "Lengkapi Profil" : "Edit Profil"}
                    </Link>
                  </Button>
                </>
              )}
            </CardContent>
          </Card>

          {/* ---- Upcoming Reminders ---- */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Pengingat Mendatang
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : (
                <UpcomingReminders applications={recentApps} />
              )}
            </CardContent>
          </Card>

          {/* ---- Skills ---- */}
          {skills.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Skill Kamu</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {skills.slice(0, 10).map((skill) => (
                    <Badge key={skill} variant="secondary">
                      {skill}
                    </Badge>
                  ))}
                  {skills.length > 10 && (
                    <Badge variant="outline">+{skills.length - 10}</Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

/* ================================================================== */
/*  Sub-components                                                     */
/* ================================================================== */

function StatCard({
  label,
  value,
  icon,
  color,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  color: string;
}) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="text-2xl md:text-3xl font-bold mt-1">{value}</p>
          </div>
          <div className={`flex h-12 w-12 items-center justify-center rounded-full ${color}`}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function JobCard({ job }: { job: Job }) {
  const salaryText =
    job.salaryMin || job.salaryMax
      ? `${formatSalary(job.salaryMin)} – ${formatSalary(job.salaryMax)}`
      : null;

  return (
    <Card className="hover:shadow-md transition-shadow group">
      <CardContent className="p-4 space-y-2">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
            <Building2 className="h-5 w-5 text-muted-foreground" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-sm leading-tight group-hover:text-primary transition-colors truncate">
              {job.title}
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5 truncate">
              {job.company?.name ?? "Perusahaan"}
            </p>
          </div>
        </div>

        {job.location && (
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            {job.city ? `${job.city}, ` : ""}
            {job.location}
          </p>
        )}

        {salaryText && (
          <p className="text-xs font-medium text-green-700">{salaryText}</p>
        )}

        <div className="flex flex-wrap gap-1.5 pt-1">
          <Badge variant="secondary" className="text-[10px] px-2">
            {job.type.replace("_", "-")}
          </Badge>
          <Badge variant="outline" className="text-[10px] px-2">
            {job.level}
          </Badge>
        </div>

        <Button
          asChild
          variant="ghost"
          size="sm"
          className="w-full mt-2 text-xs"
        >
          <Link href={`/jobs/${job.id}`}>Lihat Detail</Link>
        </Button>
      </CardContent>
    </Card>
  );
}

function UpcomingReminders({ applications }: { applications: Application[] }) {
  const upcoming = applications
    .filter(
      (a) =>
        a.followUpAt &&
        new Date(a.followUpAt) > new Date() &&
        !["REJECTED", "WITHDRAWN", "ACCEPTED"].includes(a.status)
    )
    .sort(
      (a, b) =>
        new Date(a.followUpAt!).getTime() - new Date(b.followUpAt!).getTime()
    )
    .slice(0, 3);

  if (upcoming.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-4">
        Tidak ada pengingat mendatang 🎉
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {upcoming.map((app) => (
        <div
          key={app.id}
          className="flex items-start gap-3 rounded-lg border p-3"
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-600">
            <Clock className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium truncate">{app.position}</p>
            <p className="text-xs text-muted-foreground">
              Follow-up · {formatDate(app.followUpAt!)}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyState({
  message,
  actionHref,
  actionLabel,
}: {
  message: string;
  actionHref: string;
  actionLabel: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      <p className="text-sm text-muted-foreground mb-4">{message}</p>
      <Button asChild size="sm">
        <Link href={actionHref}>{actionLabel}</Link>
      </Button>
    </div>
  );
}
