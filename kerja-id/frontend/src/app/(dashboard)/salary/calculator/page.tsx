"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { cn, formatSalary } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Calculator,
  MapPin,
  Briefcase,
  Clock,
  GraduationCap,
  TrendingUp,
  TrendingDown,
  BarChart3,
  ArrowLeft,
  Loader2,
  DollarSign,
  Building2,
  Scale,
} from "lucide-react";

// ─── Constants ───────────────────────────────────────────────────────────────────

const LOCATIONS = [
  "Jakarta",
  "Surabaya",
  "Bandung",
  "Semarang",
  "Yogyakarta",
  "Medan",
  "Makassar",
  "Bali",
  "Tangerang",
  "Bekasi",
  "Remote",
];

const INDUSTRIES = [
  "Teknologi Informasi",
  "Perbankan & Keuangan",
  "E-Commerce",
  "Konsultan",
  "Manufaktur",
  "Kesehatan",
  "Pendidikan",
  "Retail",
  "Media & Kreatif",
  "Telekomunikasi",
  "Oil & Gas",
  "Properti",
];

const EXPERIENCE_LEVELS = [
  { value: "0", label: "Fresh Graduate" },
  { value: "1", label: "1 tahun" },
  { value: "2", label: "2 tahun" },
  { value: "3", label: "3 tahun" },
  { value: "5", label: "5 tahun" },
  { value: "7", label: "7 tahun" },
  { value: "10", label: "10 tahun" },
  { value: "15", label: "15+ tahun" },
];

const EDUCATION_LEVELS = [
  { value: "SMA", label: "SMA / Sederajat" },
  { value: "D3", label: "D3 / Diploma" },
  { value: "S1", label: "S1 / Sarjana" },
  { value: "S2", label: "S2 / Magister" },
  { value: "S3", label: "S3 / Doktor" },
];

// ─── Types ───────────────────────────────────────────────────────────────────────

interface SalaryEstimate {
  position: string;
  location: string;
  experience: string;
  estimatedMin: number;
  estimatedMax: number;
  estimatedMedian: number;
  marketMedian: number;
  marketP25: number;
  marketP75: number;
  percentile: number; // where you stand (0-100)
  sampleSize: number;
  factors: {
    name: string;
    impact: "positive" | "negative" | "neutral";
    description: string;
  }[];
}

// ─── Salary Range Bar ────────────────────────────────────────────────────────────

function SalaryRangeBar({ estimate }: { estimate: SalaryEstimate }) {
  const totalMin = Math.min(estimate.estimatedMin, estimate.marketP25) * 0.9;
  const totalMax = Math.max(estimate.estimatedMax, estimate.marketP75) * 1.1;
  const range = totalMax - totalMin;

  const getPos = (val: number) => ((val - totalMin) / range) * 100;

  const estMinPos = getPos(estimate.estimatedMin);
  const estMaxPos = getPos(estimate.estimatedMax);
  const estMedPos = getPos(estimate.estimatedMedian);
  const mktP25Pos = getPos(estimate.marketP25);
  const mktP75Pos = getPos(estimate.marketP75);
  const mktMedPos = getPos(estimate.marketMedian);

  return (
    <div className="space-y-3">
      <div className="relative h-10 w-full rounded-lg bg-muted/60 overflow-hidden">
        {/* Market range (P25-P75) */}
        <div
          className="absolute top-0 h-full bg-blue-100"
          style={{ left: `${mktP25Pos}%`, width: `${mktP75Pos - mktP25Pos}%` }}
        />
        {/* Estimated range */}
        <div
          className="absolute top-1 bottom-1 rounded bg-primary/30"
          style={{ left: `${estMinPos}%`, width: `${estMaxPos - estMinPos}%` }}
        />
        {/* Inner bar */}
        <div
          className="absolute top-2 bottom-2 rounded bg-primary/50"
          style={{ left: `${estMinPos + (estMaxPos - estMinPos) * 0.15}%`, width: `${(estMaxPos - estMinPos) * 0.7}%` }}
        />
        {/* Estimated median marker */}
        <div
          className="absolute top-0 bottom-0 w-1 bg-primary"
          style={{ left: `${estMedPos}%` }}
        >
          <div className="absolute -top-5 left-1/2 -translate-x-1/2 whitespace-nowrap">
            <span className="text-[10px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded">
              Estimasi
            </span>
          </div>
        </div>
        {/* Market median marker */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-blue-500/60 border-dashed"
          style={{ left: `${mktMedPos}%` }}
        >
          <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap">
            <span className="text-[10px] text-blue-600">Market</span>
          </div>
        </div>
      </div>

      <div className="flex justify-between text-xs text-muted-foreground pt-2">
        <span>{formatSalary(Math.floor(totalMin))}</span>
        <span>{formatSalary(Math.floor(totalMax))}</span>
      </div>

      <div className="flex gap-4 text-xs">
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-3 rounded bg-primary/50" />
          <span>Estimasi Anda</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-3 rounded bg-blue-100" />
          <span>Pasar (P25-P75)</span>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────────

export default function SalaryCalculatorPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    position: "",
    industry: "",
    location: "",
    experience: "",
    education: "",
  });
  const [estimate, setEstimate] = useState<SalaryEstimate | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const canSubmit = form.position.trim() && form.location && form.experience;

  const handleCalculate = async () => {
    if (!canSubmit) return;
    setLoading(true);
    setError("");
    setEstimate(null);
    try {
      const params: Record<string, string> = {
        position: form.position.trim(),
        location: form.location,
        experience: form.experience,
      };
      if (form.industry) params.industry = form.industry;
      if (form.education) params.education = form.education;
      const res = await api.get<SalaryEstimate>("/salary/calculator", { params });
      setEstimate(res.data);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Gagal menghitung estimasi gaji. Coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto max-w-3xl px-4 py-8 space-y-6">
      {/* Header */}
      <div>
        <Button variant="ghost" size="sm" className="mb-2 -ml-2" onClick={() => router.push("/salary")}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Kembali
        </Button>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Calculator className="h-6 w-6" />
          Kalkulator Gaji
        </h1>
        <p className="text-muted-foreground mt-1">
          Hitung estimasi gaji berdasarkan posisi, lokasi, dan pengalamanmu
        </p>
      </div>

      {/* Form */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base">Input Data</CardTitle>
          <CardDescription>Isi form di bawah untuk mendapatkan estimasi gaji</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Position */}
          <div className="space-y-2">
            <Label className="flex items-center gap-1.5">
              <Briefcase className="h-3.5 w-3.5" /> Posisi / Jabatan <span className="text-destructive">*</span>
            </Label>
            <Input
              placeholder="Contoh: Software Engineer, Product Manager, Data Analyst"
              value={form.position}
              onChange={(e) => setForm((f) => ({ ...f, position: e.target.value }))}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {/* Location */}
            <div className="space-y-2">
              <Label className="flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5" /> Lokasi <span className="text-destructive">*</span>
              </Label>
              <Select value={form.location} onValueChange={(v) => setForm((f) => ({ ...f, location: v }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih lokasi" />
                </SelectTrigger>
                <SelectContent>
                  {LOCATIONS.map((loc) => (
                    <SelectItem key={loc} value={loc}>
                      {loc}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Experience */}
            <div className="space-y-2">
              <Label className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" /> Pengalaman <span className="text-destructive">*</span>
              </Label>
              <Select value={form.experience} onValueChange={(v) => setForm((f) => ({ ...f, experience: v }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih pengalaman" />
                </SelectTrigger>
                <SelectContent>
                  {EXPERIENCE_LEVELS.map((exp) => (
                    <SelectItem key={exp.value} value={exp.value}>
                      {exp.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {/* Industry */}
            <div className="space-y-2">
              <Label className="flex items-center gap-1.5">
                <Building2 className="h-3.5 w-3.5" /> Industri <span className="text-muted-foreground text-xs">(opsional)</span>
              </Label>
              <Select value={form.industry} onValueChange={(v) => setForm((f) => ({ ...f, industry: v }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih industri" />
                </SelectTrigger>
                <SelectContent>
                  {INDUSTRIES.map((ind) => (
                    <SelectItem key={ind} value={ind}>
                      {ind}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Education */}
            <div className="space-y-2">
              <Label className="flex items-center gap-1.5">
                <GraduationCap className="h-3.5 w-3.5" /> Pendidikan <span className="text-muted-foreground text-xs">(opsional)</span>
              </Label>
              <Select value={form.education} onValueChange={(v) => setForm((f) => ({ ...f, education: v }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih pendidikan" />
                </SelectTrigger>
                <SelectContent>
                  {EDUCATION_LEVELS.map((edu) => (
                    <SelectItem key={edu.value} value={edu.value}>
                      {edu.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}
        </CardContent>
        <CardFooter>
          <Button className="w-full" size="lg" onClick={handleCalculate} disabled={!canSubmit || loading}>
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Menghitung...
              </>
            ) : (
              <>
                <Calculator className="h-4 w-4 mr-2" /> Hitung Estimasi
              </>
            )}
          </Button>
        </CardFooter>
      </Card>

      {/* Results */}
      {estimate && (
        <div className="space-y-4">
          {/* Estimated Range Card */}
          <Card className="border-primary/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-primary" />
                Estimasi Gaji untuk {estimate.position}
              </CardTitle>
              <CardDescription>
                {estimate.location} · {estimate.experience} pengalaman
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Big numbers */}
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Minimum</p>
                  <p className="text-lg font-bold text-foreground">{formatSalary(estimate.estimatedMin)}</p>
                </div>
                <div className="border-x">
                  <p className="text-xs text-muted-foreground mb-1">Median</p>
                  <p className="text-2xl font-bold text-primary">{formatSalary(estimate.estimatedMedian)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Maksimum</p>
                  <p className="text-lg font-bold text-foreground">{formatSalary(estimate.estimatedMax)}</p>
                </div>
              </div>

              <Separator />

              {/* Visual Range Bar */}
              <SalaryRangeBar estimate={estimate} />
            </CardContent>
          </Card>

          {/* vs Market */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Scale className="h-5 w-5" />
                Perbandingan dengan Pasar
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-muted/50 rounded-lg p-3 text-center">
                  <p className="text-xs text-muted-foreground">Market Median</p>
                  <p className="text-lg font-semibold">{formatSalary(estimate.marketMedian)}</p>
                </div>
                <div className="bg-muted/50 rounded-lg p-3 text-center">
                  <p className="text-xs text-muted-foreground">Market P25 – P75</p>
                  <p className="text-lg font-semibold">
                    {formatSalary(estimate.marketP25)} – {formatSalary(estimate.marketP75)}
                  </p>
                </div>
              </div>

              {/* Percentile */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Posisi Anda di pasar</span>
                  <Badge variant={estimate.percentile >= 50 ? "default" : "secondary"}>
                    Persentil ke-{estimate.percentile}
                  </Badge>
                </div>
                <div className="relative h-3 w-full rounded-full bg-muted overflow-hidden">
                  <div
                    className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-primary/60 to-primary"
                    style={{ width: `${estimate.percentile}%` }}
                  />
                  <div
                    className="absolute top-0 bottom-0 w-0.5 bg-foreground/60"
                    style={{ left: "50%" }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-muted-foreground">
                  <span>0</span>
                  <span>50</span>
                  <span>100</span>
                </div>
              </div>

              {/* Comparison text */}
              <div
                className={cn(
                  "flex items-center gap-2 p-3 rounded-lg text-sm",
                  estimate.estimatedMedian >= estimate.marketMedian
                    ? "bg-green-50 text-green-800"
                    : "bg-orange-50 text-orange-800"
                )}
              >
                {estimate.estimatedMedian >= estimate.marketMedian ? (
                  <>
                    <TrendingUp className="h-4 w-4 shrink-0" />
                    <span>
                      Estimasi Anda <strong>{formatSalary(estimate.estimatedMedian - estimate.marketMedian)}</strong> di atas median pasar
                    </span>
                  </>
                ) : (
                  <>
                    <TrendingDown className="h-4 w-4 shrink-0" />
                    <span>
                      Estimasi Anda <strong>{formatSalary(estimate.marketMedian - estimate.estimatedMedian)}</strong> di bawah median pasar
                    </span>
                  </>
                )}
              </div>

              <p className="text-xs text-muted-foreground">
                Berdasarkan {estimate.sampleSize} data responden
              </p>
            </CardContent>
          </Card>

          {/* Factors */}
          {estimate.factors.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" /> Faktor yang Mempengaruhi
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {estimate.factors.map((f, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div
                        className={cn(
                          "mt-0.5 h-6 w-6 shrink-0 rounded-full flex items-center justify-center",
                          f.impact === "positive"
                            ? "bg-green-100 text-green-600"
                            : f.impact === "negative"
                            ? "bg-red-100 text-red-600"
                            : "bg-muted text-muted-foreground"
                        )}
                      >
                        {f.impact === "positive" ? (
                          <TrendingUp className="h-3.5 w-3.5" />
                        ) : f.impact === "negative" ? (
                          <TrendingDown className="h-3.5 w-3.5" />
                        ) : (
                          <span className="text-[10px] font-bold">~</span>
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{f.name}</p>
                        <p className="text-xs text-muted-foreground">{f.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action */}
          <div className="flex gap-3 pb-8">
            <Button variant="outline" className="flex-1" onClick={() => router.push("/salary/search?q=" + encodeURIComponent(form.position))}>
              Cari Data Gaji
            </Button>
            <Button className="flex-1" onClick={() => { setEstimate(null); setForm({ position: "", industry: "", location: "", experience: "", education: "" }); }}>
              Hitung Lagi
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
