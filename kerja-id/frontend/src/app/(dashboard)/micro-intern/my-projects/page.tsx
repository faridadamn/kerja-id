"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/lib/api";
import { cn, formatSalary, formatDate } from "@/lib/utils";
import type { MicroInternApplication } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Briefcase,
  Clock,
  DollarSign,
  Calendar,
  Building2,
  ArrowRight,
  FolderOpen,
  Loader2,
  CheckCircle2,
  XCircle,
  Hourglass,
  PlayCircle,
} from "lucide-react";

const STATUS_CONFIG: Record<
  string,
  { label: string; variant: "default" | "secondary" | "destructive" | "success" | "warning" | "outline"; icon: typeof Briefcase }
> = {
  PENDING: { label: "Menunggu", variant: "warning", icon: Hourglass },
  ACCEPTED: { label: "Diterima", variant: "success", icon: CheckCircle2 },
  IN_PROGRESS: { label: "Sedang Dikerjakan", variant: "default", icon: PlayCircle },
  COMPLETED: { label: "Selesai", variant: "secondary", icon: CheckCircle2 },
  REJECTED: { label: "Ditolak", variant: "destructive", icon: XCircle },
};

function StatusBadge({ status }: { status: string }) {
  const config = STATUS_CONFIG[status] || { label: status, variant: "outline" as const, icon: Briefcase };
  const Icon = config.icon;
  return (
    <Badge variant={config.variant} className="flex items-center gap-1 w-fit">
      <Icon className="h-3 w-3" />
      {config.label}
    </Badge>
  );
}

function ApplicationCardSkeleton() {
  return (
    <Card>
      <CardContent className="p-4 space-y-3">
        <div className="flex justify-between">
          <Skeleton className="h-5 w-2/3" />
          <Skeleton className="h-5 w-20 rounded-full" />
        </div>
        <Skeleton className="h-4 w-1/3" />
        <div className="flex gap-4">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-24" />
        </div>
      </CardContent>
    </Card>
  );
}

export default function MyProjectsPage() {
  const [applications, setApplications] = useState<MicroInternApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    async function fetchApplications() {
      setIsLoading(true);
      setError(null);
      try {
        const res = await api.get<MicroInternApplication[]>("/micro-intern/my-projects");
        setApplications(res.data);
      } catch (err: any) {
        setError(err.response?.data?.message || "Gagal memuat data");
      } finally {
        setIsLoading(false);
      }
    }
    fetchApplications();
  }, []);

  const filteredApps = activeTab === "all"
    ? applications
    : applications.filter((app) => app.status === activeTab);

  const statusCounts = applications.reduce(
    (acc, app) => {
      acc[app.status] = (acc[app.status] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Briefcase className="h-6 w-6 text-primary" />
          Project Saya
        </h1>
        <p className="text-muted-foreground mt-1">
          Kelola semua lamaran dan project micro-intern kamu
        </p>
      </div>

      {/* Error */}
      {error && (
        <Card className="mb-6 border-destructive">
          <CardContent className="pt-6 text-center text-destructive">
            <p>{error}</p>
            <Button variant="outline" className="mt-3" onClick={() => window.location.reload()}>
              Coba Lagi
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <ApplicationCardSkeleton key={i} />
          ))}
        </div>
      )}

      {/* Content */}
      {!isLoading && (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4 flex flex-wrap h-auto gap-1">
            <TabsTrigger value="all" className="text-xs sm:text-sm">
              Semua ({applications.length})
            </TabsTrigger>
            <TabsTrigger value="PENDING" className="text-xs sm:text-sm">
              Menunggu ({statusCounts.PENDING || 0})
            </TabsTrigger>
            <TabsTrigger value="ACCEPTED" className="text-xs sm:text-sm">
              Diterima ({statusCounts.ACCEPTED || 0})
            </TabsTrigger>
            <TabsTrigger value="IN_PROGRESS" className="text-xs sm:text-sm">
              Dikerjakan ({statusCounts.IN_PROGRESS || 0})
            </TabsTrigger>
            <TabsTrigger value="COMPLETED" className="text-xs sm:text-sm">
              Selesai ({statusCounts.COMPLETED || 0})
            </TabsTrigger>
            <TabsTrigger value="REJECTED" className="text-xs sm:text-sm">
              Ditolak ({statusCounts.REJECTED || 0})
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab}>
            {/* Empty state */}
            {filteredApps.length === 0 && (
              <Card className="py-16">
                <CardContent className="text-center">
                  <FolderOpen className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    {activeTab === "all" ? "Belum ada lamaran" : "Tidak ada project dengan status ini"}
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    {activeTab === "all"
                      ? "Mulai jelajahi marketplace dan lamar project yang menarik!"
                      : "Coba pilih tab lain atau jelajahi marketplace."}
                  </p>
                  <Link href="/micro-intern">
                    <Button>
                      <Briefcase className="h-4 w-4 mr-2" />
                      Jelajahi Marketplace
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}

            {/* Application list */}
            <div className="space-y-3">
              {filteredApps.map((app) => (
                <Card key={app.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <h3 className="font-semibold truncate">
                            {app.project?.title || "Project"}
                          </h3>
                          <StatusBadge status={app.status} />
                        </div>
                        {app.project?.company && (
                          <p className="text-sm text-muted-foreground flex items-center gap-1 mb-2">
                            <Building2 className="h-3.5 w-3.5" />
                            {app.project.company.name}
                          </p>
                        )}
                        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                          {app.project?.budget && (
                            <span className="flex items-center gap-1">
                              <DollarSign className="h-3.5 w-3.5" />
                              {formatSalary(app.project.budget)}
                            </span>
                          )}
                          {app.project?.duration && (
                            <span className="flex items-center gap-1">
                              <Clock className="h-3.5 w-3.5" />
                              {app.project.duration} hari
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5" />
                            Dilamar {formatDate(app.appliedAt)}
                          </span>
                        </div>
                      </div>
                      <Link href={`/micro-intern/${app.projectId}`}>
                        <Button variant="outline" size="sm" className="shrink-0">
                          Detail
                          <ArrowRight className="h-3.5 w-3.5 ml-1" />
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
