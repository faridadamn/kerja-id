"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import api from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Target, TrendingUp, BookOpen, ArrowRight, BarChart3 } from "lucide-react";

interface SkillTrend {
  name: string;
  count: number;
}

export default function SkillsPage() {
  const [trending, setTrending] = useState<SkillTrend[]>([]);
  const [loading, setLoading] = useState(true);
  const [industry, setIndustry] = useState("");

  useEffect(() => {
    fetchTrending();
  }, [industry]);

  const fetchTrending = async () => {
    try {
      setLoading(true);
      const url = industry ? `/skills/industry/${industry}` : "/skills/trending";
      const res = await api.get(url);
      setTrending(res.data);
    } catch {
      setTrending([]);
    } finally {
      setLoading(false);
    }
  };

  const maxCount = trending.length > 0 ? Math.max(...trending.map((s) => s.count)) : 1;

  return (
    <div className="container py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Skill Gap Analyzer</h1>
        <p className="text-muted-foreground mt-2">
          Ketahui skill yang dibutuhkan industri dan temukan gap yang perlu ditutup
        </p>
      </div>

      {/* CTA Cards */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Target className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle>Skill Assessment</CardTitle>
                <CardDescription>Uji kemampuanmu dan dapatkan sertifikat digital</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Link href="/skills/assessment">
              <Button className="w-full">
                Mulai Assessment <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-100">
                <BarChart3 className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <CardTitle>Gap Analysis</CardTitle>
                <CardDescription>Visualisasikan gap antara skill kamu dan kebutuhan industri</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Link href="/skills/gap">
              <Button className="w-full" variant="outline">
                Lihat Gap Analysis <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Industry Filter */}
      <div className="flex gap-2 flex-wrap">
        {["", "Tech", "Finance", "Marketing", "Healthcare", "Education"].map((ind) => (
          <Button
            key={ind}
            variant={industry === ind ? "default" : "outline"}
            size="sm"
            onClick={() => setIndustry(ind)}
          >
            {ind || "Semua Industri"}
          </Button>
        ))}
      </div>

      {/* Trending Skills */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Skill yang Paling Dibutuhkan
          </CardTitle>
          <CardDescription>Berdasarkan analisis lowongan kerja terbaru</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 10 }).map((_, i) => (
                <Skeleton key={i} className="h-8 w-full" />
              ))}
            </div>
          ) : trending.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">Belum ada data skill tersedia</p>
          ) : (
            <div className="space-y-3">
              {trending.map((skill, i) => (
                <div key={skill.name} className="flex items-center gap-3">
                  <span className="text-sm font-medium w-6 text-muted-foreground">{i + 1}</span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">{skill.name}</span>
                      <span className="text-xs text-muted-foreground">{skill.count} lowongan</span>
                    </div>
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all"
                        style={{ width: `${(skill.count / maxCount) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
