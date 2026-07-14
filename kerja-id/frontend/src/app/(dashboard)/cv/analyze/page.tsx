"use client";

import { useState } from "react";
import Link from "next/link";
import api from "@/lib/api";
import type { CvAnalysis } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Search,
  Loader2,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Lightbulb,
  ArrowRight,
  Target,
  Sparkles,
  TrendingUp,
  FileSearch,
} from "lucide-react";

export default function CvAnalyzePage() {
  const [cvText, setCvText] = useState("");
  const [targetPosition, setTargetPosition] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<CvAnalysis | null>(null);

  async function handleAnalyze() {
    if (!cvText.trim()) {
      setError("Masukkan teks CV Anda.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const res = await api.post<CvAnalysis>("/cv/analyze", {
        cvText: cvText.trim(),
        targetPosition: targetPosition.trim() || undefined,
      });
      setResult(res.data);
    } catch (err: any) {
      setError(err.response?.data?.message || "Gagal menganalisis CV. Coba lagi.");
    } finally {
      setLoading(false);
    }
  }

  function getScoreColor(score: number) {
    if (score >= 80) return { ring: "stroke-green-500", text: "text-green-600", bg: "bg-green-500" };
    if (score >= 60) return { ring: "stroke-yellow-500", text: "text-yellow-600", bg: "bg-yellow-500" };
    return { ring: "stroke-red-500", text: "text-red-600", bg: "bg-red-500" };
  }

  function getPriorityIcon(priority: string) {
    switch (priority) {
      case "high":
        return <AlertCircle className="h-4 w-4 text-red-500 shrink-0" />;
      case "medium":
        return <Lightbulb className="h-4 w-4 text-yellow-500 shrink-0" />;
      default:
        return <CheckCircle2 className="h-4 w-4 text-blue-500 shrink-0" />;
    }
  }

  function getCompatibilityBadge(compat: string) {
    switch (compat) {
      case "high":
        return <Badge variant="success">Kompatibilitas Tinggi</Badge>;
      case "medium":
        return <Badge variant="warning">Kompatibilitas Sedang</Badge>;
      default:
        return <Badge variant="destructive">Kompatibilitas Rendah</Badge>;
    }
  }

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <FileSearch className="h-6 w-6" />
          Analisis CV
        </h1>
        <p className="text-muted-foreground mt-1">
          Dapatkan analisis mendalam dan saran perbaikan untuk CV Anda
        </p>
      </div>

      {/* Input Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Masukkan CV Anda</CardTitle>
          <CardDescription>
            Tempelkan isi CV Anda di bawah untuk mendapatkan analisis ATS
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="cvText">Teks CV *</Label>
            <Textarea
              id="cvText"
              placeholder="Tempelkan isi CV Anda di sini..."
              value={cvText}
              onChange={(e) => setCvText(e.target.value)}
              rows={12}
              className="resize-y"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="targetPosition">Posisi Target (opsional)</Label>
            <Input
              id="targetPosition"
              placeholder="Contoh: Frontend Developer, Product Manager"
              value={targetPosition}
              onChange={(e) => setTargetPosition(e.target.value)}
            />
          </div>
          {error && (
            <p className="text-sm text-destructive flex items-center gap-1">
              <AlertCircle className="h-4 w-4" />
              {error}
            </p>
          )}
          <Button onClick={handleAnalyze} disabled={loading} className="w-full sm:w-auto">
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Menganalisis...
              </>
            ) : (
              <>
                <Search className="h-4 w-4 mr-2" />
                Analisis CV
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Results Section */}
      {result && (
        <div className="space-y-6">
          {/* Overall Score */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row items-center gap-8">
                {/* Circular Score */}
                <div className="relative flex items-center justify-center">
                  <svg width="160" height="160" className="-rotate-90">
                    <circle
                      cx="80"
                      cy="80"
                      r="70"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="10"
                      className="text-muted"
                    />
                    <circle
                      cx="80"
                      cy="80"
                      r="70"
                      fill="none"
                      strokeWidth="10"
                      strokeLinecap="round"
                      strokeDasharray={`${2 * Math.PI * 70}`}
                      strokeDashoffset={`${2 * Math.PI * 70 * (1 - result.overallScore / 100)}`}
                      className={getScoreColor(result.overallScore).ring}
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center">
                    <span className={`text-4xl font-bold ${getScoreColor(result.overallScore).text}`}>
                      {result.overallScore}
                    </span>
                    <span className="text-sm text-muted-foreground">/ 100</span>
                  </div>
                </div>

                {/* Summary Stats */}
                <div className="flex-1 space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold">Skor ATS Keseluruhan</h3>
                    <p className="text-muted-foreground text-sm">
                      {result.overallScore >= 80
                        ? "CV Anda sudah sangat baik! Sedikit penyempurnaan akan membuatnya sempurna."
                        : result.overallScore >= 60
                        ? "CV Anda cukup baik, namun masih ada ruang untuk perbaikan."
                        : "CV Anda perlu perbaikan signifikan untuk lolos sistem ATS."}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {getCompatibilityBadge(result.estimatedAtsCompatibility)}
                    <Badge variant="outline">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      {result.quantifiedAchievements} pencapaian terukur
                    </Badge>
                  </div>
                  {result.actionVerbs.length > 0 && (
                    <div>
                      <p className="text-sm font-medium mb-1">Kata kerja aksi terdeteksi:</p>
                      <div className="flex flex-wrap gap-1">
                        {result.actionVerbs.slice(0, 10).map((verb) => (
                          <Badge key={verb} variant="secondary" className="text-xs">
                            {verb}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Breakdown per Bagian</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {result.sections.map((section) => (
                <div key={section.name} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{section.name}</span>
                    <span className={`text-sm font-semibold ${getScoreColor(section.score).text}`}>
                      {section.score}%
                    </span>
                  </div>
                  <Progress value={section.score} className="h-2" />
                  <p className="text-xs text-muted-foreground">{section.feedback}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Keywords */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Found Keywords */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  Kata Kunci Ditemukan ({result.keywords.found.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {result.keywords.found.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {result.keywords.found.map((kw) => (
                      <Badge key={kw} variant="success" className="text-xs">
                        {kw}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Tidak ada kata kunci yang terdeteksi.</p>
                )}
              </CardContent>
            </Card>

            {/* Missing Keywords */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <XCircle className="h-5 w-5 text-red-500" />
                  Kata Kunci Kurang ({result.keywords.missing.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {result.keywords.missing.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {result.keywords.missing.map((kw) => (
                      <Badge key={kw} variant="destructive" className="text-xs">
                        {kw}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Semua kata kunci penting sudah tercakup!</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Suggestions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Lightbulb className="h-5 w-5" />
                Saran Perbaikan
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {result.suggestions.map((suggestion, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-3 p-3 rounded-md bg-muted/50"
                  >
                    {getPriorityIcon(suggestion.priority)}
                    <div className="flex-1">
                      <p className="text-sm">{suggestion.message}</p>
                      <Badge
                        variant={
                          suggestion.priority === "high"
                            ? "destructive"
                            : suggestion.priority === "medium"
                            ? "warning"
                            : "secondary"
                        }
                        className="mt-1 text-xs"
                      >
                        {suggestion.priority === "high"
                          ? "Prioritas Tinggi"
                          : suggestion.priority === "medium"
                          ? "Prioritas Sedang"
                          : "Prioritas Rendah"}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* CTA */}
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <h3 className="font-semibold">Optimalkan CV Anda</h3>
                  <p className="text-sm text-muted-foreground">
                    Gunakan CV Builder kami untuk membuat CV yang dioptimalkan berdasarkan analisis ini.
                  </p>
                </div>
                <Button asChild>
                  <Link href="/cv/builder">
                    <Sparkles className="h-4 w-4 mr-2" />
                    Optimalkan CV Ini
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
