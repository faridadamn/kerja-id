"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Heart,
  Smile,
  BookOpen,
  Users,
  RefreshCw,
  Stethoscope,
  TrendingUp,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import api from "@/lib/api";
import type { MoodEntry } from "@/lib/types";

const MOODS = [
  { value: 1, emoji: "😫", label: "Sangat Buruk", color: "bg-red-500" },
  { value: 2, emoji: "😟", label: "Buruk", color: "bg-orange-400" },
  { value: 3, emoji: "😐", label: "Biasa", color: "bg-yellow-400" },
  { value: 4, emoji: "🙂", label: "Baik", color: "bg-green-400" },
  { value: 5, emoji: "😄", label: "Sangat Baik", color: "bg-emerald-500" },
];

const WELLNESS_ARTICLES = [
  {
    title: "5 Menit Napas Sadar untuk Kurangi Cemas",
    description: "Teknik pernapasan sederhana yang bisa kamu lakukan kapan saja.",
    tag: "Latihan",
    duration: "5 menit",
  },
  {
    title: "Mengapa Rejection Bukan Akhir Dunia",
    description: "Perspektif baru tentang penolakan dalam pencarian kerja.",
    tag: "Artikel",
    duration: "3 menit baca",
  },
  {
    title: "Journaling untuk Kesehatan Mental",
    description: "Cara menulis jurnal yang efektif untuk refleksi diri.",
    tag: "Panduan",
    duration: "4 menit baca",
  },
];

export default function WellnessPage() {
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [journal, setJournal] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [moodHistory, setMoodHistory] = useState<MoodEntry[]>([]);
  const [loading, setLoading] = useState(true);

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

  const handleSubmitMood = async () => {
    if (!selectedMood) return;
    setSubmitting(true);
    try {
      await api.post("/wellness/mood", { mood: selectedMood, journal: journal || undefined });
      setSubmitted(true);
      setSelectedMood(null);
      setJournal("");
      fetchMoodHistory();
      setTimeout(() => setSubmitted(false), 3000);
    } catch {
      // handle error
    } finally {
      setSubmitting(false);
    }
  };

  // Build last 30 days chart data
  const last30Days = Array.from({ length: 30 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (29 - i));
    const dateStr = d.toISOString().split("T")[0];
    const entry = moodHistory.find((m) => m.date?.startsWith(dateStr));
    return { date: dateStr, mood: entry?.mood ?? 0, day: d.getDate() };
  });

  const maxMood = 5;

  return (
    <div className="container mx-auto max-w-6xl p-4 md:p-8 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-pink-100 text-pink-600">
            <Heart className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">JobWell</h1>
            <p className="text-muted-foreground">Kesehatan mental untuk perjalanan karirmu</p>
          </div>
        </div>
      </div>

      {/* Daily Mood Check-in */}
      <Card className="border-pink-200 bg-gradient-to-br from-pink-50 to-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Smile className="h-5 w-5 text-pink-500" />
            Check-in Harian
          </CardTitle>
          <CardDescription>Gimana perasaanmu hari ini?</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {submitted ? (
            <div className="text-center py-8 space-y-2">
              <div className="text-4xl">✨</div>
              <p className="font-medium text-lg">Terima kasih sudah check-in!</p>
              <p className="text-sm text-muted-foreground">Jaga terus kesehatan mentalmu ya.</p>
            </div>
          ) : (
            <>
              <div className="flex justify-center gap-3 md:gap-6">
                {MOODS.map((mood) => (
                  <button
                    key={mood.value}
                    onClick={() => setSelectedMood(mood.value)}
                    className={`flex flex-col items-center gap-1 p-3 rounded-xl transition-all ${
                      selectedMood === mood.value
                        ? "bg-pink-100 scale-110 ring-2 ring-pink-400"
                        : "hover:bg-gray-50"
                    }`}
                  >
                    <span className="text-3xl md:text-4xl">{mood.emoji}</span>
                    <span className="text-xs text-muted-foreground">{mood.label}</span>
                  </button>
                ))}
              </div>

              {selectedMood && (
                <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
                  <Textarea
                    placeholder="Ceritakan lebih lanjut (opsional)..."
                    value={journal}
                    onChange={(e) => setJournal(e.target.value)}
                    rows={3}
                  />
                  <Button
                    onClick={handleSubmitMood}
                    disabled={submitting}
                    className="w-full bg-pink-600 hover:bg-pink-700"
                  >
                    {submitting ? "Mengirim..." : "Kirim Check-in"}
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Mood Trends Chart */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingUp className="h-5 w-5 text-blue-500" />
              Tren Mood 30 Hari
            </CardTitle>
            <Link href="/wellness/mood">
              <Button variant="ghost" size="sm">
                Detail <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="h-32 flex items-center justify-center text-muted-foreground">
              Memuat data...
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-end gap-1 h-32">
                {last30Days.map((day, i) => {
                  const height = day.mood > 0 ? (day.mood / maxMood) * 100 : 0;
                  const color =
                    day.mood >= 4
                      ? "bg-green-400"
                      : day.mood === 3
                      ? "bg-yellow-400"
                      : day.mood >= 1
                      ? "bg-red-400"
                      : "bg-gray-200";
                  return (
                    <div
                      key={i}
                      className="flex-1 flex flex-col items-center gap-1"
                      title={`${day.date}: ${day.mood > 0 ? MOODS[day.mood - 1].emoji : "Belum"}`}
                    >
                      <div
                        className={`w-full rounded-t-sm transition-all ${color}`}
                        style={{ height: `${height}%`, minHeight: day.mood > 0 ? "4px" : "2px" }}
                      />
                    </div>
                  );
                })}
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>30 hari lalu</span>
                <span>Hari ini</span>
              </div>
              <div className="flex gap-4 justify-center pt-2">
                {MOODS.map((m) => (
                  <div key={m.value} className="flex items-center gap-1 text-xs">
                    <div className={`w-3 h-3 rounded-full ${m.color}`} />
                    <span>{m.label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Wellness of the Day */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Sparkles className="h-5 w-5 text-amber-500" />
              Wellness Hari Ini
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {WELLNESS_ARTICLES.map((article, i) => (
              <div
                key={i}
                className="p-4 rounded-lg border hover:border-pink-200 hover:bg-pink-50/50 transition-colors cursor-pointer"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        {article.tag}
                      </Badge>
                      <span className="text-xs text-muted-foreground">{article.duration}</span>
                    </div>
                    <h4 className="font-medium text-sm">{article.title}</h4>
                    <p className="text-xs text-muted-foreground">{article.description}</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0 mt-1" />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Quick Links */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <BookOpen className="h-5 w-5 text-purple-500" />
              Akses Cepat
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/wellness/community">
              <div className="flex items-center gap-4 p-4 rounded-lg border hover:border-blue-200 hover:bg-blue-50/50 transition-colors">
                <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                  <Users className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-sm">Komunitas Dukungan</h4>
                  <p className="text-xs text-muted-foreground">
                    Terhubung dengan sesama pencari kerja
                  </p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </div>
            </Link>

            <Link href="/wellness/reframe">
              <div className="flex items-center gap-4 p-4 rounded-lg border hover:border-amber-200 hover:bg-amber-50/50 transition-colors">
                <div className="p-2 rounded-lg bg-amber-100 text-amber-600">
                  <RefreshCw className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-sm">Rejection Reframe</h4>
                  <p className="text-xs text-muted-foreground">
                    Ubah perspektif tentang penolakan
                  </p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </div>
            </Link>

            <a href="https://www.halodoc.com" target="_blank" rel="noopener noreferrer">
              <div className="flex items-center gap-4 p-4 rounded-lg border hover:border-green-200 hover:bg-green-50/50 transition-colors">
                <div className="p-2 rounded-lg bg-green-100 text-green-600">
                  <Stethoscope className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-sm">Bantuan Profesional</h4>
                  <p className="text-xs text-muted-foreground">
                    Konsultasi dengan tenaga profesional
                  </p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </div>
            </a>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
