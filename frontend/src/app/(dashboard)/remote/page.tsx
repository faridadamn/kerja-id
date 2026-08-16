"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MapPin, Wifi, Building2, DollarSign, BookOpen, Globe, ArrowRight, Star } from "lucide-react";

interface RemoteJob {
  id: string;
  title: string;
  company: string;
  location: string;
  salaryMin?: number;
  salaryMax?: number;
  type: string;
  skills: string[];
}

interface RemoteCompany {
  id: string;
  name: string;
  logoUrl?: string;
  remotePolicy: string;
  tools: string[];
  rating: number;
  industry: string;
}

interface CityCost {
  city: string;
  housing: number;
  food: number;
  transport: number;
  internet: number;
  total: number;
}

export default function RemoteHubPage() {
  const [tab, setTab] = useState("jobs");
  const [jobs, setJobs] = useState<RemoteJob[]>([]);
  const [companies, setCompanies] = useState<RemoteCompany[]>([]);
  const [cities, setCities] = useState<CityCost[]>([]);
  const [compareCities, setCompareCities] = useState<string[]>(["Jakarta", "Yogyakarta"]);
  const [remoteType, setRemoteType] = useState("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [tab, remoteType]);

  const fetchData = async () => {
    try {
      setLoading(true);
      if (tab === "jobs") {
        const typeParam = remoteType === "all" ? "" : remoteType;
        const res = await api.get(`/remote/jobs?q=${search}&type=${typeParam}`);
        setJobs(res.data.jobs || res.data || []);
      } else if (tab === "companies") {
        const res = await api.get("/remote/companies");
        setCompanies(res.data.companies || res.data || []);
      } else if (tab === "calculator") {
        const res = await api.get(`/remote/calculator?cities=${compareCities.join(",")}`);
        setCities(res.data || []);
      }
    } catch {
      // Fallback demo data
      if (tab === "jobs") {
        setJobs([
          { id: "1", title: "Frontend Developer", company: "TechCorp", location: "Remote", salaryMin: 8000000, salaryMax: 15000000, type: "FULL_TIME", skills: ["React", "TypeScript"] },
          { id: "2", title: "UI/UX Designer", company: "DesignStudio", location: "Hybrid - Bandung", salaryMin: 6000000, salaryMax: 12000000, type: "FULL_TIME", skills: ["Figma", "UI Design"] },
          { id: "3", title: "Data Analyst", company: "DataCo", location: "Remote", salaryMin: 7000000, salaryMax: 13000000, type: "CONTRACT", skills: ["Python", "SQL"] },
        ]);
      } else if (tab === "companies") {
        setCompanies([
          { id: "1", name: "Tokopedia", remotePolicy: "Hybrid (3 WFO, 2 WFH)", tools: ["Slack", "Notion", "Zoom"], rating: 4.5, industry: "E-commerce" },
          { id: "2", name: "Gojek", remotePolicy: "Full Remote untuk engineering", tools: ["Teams", "Jira", "GitHub"], rating: 4.3, industry: "Tech" },
          { id: "3", name: "Traveloka", remotePolicy: "Flexible - bisa remote penuh", tools: ["Slack", "Confluence", "Figma"], rating: 4.4, industry: "Travel" },
        ]);
      } else {
        setCities([
          { city: "Jakarta", housing: 4000000, food: 2500000, transport: 500000, internet: 400000, total: 7400000 },
          { city: "Yogyakarta", housing: 1500000, food: 1500000, transport: 200000, internet: 350000, total: 3550000 },
        ]);
      }
    } finally {
      setLoading(false);
    }
  };

  const formatSalary = (min?: number, max?: number) => {
    if (!min && !max) return "Negotiable";
    const fmt = (n: number) => `Rp ${(n / 1_000_000).toFixed(0)} juta`;
    if (min && max) return `${fmt(min)} - ${fmt(max)}`;
    if (min) return `Mulai ${fmt(min)}`;
    return `Hingga ${fmt(max!)}`;
  };

  return (
    <div className="container py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Wifi className="h-8 w-8 text-primary" />
          KerjaDariMana
        </h1>
        <p className="text-muted-foreground mt-2">Remote work & lowongan di seluruh Indonesia</p>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="jobs">Remote Jobs</TabsTrigger>
          <TabsTrigger value="companies">Perusahaan</TabsTrigger>
          <TabsTrigger value="calculator">Cost of Living</TabsTrigger>
          <TabsTrigger value="resources">Resources</TabsTrigger>
        </TabsList>

        {/* Remote Jobs */}
        <TabsContent value="jobs" className="space-y-4">
          <div className="flex gap-2 flex-wrap">
            <Input placeholder="Cari remote job..." value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-sm" />
            {["all", "remote", "hybrid", "onsite"].map((t) => (
              <Button key={t} variant={remoteType === t ? "default" : "outline"} size="sm" onClick={() => setRemoteType(t)}>
                {t === "all" ? "Semua" : t === "remote" ? "100% Remote" : t === "hybrid" ? "Hybrid" : "Onsite"}
              </Button>
            ))}
          </div>
          {loading ? (
            <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24 w-full" />)}</div>
          ) : jobs.length === 0 ? (
            <Card><CardContent className="p-8 text-center text-muted-foreground">Tidak ada remote job ditemukan</CardContent></Card>
          ) : (
            <div className="space-y-3">
              {jobs.map((job) => (
                <Card key={job.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold">{job.title}</h3>
                        <p className="text-sm text-muted-foreground">{job.company}</p>
                        <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                          <MapPin className="h-3 w-3" /> {job.location}
                        </div>
                        <div className="flex gap-1 mt-2 flex-wrap">
                          {job.skills.map((s) => <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>)}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">{formatSalary(job.salaryMin, job.salaryMax)}</div>
                        <Badge variant="outline" className="mt-1">{job.type.replace("_", " ")}</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Companies */}
        <TabsContent value="companies" className="space-y-4">
          {loading ? (
            <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-20 w-full" />)}</div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {companies.map((c) => (
                <Card key={c.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Building2 className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold">{c.name}</h3>
                        <p className="text-xs text-muted-foreground">{c.industry}</p>
                        <p className="text-sm mt-1">{c.remotePolicy}</p>
                        <div className="flex gap-1 mt-2 flex-wrap">
                          {c.tools.map((t) => <Badge key={t} variant="outline" className="text-xs">{t}</Badge>)}
                        </div>
                        <div className="flex items-center gap-1 mt-1">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm">{c.rating}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Cost of Living */}
        <TabsContent value="calculator" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" /> Cost of Living Calculator
              </CardTitle>
              <CardDescription>Bandingkan biaya hidup antar kota di Indonesia</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2 mb-4">
                {compareCities.map((city, i) => (
                  <Input key={i} value={city} onChange={(e) => {
                    const newCities = [...compareCities];
                    newCities[i] = e.target.value;
                    setCompareCities(newCities);
                  }} className="max-w-xs" />
                ))}
                <Button variant="outline" size="sm" onClick={() => setCompareCities([...compareCities, ""])}>+ Tambah Kota</Button>
                <Button size="sm" onClick={fetchData}>Bandingkan</Button>
              </div>
              {cities.length > 0 && (
                <div className="grid md:grid-cols-2 gap-4">
                  {cities.map((c) => (
                    <Card key={c.city}>
                      <CardContent className="p-4">
                        <h3 className="font-semibold text-lg mb-3">{c.city}</h3>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between"><span>🏠 Sewa Kos/Rumah</span><span>Rp {c.housing.toLocaleString("id-ID")}</span></div>
                          <div className="flex justify-between"><span>🍚 Makan</span><span>Rp {c.food.toLocaleString("id-ID")}</span></div>
                          <div className="flex justify-between"><span>🚗 Transport</span><span>Rp {c.transport.toLocaleString("id-ID")}</span></div>
                          <div className="flex justify-between"><span>📶 Internet</span><span>Rp {c.internet.toLocaleString("id-ID")}</span></div>
                          <div className="flex justify-between font-bold border-t pt-2"><span>Total/bulan</span><span>Rp {c.total.toLocaleString("id-ID")}</span></div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Resources */}
        <TabsContent value="resources" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            {[
              { title: "Setup Home Office", desc: "Panduan lengkap WFH yang produktif", icon: "🏠" },
              { title: "Internet Recommendation", desc: "Rekomendasi ISP terbaik per kota", icon: "📶" },
              { title: "Time Management", desc: "Tips mengelola waktu kerja remote", icon: "⏰" },
              { title: "Remote Tools", desc: "Tools wajib untuk remote worker", icon: "🛠️" },
              { title: "Coworking Spaces", desc: "Daftar coworking space di Indonesia", icon: "🏢" },
              { title: "Community Forum", desc: "Bergabung dengan komunitas remote workers", icon: "👥" },
            ].map((r) => (
              <Card key={r.title} className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4 flex items-start gap-3">
                  <span className="text-2xl">{r.icon}</span>
                  <div>
                    <h3 className="font-semibold">{r.title}</h3>
                    <p className="text-sm text-muted-foreground">{r.desc}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
