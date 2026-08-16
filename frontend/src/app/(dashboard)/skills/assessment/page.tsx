"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Target, CheckCircle, XCircle, Clock, Award, ArrowRight } from "lucide-react";

interface Question {
  id: string;
  question: string;
  options: string[];
  correctIndex?: number;
}

interface AssessmentResult {
  skill: string;
  score: number;
  level: string;
}

export default function AssessmentPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [step, setStep] = useState<"select" | "quiz" | "result">("select");
  const [trending, setTrending] = useState<{ name: string; count: number }[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [sessionId, setSessionId] = useState("");
  const [currentQ, setCurrentQ] = useState<Question | null>(null);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(10);
  const [answer, setAnswer] = useState<number | null>(null);
  const [timer, setTimer] = useState(30);
  const [results, setResults] = useState<AssessmentResult[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get("/skills/trending").then((r) => setTrending(r.data)).catch(() => {});
  }, []);

  useEffect(() => {
    if (step !== "quiz") return;
    const interval = setInterval(() => {
      setTimer((t) => {
        if (t <= 1) {
          submitAnswer();
          return 30;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [step, questionIndex]);

  const toggleSkill = (name: string) => {
    setSelected((s) => (s.includes(name) ? s.filter((x) => x !== name) : s.length < 5 ? [...s, name] : s));
  };

  const startAssessment = async () => {
    if (selected.length === 0) {
      toast({ title: "Pilih minimal 1 skill", variant: "destructive" });
      return;
    }
    try {
      setLoading(true);
      const res = await api.post("/skills/assessment/start", { skillIds: selected });
      setSessionId(res.data.sessionId);
      setCurrentQ(res.data.question);
      setTotalQuestions(res.data.totalQuestions || 10);
      setQuestionIndex(0);
      setTimer(30);
      setStep("quiz");
    } catch {
      toast({ title: "Gagal memulai assessment", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const submitAnswer = async () => {
    if (!currentQ) return;
    try {
      const res = await api.post("/skills/assessment/answer", {
        sessionId,
        questionId: currentQ.id,
        answer: answer ?? -1,
      });
      if (res.data.completed) {
        setResults(res.data.results);
        setStep("result");
      } else {
        setCurrentQ(res.data.nextQuestion);
        setQuestionIndex((i) => i + 1);
        setAnswer(null);
        setTimer(30);
      }
    } catch {
      toast({ title: "Gagal mengirim jawaban", variant: "destructive" });
    }
  };

  const getLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case "expert": return "bg-green-100 text-green-800";
      case "advanced": return "bg-blue-100 text-blue-800";
      case "intermediate": return "bg-yellow-100 text-yellow-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  if (step === "select") {
    return (
      <div className="container py-8 space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Skill Assessment</h1>
          <p className="text-muted-foreground mt-2">Pilih maksimal 5 skill untuk diuji</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {trending.map((s) => (
            <Badge
              key={s.name}
              variant={selected.includes(s.name) ? "default" : "outline"}
              className="cursor-pointer text-sm py-1.5 px-3"
              onClick={() => toggleSkill(s.name)}
            >
              {s.name}
            </Badge>
          ))}
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">{selected.length}/5 skill dipilih</span>
          <Button onClick={startAssessment} disabled={loading || selected.length === 0}>
            {loading ? "Memuat..." : "Mulai Assessment"}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  if (step === "quiz" && currentQ) {
    return (
      <div className="container py-8 max-w-2xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Soal {questionIndex + 1} dari {totalQuestions}</span>
          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4" />
            <span className={timer <= 10 ? "text-destructive font-bold" : ""}>{timer}s</span>
          </div>
        </div>
        <Progress value={((questionIndex + 1) / totalQuestions) * 100} />
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{currentQ.question}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {currentQ.options.map((opt, i) => (
              <button
                key={i}
                onClick={() => setAnswer(i)}
                className={`w-full text-left p-4 rounded-lg border transition-colors ${
                  answer === i ? "border-primary bg-primary/5" : "hover:bg-accent"
                }`}
              >
                <span className="font-medium mr-2">{String.fromCharCode(65 + i)}.</span>
                {opt}
              </button>
            ))}
            <Button onClick={submitAnswer} className="w-full mt-4" disabled={answer === null}>
              {questionIndex + 1 === totalQuestions ? "Selesai" : "Jawab Berikutnya"}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (step === "result") {
    const avgScore = results.length > 0 ? Math.round(results.reduce((a, r) => a + r.score, 0) / results.length) : 0;
    return (
      <div className="container py-8 space-y-6">
        <div className="text-center">
          <Award className="h-16 w-16 text-primary mx-auto mb-4" />
          <h1 className="text-3xl font-bold">Hasil Assessment</h1>
          <p className="text-muted-foreground mt-2">Skor rata-rata: {avgScore}/100</p>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          {results.map((r) => (
            <Card key={r.skill}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">{r.skill}</span>
                  <Badge className={getLevelColor(r.level)}>{r.level}</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Progress value={r.score} className="flex-1" />
                  <span className="text-sm font-bold">{r.score}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="flex gap-4 justify-center">
          <Button onClick={() => { setStep("select"); setResults([]); }}>Ulangi Assessment</Button>
          <Button variant="outline" onClick={() => router.push("/skills/gap")}>Lihat Gap Analysis</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8 flex items-center justify-center">
      <Skeleton className="h-64 w-full max-w-md" />
    </div>
  );
}
