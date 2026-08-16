"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { unwrapArray } from "@/lib/api-response";
import { cn, formatDateShort, timeAgo } from "@/lib/utils";
import type { InterviewSession } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Mic,
  Plus,
  Search,
  Brain,
  Users,
  Briefcase,
  Building2,
  Clock,
  Star,
  Trophy,
  Filter,
  ArrowRight,
  Sparkles,
  BookOpen,
  Target,
  ChevronRight,
} from "lucide-react";

// ─── Constants ───────────────────────────────────────────────────────────────────

const INTERVIEW_TYPE_META: Record<
  string,
  { label: string; icon: typeof Brain; color: string; bg: string; description: string }
> = {
  behavioral: {
    label: "Behavioral",
    icon: Users,
    color: "text-blue-700",
    bg: "bg-blue-100",
    description: "Ceritakan pengalaman & perilaku kerja Anda",
  },
  technical: {
    label: "Technical",
    icon: Brain,
    color: "text-purple-700",
    bg: "bg-purple-100",
    description: "Pertanyaan teknis sesuai bidang Anda",
  },
  case_study: {
    label: "Case Study",
    icon: BookOpen,
    color: "text-orange-700",
    bg: "bg-orange-100",
    description: "Analisis studi kasus bisnis nyata",
  },
  hr_culture: {
    label: "HR & Culture",
    icon: Target,
    color: "text-green-700",
    bg: "bg-green-100",
    description: "Kesesuaian budaya & nilai perusahaan",
  },
};

const CATEGORIES = [
  { key: "all", label: "Semua" },
  { key: "behavioral", label: "Behavioral" },
  { key: "technical", label: "Technical" },
  { key: "case_study", label: "Case Study" },
  { key: "hr_culture", label: "HR & Culture" },
];

const INDUSTRIES = [
  "Technology",
  "Finance",
  "Healthcare",
  "Marketing",
  "Consulting",
  "Manufacturing",
  "Education",
  "Retail",
];

const DIFFICULTIES = [
  { key: "easy", label: "Mudah", color: "bg-green-100 text-green-700" },
  { key: "medium", label: "Sedang", color: "bg-yellow-100 text-yellow-700" },
  { key: "hard", label: "Sulit", color: "bg-red-100 text-red-700" },
];

interface QuestionBankItem {
  id: string;
  question: string;
  category: string;
  industry?: string;
  difficulty: "easy" | "medium" | "hard";
}

// ─── Score Badge ─────────────────────────────────────────────────────────────────

function ScoreBadge({ score }: { score?: number }) {
  if (score == null) return <span className="text-muted-foreground text-xs">-</span>;
  const variant = score >= 80 ? "success" : score >= 60 ? "warning" : "destructive";
  return (
    <Badge variant={variant} className="text-xs font-semibold">
      {score}
    </Badge>
  );
}

// ─── Session Card ────────────────────────────────────────────────────────────────

function SessionCard({ session }: { session: InterviewSession }) {
  const router = useRouter();
  const meta = INTERVIEW_TYPE_META[session.type] || INTERVIEW_TYPE_META.behavioral;
  const Icon = meta.icon;

  return (
    <Card
      className="cursor-pointer transition-all hover:shadow-md hover:border-primary/30"
      onClick={() =>
        router.push(
          session.status === "completed"
            ? `/interview/session/${session.id}/feedback`
            : `/interview/session/${session.id}`
        )
      }
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-lg", meta.bg)}>
            <Icon className={cn("h-5 w-5", meta.color)} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="font-medium truncate">{session.position}</p>
                {session.company && (
                  <p className="text-sm text-muted-foreground truncate flex items-center gap-1">
                    <Building2 className="h-3 w-3" />
                    {session.company}
                  </p>
                )}
              </div>
              <ScoreBadge score={session.score} />
            </div>
            <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
              <span className={cn("px-2 py-0.5 rounded-full text-[11px] font-medium", meta.bg, meta.color)}>
                {meta.label}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {session.duration} menit
              </span>
              <span>{timeAgo(session.createdAt)}</span>
              {session.status === "completed" && (
                <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                  Selesai
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Question Card ───────────────────────────────────────────────────────────────

function QuestionCard({ item }: { item: QuestionBankItem }) {
  const meta = INTERVIEW_TYPE_META[item.category] || INTERVIEW_TYPE_META.behavioral;
  const Icon = meta.icon;
  const diff = DIFFICULTIES.find((d) => d.key === item.difficulty);

  return (
    <Card className="transition-all hover:shadow-sm">
      <CardContent className="p-4 space-y-2">
        <div className="flex items-start gap-2">
          <div className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded", meta.bg)}>
            <Icon className={cn("h-4 w-4", meta.color)} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium leading-snug">{item.question}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <span className={cn("px-2 py-0.5 rounded-full text-[11px] font-medium", meta.bg, meta.color)}>
            {meta.label}
          </span>
          {item.industry && (
            <span className="text-[11px] text-muted-foreground">{item.industry}</span>
          )}
          {diff && (
            <span className={cn("px-2 py-0.5 rounded-full text-[11px] font-medium", diff.color)}>
              {diff.label}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────────

export default function InterviewPage() {
  const router = useRouter();
  const [sessions, setSessions] = useState<InterviewSession[]>([]);
  const [questions, setQuestions] = useState<QuestionBankItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [questionsLoading, setQuestionsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterIndustry, setFilterIndustry] = useState<string>("all");
  const [filterDifficulty, setFilterDifficulty] = useState<string>("all");
  const [activeTab, setActiveTab] = useState("sessions");

  const fetchSessions = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get<InterviewSession[]>("/interview/history");
      setSessions(unwrapArray<InterviewSession>(res.data));
    } catch (err) {
      console.error("Failed to fetch interview sessions:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchQuestions = useCallback(async () => {
    try {
      setQuestionsLoading(true);
      const params: Record<string, string> = {};
      if (filterType !== "all") params.category = filterType;
      if (filterIndustry !== "all") params.industry = filterIndustry;
      if (filterDifficulty !== "all") params.difficulty = filterDifficulty;
      if (search.trim()) params.search = search.trim();
      const res = await api.get<QuestionBankItem[]>("/interview/questions", { params });
      setQuestions(unwrapArray<QuestionBankItem>(res.data));
    } catch (err) {
      console.error("Failed to fetch questions:", err);
    } finally {
      setQuestionsLoading(false);
    }
  }, [filterType, filterIndustry, filterDifficulty, search]);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  useEffect(() => {
    if (activeTab === "questions") {
      fetchQuestions();
    }
  }, [activeTab, fetchQuestions]);

  // Stats
  const completedSessions = sessions.filter((s) => s.status === "completed");
  const avgScore =
    completedSessions.length > 0
      ? Math.round(
          completedSessions.reduce((sum, s) => sum + (s.score || 0), 0) / completedSessions.length
        )
      : 0;
  const bestScore =
    completedSessions.length > 0
      ? Math.max(...completedSessions.map((s) => s.score || 0))
      : 0;

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Mic className="h-6 w-6 text-primary" />
            Interview Simulator
          </h1>
          <p className="text-sm text-muted-foreground">
            Latihan wawancara dengan AI dan tingkatkan kepercayaan diri Anda
          </p>
        </div>
        <Button size="lg" onClick={() => router.push("/interview/setup")}>
          <Plus className="h-4 w-4 mr-2" />
          Mulai Interview Baru
        </Button>
      </div>

      {/* Stats */}
      {sessions.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold">{sessions.length}</p>
              <p className="text-xs text-muted-foreground">Total Sesi</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold">{completedSessions.length}</p>
              <p className="text-xs text-muted-foreground">Selesai</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold flex items-center justify-center gap-1">
                <Star className="h-5 w-5 text-yellow-500" />
                {avgScore}
              </p>
              <p className="text-xs text-muted-foreground">Rata-rata Skor</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold flex items-center justify-center gap-1">
                <Trophy className="h-5 w-5 text-amber-500" />
                {bestScore}
              </p>
              <p className="text-xs text-muted-foreground">Skor Terbaik</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="sessions">Riwayat Sesi</TabsTrigger>
          <TabsTrigger value="questions">Bank Soal</TabsTrigger>
        </TabsList>

        {/* Sessions Tab */}
        <TabsContent value="sessions" className="space-y-4">
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-20 w-full rounded-lg" />
              ))}
            </div>
          ) : sessions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <Sparkles className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-medium">Belum Ada Sesi Interview</h3>
              <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                Mulai latihan wawancara pertama Anda untuk mempersiapkan diri menghadapi interview
                sesungguhnya.
              </p>
              <Button className="mt-4" onClick={() => router.push("/interview/setup")}>
                <Plus className="h-4 w-4 mr-2" />
                Mulai Interview Baru
              </Button>
            </div>
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {sessions.map((session) => (
                <SessionCard key={session.id} session={session} />
              ))}
            </div>
          )}
        </TabsContent>

        {/* Questions Tab */}
        <TabsContent value="questions" className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari pertanyaan..."
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-full sm:w-[160px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Kategori" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((c) => (
                  <SelectItem key={c.key} value={c.key}>
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterIndustry} onValueChange={setFilterIndustry}>
              <SelectTrigger className="w-full sm:w-[160px]">
                <SelectValue placeholder="Industri" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Industri</SelectItem>
                {INDUSTRIES.map((ind) => (
                  <SelectItem key={ind} value={ind}>
                    {ind}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterDifficulty} onValueChange={setFilterDifficulty}>
              <SelectTrigger className="w-full sm:w-[140px]">
                <SelectValue placeholder="Kesulitan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua</SelectItem>
                {DIFFICULTIES.map((d) => (
                  <SelectItem key={d.key} value={d.key}>
                    {d.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Questions Grid */}
          {questionsLoading ? (
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-28 rounded-lg" />
              ))}
            </div>
          ) : questions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <BookOpen className="h-10 w-10 text-muted-foreground/50 mb-3" />
              <p className="text-sm text-muted-foreground">
                Tidak ada pertanyaan yang sesuai filter.
              </p>
            </div>
          ) : (
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {questions.map((q) => (
                <QuestionCard key={q.id} item={q} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
