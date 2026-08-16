"use client";

import { useEffect, useState, useMemo } from "react";
import api from "@/lib/api";
import type { Application, ApplicationStatus } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BarChart3,
  TrendingUp,
  Target,
  Clock,
  Globe,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Briefcase,
  Filter,
} from "lucide-react";

/* ── types ─────────────────────────────────────────────────────────── */

interface StatsResponse {
  total: number;
  byStatus: Record<string, number>;
  bySource: Record<string, number>;
  avgResponseTime: number; // days
}

type Period = "weekly" | "monthly" | "all";

const STATUS_ORDER: ApplicationStatus[] = [
  "APPLIED",
  "SCREENING",
  "INTERVIEW",
  "OFFER",
  "ACCEPTED",
  "REJECTED",
  "WITHDRAWN",
  "SAVED",
];

const FUNNEL_STAGES = ["APPLIED", "SCREENING", "INTERVIEW", "OFFER"] as const;

const STATUS_LABELS: Record<string, string> = {
  SAVED: "Disimpan",
  APPLIED: "Dilamar",
  SCREENING: "Screening",
  INTERVIEW: "Interview",
  OFFER: "Offer",
  ACCEPTED: "Diterima",
  REJECTED: "Ditolak",
  WITHDRAWN: "Ditarik",
};

const STATUS_COLORS: Record<string, string> = {
  SAVED: "bg-slate-400",
  APPLIED: "bg-blue-500",
  SCREENING: "bg-amber-500",
  INTERVIEW: "bg-violet-500",
  OFFER: "bg-emerald-500",
  ACCEPTED: "bg-green-600",
  REJECTED: "bg-red-500",
  WITHDRAWN: "bg-slate-500",
};

/* ── helpers ───────────────────────────────────────────────────────── */

function filterByPeriod(apps: Application[], period: Period): Application[] {
  if (period === "all") return apps;
  const now = new Date();
  const cutoff = new Date();
  if (period === "weekly") cutoff.setDate(now.getDate() - 7);
  else cutoff.setDate(now.getDate() - 30);
  return apps.filter((a) => new Date(a.createdAt) >= cutoff);
}

function groupByDate(apps: Application[], days: number): { label: string; count: number }[] {
  const result: { label: string; count: number }[] = [];
  const now = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    const label = d.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
    const count = apps.filter((a) => a.createdAt.slice(0, 10) === key).length;
    result.push({ label, count });
  }
  return result;
}

/* ── component ─────────────────────────────────────────────────────── */

export default function AnalyticsPage() {
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [period, setPeriod] = useState<Period>("monthly");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [statsRes, appsRes] = await Promise.all([
          api.get<StatsResponse>("/applications/stats"),
          api.get<Application[]>("/applications"),
        ]);
        setStats(statsRes.data);
        setApplications(Array.isArray(appsRes.data) ? appsRes.data : []);
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filtered = useMemo(() => filterByPeriod(applications, period), [applications, period]);

  /* derived data */
  const byStatus = useMemo(() => {
    const map: Record<string, number> = {};
    filtered.forEach((a) => {
      map[a.status] = (map[a.status] || 0) + 1;
    });
    return map;
  }, [filtered]);

  const total = filtered.length;

  const responseRate = useMemo(() => {
    const applied = byStatus["APPLIED"] || 0;
    if (!applied) return 0;
    const responded = applied - (byStatus["REJECTED"] || 0); // rough: not rejected = responded
    return Math.round((responded / applied) * 100);
  }, [byStatus]);

  const interviewRate = useMemo(() => {
    const applied = byStatus["APPLIED"] || 0;
    if (!applied) return 0;
    return Math.round(((byStatus["INTERVIEW"] || 0) / applied) * 100);
  }, [byStatus]);

  const offerRate = useMemo(() => {
    const applied = byStatus["APPLIED"] || 0;
    if (!applied) return 0;
    return Math.round(((byStatus["OFFER"] || 0) / applied) * 100);
  }, [byStatus]);

  const bySource = useMemo(() => {
    const map: Record<string, { total: number; responses: number }> = {};
    filtered.forEach((a) => {
      const src = a.source || "Lainnya";
      if (!map[src]) map[src] = { total: 0, responses: 0 };
      map[src].total++;
      if (a.status !== "APPLIED" && a.status !== "SAVED") map[src].responses++;
    });
    return Object.entries(map)
      .map(([name, v]) => ({ name, ...v, rate: v.total ? Math.round((v.responses / v.total) * 100) : 0 }))
      .sort((a, b) => b.rate - a.rate);
  }, [filtered]);

  const rejectionReasons = useMemo(() => {
    const map: Record<string, number> = {};
    filtered
      .filter((a) => a.status === "REJECTED" && a.rejectionReason)
      .forEach((a) => {
        const reason = a.rejectionReason || "Tidak diketahui";
        map[reason] = (map[reason] || 0) + 1;
      });
    return Object.entries(map)
      .map(([reason, count]) => ({ reason, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);
  }, [filtered]);

  const timelineData = useMemo(() => {
    if (period === "weekly") return groupByDate(filtered, 7);
    if (period === "monthly") return groupByDate(filtered, 30);
    // all-time: group by week
    const weeks: { label: string; count: number }[] = [];
    const now = new Date();
    for (let i = 11; i >= 0; i--) {
      const start = new Date(now);
      start.setDate(start.getDate() - i * 7);
      const end = new Date(start);
      end.setDate(end.getDate() + 7);
      const label = start.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
      const count = filtered.filter((a) => {
        const d = new Date(a.createdAt);
        return d >= start && d < end;
      }).length;
      weeks.push({ label, count });
    }
    return weeks;
  }, [filtered, period]);

  const avgResponseBySource = useMemo(() => {
    const map: Record<string, { total: number; days: number }> = {};
    filtered
      .filter((a) => a.status !== "APPLIED" && a.status !== "SAVED" && a.appliedAt)
      .forEach((a) => {
        const src = a.source || "Lainnya";
        if (!map[src]) map[src] = { total: 0, days: 0 };
        const applied = new Date(a.appliedAt!).getTime();
        const updated = new Date(a.updatedAt).getTime();
        const diffDays = Math.max(0, (updated - applied) / (1000 * 60 * 60 * 24));
        map[src].days += diffDays;
        map[src].total++;
      });
    return Object.entries(map)
      .map(([name, v]) => ({ name, avg: v.total ? Math.round(v.days / v.total) : 0 }))
      .sort((a, b) => a.avg - b.avg);
  }, [filtered]);

  const maxTimeline = Math.max(1, ...timelineData.map((d) => d.count));
  const maxFunnel = Math.max(1, ...FUNNEL_STAGES.map((s) => byStatus[s] || 0));
  const maxSource = Math.max(1, ...bySource.map((s) => s.total));
  const maxRejection = Math.max(1, ...rejectionReasons.map((r) => r.count));
  const maxResponseTime = Math.max(1, ...avgResponseBySource.map((s) => s.avg));

  /* ── loading state ────────────────────────────────────────────────── */

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Skeleton className="h-72" />
          <Skeleton className="h-72" />
        </div>
      </div>
    );
  }

  /* ── render ────────────────────────────────────────────────────────── */

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      {/* header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-primary" />
            Analytics
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Pantau progress lamaran kerja kamu
          </p>
        </div>

        {/* period selector */}
        <div className="flex items-center gap-1 rounded-lg border p-1 bg-muted">
          {(["weekly", "monthly", "all"] as Period[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                period === p
                  ? "bg-background text-foreground shadow-sm font-medium"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {p === "weekly" ? "Minggu" : p === "monthly" ? "Bulan" : "Semua"}
            </button>
          ))}
        </div>
      </div>

      {/* ── overview stats ──────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <StatCard
          icon={<Briefcase className="h-5 w-5" />}
          label="Total Lamaran"
          value={total}
          color="text-blue-600 bg-blue-50"
        />
        <StatCard
          icon={<Target className="h-5 w-5" />}
          label="Response Rate"
          value={`${responseRate}%`}
          color="text-emerald-600 bg-emerald-50"
        />
        <StatCard
          icon={<TrendingUp className="h-5 w-5" />}
          label="Interview Rate"
          value={`${interviewRate}%`}
          color="text-violet-600 bg-violet-50"
        />
        <StatCard
          icon={<ArrowUpRight className="h-5 w-5" />}
          label="Offer Rate"
          value={`${offerRate}%`}
          color="text-amber-600 bg-amber-50"
        />
      </div>

      {/* ── funnel + platform performance ───────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* application funnel */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Funnel Lamaran
            </CardTitle>
            <CardDescription>Distribusi status dari Applied ke Offer</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {FUNNEL_STAGES.map((stage) => {
              const count = byStatus[stage] || 0;
              const pct = maxFunnel ? (count / maxFunnel) * 100 : 0;
              return (
                <div key={stage} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{STATUS_LABELS[stage]}</span>
                    <span className="text-muted-foreground">{count}</span>
                  </div>
                  <div className="h-6 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${STATUS_COLORS[stage]}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* best performing platforms */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Globe className="h-4 w-4" />
              Platform Terbaik
            </CardTitle>
            <CardDescription>Sumber lamaran dengan response rate tertinggi</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {bySource.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">Belum ada data</p>
            ) : (
              bySource.slice(0, 6).map((src) => (
                <div key={src.name} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{src.name}</span>
                    <span className="text-muted-foreground">
                      {src.total} lamaran · {src.rate}% response
                    </span>
                  </div>
                  <div className="h-5 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-primary transition-all duration-500"
                      style={{ width: `${maxSource ? (src.total / maxSource) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── applications over time ──────────────────────────────────── */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Lamaran dari Waktu ke Waktu
          </CardTitle>
          <CardDescription>
            {period === "weekly"
              ? "7 hari terakhir"
              : period === "monthly"
                ? "30 hari terakhir"
                : "12 minggu terakhir"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {timelineData.every((d) => d.count === 0) ? (
            <p className="text-sm text-muted-foreground text-center py-12">Belum ada data</p>
          ) : (
            <div className="flex items-end gap-1 h-40">
              {timelineData.map((d, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1 min-w-0">
                  <span className="text-[10px] text-muted-foreground">{d.count || ""}</span>
                  <div className="w-full bg-muted rounded-t-sm overflow-hidden" style={{ height: "120px" }}>
                    <div
                      className="w-full bg-primary/80 rounded-t-sm transition-all duration-300"
                      style={{
                        height: `${maxTimeline ? (d.count / maxTimeline) * 100 : 0}%`,
                        marginTop: "auto",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "flex-end",
                      }}
                    />
                  </div>
                  <span className="text-[9px] text-muted-foreground truncate w-full text-center">
                    {i % Math.max(1, Math.floor(timelineData.length / 8)) === 0 ? d.label : ""}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── rejection reasons + avg response time ───────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* rejection reasons */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Alasan Penolakan
            </CardTitle>
            <CardDescription>Alasan paling umum dari penolakan</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {rejectionReasons.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                Tidak ada data penolakan{period !== "all" ? " di periode ini" : ""}
              </p>
            ) : (
              rejectionReasons.map((r) => (
                <div key={r.reason} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium truncate mr-2">{r.reason}</span>
                    <span className="text-muted-foreground shrink-0">{r.count}</span>
                  </div>
                  <div className="h-5 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-red-500/80 transition-all duration-500"
                      style={{ width: `${maxRejection ? (r.count / maxRejection) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* avg response time */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Rata-rata Waktu Respon
            </CardTitle>
            <CardDescription>Hari sampai mendapat respon per platform</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {avgResponseBySource.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                Belum ada data respon{period !== "all" ? " di periode ini" : ""}
              </p>
            ) : (
              avgResponseBySource.map((s) => (
                <div key={s.name} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{s.name}</span>
                    <span className="text-muted-foreground">
                      {s.avg} hari
                    </span>
                  </div>
                  <div className="h-5 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-amber-500/80 transition-all duration-500"
                      style={{ width: `${maxResponseTime ? (s.avg / maxResponseTime) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── status breakdown table ──────────────────────────────────── */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Semua Status</CardTitle>
          <CardDescription>Breakdown lengkap berdasarkan status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {STATUS_ORDER.map((status) => (
              <div key={status} className="flex items-center gap-2 p-3 rounded-lg border">
                <div className={`w-3 h-3 rounded-full ${STATUS_COLORS[status]}`} />
                <div>
                  <p className="text-sm font-medium">{STATUS_LABELS[status]}</p>
                  <p className="text-lg font-bold">{byStatus[status] || 0}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/* ── sub-components ─────────────────────────────────────────────────── */

function StatCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  color: string;
}) {
  return (
    <Card>
      <CardContent className="p-4 md:p-5">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${color}`}>{icon}</div>
          <div>
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="text-2xl font-bold">{value}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
