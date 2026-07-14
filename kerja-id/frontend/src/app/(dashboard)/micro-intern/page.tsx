"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import api from "@/lib/api";
import { cn, formatSalary, truncate } from "@/lib/utils";
import type { MicroInternProject, MicroInternListResponse } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Briefcase,
  Star,
  Clock,
  DollarSign,
  MapPin,
  Wifi,
  Building2,
  Users,
  ChevronLeft,
  ChevronRight,
  FolderOpen,
  Plus,
} from "lucide-react";

const SKILL_OPTIONS = [
  "React", "Node.js", "Python", "TypeScript", "Go", "Java", "Flutter",
  "UI/UX Design", "Data Analysis", "Machine Learning", "DevOps", "PHP",
  "Laravel", "Vue.js", "Next.js", "Docker", "AWS", "Figma",
];

const TYPE_FILTERS = [
  { value: "all", label: "Semua Tipe", icon: Briefcase },
  { value: "REMOTE", label: "Remote", icon: Wifi },
  { value: "ONSITE", label: "Onsite", icon: Building2 },
  { value: "HYBRID", label: "Hybrid", icon: Users },
];

function ProjectCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-1/2 mt-1" />
      </CardHeader>
      <CardContent className="space-y-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <div className="flex gap-2 mt-2">
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
        <div className="flex justify-between mt-4">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-20" />
        </div>
        <Skeleton className="h-10 w-full mt-2" />
      </CardContent>
    </Card>
  );
}

function DifficultyStars({ level }: { level: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={cn(
            "h-3.5 w-3.5",
            i < level ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
          )}
        />
      ))}
    </div>
  );
}

function TypeBadge({ type }: { type: string }) {
  const config: Record<string, { label: string; variant: "default" | "secondary" | "outline" }> = {
    REMOTE: { label: "Remote", variant: "default" },
    ONSITE: { label: "Onsite", variant: "secondary" },
    HYBRID: { label: "Hybrid", variant: "outline" },
  };
  const c = config[type] || { label: type, variant: "outline" as const };
  return <Badge variant={c.variant}>{c.label}</Badge>;
}

export default function MicroInternBrowsePage() {
  const [projects, setProjects] = useState<MicroInternProject[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSkill, setSelectedSkill] = useState("all");
  const [durationFilter, setDurationFilter] = useState("all");
  const [budgetMin, setBudgetMin] = useState("");
  const [budgetMax, setBudgetMax] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  const fetchProjects = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params: Record<string, string> = { page: String(page), limit: "12" };
      if (searchQuery) params.q = searchQuery;
      if (selectedSkill !== "all") params.skills = selectedSkill;
      if (durationFilter !== "all") params.duration = durationFilter;
      if (budgetMin) params.budgetMin = budgetMin;
      if (budgetMax) params.budgetMax = budgetMax;
      if (typeFilter !== "all") params.type = typeFilter;

      const res = await api.get<MicroInternListResponse>("/micro-intern", { params });
      setProjects(res.data.projects);
      setTotal(res.data.total);
      setTotalPages(res.data.totalPages);
    } catch (err: any) {
      setError(err.response?.data?.message || "Gagal memuat data project");
    } finally {
      setIsLoading(false);
    }
  }, [page, searchQuery, selectedSkill, durationFilter, budgetMin, budgetMax, typeFilter]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [searchQuery, selectedSkill, durationFilter, budgetMin, budgetMax, typeFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchProjects();
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Briefcase className="h-6 w-6 text-primary" />
            Micro-Intern & Project Marketplace
          </h1>
          <p className="text-muted-foreground mt-1">
            Temukan project singkat dan bangun portfoliomu
          </p>
        </div>
        <Link href="/micro-intern/post">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Posting Project
          </Button>
        </Link>
      </div>

      {/* Search & Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <form onSubmit={handleSearch} className="space-y-4">
            {/* Search bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari project berdasarkan judul, deskripsi, atau perusahaan..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filter row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {/* Skill filter */}
              <Select value={selectedSkill} onValueChange={setSelectedSkill}>
                <SelectTrigger>
                  <SelectValue placeholder="Skill" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Skill</SelectItem>
                  {SKILL_OPTIONS.map((skill) => (
                    <SelectItem key={skill} value={skill}>
                      {skill}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Duration filter */}
              <Select value={durationFilter} onValueChange={setDurationFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Durasi" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Durasi</SelectItem>
                  <SelectItem value="7">&le; 1 minggu</SelectItem>
                  <SelectItem value="14">&le; 2 minggu</SelectItem>
                  <SelectItem value="30">&le; 1 bulan</SelectItem>
                  <SelectItem value="90">&le; 3 bulan</SelectItem>
                </SelectContent>
              </Select>

              {/* Budget min */}
              <Input
                type="number"
                placeholder="Budget min (Rp)"
                value={budgetMin}
                onChange={(e) => setBudgetMin(e.target.value)}
              />

              {/* Budget max */}
              <Input
                type="number"
                placeholder="Budget max (Rp)"
                value={budgetMax}
                onChange={(e) => setBudgetMax(e.target.value)}
              />

              {/* Type filter */}
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Tipe" />
                </SelectTrigger>
                <SelectContent>
                  {TYPE_FILTERS.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Results info */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-muted-foreground">
          {isLoading ? "Memuat..." : `${total} project ditemukan`}
        </p>
      </div>

      {/* Error state */}
      {error && (
        <Card className="mb-6 border-destructive">
          <CardContent className="pt-6 text-center text-destructive">
            <p>{error}</p>
            <Button variant="outline" className="mt-3" onClick={fetchProjects}>
              Coba Lagi
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Loading skeletons */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <ProjectCardSkeleton key={i} />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && !error && projects.length === 0 && (
        <Card className="py-16">
          <CardContent className="text-center">
            <FolderOpen className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Belum ada project</h3>
            <p className="text-muted-foreground mb-4">
              Belum ada project yang sesuai dengan filter kamu. Coba ubah filter atau kembali lagi nanti.
            </p>
            <Button variant="outline" onClick={() => {
              setSearchQuery("");
              setSelectedSkill("all");
              setDurationFilter("all");
              setBudgetMin("");
              setBudgetMax("");
              setTypeFilter("all");
            }}>
              Reset Filter
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Project grid */}
      {!isLoading && projects.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => (
            <Card key={project.id} className="overflow-hidden hover:shadow-md transition-shadow flex flex-col">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-base leading-snug line-clamp-2">
                    <Link
                      href={`/micro-intern/${project.id}`}
                      className="hover:text-primary transition-colors"
                    >
                      {project.title}
                    </Link>
                  </CardTitle>
                  <TypeBadge type={project.type} />
                </div>
                {project.company && (
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <Building2 className="h-3.5 w-3.5" />
                    {project.company.name}
                  </p>
                )}
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                  {truncate(project.description, 120)}
                </p>

                {/* Skills */}
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {project.skills.slice(0, 4).map((skill) => (
                    <Badge key={skill} variant="secondary" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                  {project.skills.length > 4 && (
                    <Badge variant="secondary" className="text-xs">
                      +{project.skills.length - 4}
                    </Badge>
                  )}
                </div>

                {/* Meta info */}
                <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground mb-4">
                  <div className="flex items-center gap-1.5">
                    <DollarSign className="h-3.5 w-3.5" />
                    <span>{formatSalary(project.budget)}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5" />
                    <span>{project.duration} hari</span>
                  </div>
                </div>

                {/* Difficulty + applicants */}
                <div className="flex items-center justify-between text-sm mb-4">
                  <DifficultyStars level={project.difficulty} />
                  <span className="text-muted-foreground flex items-center gap-1">
                    <Users className="h-3.5 w-3.5" />
                    {project.applicantCount} pelamar
                  </span>
                </div>

                {/* Apply button */}
                <div className="mt-auto">
                  <Link href={`/micro-intern/${project.id}`}>
                    <Button className="w-full" size="sm">
                      Lihat Detail & Lamar
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {!isLoading && totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(totalPages, 7) }).map((_, i) => {
              let pageNum: number;
              if (totalPages <= 7) {
                pageNum = i + 1;
              } else if (page <= 4) {
                pageNum = i + 1;
              } else if (page >= totalPages - 3) {
                pageNum = totalPages - 6 + i;
              } else {
                pageNum = page - 3 + i;
              }
              return (
                <Button
                  key={pageNum}
                  variant={pageNum === page ? "default" : "outline"}
                  size="icon"
                  className="h-9 w-9"
                  onClick={() => setPage(pageNum)}
                >
                  {pageNum}
                </Button>
              );
            })}
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
