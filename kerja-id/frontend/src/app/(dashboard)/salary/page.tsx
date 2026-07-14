"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  TrendingUp,
  MapPin,
  Briefcase,
  BarChart3,
  Calculator,
  ArrowRight,
  Users,
  ChevronRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import api from "@/lib/api";
import { formatSalary } from "@/lib/utils";
import type { SalaryData } from "@/lib/types";

const POPULAR_POSITIONS = [
  { title: "Software Engineer", icon: "💻", category: "Teknologi" },
  { title: "Product Manager", icon: "📊", category: "Produk" },
  { title: "UI/UX Designer", icon: "🎨", category: "Desain" },
  { title: "Data Analyst", icon: "📈", category: "Data" },
  { title: "Marketing Manager", icon: "📢", category: "Pemasaran" },
  { title: "Accountant", icon: "🧮", category: "Keuangan" },
  { title: "HR Manager", icon: "👥", category: "HR" },
  { title: "Business Analyst", icon: "💼", category: "Bisnis" },
  { title: "DevOps Engineer", icon: "⚙️", category: "Teknologi" },
  { title: "Content Writer", icon: "✍️", category: "Konten" },
  { title: "Sales Executive", icon: "🤝", category: "Penjualan" },
  { title: "Project Manager", icon: "📋", category: "Manajemen" },
];

export default function SalaryLandingPage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [recentData, setRecentData] = useState<SalaryData[]>([]);
  const [loading, setLoading] = useState(true);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchRecentData();
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function fetchRecentData() {
    try {
      const res = await api.get<SalaryData[]>("/salary/search", {
        params: { q: "", limit: 6 },
      });
      setRecentData(res.data);
    } catch {
      setRecentData([]);
    } finally {
      setLoading(false);
    }
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/salary/search?q=${encodeURIComponent(query.trim())}`);
    }
  }

  function handleInputChange(value: string) {
    setQuery(value);
    if (value.length >= 2) {
      const filtered = POPULAR_POSITIONS.filter((p) =>
        p.title.toLowerCase().includes(value.toLowerCase())
      ).map((p) => p.title);
      setSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
    } else {
      setShowSuggestions(false);
    }
  }

  function selectSuggestion(s: string) {
    setQuery(s);
    setShowSuggestions(false);
    router.push(`/salary/search?q=${encodeURIComponent(s)}`);
  }

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8 space-y-10">
      {/* Hero */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
          <BarChart3 className="h-4 w-4" />
          Salary Insight
        </div>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
          Cek Gaji Pasar <span className="text-primary">Indonesia</span>
        </h1>
        <p className="mx-auto max-w-2xl text-muted-foreground">
          Bandingkan gaji berdasarkan posisi, lokasi, dan pengalaman. Data dari komunitas profesional Indonesia.
        </p>
      </div>

      {/* Search Bar */}
      <div className="mx-auto max-w-2xl" ref={wrapperRef}>
        <form onSubmit={handleSearch} className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => handleInputChange(e.target.value)}
            onFocus={() => query.length >= 2 && suggestions.length > 0 && setShowSuggestions(true)}
            placeholder="Cari posisi, misal: Software Engineer..."
            className="h-14 pl-12 pr-28 text-base rounded-xl shadow-lg"
          />
          <Button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg px-6">
            Cari
          </Button>

          {/* Autocomplete */}
          {showSuggestions && (
            <div className="absolute top-full left-0 right-0 z-50 mt-2 rounded-xl border bg-background shadow-lg">
              {suggestions.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => selectSuggestion(s)}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm hover:bg-accent transition-colors"
                >
                  <Briefcase className="h-4 w-4 text-muted-foreground" />
                  {s}
                </button>
              ))}
            </div>
          )}
        </form>

        {/* Quick links */}
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-sm">
          <span className="text-muted-foreground">Populer:</span>
          {["Software Engineer", "Data Analyst", "Product Manager"].map((p) => (
            <button
              key={p}
              onClick={() => router.push(`/salary/search?q=${encodeURIComponent(p)}`)}
              className="rounded-full bg-muted px-3 py-1 text-xs font-medium hover:bg-primary hover:text-primary-foreground transition-colors"
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* CTA Cards */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Link href="/salary/calculator">
          <Card className="group cursor-pointer transition-all hover:shadow-md hover:border-primary/50">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Calculator className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">Kalkulator Gaji</h3>
                <p className="text-sm text-muted-foreground">
                  Estimasi gaji berdasarkan profil Anda
                </p>
              </div>
              <ArrowRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1" />
            </CardContent>
          </Card>
        </Link>
        <Link href="/salary/submit">
          <Card className="group cursor-pointer transition-all hover:shadow-md hover:border-primary/50">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-green-500/10 text-green-600">
                <Users className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">Kontribusi Data Gaji</h3>
                <p className="text-sm text-muted-foreground">
                  Bantu komunitas dengan data gaji anonim Anda
                </p>
              </div>
              <ArrowRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1" />
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Popular Positions Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Posisi Populer</h2>
          <Link href="/salary/search" className="text-sm text-primary hover:underline flex items-center gap-1">
            Lihat semua <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {POPULAR_POSITIONS.map((pos) => (
            <Link key={pos.title} href={`/salary/search?q=${encodeURIComponent(pos.title)}`}>
              <Card className="group cursor-pointer transition-all hover:shadow-md hover:border-primary/50 h-full">
                <CardContent className="flex items-center gap-3 p-4">
                  <span className="text-2xl">{pos.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{pos.title}</p>
                    <p className="text-xs text-muted-foreground">{pos.category}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Highlights */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Data Gaji Terbaru</h2>
        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-5 space-y-3">
                  <Skeleton className="h-5 w-2/3" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-4 w-1/3" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : recentData.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {recentData.map((item) => (
              <Link key={item.position} href={`/salary/search?q=${encodeURIComponent(item.position)}`}>
                <Card className="group cursor-pointer transition-all hover:shadow-md h-full">
                  <CardContent className="p-5 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-sm">{item.position}</h3>
                        {item.location && (
                          <p className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                            <MapPin className="h-3 w-3" />
                            {item.location}
                          </p>
                        )}
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {item.sampleSize} data
                      </Badge>
                    </div>

                    {/* Salary range bar */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{formatSalary(item.p25)}</span>
                        <span>{formatSalary(item.p75)}</span>
                      </div>
                      <div className="relative h-2 w-full rounded-full bg-muted">
                        <div
                          className="absolute h-full rounded-full bg-primary/30"
                          style={{ left: "0%", width: "100%" }}
                        />
                        <div
                          className="absolute h-full rounded-full bg-primary"
                          style={{
                            left: `${((item.p25 - item.min) / (item.max - item.min)) * 100}%`,
                            width: `${((item.p75 - item.p25) / (item.max - item.min)) * 100}%`,
                          }}
                        />
                        {/* Median marker */}
                        <div
                          className="absolute top-1/2 -translate-y-1/2 h-4 w-1 rounded bg-primary-foreground border border-primary"
                          style={{
                            left: `${((item.median - item.min) / (item.max - item.min)) * 100}%`,
                          }}
                        />
                      </div>
                      <p className="text-center text-sm font-semibold text-primary">
                        Median: {formatSalary(item.median)}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <BarChart3 className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Belum ada data gaji tersedia</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Stats Banner */}
      <Card className="bg-muted/50">
        <CardContent className="grid gap-6 p-6 sm:grid-cols-3">
          <div className="text-center">
            <p className="text-2xl font-bold text-primary">10K+</p>
            <p className="text-sm text-muted-foreground">Data Gaji</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-primary">500+</p>
            <p className="text-sm text-muted-foreground">Posisi</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-primary">50+</p>
            <p className="text-sm text-muted-foreground">Kota</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
