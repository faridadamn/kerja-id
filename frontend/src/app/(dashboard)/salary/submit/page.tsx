"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Shield,
  Eye,
  Lock,
  DollarSign,
  MapPin,
  Briefcase,
  Clock,
  GraduationCap,
  Building2,
  Send,
  Loader2,
  CheckCircle2,
  ArrowLeft,
  Info,
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
  { value: "0-1", label: "Fresh Graduate (0-1 tahun)" },
  { value: "1-3", label: "Junior (1-3 tahun)" },
  { value: "3-5", label: "Mid (3-5 tahun)" },
  { value: "5-10", label: "Senior (5-10 tahun)" },
  { value: "10+", label: "Expert (10+ tahun)" },
];

const EDUCATION_LEVELS = [
  { value: "SMA", label: "SMA / Sederajat" },
  { value: "D3", label: "D3 / Diploma" },
  { value: "S1", label: "S1 / Sarjana" },
  { value: "S2", label: "S2 / Magister" },
  { value: "S3", label: "S3 / Doktor" },
];

// ─── Main Page ───────────────────────────────────────────────────────────────────

export default function SubmitSalaryPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    position: "",
    company: "",
    industry: "",
    location: "",
    experience: "",
    education: "",
    salaryBase: "",
    salaryTotal: "",
    benefits: "",
    notes: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const canSubmit =
    form.position.trim() &&
    form.location &&
    form.experience &&
    form.salaryBase;

  const handleChange = (field: string, value: string) => {
    setForm((f) => ({ ...f, [field]: value }));
  };

  const handleSalaryInput = (field: string, value: string) => {
    // Allow only numbers
    const cleaned = value.replace(/[^0-9]/g, "");
    handleChange(field, cleaned);
  };

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    setError("");
    try {
      await api.post("/salary/submit", {
        position: form.position.trim(),
        company: form.company.trim() || undefined,
        industry: form.industry || undefined,
        location: form.location,
        experience: form.experience,
        education: form.education || undefined,
        salaryBase: Number(form.salaryBase),
        salaryTotal: form.salaryTotal ? Number(form.salaryTotal) : undefined,
        benefits: form.benefits.trim() || undefined,
        notes: form.notes.trim() || undefined,
      });
      setSubmitted(true);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Gagal mengirim data. Silakan coba lagi.");
    } finally {
      setSubmitting(false);
    }
  };

  // Success state
  if (submitted) {
    return (
      <div className="container mx-auto max-w-xl px-4 py-16">
        <Card className="text-center">
          <CardContent className="pt-10 pb-8 px-6 space-y-4">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-xl font-bold">Terima Kasih!</h2>
            <p className="text-muted-foreground max-w-sm mx-auto">
              Data gaji Anda telah berhasil dikirim secara anonim. Kontribusi Anda membantu pencari kerja lain mendapatkan informasi yang lebih baik.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 pt-4 justify-center">
              <Button onClick={() => { setSubmitted(false); setForm({ position: "", company: "", industry: "", location: "", experience: "", education: "", salaryBase: "", salaryTotal: "", benefits: "", notes: "" }); }}>
                Kirim Data Lagi
              </Button>
              <Button variant="outline" onClick={() => router.push("/salary")}>
                Kembali ke Insight Gaji
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8 space-y-6">
      {/* Header */}
      <div>
        <Button variant="ghost" size="sm" className="mb-2 -ml-2" onClick={() => router.push("/salary")}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Kembali
        </Button>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <DollarSign className="h-6 w-6" />
          Kirim Data Gaji
        </h1>
        <p className="text-muted-foreground mt-1">
          Bantu sesama pencari kerja dengan berbagi informasi gaji Anda
        </p>
      </div>

      {/* Privacy Notice */}
      <Card className="border-blue-200 bg-blue-50/50">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Shield className="h-5 w-5 text-blue-600 mt-0.5 shrink-0" />
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-blue-900">Privasi Terjaga</h3>
              <ul className="text-xs text-blue-800 space-y-1">
                <li className="flex items-center gap-1.5">
                  <Eye className="h-3 w-3 shrink-0" />
                  Data dikirim secara <strong>anonim</strong> — nama dan akun Anda tidak akan ditampilkan
                </li>
                <li className="flex items-center gap-1.5">
                  <Lock className="h-3 w-3 shrink-0" />
                  Informasi perusahaan bersifat <strong>opsional</strong>
                </li>
                <li className="flex items-center gap-1.5">
                  <Info className="h-3 w-3 shrink-0" />
                  Data digunakan untuk insight gaji komunitas, diakumulasi dan tidak bisa dilacak
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Form */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base">Data Gaji</CardTitle>
          <CardDescription>Isi data seakurat mungkin untuk hasil terbaik</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Position & Company */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label className="flex items-center gap-1.5">
                <Briefcase className="h-3.5 w-3.5" /> Posisi / Jabatan <span className="text-destructive">*</span>
              </Label>
              <Input
                placeholder="Contoh: Software Engineer"
                value={form.position}
                onChange={(e) => handleChange("position", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-1.5">
                <Building2 className="h-3.5 w-3.5" /> Perusahaan <span className="text-muted-foreground text-xs">(opsional)</span>
              </Label>
              <Input
                placeholder="Nama perusahaan"
                value={form.company}
                onChange={(e) => handleChange("company", e.target.value)}
              />
            </div>
          </div>

          {/* Industry & Location */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label className="flex items-center gap-1.5">
                <Building2 className="h-3.5 w-3.5" /> Industri <span className="text-muted-foreground text-xs">(opsional)</span>
              </Label>
              <Select value={form.industry} onValueChange={(v) => handleChange("industry", v)}>
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
            <div className="space-y-2">
              <Label className="flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5" /> Lokasi <span className="text-destructive">*</span>
              </Label>
              <Select value={form.location} onValueChange={(v) => handleChange("location", v)}>
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
          </div>

          {/* Experience & Education */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" /> Pengalaman <span className="text-destructive">*</span>
              </Label>
              <Select value={form.experience} onValueChange={(v) => handleChange("experience", v)}>
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
            <div className="space-y-2">
              <Label className="flex items-center gap-1.5">
                <GraduationCap className="h-3.5 w-3.5" /> Pendidikan <span className="text-muted-foreground text-xs">(opsional)</span>
              </Label>
              <Select value={form.education} onValueChange={(v) => handleChange("education", v)}>
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

          <Separator />

          {/* Salary */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>
                Gaji Pokok (per bulan) <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">Rp</span>
                <Input
                  className="pl-10"
                  placeholder="8000000"
                  value={form.salaryBase}
                  onChange={(e) => handleSalaryInput("salaryBase", e.target.value)}
                />
              </div>
              {form.salaryBase && (
                <p className="text-xs text-muted-foreground">
                  Rp {Number(form.salaryBase).toLocaleString("id-ID")}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label>
                Total Kompensasi (per bulan) <span className="text-muted-foreground text-xs">(opsional)</span>
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">Rp</span>
                <Input
                  className="pl-10"
                  placeholder="Termasuk tunjangan"
                  value={form.salaryTotal}
                  onChange={(e) => handleSalaryInput("salaryTotal", e.target.value)}
                />
              </div>
              {form.salaryTotal && (
                <p className="text-xs text-muted-foreground">
                  Rp {Number(form.salaryTotal).toLocaleString("id-ID")}
                </p>
              )}
            </div>
          </div>

          {/* Benefits */}
          <div className="space-y-2">
            <Label>Tunjangan & Benefits <span className="text-muted-foreground text-xs">(opsional)</span></Label>
            <Textarea
              placeholder="Contoh: BPJS, THR, bonus tahunan, makan siang, transport, laptop"
              value={form.benefits}
              onChange={(e) => handleChange("benefits", e.target.value)}
              rows={2}
              className="resize-none"
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label>Catatan Tambahan <span className="text-muted-foreground text-xs">(opsional)</span></Label>
            <Textarea
              placeholder="Info tambahan tentang pekerjaan atau gaji Anda"
              value={form.notes}
              onChange={(e) => handleChange("notes", e.target.value)}
              rows={2}
              className="resize-none"
            />
          </div>

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}
        </CardContent>
        <CardFooter className="flex-col gap-3">
          <Button className="w-full" size="lg" onClick={handleSubmit} disabled={!canSubmit || submitting}>
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Mengirim...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" /> Kirim Data Gaji
              </>
            )}
          </Button>
          <p className="text-[11px] text-muted-foreground text-center">
            Dengan mengirim data, Anda setuju bahwa informasi ini akan digunakan secara anonim untuk insight gaji komunitas.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
