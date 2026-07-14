"use client";

import { useState, useEffect, useCallback } from "react";
import api from "@/lib/api";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Search,
  Star,
  MessageSquareQuestion,
  Brain,
  Users,
  Briefcase,
  Lightbulb,
  ChevronDown,
  ChevronUp,
  Plus,
  Loader2,
  Sparkles,
  Building2,
  Send,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────────

interface InterviewQuestion {
  id: string;
  question: string;
  category: "behavioral" | "technical" | "case_study" | "hr_culture";
  industry?: string;
  difficulty: "easy" | "medium" | "hard";
  sampleAnswer?: string;
  starAnswer?: {
    situation: string;
    task: string;
    action: string;
    result: string;
  };
  tags?: string[];
}

// ─── Constants ───────────────────────────────────────────────────────────────────

const CATEGORIES = [
  { key: "all", label: "All Categories", icon: MessageSquareQuestion },
  { key: "behavioral", label: "Behavioral", icon: Users },
  { key: "technical", label: "Technical", icon: Brain },
  { key: "case_study", label: "Case Study", icon: Briefcase },
  { key: "hr_culture", label: "HR & Culture", icon: Lightbulb },
] as const;

const DIFFICULTIES = [
  { key: "all", label: "All Levels" },
  { key: "easy", label: "Easy", stars: 1 },
  { key: "medium", label: "Medium", stars: 2 },
  { key: "hard", label: "Hard", stars: 3 },
] as const;

const INDUSTRIES = [
  "all", "Technology", "Finance", "Healthcare", "E-commerce",
  "Consulting", "Manufacturing", "Education", "Startup",
] as const;

const CATEGORY_COLORS: Record<string, string> = {
  behavioral: "bg-blue-100 text-blue-800",
  technical: "bg-purple-100 text-purple-800",
  case_study: "bg-orange-100 text-orange-800",
  hr_culture: "bg-green-100 text-green-800",
};

// ─── Difficulty Stars ────────────────────────────────────────────────────────────

function DifficultyStars({ level }: { level: "easy" | "medium" | "hard" }) {
  const count = level === "easy" ? 1 : level === "medium" ? 2 : 3;
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 3 }).map((_, i) => (
        <Star
          key={i}
          className={cn(
            "h-3.5 w-3.5",
            i < count ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
          )}
        />
      ))}
    </div>
  );
}

// ─── Question Card ───────────────────────────────────────────────────────────────

function QuestionCard({ question }: { question: InterviewQuestion }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <Card className="transition-all hover:shadow-md">
      <CardContent className="p-0">
        {/* Header - always visible */}
        <button
          className="w-full text-left p-4 flex items-start gap-3"
          onClick={() => setExpanded(!expanded)}
        >
          <div className="flex-1 min-w-0 space-y-2">
            <p className="font-medium text-sm leading-relaxed">{question.question}</p>
            <div className="flex flex-wrap items-center gap-2">
              <Badge
                variant="outline"
                className={cn(
                  "text-[10px] px-2 py-0",
                  CATEGORY_COLORS[question.category],
                  "border-0"
                )}
              >
                {question.category.replace("_", " ")}
              </Badge>
              <DifficultyStars level={question.difficulty} />
              {question.industry && (
                <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                  <Building2 className="h-3 w-3" />
                  {question.industry}
                </span>
              )}
            </div>
          </div>
          <div className="shrink-0 ml-2">
            {expanded ? (
              <ChevronUp className="h-5 w-5 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-5 w-5 text-muted-foreground" />
            )}
          </div>
        </button>

        {/* Expanded: Sample STAR Answer */}
        {expanded && (
          <div className="px-4 pb-4 border-t pt-4 space-y-3">
            {question.starAnswer ? (
              <div className="space-y-3">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                  <Sparkles className="h-3 w-3" />
                  Sample STAR Answer
                </p>
                <div className="grid gap-2">
                  {(["situation", "task", "action", "result"] as const).map((key) => (
                    <div key={key} className="flex gap-2">
                      <Badge variant="secondary" className="text-[10px] shrink-0 uppercase w-16 justify-center">
                        {key}
                      </Badge>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {question.starAnswer![key]}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ) : question.sampleAnswer ? (
              <div className="space-y-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Sample Answer
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {question.sampleAnswer}
                </p>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground italic">
                No sample answer available yet.
              </p>
            )}

            {question.tags && question.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 pt-2">
                {question.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="text-[10px]">
                    #{tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Submit Question Dialog ──────────────────────────────────────────────────────

function SubmitQuestionDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [form, setForm] = useState({
    question: "",
    category: "behavioral" as string,
    industry: "",
    difficulty: "medium" as string,
    sampleAnswer: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (!form.question.trim()) return;
    setSubmitting(true);
    try {
      await api.post("/interview/questions", {
        question: form.question.trim(),
        category: form.category,
        industry: form.industry.trim() || undefined,
        difficulty: form.difficulty,
        sampleAnswer: form.sampleAnswer.trim() || undefined,
      });
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setForm({ question: "", category: "behavioral", industry: "", difficulty: "medium", sampleAnswer: "" });
        onOpenChange(false);
      }, 1500);
    } catch (err) {
      console.error("Failed to submit question:", err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>Submit a Question</DialogTitle>
          <DialogDescription>
            Contribute to the community question bank. Your submission will be reviewed.
          </DialogDescription>
        </DialogHeader>

        {submitted ? (
          <div className="flex flex-col items-center py-8 text-center">
            <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center mb-3">
              <Sparkles className="h-6 w-6 text-green-600" />
            </div>
            <p className="font-semibold">Thank you!</p>
            <p className="text-sm text-muted-foreground">Your question has been submitted for review.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="question">Question *</Label>
              <Textarea
                id="question"
                placeholder="e.g. Tell me about a time when you had to deal with a difficult stakeholder."
                rows={3}
                value={form.question}
                onChange={(e) => setForm({ ...form, question: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.filter((c) => c.key !== "all").map((c) => (
                      <SelectItem key={c.key} value={c.key}>
                        {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Difficulty</Label>
                <Select value={form.difficulty} onValueChange={(v) => setForm({ ...form, difficulty: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DIFFICULTIES.filter((d) => d.key !== "all").map((d) => (
                      <SelectItem key={d.key} value={d.key}>
                        {d.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="industry">Industry (optional)</Label>
              <Input
                id="industry"
                placeholder="e.g. Technology, Finance"
                value={form.industry}
                onChange={(e) => setForm({ ...form, industry: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sampleAnswer">Sample Answer (optional)</Label>
              <Textarea
                id="sampleAnswer"
                placeholder="Provide a sample answer using the STAR method..."
                rows={4}
                value={form.sampleAnswer}
                onChange={(e) => setForm({ ...form, sampleAnswer: e.target.value })}
              />
            </div>
          </div>
        )}

        {!submitted && (
          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!form.question.trim() || submitting}
            >
              {submitting ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Send className="h-4 w-4 mr-2" />
              )}
              Submit Question
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────────

export default function QuestionBankPage() {
  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [industry, setIndustry] = useState("all");
  const [difficulty, setDifficulty] = useState("all");
  const [showSubmit, setShowSubmit] = useState(false);

  const fetchQuestions = useCallback(async () => {
    try {
      setLoading(true);
      const params: Record<string, string> = {};
      if (category !== "all") params.category = category;
      if (industry !== "all") params.industry = industry;
      if (difficulty !== "all") params.difficulty = difficulty;
      if (search.trim()) params.search = search.trim();
      const res = await api.get<InterviewQuestion[]>("/interview/questions", { params });
      setQuestions(Array.isArray(res.data) ? res.data : res.data.data || []);
    } catch (err) {
      console.error("Failed to fetch questions:", err);
    } finally {
      setLoading(false);
    }
  }, [category, industry, difficulty, search]);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  // Client-side search filter (in case API doesn't support search param)
  const filtered = questions.filter((q) => {
    if (search.trim()) {
      const s = search.toLowerCase();
      return (
        q.question.toLowerCase().includes(s) ||
        q.tags?.some((t) => t.toLowerCase().includes(s)) ||
        false
      );
    }
    return true;
  });

  // Stats
  const categoryCounts = CATEGORIES.reduce(
    (acc, cat) => {
      acc[cat.key] = cat.key === "all" ? questions.length : questions.filter((q) => q.category === cat.key).length;
      return acc;
    },
    {} as Record<string, number>
  );

  if (loading) {
    return (
      <div className="p-4 md:p-6 space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="flex gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-32" />
          ))}
        </div>
        <div className="grid gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Question Bank</h1>
          <p className="text-sm text-muted-foreground">
            {questions.length} questions across {CATEGORIES.length - 1} categories
          </p>
        </div>
        <Button onClick={() => setShowSubmit(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Submit Question
        </Button>
      </div>

      {/* Category Tabs */}
      <Tabs value={category} onValueChange={setCategory}>
        <TabsList className="flex-wrap h-auto gap-1">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            return (
              <TabsTrigger key={cat.key} value={cat.key} className="gap-1.5">
                <Icon className="h-3.5 w-3.5" />
                {cat.label}
                <Badge variant="secondary" className="text-[10px] ml-1 px-1.5 py-0">
                  {categoryCounts[cat.key]}
                </Badge>
              </TabsTrigger>
            );
          })}
        </TabsList>
      </Tabs>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search questions..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={industry} onValueChange={setIndustry}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="All Industries" />
          </SelectTrigger>
          <SelectContent>
            {INDUSTRIES.map((ind) => (
              <SelectItem key={ind} value={ind}>
                {ind === "all" ? "All Industries" : ind}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={difficulty} onValueChange={setDifficulty}>
          <SelectTrigger className="w-full sm:w-[150px]">
            <SelectValue placeholder="All Levels" />
          </SelectTrigger>
          <SelectContent>
            {DIFFICULTIES.map((d) => (
              <SelectItem key={d.key} value={d.key}>
                {d.key === "all" ? "All Levels" : d.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Questions Grid */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <MessageSquareQuestion className="h-12 w-12 text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-medium">No questions found</h3>
          <p className="text-sm text-muted-foreground mt-1">
            {questions.length === 0
              ? "Be the first to contribute a question!"
              : "Try adjusting your filters or search"}
          </p>
          {questions.length === 0 && (
            <Button className="mt-4" onClick={() => setShowSubmit(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Submit Question
            </Button>
          )}
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {filtered.map((q) => (
            <QuestionCard key={q.id} question={q} />
          ))}
        </div>
      )}

      {/* Submit Dialog */}
      <SubmitQuestionDialog open={showSubmit} onOpenChange={setShowSubmit} />
    </div>
  );
}
