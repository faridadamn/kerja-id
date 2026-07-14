"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  ArrowRight,
  Brain,
  Users,
  BookOpen,
  Target,
  Building2,
  Clock,
  Globe,
  Lightbulb,
  Loader2,
  Mic,
  Sparkles,
  CheckCircle2,
} from "lucide-react";

// ─── Constants ───────────────────────────────────────────────────────────────────

const INTERVIEW_TYPES = [
  {
    value: "behavioral",
    label: "Behavioral",
    icon: Users,
    color: "border-blue-300 bg-blue-50 hover:bg-blue-100",
    activeColor: "border-blue-500 bg-blue-100 ring-2 ring-blue-300",
    description: "Pertanyaan tentang pengalaman, perilaku, dan cara Anda menangani situasi kerja.",
  },
  {
    value: "technical",
    label: "Technical",
    icon: Brain,
    color: "border-purple-300 bg-purple-50 hover:bg-purple-100",
    activeColor: "border-purple-500 bg-purple-100 ring-2 ring-purple-300",
    description: "Pertanyaan teknis mendalam sesuai bidang dan posisi yang dilamar.",
  },
  {
    value: "case_study",
    label: "Case Study",
    icon: BookOpen,
    color: "border-orange-300 bg-orange-50 hover:bg-orange-100",
    activeColor: "border-orange-500 bg-orange-100 ring-2 ring-orange-300",
    description: "Analisis studi kasus bisnis nyata untuk menguji kemampuan berpikir strategis.",
  },
  {
    value: "hr_culture",
    label: "HR & Culture",
    icon: Target,
    color: "border-green-300 bg-green-50 hover:bg-green-100",
    activeColor: "border-green-500 bg-green-100 ring-2 ring-green-300",
    description: "Pertanyaan tentang kesesuaian budaya, nilai, dan motivasi kerja Anda.",
  },
] as const;

const LANGUAGES = [
  { value: "id", label: "Bahasa Indonesia", flag: "🇮🇩" },
  { value: "en", label: "English", flag: "🇬🇧" },
  { value: "mixed", label: "Campur (ID + EN)", flag: "🌐" },
] as const;

const DURATIONS = [
  { value: "15", label: "15 menit", description: "~3-5 pertanyaan" },
  { value: "30", label: "30 menit", description: "~6-10 pertanyaan" },
  { value: "60", label: "60 menit", description: "~12-20 pertanyaan" },
] as const;

const TIPS = [
  "Jawab dengan metode STAR (Situation, Task, Action, Result) untuk pertanyaan behavioral.",
  "Gunakan contoh spesifik dari pengalaman kerja Anda, bukan jawaban umum.",
  "Jangan ragu untuk meminta klarifikasi jika pertanyaan kurang jelas.",
  "Perhatikan waktu — alokasikan waktu yang cukup untuk setiap jawaban.",
  "Tunjukkan antusiasme dan passion terhadap posisi yang dilamar.",
];

// ─── Page ────────────────────────────────────────────────────────────────────────

export default function InterviewSetupPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    position: "",
    company: "",
    type: "",
    language: "id",
    duration: "30",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const isValid = form.position.trim().length > 0 && form.type.length > 0;

  const handleSubmit = async () => {
    if (!isValid) return;
    setSubmitting(true);
    setError("");
    try {
      const res = await api.post<{ id: string }>("/interview/start", {
        position: form.position.trim(),
        company: form.company.trim() || undefined,
        type: form.type,
        language: form.language,
        duration: parseInt(form.duration),
      });
      router.push(`/interview/session/${res.data.id}`);
    } catch (err: any) {
      console.error("Failed to start interview:", err);
      setError(
        err.response?.data?.message || "Gagal memulai sesi interview. Silakan coba lagi."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => router.push("/interview")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" />
            Setup Interview
          </h1>
          <p className="text-sm text-muted-foreground">
            Konfigurasi sesi latihan interview Anda
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        {/* Main Form */}
        <div className="space-y-6">
          {/* Position & Company */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Posisi & Perusahaan</CardTitle>
              <CardDescription>Tentukan target posisi yang ingin Anda latih</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="position">
                  Posisi Target <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="position"
                  placeholder="Contoh: Frontend Developer, Product Manager, Data Analyst"
                  value={form.position}
                  onChange={(e) => setForm({ ...form, position: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="company" className="flex items-center gap-1">
                  <Building2 className="h-3.5 w-3.5" />
                  Perusahaan <span className="text-muted-foreground font-normal">(opsional)</span>
                </Label>
                <Input
                  id="company"
                  placeholder="Contoh: Tokopedia, Gojek, Traveloka"
                  value={form.company}
                  onChange={(e) => setForm({ ...form, company: e.target.value })}
                />
                <p className="text-xs text-muted-foreground">
                  Menambahkan nama perusahaan akan membuat pertanyaan lebih relevan
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Interview Type */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Tipe Interview</CardTitle>
              <CardDescription>Pilih jenis wawancara yang ingin Anda latih</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-2">
                {INTERVIEW_TYPES.map((t) => {
                  const Icon = t.icon;
                  const isActive = form.type === t.value;
                  return (
                    <button
                      key={t.value}
                      type="button"
                      className={cn(
                        "rounded-lg border-2 p-4 text-left transition-all",
                        isActive ? t.activeColor : t.color
                      )}
                      onClick={() => setForm({ ...form, type: t.value })}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <Icon className="h-5 w-5" />
                        <span className="font-semibold text-sm">{t.label}</span>
                        {isActive && <CheckCircle2 className="h-4 w-4 ml-auto text-primary" />}
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {t.description}
                      </p>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Language & Duration */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Bahasa & Durasi</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label className="flex items-center gap-1">
                  <Globe className="h-3.5 w-3.5" />
                  Bahasa
                </Label>
                <Select
                  value={form.language}
                  onValueChange={(val) => setForm({ ...form, language: val })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {LANGUAGES.map((l) => (
                      <SelectItem key={l.value} value={l.value}>
                        {l.flag} {l.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  Durasi
                </Label>
                <Select
                  value={form.duration}
                  onValueChange={(val) => setForm({ ...form, duration: val })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DURATIONS.map((d) => (
                      <SelectItem key={d.value} value={d.value}>
                        {d.label} <span className="text-muted-foreground ml-1">({d.description})</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Error */}
          {error && (
            <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          {/* Submit */}
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => router.push("/interview")}>
              Batal
            </Button>
            <Button size="lg" onClick={handleSubmit} disabled={!isValid || submitting}>
              {submitting ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Mic className="h-4 w-4 mr-2" />
              )}
              {submitting ? "Memulai..." : "Mulai Interview"}
              {!submitting && <ArrowRight className="h-4 w-4 ml-1" />}
            </Button>
          </div>
        </div>

        {/* Tips Sidebar */}
        <div className="hidden lg:block">
          <Card className="sticky top-6 border-amber-200 bg-amber-50">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2 text-amber-800">
                <Lightbulb className="h-5 w-5 text-amber-600" />
                Tips Interview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {TIPS.map((tip, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-amber-900">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-200 text-[11px] font-bold text-amber-700">
                      {i + 1}
                    </span>
                    <span className="leading-relaxed">{tip}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
