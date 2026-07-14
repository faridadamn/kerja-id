"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import api from "@/lib/api";
import type { CvVersion, CvTemplate, Profile, Experience, Education, UserSkill } from "@/lib/types";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  ChevronLeft,
  ChevronRight,
  Save,
  Loader2,
  Plus,
  Trash2,
  GripVertical,
  User,
  FileText,
  Briefcase,
  GraduationCap,
  Wrench,
  CheckCircle2,
  LayoutTemplate,
} from "lucide-react";

interface CvContent {
  personalInfo: {
    fullName: string;
    email: string;
    phone: string;
    location: string;
    linkedinUrl: string;
    githubUrl: string;
    portfolioUrl: string;
    website: string;
  };
  summary: string;
  experiences: {
    id: string;
    company: string;
    position: string;
    description: string;
    startDate: string;
    endDate: string;
    isCurrent: boolean;
    location: string;
  }[];
  educations: {
    id: string;
    institution: string;
    degree: string;
    field: string;
    startYear: string;
    endYear: string;
    gpa: string;
    description: string;
  }[];
  skills: {
    id: string;
    name: string;
    level: number;
  }[];
}

const STEPS = [
  { id: 1, label: "Template", icon: LayoutTemplate },
  { id: 2, label: "Info Pribadi", icon: User },
  { id: 3, label: "Ringkasan", icon: FileText },
  { id: 4, label: "Pengalaman", icon: Briefcase },
  { id: 5, label: "Pendidikan", icon: GraduationCap },
  { id: 6, label: "Keahlian", icon: Wrench },
];

const TEMPLATES: CvTemplate[] = [
  { id: "modern", name: "Modern", category: "professional", description: "Desain bersih dan kontemporer dengan sentuhan warna", previewUrl: "", atsScore: 95 },
  { id: "classic", name: "Klasik", category: "traditional", description: "Format tradisional yang diterima secara luas", previewUrl: "", atsScore: 98 },
  { id: "creative", name: "Kreatif", category: "creative", description: "Desain unik untuk industri kreatif", previewUrl: "", atsScore: 80 },
  { id: "minimal", name: "Minimalis", category: "simple", description: "Sederhana dan mudah dibaca", previewUrl: "", atsScore: 97 },
  { id: "executive", name: "Eksekutif", category: "executive", description: "Profesional untuk posisi senior", previewUrl: "", atsScore: 96 },
];

function newId() {
  return Math.random().toString(36).slice(2, 9);
}

const emptyContent: CvContent = {
  personalInfo: {
    fullName: "",
    email: "",
    phone: "",
    location: "",
    linkedinUrl: "",
    githubUrl: "",
    portfolioUrl: "",
    website: "",
  },
  summary: "",
  experiences: [],
  educations: [],
  skills: [],
};

export default function CvBuilderPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("id");
  const { user } = useAuth();

  const [step, setStep] = useState(1);
  const [selectedTemplate, setSelectedTemplate] = useState("modern");
  const [cvName, setCvName] = useState("");
  const [targetPosition, setTargetPosition] = useState("");
  const [targetCompany, setTargetCompany] = useState("");
  const [content, setContent] = useState<CvContent>(emptyContent);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(!!editId);
  const [profileLoaded, setProfileLoaded] = useState(false);

  // Load existing CV if editing
  useEffect(() => {
    if (editId) {
      setLoading(true);
      api.get<CvVersion[]>("/cv").then((res) => {
        const cv = res.data.find((c) => c.id === editId);
        if (cv) {
          setCvName(cv.name);
          setSelectedTemplate(cv.templateId || "modern");
          setTargetPosition(cv.targetPosition || "");
          setTargetCompany(cv.targetCompany || "");
          if (cv.content) {
            setContent({ ...emptyContent, ...cv.content });
          }
        }
      }).finally(() => setLoading(false));
    }
  }, [editId]);

  // Auto-fill from profile
  useEffect(() => {
    if (user?.profile && !editId && !profileLoaded) {
      const p = user.profile;
      setContent((prev) => ({
        ...prev,
        personalInfo: {
          fullName: p.fullName || prev.personalInfo.fullName,
          email: user.email || prev.personalInfo.email,
          phone: prev.personalInfo.phone,
          location: p.location || prev.personalInfo.location,
          linkedinUrl: p.linkedinUrl || prev.personalInfo.linkedinUrl,
          githubUrl: p.githubUrl || prev.personalInfo.githubUrl,
          portfolioUrl: p.portfolioUrl || prev.personalInfo.portfolioUrl,
          website: p.website || prev.personalInfo.website,
        },
        experiences: p.experiences?.map((e) => ({
          id: e.id,
          company: e.company,
          position: e.position,
          description: e.description || "",
          startDate: e.startDate?.slice(0, 10) || "",
          endDate: e.endDate?.slice(0, 10) || "",
          isCurrent: e.isCurrent,
          location: e.location || "",
        })) || prev.experiences,
        educations: p.educations?.map((e) => ({
          id: e.id,
          institution: e.institution,
          degree: e.degree,
          field: e.field,
          startYear: String(e.startYear),
          endYear: e.endYear ? String(e.endYear) : "",
          gpa: e.gpa ? String(e.gpa) : "",
          description: e.description || "",
        })) || prev.educations,
        skills: p.skills?.map((s) => ({
          id: s.id,
          name: s.name,
          level: s.level,
        })) || prev.skills,
      }));
      setProfileLoaded(true);
    }
  }, [user, editId, profileLoaded]);

  const updatePersonal = useCallback((field: string, value: string) => {
    setContent((prev) => ({
      ...prev,
      personalInfo: { ...prev.personalInfo, [field]: value },
    }));
  }, []);

  const addExperience = useCallback(() => {
    setContent((prev) => ({
      ...prev,
      experiences: [
        ...prev.experiences,
        { id: newId(), company: "", position: "", description: "", startDate: "", endDate: "", isCurrent: false, location: "" },
      ],
    }));
  }, []);

  const updateExperience = useCallback((id: string, field: string, value: any) => {
    setContent((prev) => ({
      ...prev,
      experiences: prev.experiences.map((e) => (e.id === id ? { ...e, [field]: value } : e)),
    }));
  }, []);

  const removeExperience = useCallback((id: string) => {
    setContent((prev) => ({
      ...prev,
      experiences: prev.experiences.filter((e) => e.id !== id),
    }));
  }, []);

  const addEducation = useCallback(() => {
    setContent((prev) => ({
      ...prev,
      educations: [
        ...prev.educations,
        { id: newId(), institution: "", degree: "", field: "", startYear: "", endYear: "", gpa: "", description: "" },
      ],
    }));
  }, []);

  const updateEducation = useCallback((id: string, field: string, value: string) => {
    setContent((prev) => ({
      ...prev,
      educations: prev.educations.map((e) => (e.id === id ? { ...e, [field]: value } : e)),
    }));
  }, []);

  const removeEducation = useCallback((id: string) => {
    setContent((prev) => ({
      ...prev,
      educations: prev.educations.filter((e) => e.id !== id),
    }));
  }, []);

  const addSkill = useCallback(() => {
    setContent((prev) => ({
      ...prev,
      skills: [...prev.skills, { id: newId(), name: "", level: 50 }],
    }));
  }, []);

  const updateSkill = useCallback((id: string, field: string, value: any) => {
    setContent((prev) => ({
      ...prev,
      skills: prev.skills.map((s) => (s.id === id ? { ...s, [field]: value } : s)),
    }));
  }, []);

  const removeSkill = useCallback((id: string) => {
    setContent((prev) => ({
      ...prev,
      skills: prev.skills.filter((s) => s.id !== id),
    }));
  }, []);

  function getCompletionPercent(): number {
    let filled = 0;
    let total = 6;
    if (selectedTemplate) filled++;
    if (content.personalInfo.fullName && content.personalInfo.email) filled++;
    if (content.summary.trim()) filled++;
    if (content.experiences.length > 0) filled++;
    if (content.educations.length > 0) filled++;
    if (content.skills.length > 0) filled++;
    return Math.round((filled / total) * 100);
  }

  async function handleSave() {
    if (!cvName.trim()) {
      alert("Masukkan nama CV.");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        name: cvName.trim(),
        templateId: selectedTemplate,
        content,
        targetPosition: targetPosition.trim() || undefined,
        targetCompany: targetCompany.trim() || undefined,
      };
      if (editId) {
        await api.put(`/cv/${editId}`, payload);
      } else {
        await api.post("/cv", payload);
      }
      router.push("/cv");
    } catch (err: any) {
      alert(err.response?.data?.message || "Gagal menyimpan CV.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">
            {editId ? "Edit CV" : "Buat CV Baru"}
          </h1>
          <p className="text-muted-foreground mt-1">
            Langkah {step} dari {STEPS.length}: {STEPS[step - 1].label}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-sm text-muted-foreground">
            {getCompletionPercent()}% selesai
          </div>
          <Progress value={getCompletionPercent()} className="w-24 h-2" />
        </div>
      </div>

      {/* Step indicators */}
      <div className="flex items-center gap-1 overflow-x-auto pb-2">
        {STEPS.map((s, idx) => {
          const Icon = s.icon;
          const isActive = step === s.id;
          const isDone = step > s.id;
          return (
            <div key={s.id} className="flex items-center">
              <button
                onClick={() => setStep(s.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : isDone
                    ? "bg-primary/10 text-primary"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {isDone ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  <Icon className="h-4 w-4" />
                )}
                <span className="hidden sm:inline">{s.label}</span>
              </button>
              {idx < STEPS.length - 1 && (
                <div className={`w-6 h-px mx-1 ${isDone ? "bg-primary" : "bg-muted"}`} />
              )}
            </div>
          );
        })}
      </div>

      <Separator />

      {/* CV Name (always visible) */}
      {step !== 1 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="cvName">Nama CV *</Label>
            <Input
              id="cvName"
              placeholder="CV Frontend Developer"
              value={cvName}
              onChange={(e) => setCvName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="targetPosition">Posisi Target</Label>
            <Input
              id="targetPosition"
              placeholder="Frontend Developer"
              value={targetPosition}
              onChange={(e) => setTargetPosition(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="targetCompany">Perusahaan Target</Label>
            <Input
              id="targetCompany"
              placeholder="Gojek, Tokopedia..."
              value={targetCompany}
              onChange={(e) => setTargetCompany(e.target.value)}
            />
          </div>
        </div>
      )}

      {/* Step Content */}
      <div className="min-h-[400px]">
        {/* Step 1: Template Selection */}
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold">Pilih Template</h2>
              <p className="text-sm text-muted-foreground">
                Pilih desain CV yang sesuai dengan industri dan posisi target Anda
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {TEMPLATES.map((t) => (
                <Card
                  key={t.id}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    selectedTemplate === t.id
                      ? "ring-2 ring-primary border-primary"
                      : "hover:border-primary/50"
                  }`}
                  onClick={() => setSelectedTemplate(t.id)}
                >
                  <CardContent className="p-4">
                    <div className="h-40 rounded-md bg-muted flex items-center justify-center border border-dashed mb-3">
                      <div className="text-center">
                        <LayoutTemplate className="h-10 w-10 mx-auto text-muted-foreground" />
                        <p className="text-xs text-muted-foreground mt-1">{t.name}</p>
                      </div>
                    </div>
                    <h3 className="font-semibold text-sm">{t.name}</h3>
                    <p className="text-xs text-muted-foreground mt-1">{t.description}</p>
                    <div className="flex items-center justify-between mt-2">
                      <Badge variant="secondary" className="text-xs">ATS: {t.atsScore}%</Badge>
                      {selectedTemplate === t.id && (
                        <CheckCircle2 className="h-5 w-5 text-primary" />
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="space-y-2">
              <Label htmlFor="cvNameFirst">Nama CV *</Label>
              <Input
                id="cvNameFirst"
                placeholder="CV Frontend Developer"
                value={cvName}
                onChange={(e) => setCvName(e.target.value)}
              />
            </div>
          </div>
        )}

        {/* Step 2: Personal Info */}
        {step === 2 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold">Informasi Pribadi</h2>
              <p className="text-sm text-muted-foreground">
                Data dari profil Anda sudah diisi otomatis. Silakan periksa dan lengkapi.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nama Lengkap *</Label>
                <Input
                  value={content.personalInfo.fullName}
                  onChange={(e) => updatePersonal("fullName", e.target.value)}
                  placeholder="John Doe"
                />
              </div>
              <div className="space-y-2">
                <Label>Email *</Label>
                <Input
                  type="email"
                  value={content.personalInfo.email}
                  onChange={(e) => updatePersonal("email", e.target.value)}
                  placeholder="john@example.com"
                />
              </div>
              <div className="space-y-2">
                <Label>Telepon</Label>
                <Input
                  value={content.personalInfo.phone}
                  onChange={(e) => updatePersonal("phone", e.target.value)}
                  placeholder="+62 812-3456-7890"
                />
              </div>
              <div className="space-y-2">
                <Label>Lokasi</Label>
                <Input
                  value={content.personalInfo.location}
                  onChange={(e) => updatePersonal("location", e.target.value)}
                  placeholder="Jakarta, Indonesia"
                />
              </div>
              <div className="space-y-2">
                <Label>LinkedIn</Label>
                <Input
                  value={content.personalInfo.linkedinUrl}
                  onChange={(e) => updatePersonal("linkedinUrl", e.target.value)}
                  placeholder="https://linkedin.com/in/..."
                />
              </div>
              <div className="space-y-2">
                <Label>GitHub</Label>
                <Input
                  value={content.personalInfo.githubUrl}
                  onChange={(e) => updatePersonal("githubUrl", e.target.value)}
                  placeholder="https://github.com/..."
                />
              </div>
              <div className="space-y-2">
                <Label>Portfolio</Label>
                <Input
                  value={content.personalInfo.portfolioUrl}
                  onChange={(e) => updatePersonal("portfolioUrl", e.target.value)}
                  placeholder="https://portfolio.com"
                />
              </div>
              <div className="space-y-2">
                <Label>Website</Label>
                <Input
                  value={content.personalInfo.website}
                  onChange={(e) => updatePersonal("website", e.target.value)}
                  placeholder="https://mywebsite.com"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Summary */}
        {step === 3 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold">Ringkasan Profesional</h2>
              <p className="text-sm text-muted-foreground">
                Tuliskan ringkasan singkat tentang diri Anda, keahlian utama, dan tujuan karir.
                Gunakan kata kerja aksi dan sertakan pencapaian terukur.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="summary">Ringkasan / Objective</Label>
              <Textarea
                id="summary"
                value={content.summary}
                onChange={(e) => setContent((prev) => ({ ...prev, summary: e.target.value }))}
                placeholder="Frontend Developer dengan 5 tahun pengalaman membangun aplikasi web performa tinggi menggunakan React dan TypeScript. Berhasil meningkatkan performa aplikasi sebesar 40% dan memimpin tim 4 developer..."
                rows={8}
                className="resize-y"
              />
              <p className="text-xs text-muted-foreground">
                {content.summary.length} karakter • Disarankan 300-500 karakter
              </p>
            </div>
          </div>
        )}

        {/* Step 4: Experience */}
        {step === 4 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">Pengalaman Kerja</h2>
                <p className="text-sm text-muted-foreground">
                  Tambahkan pengalaman kerja Anda, mulai dari yang terbaru.
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={addExperience}>
                <Plus className="h-4 w-4 mr-1" />
                Tambah
              </Button>
            </div>
            {content.experiences.length === 0 ? (
              <Card className="p-8">
                <div className="flex flex-col items-center text-center space-y-2">
                  <Briefcase className="h-8 w-8 text-muted-foreground" />
                  <p className="text-muted-foreground">Belum ada pengalaman ditambahkan.</p>
                  <Button variant="outline" size="sm" onClick={addExperience}>
                    <Plus className="h-4 w-4 mr-1" />
                    Tambah Pengalaman
                  </Button>
                </div>
              </Card>
            ) : (
              <div className="space-y-4">
                {content.experiences.map((exp, idx) => (
                  <Card key={exp.id}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base flex items-center gap-2">
                          <GripVertical className="h-4 w-4 text-muted-foreground" />
                          Pengalaman {idx + 1}
                        </CardTitle>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeExperience(exp.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <Label className="text-xs">Perusahaan *</Label>
                          <Input
                            value={exp.company}
                            onChange={(e) => updateExperience(exp.id, "company", e.target.value)}
                            placeholder="PT Teknologi Indonesia"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Posisi *</Label>
                          <Input
                            value={exp.position}
                            onChange={(e) => updateExperience(exp.id, "position", e.target.value)}
                            placeholder="Frontend Developer"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Tanggal Mulai</Label>
                          <Input
                            type="date"
                            value={exp.startDate}
                            onChange={(e) => updateExperience(exp.id, "startDate", e.target.value)}
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Tanggal Selesai</Label>
                          <div className="flex items-center gap-2">
                            <Input
                              type="date"
                              value={exp.endDate}
                              onChange={(e) => updateExperience(exp.id, "endDate", e.target.value)}
                              disabled={exp.isCurrent}
                            />
                            <label className="flex items-center gap-1 whitespace-nowrap text-xs">
                              <input
                                type="checkbox"
                                checked={exp.isCurrent}
                                onChange={(e) => updateExperience(exp.id, "isCurrent", e.target.checked)}
                                className="rounded"
                              />
                              Sekarang
                            </label>
                          </div>
                        </div>
                        <div className="space-y-1 sm:col-span-2">
                          <Label className="text-xs">Lokasi</Label>
                          <Input
                            value={exp.location}
                            onChange={(e) => updateExperience(exp.id, "location", e.target.value)}
                            placeholder="Jakarta, Indonesia"
                          />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Deskripsi</Label>
                        <Textarea
                          value={exp.description}
                          onChange={(e) => updateExperience(exp.id, "description", e.target.value)}
                          placeholder="Jelaskan tanggung jawab dan pencapaian Anda. Gunakan angka untuk hasil yang terukur..."
                          rows={4}
                          className="resize-y"
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Step 5: Education */}
        {step === 5 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">Pendidikan</h2>
                <p className="text-sm text-muted-foreground">
                  Tambahkan riwayat pendidikan Anda.
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={addEducation}>
                <Plus className="h-4 w-4 mr-1" />
                Tambah
              </Button>
            </div>
            {content.educations.length === 0 ? (
              <Card className="p-8">
                <div className="flex flex-col items-center text-center space-y-2">
                  <GraduationCap className="h-8 w-8 text-muted-foreground" />
                  <p className="text-muted-foreground">Belum ada pendidikan ditambahkan.</p>
                  <Button variant="outline" size="sm" onClick={addEducation}>
                    <Plus className="h-4 w-4 mr-1" />
                    Tambah Pendidikan
                  </Button>
                </div>
              </Card>
            ) : (
              <div className="space-y-4">
                {content.educations.map((edu, idx) => (
                  <Card key={edu.id}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base flex items-center gap-2">
                          <GripVertical className="h-4 w-4 text-muted-foreground" />
                          Pendidikan {idx + 1}
                        </CardTitle>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeEducation(edu.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <Label className="text-xs">Institusi *</Label>
                          <Input
                            value={edu.institution}
                            onChange={(e) => updateEducation(edu.id, "institution", e.target.value)}
                            placeholder="Universitas Indonesia"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Gelar *</Label>
                          <Input
                            value={edu.degree}
                            onChange={(e) => updateEducation(edu.id, "degree", e.target.value)}
                            placeholder="S1 / Bachelor"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Jurusan *</Label>
                          <Input
                            value={edu.field}
                            onChange={(e) => updateEducation(edu.id, "field", e.target.value)}
                            placeholder="Ilmu Komputer"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">IPK</Label>
                          <Input
                            value={edu.gpa}
                            onChange={(e) => updateEducation(edu.id, "gpa", e.target.value)}
                            placeholder="3.75"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Tahun Mulai</Label>
                          <Input
                            value={edu.startYear}
                            onChange={(e) => updateEducation(edu.id, "startYear", e.target.value)}
                            placeholder="2018"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Tahun Lulus</Label>
                          <Input
                            value={edu.endYear}
                            onChange={(e) => updateEducation(edu.id, "endYear", e.target.value)}
                            placeholder="2022"
                          />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Deskripsi (opsional)</Label>
                        <Textarea
                          value={edu.description}
                          onChange={(e) => updateEducation(edu.id, "description", e.target.value)}
                          placeholder="Kegiatan, pencapaian, atau mata kuliah relevan..."
                          rows={2}
                          className="resize-y"
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Step 6: Skills */}
        {step === 6 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">Keahlian</h2>
                <p className="text-sm text-muted-foreground">
                  Tambahkan keahlian Anda dan tentukan tingkat penguasaan (0-100).
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={addSkill}>
                <Plus className="h-4 w-4 mr-1" />
                Tambah
              </Button>
            </div>
            {content.skills.length === 0 ? (
              <Card className="p-8">
                <div className="flex flex-col items-center text-center space-y-2">
                  <Wrench className="h-8 w-8 text-muted-foreground" />
                  <p className="text-muted-foreground">Belum ada keahlian ditambahkan.</p>
                  <Button variant="outline" size="sm" onClick={addSkill}>
                    <Plus className="h-4 w-4 mr-1" />
                    Tambah Keahlian
                  </Button>
                </div>
              </Card>
            ) : (
              <div className="space-y-3">
                {content.skills.map((skill) => (
                  <div key={skill.id} className="flex items-center gap-3">
                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-[1fr,120px,auto] gap-2 items-center">
                      <Input
                        value={skill.name}
                        onChange={(e) => updateSkill(skill.id, "name", e.target.value)}
                        placeholder="React, TypeScript, Node.js..."
                      />
                      <div className="flex items-center gap-2">
                        <input
                          type="range"
                          min={0}
                          max={100}
                          step={10}
                          value={skill.level}
                          onChange={(e) => updateSkill(skill.id, "level", Number(e.target.value))}
                          className="flex-1"
                        />
                        <span className="text-sm font-mono w-8 text-right">{skill.level}%</span>
                      </div>
                      <Badge variant="secondary" className="text-xs whitespace-nowrap">
                        {skill.level >= 80 ? "Ahli" : skill.level >= 50 ? "Menengah" : "Pemula"}
                      </Badge>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeSkill(skill.id)}
                      className="text-destructive hover:text-destructive shrink-0"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Navigation */}
      <Separator />
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={() => setStep((s) => Math.max(1, s - 1))}
          disabled={step === 1}
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Sebelumnya
        </Button>
        <div className="flex gap-2">
          {step < STEPS.length ? (
            <Button onClick={() => setStep((s) => Math.min(STEPS.length, s + 1))}>
              Selanjutnya
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          ) : (
            <Button onClick={handleSave} disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Simpan CV
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
