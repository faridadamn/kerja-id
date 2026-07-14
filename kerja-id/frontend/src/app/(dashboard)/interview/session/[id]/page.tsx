"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import api from "@/lib/api";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Send,
  Clock,
  Mic,
  Bot,
  User,
  AlertTriangle,
  Loader2,
  StopCircle,
  ArrowRight,
  Sparkles,
  CircleDot,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────────

interface ChatMessage {
  id: string;
  role: "ai" | "user";
  content: string;
  timestamp: Date;
  score?: number;
  feedback?: string;
}

interface SessionData {
  id: string;
  position: string;
  company?: string;
  type: string;
  language: string;
  duration: number;
  status: string;
  currentQuestion?: string;
  questionNumber?: number;
  totalQuestions?: number;
}

// ─── Timer Component ─────────────────────────────────────────────────────────────

function QuestionTimer({
  duration,
  onExpire,
  isActive,
}: {
  duration: number;
  onExpire: () => void;
  isActive: boolean;
}) {
  const [seconds, setSeconds] = useState(duration);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setSeconds(duration);
  }, [duration]);

  useEffect(() => {
    if (!isActive) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }
    intervalRef.current = setInterval(() => {
      setSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current!);
          onExpire();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isActive, onExpire]);

  const percentage = (seconds / duration) * 100;
  const isLow = seconds <= 10;
  const isCritical = seconds <= 5;

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  return (
    <div className="flex items-center gap-2">
      <Clock className={cn("h-4 w-4", isCritical ? "text-red-500 animate-pulse" : isLow ? "text-yellow-500" : "text-muted-foreground")} />
      <span
        className={cn(
          "text-sm font-mono font-semibold tabular-nums",
          isCritical ? "text-red-500" : isLow ? "text-yellow-600" : "text-foreground"
        )}
      >
        {formatTime(seconds)}
      </span>
      <div className="flex-1 max-w-[120px]">
        <Progress
          value={percentage}
          className={cn(
            "h-1.5",
            isCritical && "[&>div]:bg-red-500",
            isLow && !isCritical && "[&>div]:bg-yellow-500"
          )}
        />
      </div>
    </div>
  );
}

// ─── Confidence Indicator ────────────────────────────────────────────────────────

function ConfidenceIndicator({ level }: { level: "high" | "medium" | "low" }) {
  const config = {
    high: { color: "bg-green-500", label: "Percaya Diri", text: "text-green-700" },
    medium: { color: "bg-yellow-500", label: "Cukup", text: "text-yellow-700" },
    low: { color: "bg-red-500", label: "Perlu Perbaikan", text: "text-red-700" },
  };
  const c = config[level];

  return (
    <div className="flex items-center gap-1.5">
      <div className={cn("h-2 w-2 rounded-full", c.color)} />
      <span className={cn("text-xs font-medium", c.text)}>{c.label}</span>
    </div>
  );
}

// ─── Chat Bubble ─────────────────────────────────────────────────────────────────

function ChatBubble({ message }: { message: ChatMessage }) {
  const isAI = message.role === "ai";

  return (
    <div className={cn("flex gap-3", isAI ? "justify-start" : "justify-end")}>
      {isAI && (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
          <Bot className="h-4 w-4 text-primary" />
        </div>
      )}
      <div
        className={cn(
          "max-w-[75%] rounded-2xl px-4 py-3",
          isAI
            ? "bg-muted text-foreground rounded-tl-md"
            : "bg-primary text-primary-foreground rounded-tr-md"
        )}
      >
        <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
        {message.score != null && (
          <div className="mt-2 pt-2 border-t border-border/30 space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium">Skor:</span>
              <Badge
                variant={message.score >= 80 ? "success" : message.score >= 60 ? "warning" : "destructive"}
                className="text-xs"
              >
                {message.score}
              </Badge>
            </div>
            {message.feedback && (
              <p className="text-xs text-muted-foreground">{message.feedback}</p>
            )}
          </div>
        )}
      </div>
      {!isAI && (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary">
          <User className="h-4 w-4 text-secondary-foreground" />
        </div>
      )}
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────────

export default function InterviewSessionPage() {
  const router = useRouter();
  const params = useParams();
  const sessionId = params.id as string;

  const [session, setSession] = useState<SessionData | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [showEndDialog, setShowEndDialog] = useState(false);
  const [timerActive, setTimerActive] = useState(false);
  const [questionTime, setQuestionTime] = useState(90);
  const [confidence, setConfidence] = useState<"high" | "medium" | "low">("medium");

  const chatEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll
  const scrollToBottom = useCallback(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Load session
  useEffect(() => {
    const loadSession = async () => {
      try {
        setLoading(true);
        const res = await api.get<SessionData>(`/interview/${sessionId}`);
        const data = res.data;
        setSession(data);

        // Add initial AI question if available
        if (data.currentQuestion) {
          setMessages([
            {
              id: "welcome",
              role: "ai",
              content: `Halo! Saya akan mewawancarai Anda untuk posisi ${data.position}${data.company ? ` di ${data.company}` : ""}. Mari kita mulai!`,
              timestamp: new Date(),
            },
            {
              id: "q1",
              role: "ai",
              content: data.currentQuestion,
              timestamp: new Date(),
            },
          ]);
          setTimerActive(true);
        } else {
          // Fetch first question
          const qRes = await api.post<{ question: string; questionNumber: number; totalQuestions: number }>(
            `/interview/${sessionId}/answer`,
            { answer: "" }
          );
          setMessages([
            {
              id: "welcome",
              role: "ai",
              content: `Halo! Saya akan mewawancarai Anda untuk posisi ${data.position}${data.company ? ` di ${data.company}` : ""}. Mari kita mulai!`,
              timestamp: new Date(),
            },
            {
              id: "q1",
              role: "ai",
              content: qRes.data.question,
              timestamp: new Date(),
            },
          ]);
          setTimerActive(true);
        }
      } catch (err) {
        console.error("Failed to load session:", err);
      } finally {
        setLoading(false);
      }
    };
    loadSession();
  }, [sessionId]);

  // Update confidence based on answer length
  useEffect(() => {
    const len = answer.trim().length;
    if (len === 0) setConfidence("low");
    else if (len < 50) setConfidence("low");
    else if (len < 150) setConfidence("medium");
    else setConfidence("high");
  }, [answer]);

  // Adjust timer based on language
  useEffect(() => {
    if (session) {
      const base = session.language === "en" ? 120 : 90;
      setQuestionTime(base);
    }
  }, [session]);

  const handleSend = async () => {
    if (!answer.trim() || sending) return;
    const userAnswer = answer.trim();
    setAnswer("");
    setSending(true);
    setTimerActive(false);

    // Add user message
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: userAnswer,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);

    try {
      const res = await api.post<{
        feedback?: string;
        nextQuestion?: string;
        score?: number;
        isComplete?: boolean;
      }>(`/interview/${sessionId}/answer`, { answer: userAnswer });

      // Add feedback message if available
      if (res.data.feedback) {
        setMessages((prev) => [
          ...prev,
          {
            id: `feedback-${Date.now()}`,
            role: "ai",
            content: res.data.feedback!,
            timestamp: new Date(),
            score: res.data.score,
          },
        ]);
      }

      if (res.data.isComplete || !res.data.nextQuestion) {
        // Session complete
        setMessages((prev) => [
          ...prev,
          {
            id: `complete-${Date.now()}`,
            role: "ai",
            content: "Interview telah selesai! Terima kasih atas jawaban Anda. Klik tombol 'Lihat Feedback' untuk melihat hasil lengkap.",
            timestamp: new Date(),
          },
        ]);
        setSession((prev) => prev ? { ...prev, status: "completed" } : prev);
      } else {
        // Next question
        setMessages((prev) => [
          ...prev,
          {
            id: `q-${Date.now()}`,
            role: "ai",
            content: res.data.nextQuestion!,
            timestamp: new Date(),
          },
        ]);
        setTimerActive(true);
        setQuestionTime((prev) => prev); // Reset timer
      }
    } catch (err) {
      console.error("Failed to send answer:", err);
      setMessages((prev) => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          role: "ai",
          content: "Maaf, terjadi kesalahan. Silakan coba lagi.",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setSending(false);
      textareaRef.current?.focus();
    }
  };

  const handleEndSession = async () => {
    try {
      await api.post(`/interview/${sessionId}/end`);
    } catch {
      // Ignore
    }
    router.push(`/interview/session/${sessionId}/feedback`);
  };

  const handleTimeExpire = useCallback(() => {
    setTimerActive(false);
    // Auto-send if there's partial answer
    if (answer.trim().length > 20) {
      handleSend();
    } else {
      setMessages((prev) => [
        ...prev,
        {
          id: `timeout-${Date.now()}`,
          role: "ai",
          content: "Waktu habis untuk pertanyaan ini. Mari kita lanjut ke pertanyaan berikutnya.",
          timestamp: new Date(),
        },
      ]);
    }
  }, [answer]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col h-[calc(100vh-64px)]">
        <div className="p-4 border-b">
          <Skeleton className="h-8 w-64" />
        </div>
        <div className="flex-1 p-4 space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className={cn("flex gap-3", i % 2 === 0 ? "justify-start" : "justify-end")}>
              <Skeleton className={cn("h-16 rounded-2xl", i % 2 === 0 ? "w-2/3" : "w-1/2")} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-64px)] text-center">
        <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
        <h2 className="text-lg font-semibold">Sesi Tidak Ditemukan</h2>
        <p className="text-sm text-muted-foreground mt-1">Sesi interview ini tidak ada atau telah berakhir.</p>
        <Button className="mt-4" onClick={() => router.push("/interview")}>
          Kembali
        </Button>
      </div>
    );
  }

  const isComplete = session.status === "completed";
  const progress =
    session.totalQuestions && session.questionNumber
      ? (session.questionNumber / session.totalQuestions) * 100
      : undefined;

  return (
    <div className="flex flex-col h-[calc(100vh-64px)]">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-10">
        <div className="flex items-center justify-between p-3 md:px-6">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10">
              <Mic className="h-4 w-4 text-primary" />
            </div>
            <div className="min-w-0">
              <h1 className="text-sm font-semibold truncate">
                Interview: {session.position}
                {session.company && (
                  <span className="text-muted-foreground font-normal"> · {session.company}</span>
                )}
              </h1>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Badge variant="outline" className="text-[10px] px-1.5 py-0 capitalize">
                  {session.type.replace("_", " ")}
                </Badge>
                {session.questionNumber && session.totalQuestions && (
                  <span>
                    Soal {session.questionNumber}/{session.totalQuestions}
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {!isComplete && timerActive && (
              <QuestionTimer
                key={`timer-${messages.length}`}
                duration={questionTime}
                onExpire={handleTimeExpire}
                isActive={timerActive}
              />
            )}
            {!isComplete && (
              <Button variant="destructive" size="sm" onClick={() => setShowEndDialog(true)}>
                <StopCircle className="h-4 w-4 mr-1" />
                Akhiri
              </Button>
            )}
            {isComplete && (
              <Button size="sm" onClick={() => router.push(`/interview/session/${sessionId}/feedback`)}>
                Lihat Feedback
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            )}
          </div>
        </div>
        {progress !== undefined && <Progress value={progress} className="h-1 rounded-none" />}
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 md:px-6 space-y-4">
        {messages.map((msg) => (
          <ChatBubble key={msg.id} message={msg} />
        ))}
        {sending && (
          <div className="flex gap-3 justify-start">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
              <Bot className="h-4 w-4 text-primary" />
            </div>
            <div className="bg-muted rounded-2xl rounded-tl-md px-4 py-3">
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Sedang mengevaluasi...</span>
              </div>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input Area */}
      {!isComplete && (
        <div className="border-t bg-background p-3 md:px-6">
          <div className="flex items-end gap-2">
            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between">
                <ConfidenceIndicator level={confidence} />
                <span className="text-xs text-muted-foreground">{answer.length} karakter</span>
              </div>
              <Textarea
                ref={textareaRef}
                placeholder="Ketik jawaban Anda di sini... (Enter untuk kirim, Shift+Enter untuk baris baru)"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={3}
                disabled={sending}
                className="resize-none"
              />
            </div>
            <Button
              size="icon"
              className="h-10 w-10 shrink-0"
              onClick={handleSend}
              disabled={!answer.trim() || sending}
            >
              {sending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      )}

      {/* End Session Dialog */}
      <Dialog open={showEndDialog} onOpenChange={setShowEndDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Akhiri Interview?</DialogTitle>
            <DialogDescription>
              Anda yakin ingin mengakhiri sesi interview ini? Jawaban yang sudah diberikan tetap akan
              dievaluasi dan Anda bisa melihat feedback lengkap.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEndDialog(false)}>
              Lanjutkan
            </Button>
            <Button variant="destructive" onClick={handleEndSession}>
              Ya, Akhiri
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
