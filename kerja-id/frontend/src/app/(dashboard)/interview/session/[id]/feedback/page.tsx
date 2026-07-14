"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import api from "@/lib/api";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft,
  Trophy,
  Target,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  XCircle,
  Star,
  RotateCcw,
  Sparkles,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  Lightbulb,
  AlertCircle,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────────

interface QuestionFeedback {
  id: string;
  question: string;
  answer: string;
  score: number;
  feedback: string;
  starCompliance: {
    situation: boolean;
    task: boolean;
    action: boolean;
    result: boolean;
    score: number;
  };
  strengths: string[];
  improvements: string[];
}

interface InterviewFeedback {
  sessionId: string;
  position: string;
  company?: string;
  type: string;
  overallScore: number;
  totalQuestions: number;
  completedAt: string;
  summary: string;
  strengths: string[];
  improvements: string[];
  questions: QuestionFeedback[];
}

// ─── STAR Indicator ──────────────────────────────────────────────────────────────

function StarCompliance({ compliance }: { compliance: QuestionFeedback["starCompliance"] }) {
  const stars = [
    { key: "situation", label: "S", fullLabel: "Situation", active: compliance.situation },
    { key: "task", label: "T", fullLabel: "Task", active: compliance.task },
    { key: "action", label: "A", fullLabel: "Action", active: compliance.action },
    { key: "result", label: "R", fullLabel: "Result", active: compliance.result },
  ];

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1">
        <span className="text-xs font-medium text-muted-foreground mr-1">STAR:</span>
        {stars.map((s) => (
          <div
            key={s.key}
            className={cn(
              "flex h-7 w-7 items-center justify-center rounded-md text-xs font-bold transition-colors",
              s.active
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground"
            )}
            title={s.fullLabel}
          >
            {s.label}
          </div>
        ))}
        <span className="ml-2 text-xs text-muted-foreground">
          {compliance.score}/4
        </span>
      </div>
    </div>
  );
}

// ─── Score Display ───────────────────────────────────────────────────────────────

function ScoreCircle({ score, size = "lg" }: { score: number; size?: "sm" | "lg" }) {
  const getColor = (s: number) => {
    if (s >= 80) return { ring: "text-green-500", bg: "bg-green-50", text: "text-green-700" };
    if (s >= 60) return { ring: "text-yellow-500", bg: "bg-yellow-50", text: "text-yellow-700" };
    return { ring: "text-red-500", bg: "bg-red-50", text: "text-red-700" };
  };
  const colors = getColor(score);
  const dim = size === "lg" ? "h-32 w-32" : "h-16 w-16";
  const textSize = size === "lg" ? "text-4xl" : "text-xl";

  return (
    <div className={cn("relative flex items-center justify-center rounded-full", dim, colors.bg)}>
      <svg className={cn("absolute inset-0", dim)} viewBox="0 0 100 100">
        <circle
          cx="50"
          cy="50"
          r="42"
          fill="none"
          stroke="currentColor"
          strokeWidth="6"
          className="text-muted/30"
        />
        <circle
          cx="50"
          cy="50"
          r="42"
          fill="none"
          stroke="currentColor"
          strokeWidth="6"
          strokeDasharray={`${(score / 100) * 264} 264`}
          strokeLinecap="round"
          transform="rotate(-90 50 50)"
          className={colors.ring}
        />
      </svg>
      <div className="flex flex-col items-center">
        <span className={cn("font-bold", textSize, colors.text)}>{score}</span>
        {size === "lg" && <span className="text-xs text-muted-foreground">/ 100</span>}
      </div>
    </div>
  );
}

// ─── Question Card ───────────────────────────────────────────────────────────────

function QuestionCard({ q, index }: { q: QuestionFeedback; index: number }) {
  const [expanded, setExpanded] = useState(index === 0);

  const scoreColor =
    q.score >= 80 ? "text-green-600" : q.score >= 60 ? "text-yellow-600" : "text-red-600";
  const scoreBadge =
    q.score >= 80 ? "success" : q.score >= 60 ? "warning" : "destructive";

  return (
    <Card className="transition-all">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left p-4 sm:p-5 flex items-start gap-3"
      >
        <div
          className={cn(
            "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold",
            q.score >= 80
              ? "bg-green-100 text-green-700"
              : q.score >= 60
              ? "bg-yellow-100 text-yellow-700"
              : "bg-red-100 text-red-700"
          )}
        >
          {index + 1}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium line-clamp-2">{q.question}</p>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant={scoreBadge as any} className="text-xs">
              Skor: {q.score}
            </Badge>
            <span className="text-xs text-muted-foreground">
              STAR: {q.starCompliance.score}/4
            </span>
          </div>
        </div>
        {expanded ? (
          <ChevronUp className="h-4 w-4 shrink-0 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
        )}
      </button>

      {expanded && (
        <div className="px-4 sm:px-5 pb-5 space-y-4 border-t pt-4">
          {/* Answer */}
          <div>
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">
              Jawabanmu
            </h4>
            <p className="text-sm text-foreground bg-muted/50 rounded-lg p-3 whitespace-pre-wrap">
              {q.answer}
            </p>
          </div>

          {/* STAR */}
          <StarCompliance compliance={q.starCompliance} />

          {/* Feedback */}
          <div className="bg-blue-50 border border-blue-100 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <MessageSquare className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
              <p className="text-sm text-blue-800">{q.feedback}</p>
            </div>
          </div>

          {/* Strengths & Improvements */}
          <div className="grid gap-3 sm:grid-cols-2">
            {q.strengths.length > 0 && (
              <div className="space-y-1.5">
                <h4 className="text-xs font-semibold text-green-700 flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Kekuatan
                </h4>
                <ul className="space-y-1">
                  {q.strengths.map((s, i) => (
                    <li key={i} className="text-xs text-green-700 flex items-start gap-1.5">
                      <span className="mt-1 h-1 w-1 rounded-full bg-green-500 shrink-0" />
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {q.improvements.length > 0 && (
              <div className="space-y-1.5">
                <h4 className="text-xs font-semibold text-orange-700 flex items-center gap-1">
                  <Lightbulb className="h-3.5 w-3.5" /> Perbaikan
                </h4>
                <ul className="space-y-1">
                  {q.improvements.map((s, i) => (
                    <li key={i} className="text-xs text-orange-700 flex items-start gap-1.5">
                      <span className="mt-1 h-1 w-1 rounded-full bg-orange-500 shrink-0" />
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </Card>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────────

export default function InterviewFeedbackPage() {
  const router = useRouter();
  const params = useParams();
  const sessionId = params.id as string;

  const [feedback, setFeedback] = useState<InterviewFeedback | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFeedback = async () => {
      try {
        setLoading(true);
        const res = await api.get<InterviewFeedback>(`/interview/${sessionId}/feedback`);
        setFeedback(res.data);
      } catch (err) {
        console.error("Failed to load feedback:", err);
      } finally {
        setLoading(false);
      }
    };
    loadFeedback();
  }, [sessionId]);

  if (loading) {
    return (
      <div className="container mx-auto max-w-3xl px-4 py-8 space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="flex flex-col items-center gap-4">
          <Skeleton className="h-32 w-32 rounded-full" />
          <Skeleton className="h-6 w-64" />
        </div>
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-32 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  if (!feedback) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-64px)] text-center px-4">
        <AlertCircle className="h-12 w-12 text-destructive mb-4" />
        <h2 className="text-lg font-semibold">Feedback Tidak Ditemukan</h2>
        <p className="text-sm text-muted-foreground mt-1 max-w-sm">
          Sesi interview ini belum selesai atau data feedback tidak tersedia.
        </p>
        <Button className="mt-4" onClick={() => router.push("/interview")}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Kembali
        </Button>
      </div>
    );
  }

  const getScoreLabel = (score: number) => {
    if (score >= 90) return { label: "Luar Biasa!", icon: Trophy, color: "text-green-600" };
    if (score >= 80) return { label: "Sangat Baik", icon: Star, color: "text-green-600" };
    if (score >= 70) return { label: "Baik", icon: TrendingUp, color: "text-blue-600" };
    if (score >= 60) return { label: "Cukup", icon: Target, color: "text-yellow-600" };
    return { label: "Perlu Perbaikan", icon: TrendingDown, color: "text-red-600" };
  };

  const scoreInfo = getScoreLabel(feedback.overallScore);
  const ScoreIcon = scoreInfo.icon;

  return (
    <div className="container mx-auto max-w-3xl px-4 py-8 space-y-6">
      {/* Back */}
      <Button variant="ghost" size="sm" onClick={() => router.push("/interview")}>
        <ArrowLeft className="h-4 w-4 mr-1" /> Kembali ke Interview
      </Button>

      {/* Overall Score Card */}
      <Card className="overflow-hidden">
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-sm text-muted-foreground font-normal">
            Hasil Interview
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4 pb-8">
          <ScoreCircle score={feedback.overallScore} />

          <div className="flex items-center gap-2">
            <ScoreIcon className={cn("h-5 w-5", scoreInfo.color)} />
            <span className={cn("text-xl font-bold", scoreInfo.color)}>
              {scoreInfo.label}
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Target className="h-4 w-4" />
              {feedback.position}
            </span>
            {feedback.company && (
              <span>· {feedback.company}</span>
            )}
            <span>· {feedback.totalQuestions} pertanyaan</span>
          </div>

          {feedback.summary && (
            <p className="text-sm text-center text-muted-foreground max-w-lg mt-2">
              {feedback.summary}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Strengths & Improvements */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2 text-green-700">
              <CheckCircle2 className="h-4 w-4" /> Kekuatan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {feedback.strengths.map((s, i) => (
                <li key={i} className="text-sm flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-green-500 shrink-0" />
                  {s}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2 text-orange-700">
              <Lightbulb className="h-4 w-4" /> Area Perbaikan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {feedback.improvements.map((s, i) => (
                <li key={i} className="text-sm flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-orange-500 shrink-0" />
                  {s}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Per-question breakdown */}
      <div>
        <h2 className="text-lg font-semibold mb-3">Detail Per Pertanyaan</h2>
        <div className="space-y-3">
          {feedback.questions.map((q, i) => (
            <QuestionCard key={q.id} q={q} index={i} />
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 pt-4 pb-8">
        <Button
          className="flex-1"
          onClick={() => router.push("/interview/setup")}
        >
          <RotateCcw className="h-4 w-4 mr-2" />
          Latihan Lagi
        </Button>
        <Button
          variant="outline"
          className="flex-1"
          onClick={() => router.push("/interview")}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Kembali ke Daftar Interview
        </Button>
      </div>
    </div>
  );
}
