"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Search,
  MapPin,
  Briefcase,
  Clock,
  Filter,
  Users,
  TrendingUp,
  ChevronDown,
  X,
  BarChart3,
  ArrowUpDown,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import api from "@/lib/api";
import { formatSalary, cn } from "@/lib/utils";
import type { SalaryData } from "@/lib/types";

const LOCATIONS = [
  "Semua Lokasi",
  "Jakarta",
  "Surabaya",
  "Bandung",
  "Semarang",
  "Yogyakarta",
  "Medan",
  "Makassar",
  "Bali",
  "Tangerang",
  "Bekasi",
];

const EXPERIENCE_LEVELS = [
  { value: "all", label: "Semua Level" },
  { value: "0-1", label: "Fresh Graduate (0-1 tahun)" },
  { value: "1-3", label: "Junior (1-3 tahun)" },
  { value: "3-5", label: "Mid (3-5 tahun)" },
  { value: "5-10", label: "Senior (5-10 tahun)" },
  { value: "10+", label: "Expert (10+ tahun)" },
];

function SalarySearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialQuery = searchParams.get("q") || "";

  const [query, setQuery] = useState(initialQuery);
  const [location, setLocation] = useState("Semua Lokasi");
  const [experience, setExperience] = useState("all");
  const [results, setResults] = useState<SalaryData[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [sortBy, setSortBy] = useState<"median" | "sampleSize">("median");
  const [showFilters, setShowFilters] = useState(false);

  const doSearch = useCallback(async () => {
    if (!query.trim()) return;
    setLoading(true);
    setSearched(true);
    try {
      const params: Record<string, string> = { q: query.trim() };
      if (location !== "Semua Lokasi") params.location = location;
      if (experience !== "all") params.experience = experience;
      const res = await api.get<SalaryData[]>("/salary/search", { params });
      setResults(res.data);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [query, location, experience]);

  useEffect(() => {
    if (initialQuery) doSearch();
  }, []);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    doSearch();
  }

  function clearFilters() {
    setLocation("Semua Lokasi");
    setExperience("all");
  }

  const hasActiveFilters = location !== "Semua Lokasi" || experience !== "all";

  const sortedResults = [...results].sort((a, b) => {
    if (sortBy === "median") return b.median - a.median;
    return b.sampleSize - a.sampleSize;
  });

  function getConfidenceLevel(sampleSize: number): { label: string; color: string } {
    if (sampleSize >= 100) return { label: "Tinggi", color: "text-green-600 bg-green-50" };
    if (sampleSize >= 30) return { label: "Sedang", color: "text-yellow-600 bg-yellow-50" };
    return { label: "Rendah", color: "text-red-600 bg-red-50" };
  }

  return (
    <div className="container mx-auto max-w-5xl px-4 py-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Cari Data Gaji</h1>
        <p className="text-muted-foreground mt-1">
          Temukan informasi gaji berdasarkan posisi dan lokasi
        </p>
      </div>

      {/* Search Form */}
      <Card>
        <CardContent className="p-4 sm:p-6 space-y-4">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Masukkan nama posisi..."
                className="pl-10"
              />
            </div>
            <Button type="submit" disabled={loading || !query.trim()}>
              {loading ? "Mencari..." : "Cari"}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => setShowFilters(!showFilters)}
              className={cn(showFilters && "bg-muted")}
            >
              <Filter className="h-4 w-4" />
            </Button>
          </form>

          {/* Filters */}
          {showFilters && (
            <div className="grid gap-4 pt-4 border-t sm:grid-cols-2">
              <div className="space-y-2">
                <Label className="flex items-center gap-1.5 text-xs">
                  <MapPin className="h-3.5 w-3.5" /> Lokasi
                </Label>
                <Select value={location} onValueChange={setLocation}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {LOCATIONS.map((loc) => (
                      <SelectItem key={loc} value={loc}>
                        {loc}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-1.5 text-xs">
                  <Clock className="h-3.5 w-3.5" /> Pengalaman
                </Label>
                <Select value={experience} onValueChange={setExperience}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {EXPERIENCE_LEVELS.map((exp) => (
                      <SelectItem key={exp.value} value={exp.value}>
                        {exp.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {hasActiveFilters && (
                <div className="sm:col-span-2">
                  <Button variant="ghost" size="sm" onClick={clearFilters} className="text-xs">
                    <X className="h-3 w-3 mr-1" /> Hapus filter
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results */}
      {searched && (
        <div className="space-y-4">
          {/* Results header */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {loading ? "Mencari..." : `${results.length} hasil ditemukan`}
            </p>
            {!loading && results.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Urutkan:</span>
                <Button
                  variant={sortBy === "median" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSortBy("median")}
                  className="text-xs h-7"
                >
                  <TrendingUp className="h-3 w-3 mr-1" /> Gaji
                </Button>
                <Button
                  variant={sortBy === "sampleSize" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSortBy("sampleSize")}
                  className="text-xs h-7"
                >
                  <Users className="h-3 w-3 mr-1" /> Jumlah Data
                </Button>
              </div>
            )}
          </div>

          {/* Loading */}
          {loading && (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-5 space-y-3">
                    <Skeleton className="h-5 w-1/3" />
                    <Skeleton className="h-3 w-full" />
                    <div className="flex gap-4">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Results list */}
          {!loading && sortedResults.map((item, idx) => {
            const confidence = getConfidenceLevel(item.sampleSize);
            const rangePercent = item.max > item.min
              ? ((item.p75 - item.p25) / (item.max - item.min)) * 100
              : 50;
            const medianPos = item.max > item.min
              ? ((item.median - item.min) / (item.max - item.min)) * 100
              : 50;
            const p25Pos = item.max > item.min
              ? ((item.p25 - item.min) / (item.max - item.min)) * 100
              : 25;

            return (
              <Card key={`${item.position}-${item.location}-${idx}`} className="transition-all hover:shadow-md">
                <CardContent className="p-5 sm:p-6 space-y-4">
                  {/* Top row */}
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-semibold text-lg">{item.position}</h3>
                      <div className="flex flex-wrap items-center gap-2 mt-1">
                        {item.location && (
                          <span className="flex items-center gap-1 text-sm text-muted-foreground">
                            <MapPin className="h-3.5 w-3.5" /> {item.location}
                          </span>
                        )}
                        {item.industry && (
                          <span className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Briefcase className="h-3.5 w-3.5" /> {item.industry}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={cn("text-xs", confidence.color)}>
                        {confidence.label}
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        <Users className="h-3 w-3 mr-1" /> {item.sampleSize} data
                      </Badge>
                    </div>
                  </div>

                  {/* Salary Range Bar */}
                  <div className="space-y-2">
                    <div className="relative h-6 w-full rounded-full bg-muted/80 overflow-hidden">
                      {/* Full range background */}
                      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5" />
                      {/* IQR bar (P25-P75) */}
                      <div
                        className="absolute top-0 h-full rounded-full bg-primary/25"
                        style={{
                          left: `${p25Pos}%`,
                          width: `${rangePercent}%`,
                        }}
                      />
                      {/* Inner darker bar for visual emphasis */}
                      <div
                        className="absolute top-1 bottom-1 rounded-full bg-primary/50"
                        style={{
                          left: `${p25Pos + rangePercent * 0.2}%`,
                          width: `${rangePercent * 0.6}%`,
                        }}
                      />
                      {/* Median marker */}
                      <div
                        className="absolute top-0 bottom-0 w-0.5 bg-primary"
                        style={{ left: `${medianPos}%` }}
                      >
                        <div className="absolute -top-1 left-1/2 -translate-x-1/2 h-2 w-2 rounded-full bg-primary" />
                        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 h-2 w-2 rounded-full bg-primary" />
                      </div>
                    </div>

                    {/* Labels */}
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{formatSalary(item.min)}</span>
                      <span className="font-medium text-foreground">P25: {formatSalary(item.p25)}</span>
                      <span className="font-bold text-primary text-sm">Median: {formatSalary(item.median)}</span>
                      <span className="font-medium text-foreground">P75: {formatSalary(item.p75)}</span>
                      <span>{formatSalary(item.max)}</span>
                    </div>
                  </div>

                  {/* Stats row */}
                  <div className="grid grid-cols-3 gap-3 pt-2 border-t">
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground">Rentang 25%-75%</p>
                      <p className="text-sm font-semibold">
                        {formatSalary(item.p25)} – {formatSalary(item.p75)}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground">Median</p>
                      <p className="text-sm font-semibold text-primary">{formatSalary(item.median)}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground">Sample Size</p>
                      <p className="text-sm font-semibold">{item.sampleSize} responden</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}

          {/* Empty */}
          {!loading && results.length === 0 && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                <Search className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="font-semibold mb-1">Tidak ada hasil</h3>
                <p className="text-sm text-muted-foreground max-w-sm">
                  Coba kata kunci lain atau ubah filter pencarian Anda.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Initial state - not searched yet */}
      {!searched && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <BarChart3 className="h-16 w-16 text-muted-foreground/50 mb-4" />
            <h3 className="font-semibold text-lg mb-1">Mulai Cari Gaji</h3>
            <p className="text-sm text-muted-foreground max-w-md">
              Ketik posisi yang ingin Anda cari di atas, lalu tekan &quot;Cari&quot; untuk melihat data gaji pasar.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default function SalarySearchPage() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto max-w-5xl px-4 py-8">
          <div className="space-y-4">
            <Skeleton className="h-8 w-1/3" />
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
        </div>
      }
    >
      <SalarySearchContent />
    </Suspense>
  );
}
