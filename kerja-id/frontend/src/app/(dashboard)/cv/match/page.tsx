"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import type { CvVersion, CvMatch, Job } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  GitCompareArrows,
  Loader2,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Lightbulb,
  FileText,
  Briefcase,
  ArrowRight,
  Target,
} from "lucide-react";

export default function CvMatchPage() {
  const [cvs, setCvs] = useState<CvVersion[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  // Form state
  const [mode, setMode] = useState<"select" | "paste">("select");
  const [selectedCvId, setSelectedCvId] = useState("");
  const [cvText, setCvText] = useState("");
  const [jobMode, setJobMode] = useState<"select" | "paste">("select");
  const [selectedJobId, setSelectedJobId] = useState("");
  const [jobDescription, setJobDescription] = useState("");

  // Result state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<CvMatch | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const [cvRes, jobRes] = await Promise.all([
          api.get<CvVersion[]>("/cv"),
          api.get("/jobs?limit=50"),
        ]);
        setCvs(cvRes.data);
        setJobs(jobRes.data.jobs || []);
      } catch {
        // silent
      } finally {
        setLoadingData(false);
      }
    }
    load();
  }, []);

  async function handleMatch() {
    setError("");

    // Validate CV
    if (mode === "select" && !selectedCvId) {
      setError("Pilih CV yang ingin di-match.");
      return;
    }
    if (mode === "paste" && !cvText.trim()) {
      setError("Masukkan teks CV Anda.");
      return;
    }

    // Validate Job
    if (jobMode === "select" && !selectedJobId) {
      setError("Pilih lowongan yang ingin di-match.");
      return;
    }
    if (jobMode === "paste" && !jobDescription.trim()) {
      setError("Masukkan deskripsi pekerjaan.");
      return;
    }

    setLoading(true);
    try {
      const payload: any = {};
      if (mode === "select") {
        payload.cvVersionId = selectedCvId;
      } else {
        payload.cvText = cvText.trim();
      }
      if (jobMode === "select") {
        payload.jobId = selectedJobId;
      } else {
        payload.jobDescription = jobDescription.trim();
      }

      const res = await api.post<CvMatch>("/cv/match", payload);
      setResult(res.data);
    } catch (err: any) {
      setError(err.response?.data?.message || "Gagal melakukan match. Coba lagi.");
    } finally {
      setLoading(false);
    }
  }

  function getScoreColor(score: number) {
    if (score >= 80) return { text: "text-green-600", bg: "bg-green-500", ring: "stroke-green-500" };
    if (score >= 60) return { text: "text-yellow-600", bg: "bg-yellow-500", ring: "stroke-yellow-500" };
    return { text: "text-red-600", bg: "bg-red-500", ring: "stroke-red-500" };
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

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <GitCompareArrows className="h-6 w-6" />
          Job Match
        </h1>
        <p className="text-muted-foreground mt-1">
          Cocokkan CV Anda dengan lowongan pekerjaan untuk melihat kecocokan dan peluang
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* CV Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="h-5 w-5" />
              CV Anda
            </CardTitle>
            <CardDescription>Pilih CV yang sudah ada atau tempel teks CV</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Button
                variant={mode === "select" ? "default" : "outline"}
                size="sm"
                onClick={() => setMode("select")}
              >
                Pilih CV
              </Button>
              <Button
                variant={mode === "paste" ? "default" : "outline"}
                size="sm"
                onClick={() => setMode("paste")}
              >
                Tempel Teks
              </Button>
            </div>

            {mode === "select" ? (
              <div className="space-y-2">
                <Label>Pilih CV</Label>
                <Select value={selectedCvId} onValueChange={setSelectedCvId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih CV..." />
                  </SelectTrigger>
                  <SelectContent>
                    {cvs.length === 0 ? (
                      <SelectItem value="none" disabled>
                        Belum ada CV tersimpan
                      </SelectItem>
                    ) : (
                      cvs.map((cv) => (
                        <SelectItem key={cv.id} value={cv.id}>
                          {cv.name}
                          {cv.atsScore ? ` (ATS: ${cv.atsScore})` : ""}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                {cvs.length === 0 && (
                  <p className="text-xs text-muted-foreground">
                    Buat CV terlebih dahulu di{" "}
                    <a href="/cv/builder" className="underline text-primary">CV Builder</a>.
                  </p>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                <Label>Teks CV</Label>
                <Textarea
                  placeholder="Tempelkan isi CV Anda di sini..."
                  value={cvText}
                  onChange={(e) => setCvText(e.target.value)}
                  rows={8}
                  className="resize-y"
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Job Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              Lowongan Pekerjaan
            </CardTitle>
            <CardDescription>Pilih lowongan dari daftar atau tempel deskripsi pekerjaan</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Button
                variant={jobMode === "select" ? "default" : "outline"}
                size="sm"
                onClick={() => setJobMode("select")}
              >
                Pilih Lowongan
              </Button>
              <Button
                variant={jobMode === "paste" ? "default" : "outline"}
                size="sm"
                onClick={() => setJobMode("paste")}
              >
                Tempel Deskripsi
              </Button>
            </div>

            {jobMode === "select" ? (
              <div className="space-y-2">
                <Label>Pilih Lowongan</Label>
                <Select value={selectedJobId} onValueChange={setSelectedJobId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih lowongan..." />
                  </SelectTrigger>
                  <SelectContent>
                    {jobs.length === 0 ? (
                      <SelectItem value="none" disabled>
                        Tidak ada lowongan tersedia
                      </SelectItem>
                    ) : (
                      jobs.map((job) => (
                        <SelectItem key={job.id} value={job.id}>
                          {job.title} - {job.company?.name || "N/A"}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <div className="space-y-2">
                <Label>Deskripsi Pekerjaan</Label>
                <Textarea
                  placeholder="Tempelkan deskripsi pekerjaan di sini..."
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  rows={8}
                  className="resize-y"
                />
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Error */}
      {error && (
        <p className="text-sm text-destructive flex items-center gap-1">
          <AlertCircle className="h-4 w-4" />
          {error}
        </p>
      )}

      {/* Match Button */}
      <Button onClick={handleMatch} disabled={loading} size="lg" className="w-full sm:w-auto">
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Menganalisis Kecocokan...
          </>
        ) : (
          <>
            <Target className="h-4 w-4 mr-2" />
            Match CV dengan Lowongan
          </>
        )}
      </Button>

      {/* Results */}
      {result && (
        <div className="space-y-6">
          <Separator />

          {/* Match Score */}
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
                      strokeDashoffset={`${2 * Math.PI * 70 * (1 - result.matchScore / 100)}`}
                      className={getScoreColor(result.matchScore).ring}
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center">
                    <span className={`text-4xl font-bold ${getScoreColor(result.matchScore).text}`}>
                      {result.matchScore}
                    </span>
                    <span className="text-sm text-muted-foreground">/ 100</span>
                  </div>
                </div>

                {/* Summary */}
                <div className="flex-1 space-y-3">
                  <div>
                    <h3 className="text-lg font-semibold">
                      Skor Kecocokan: {result.jobTitle}
                    </h3>
                    <p className="text-muted-foreground text-sm mt-1">
                      {result.recommendation}
                    </p>
                  </div>
                  <Badge
                    variant={
                      result.matchScore >= 80
                        ? "success"
                        : result.matchScore >= 60
                        ? "warning"
                        : "destructive"
                    }
                  >
                    {result.matchScore >= 80
                      ? "Kecocokan Tinggi"
                      : result.matchScore >= 60
                      ? "Kecocokan Sedang"
                      : "Kecocokan Rendah"}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Keywords */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Matched Keywords */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  Kata Kunci Cocok ({result.matchedKeywords.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {result.matchedKeywords.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {result.matchedKeywords.map((kw) => (
                      <Badge key={kw} variant="success" className="text-xs">
                        {kw}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Tidak ada kata kunci yang cocok.</p>
                )}
              </CardContent>
            </Card>

            {/* Missing Keywords */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <XCircle className="h-5 w-5 text-red-500" />
                  Kata Kunci Kurang ({result.missingKeywords.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {result.missingKeywords.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {result.missingKeywords.map((kw) => (
                      <Badge key={kw} variant="destructive" className="text-xs">
                        {kw}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Semua kata kunci tercakup!</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Suggestions */}
          {result.suggestions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Lightbulb className="h-5 w-5" />
                  Saran Peningkatan Kecocokan
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
          )}
        </div>
      )}
    </div>
  );
}
