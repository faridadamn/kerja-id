"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Target, TrendingDown, TrendingUp, BookOpen, ExternalLink, ArrowRight } from "lucide-react";

interface GapItem {
  name: string;
  myLevel: number;
  demand: number;
  priority: "high" | "medium" | "low";
}

interface Recommendation {
  skill: string;
  courses: { title: string; provider: string; url: string; rating: number; price: string }[];
}

export default function GapAnalysisPage() {
  const [gaps, setGaps] = useState<GapItem[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [gapRes, recRes] = await Promise.all([
        api.get("/skills/gap").catch(() => ({ data: [] })),
        api.get("/skills/recommendations").catch(() => ({ data: [] })),
      ]);
      setGaps(gapRes.data);
      setRecommendations(recRes.data);
    } catch {
      // fallback demo data
      setGaps([
        { name: "React", myLevel: 3, demand: 5, priority: "high" },
        { name: "TypeScript", myLevel: 2, demand: 4, priority: "high" },
        { name: "Docker", myLevel: 1, demand: 4, priority: "high" },
        { name: "Python", myLevel: 3, demand: 4, priority: "medium" },
        { name: "SQL", myLevel: 4, demand: 4, priority: "low" },
        { name: "Communication", myLevel: 4, demand: 5, priority: "medium" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (p: string) => {
    switch (p) {
      case "high": return "bg-red-100 text-red-800";
      case "medium": return "bg-yellow-100 text-yellow-800";
      default: return "bg-green-100 text-green-800";
    }
  };

  const highGaps = gaps.filter((g) => g.priority === "high");
  const mediumGaps = gaps.filter((g) => g.priority === "medium");
  const lowGaps = gaps.filter((g) => g.priority === "low");

  if (loading) {
    return (
      <div className="container py-8 space-y-4">
        <Skeleton className="h-12 w-1/3" />
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-20 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="container py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Gap Analysis</h1>
        <p className="text-muted-foreground mt-2">
          {highGaps.length > 0
            ? `Kamu perlu meningkatkan ${highGaps.length} skill untuk kompetitif`
            : "Skill kamu sudah cukup kompetitif! 👍"}
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-600">{highGaps.length}</div>
            <div className="text-sm text-muted-foreground">Gap Tinggi</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">{mediumGaps.length}</div>
            <div className="text-sm text-muted-foreground">Gap Sedang</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{lowGaps.length}</div>
            <div className="text-sm text-muted-foreground">Sudah Match</div>
          </CardContent>
        </Card>
      </div>

      {/* Radar-style visual (simplified as horizontal bars) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Skill Kamu vs Kebutuhan Industri
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {gaps.map((gap) => (
            <div key={gap.name} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-medium text-sm">{gap.name}</span>
                <Badge className={getPriorityColor(gap.priority)} variant="secondary">
                  {gap.priority === "high" ? "Prioritas Tinggi" : gap.priority === "medium" ? "Sedang" : "Match"}
                </Badge>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Skill Kamu: {gap.myLevel}/5</div>
                  <Progress value={(gap.myLevel / 5) * 100} />
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Kebutuhan: {gap.demand}/5</div>
                  <Progress value={(gap.demand / 5) * 100} className="[&>div]:bg-orange-500" />
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Rekomendasi Belajar
            </CardTitle>
            <CardDescription>Kursus untuk menutup skill gap</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recommendations.map((rec) => (
              <div key={rec.skill}>
                <h4 className="font-medium mb-2">{rec.skill}</h4>
                <div className="grid md:grid-cols-2 gap-2">
                  {rec.courses.map((course, i) => (
                    <a
                      key={i}
                      href={course.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent transition-colors"
                    >
                      <div>
                        <div className="text-sm font-medium">{course.title}</div>
                        <div className="text-xs text-muted-foreground">
                          {course.provider} · ⭐ {course.rating} · {course.price}
                        </div>
                      </div>
                      <ExternalLink className="h-4 w-4 text-muted-foreground" />
                    </a>
                  ))}
                </div>
                <Separator className="mt-4" />
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
