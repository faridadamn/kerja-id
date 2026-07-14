"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  TrendingUp,
  BookOpen,
  Lightbulb,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import api from "@/lib/api";
import { formatDate } from "@/lib/utils";
import type { MoodEntry } from "@/lib/types";

const MOODS = [
  { value: 1, emoji: "😫", label: "Sangat Buruk", color: "bg-red-500", lightColor: "bg-red-100" },
  { value: 2, emoji: "😟", label: "Buruk", color: "bg-orange-400", lightColor: "bg-orange-100" },
  { value: 3, emoji: "😐", label: "Biasa", color: "bg-yellow-400", lightColor: "bg-yellow-100" },
  { value: 4, emoji: "🙂", label: "Baik", color: "bg-green-400", lightColor: "bg-green-100" },
  { value: 5, emoji: "😄", label: "Sangat Baik", color: "bg-emerald-500", lightColor: "bg-emerald-100" },
];

const DAYS = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

export default function MoodTrackerPage() {
  const [moodHistory, setMoodHistory] = useState<MoodEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [view, setView] = useState<"week" | "month">("month");

  useEffect(() => {
    fetchMoodHistory();
  }, []);

  const fetchMoodHistory = async () => {
    try {
      const res = await api.get<MoodEntry[]>("/wellness/mood");
      setMoodHistory(res.data);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  };

  // Calendar data
  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const days: { date: Date; entry?: MoodEntry }[] = [];

    // Fill leading empty days
    for (let i = 0; i < firstDay; i++) {
      const d = new Date(year, month, -firstDay + i + 1);
      days.push({ date: d });
    }

    // Fill actual days
    for (let i = 1; i <= daysInMonth; i++) {
      const d = new Date(year, month, i);
      const dateStr = d.toISOString().split("T")[0];
      const entry = moodHistory.find((m) => m.date?.startsWith(dateStr));
      days.push({ date: d, entry });
    }

    // Fill trailing
    const remaining = 7 - (days.length % 7);
    if (remaining < 7) {
      for (let i = 1; i <= remaining; i++) {
        days.push({ date: new Date(year, month + 1, i) });
      }
    }

    return days;
  }, [currentMonth, moodHistory]);

  // Weekly data (last 7 days)
  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      const dateStr = d.toISOString().split("T")[0];
      const entry = moodHistory.find((m) => m.date?.startsWith(dateStr));
      return { date: d, entry };
    });
  }, [moodHistory]);

  // Insights
  const insights = useMemo(() => {
    if (moodHistory.length < 3) return [];
    const recent = moodHistory.slice(-7);
    const avg = recent.reduce((sum, m) => sum + m.mood, 0) / recent.length;
    const prev = moodHistory.slice(-14, -7);
    const prevAvg = prev.length > 0 ? prev.reduce((sum, m) => sum + m.mood, 0) / prev.length : avg;
    const trend = avg - prevAvg;

    const result: { icon: string; text: string; type: "positive" | "neutral" | "warning" }[] = [];

    if (Math.abs(trend) < 0.5) {
      result.push({
        icon: "📊",
        text: "Mood kamu stabil minggu ini. Pertahankan!",
        type: "positive",
      });
    } else if (trend > 0) {
      result.push({
        icon: "📈",
        text: `Mood kamu naik ${trend.toFixed(1)} poin dari minggu lalu. Bagus!`,
        type: "positive",
      });
    } else {
      result.push({
        icon: "📉",
        text: "Mood kamu sedikit turun minggu ini. Yuk coba latihan mindfulness.",
        type: "warning",
      });
    }

    // Check consistency
    const daysWithEntry = recent.filter((m) => m.mood > 0).length;
    if (daysWithEntry >= 5) {
      result.push({
        icon: "🔥",
        text: `Konsisten! Kamu sudah check-in ${daysWithEntry} hari minggu ini.`,
        type: "positive",
      });
    }

    // Best day
    const bestDay = recent.reduce((best, m) => (m.mood > best.mood ? m : best), recent[0]);
    if (bestDay.mood >= 4) {
      const dayName = new Date(bestDay.date).toLocaleDateString("id-ID", { weekday: "long" });
      result.push({
        icon: "⭐",
        text: `Hari terbaikmu: ${dayName} dengan mood ${MOODS[bestDay.mood - 1].emoji}`,
        type: "neutral",
      });
    }

    return result;
  }, [moodHistory]);

  const navigateMonth = (dir: number) => {
    setCurrentMonth((prev) => {
      const d = new Date(prev);
      d.setMonth(d.getMonth() + dir);
      return d;
    });
  };

  const getMoodColor = (mood?: number) => {
    if (!mood || mood === 0) return "";
    return MOODS[mood - 1]?.lightColor || "";
  };

  const getMoodEmoji = (mood?: number) => {
    if (!mood || mood === 0) return "";
    return MOODS[mood - 1]?.emoji || "";
  };

  return (
    <div className="container mx-auto max-w-6xl p-4 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/wellness">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Mood Tracker</h1>
          <p className="text-muted-foreground">Pantau dan pahami pola mood-mu</p>
        </div>
      </div>

      {/* View Toggle */}
      <Tabs value={view} onValueChange={(v) => setView(v as "week" | "month")}>
        <TabsList>
          <TabsTrigger value="week">Mingguan</TabsTrigger>
          <TabsTrigger value="month">Bulanan</TabsTrigger>
        </TabsList>

        {/* Weekly View */}
        <TabsContent value="week" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Mood 7 Hari Terakhir</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-2">
                {weekDays.map((day, i) => {
                  const moodInfo = day.entry ? MOODS[day.entry.mood - 1] : null;
                  return (
                    <div key={i} className="flex flex-col items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        {DAYS[day.date.getDay()]}
                      </span>
                      <div
                        className={`w-12 h-12 md:w-16 md:h-16 rounded-xl flex items-center justify-center text-2xl md:text-3xl transition-all ${
                          moodInfo
                            ? `${moodInfo.lightColor} ring-2 ring-offset-1 ring-${moodInfo.color.replace("bg-", "")}`
                            : "bg-gray-100"
                        }`}
                      >
                        {moodInfo?.emoji || "·"}
                      </div>
                      <span className="text-xs font-medium">{day.date.getDate()}</span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Weekly trend bar chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Tren Mingguan</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end gap-2 h-40">
                {weekDays.map((day, i) => {
                  const mood = day.entry?.mood || 0;
                  const height = (mood / 5) * 100;
                  const moodInfo = mood > 0 ? MOODS[mood - 1] : null;
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                      <span className="text-xs text-muted-foreground">
                        {mood > 0 ? mood.toFixed(0) : "-"}
                      </span>
                      <div className="w-full flex items-end" style={{ height: "120px" }}>
                        <div
                          className={`w-full rounded-t-md transition-all ${
                            moodInfo?.color || "bg-gray-200"
                          }`}
                          style={{ height: `${height}%`, minHeight: mood > 0 ? "8px" : "2px" }}
                        />
                      </div>
                      <span className="text-xs">{DAYS[day.date.getDay()]}</span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Monthly View */}
        <TabsContent value="month" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  {currentMonth.toLocaleDateString("id-ID", { month: "long", year: "numeric" })}
                </CardTitle>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" onClick={() => navigateMonth(-1)}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => navigateMonth(1)}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-1">
                {DAYS.map((d) => (
                  <div
                    key={d}
                    className="text-center text-xs font-medium text-muted-foreground py-2"
                  >
                    {d}
                  </div>
                ))}
                {calendarDays.map((day, i) => {
                  const isCurrentMonth = day.date.getMonth() === currentMonth.getMonth();
                  const moodEmoji = getMoodEmoji(day.entry?.mood);
                  const bgColor = getMoodColor(day.entry?.mood);
                  const isToday =
                    day.date.toISOString().split("T")[0] ===
                    new Date().toISOString().split("T")[0];

                  return (
                    <div
                      key={i}
                      className={`aspect-square flex flex-col items-center justify-center rounded-lg text-sm transition-all ${
                        !isCurrentMonth
                          ? "text-gray-300"
                          : isToday
                          ? "ring-2 ring-pink-400 font-bold"
                          : ""
                      } ${bgColor} ${day.entry ? "cursor-pointer" : ""}`}
                      title={
                        day.entry
                          ? `${formatDate(day.date)}: ${MOODS[day.entry.mood - 1].label}${
                              day.entry.journal ? ` - "${day.entry.journal.slice(0, 50)}"` : ""
                            }`
                          : undefined
                      }
                    >
                      {moodEmoji ? (
                        <span className="text-lg">{moodEmoji}</span>
                      ) : (
                        <span className={isCurrentMonth ? "text-foreground" : ""}>
                          {day.date.getDate()}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Insights */}
      {insights.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Lightbulb className="h-5 w-5 text-yellow-500" />
              Insight
            </CardTitle>
            <CardDescription>Berdasarkan data mood-mu</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {insights.map((insight, i) => (
              <div
                key={i}
                className={`flex items-start gap-3 p-3 rounded-lg ${
                  insight.type === "positive"
                    ? "bg-green-50"
                    : insight.type === "warning"
                    ? "bg-amber-50"
                    : "bg-blue-50"
                }`}
              >
                <span className="text-xl">{insight.icon}</span>
                <p className="text-sm">{insight.text}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Journal Entries */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <BookOpen className="h-5 w-5 text-purple-500" />
            Jurnal Terbaru
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Memuat...</div>
          ) : moodHistory.filter((m) => m.journal).length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <BookOpen className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>Belum ada jurnal. Mulai tulis saat check-in!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {moodHistory
                .filter((m) => m.journal)
                .slice(-10)
                .reverse()
                .map((entry) => (
                  <div key={entry.id} className="flex gap-3 p-3 rounded-lg border">
                    <span className="text-2xl">{MOODS[entry.mood - 1]?.emoji}</span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium">
                          {formatDate(entry.date)}
                        </span>
                        <Badge variant="secondary" className="text-xs">
                          {MOODS[entry.mood - 1]?.label}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{entry.journal}</p>
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
