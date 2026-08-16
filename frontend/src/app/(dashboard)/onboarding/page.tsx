"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import api from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import type { Profile, Experience, Education, UserSkill } from "@/lib/types";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

import {
  User,
  Briefcase,
  GraduationCap,
  Zap,
  Settings,
  ArrowRight,
  ArrowLeft,
  SkipForward,
  Loader2,
  Check,
  X,
  Search,
  MapPin,
  AlertTriangle,
  Sparkles,
  PartyPopper,
} from "lucide-react";

// ─── Schemas ───────────────────────────────────────────────

const basicSchema = z.object({
  fullName: z.string().min(2, "Nama minimal 2 karakter"),
  headline: z.string().optional(),
  location: z.string().optional(),
  bio: z.string().max(500, "Bio maksimal 500 karakter").optional(),
});

const experienceSchema = z.object({
  company: z.string().min(1, "Nama perusahaan wajib diisi"),
  position: z.string().min(1, "Posisi wajib diisi"),
  description: z.string().optional(),
  startDate: z.string().min(1, "Tanggal mulai wajib diisi"),
  endDate: z.string().optional(),
  isCurrent: z.boolean().default(false),
  location: z.string().optional(),
});

const educationSchema = z.object({
  institution: z.string().min(1, "Nama institusi wajib diisi"),
  degree: z.string().min(1, "Jenjang wajib diisi"),
  field: z.string().min(1, "Bidang studi wajib diisi"),
  startYear: z.coerce.number().min(1900).max(2100),
  endYear: z.coerce.number().min(1900).max(2100).optional(),
  gpa: z.coerce.number().min(0).max(4).optional(),
});

const preferenceSchema = z.object({
  targetPosition: z.string().optional(),
  expectedSalary: z.coerce.number().min(0).optional(),
  jobType: z.array(z.string()).optional(),
  preferredLocations: z.array(z.string()).optional(),
  remotePreference: z.string().optional(),
});

type BasicForm = z.infer<typeof basicSchema>;
type ExperienceForm = z.infer<typeof experienceSchema>;
type EducationForm = z.infer<typeof educationSchema>;
type PreferenceForm = z.infer<typeof preferenceSchema>;

// ─── Steps config ──────────────────────────────────────────

const STEPS = [
  { key: "basic", label: "Info Dasar", icon: User },
  { key: "experience", label: "Pengalaman", icon: Briefcase },
  { key: "education", label: "Pendidikan", icon: GraduationCap },
  { key: "skills", label: "Skill", icon: Zap },
  { key: "preferences", label: "Preferensi", icon: Settings },
] as const;

type StepKey = (typeof STEPS)[number]["key"];

// ─── Main Page ─────────────────────────────────────────────

export default function OnboardingPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [showSkipWarning, setShowSkipWarning] = useState(false);

  const fetchProfile = useCallback(async () => {
    try {
      const res = await api.get<Profile>("/profile/me");
      setProfile(res.data);
    } catch {
      toast({ title: "Gagal memuat profil", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const completionPct = profile?.profileCompletion ?? 0;

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep((s) => s + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((s) => s - 1);
    }
  };

  const handleFinish = () => {
    toast({ title: "Profil berhasil dilengkapi! 🎉", variant: "success" });
    router.push("/dashboard");
  };

  const handleSkip = () => {
    if (currentStep === STEPS.length - 1) {
      handleFinish();
    } else {
      setShowSkipWarning(true);
    }
  };

  const confirmSkip = () => {
    setShowSkipWarning(false);
    handleNext();
  };

  if (loading) {
    return (
      <div className="container mx-auto max-w-3xl px-4 py-8 space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container mx-auto max-w-3xl px-4 py-8 text-center">
        <p className="text-muted-foreground">Profil tidak ditemukan.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-3xl px-4 py-6 md:py-10 space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center gap-2 rounded-full border bg-muted px-4 py-1.5 text-sm mb-4">
          <Sparkles className="h-4 w-4 text-primary" />
          Langkah {currentStep + 1} dari {STEPS.length}
        </div>
        <h1 className="text-2xl md:text-3xl font-bold">Lengkapi Profil Anda</h1>
        <p className="text-muted-foreground mt-1">
          Profil yang lengkap meningkatkan peluang Anda hingga 3x lebih besar.
        </p>
      </div>

      {/* Progress Bar */}
      <Card>
        <CardContent className="pt-6 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Kelengkapan Profil</span>
            <span className="text-sm font-semibold text-primary">{completionPct}%</span>
          </div>
          <Progress value={completionPct} className="h-2" />

          {/* Step indicators */}
          <div className="flex justify-between pt-2">
            {STEPS.map((step, idx) => {
              const Icon = step.icon;
              const isActive = idx === currentStep;
              const isDone = idx < currentStep;
              return (
                <button
                  key={step.key}
                  onClick={() => {
                    if (idx <= currentStep) setCurrentStep(idx);
                  }}
                  className={cn(
                    "flex flex-col items-center gap-1 text-xs transition-colors",
                    isActive ? "text-primary font-semibold" : isDone ? "text-green-600" : "text-muted-foreground",
                    idx <= currentStep ? "cursor-pointer" : "cursor-default"
                  )}
                >
                  <div
                    className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors",
                      isActive
                        ? "border-primary bg-primary/10"
                        : isDone
                          ? "border-green-600 bg-green-50"
                          : "border-muted-foreground/30"
                    )}
                  >
                    {isDone ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Icon className="h-4 w-4" />
                    )}
                  </div>
                  <span className="hidden sm:block">{step.label}</span>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Skip Warning Dialog */}
      {showSkipWarning && (
        <Card className="border-amber-300 bg-amber-50 dark:bg-amber-950/30">
          <CardContent className="pt-6 flex items-start gap-4">
            <AlertTriangle className="h-6 w-6 text-amber-600 shrink-0 mt-0.5" />
            <div className="flex-1 space-y-2">
              <p className="font-medium">Lewati langkah ini?</p>
              <p className="text-sm text-muted-foreground">
                Profil Anda saat ini {completionPct}% lengkap. Melengkapi semua langkah
                meningkatkan visibilitas dan peluang Anda di mata recruiter.
              </p>
              <div className="flex gap-2 pt-1">
                <Button size="sm" variant="outline" onClick={() => setShowSkipWarning(false)}>
                  Kembali
                </Button>
                <Button size="sm" variant="secondary" onClick={confirmSkip}>
                  <SkipForward className="mr-1.5 h-3.5 w-3.5" />
                  Lewati Saja
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step Content */}
      <div>
        {currentStep === 0 && (
          <BasicInfoStep
            profile={profile}
            saving={saving}
            setSaving={setSaving}
            onSaved={fetchProfile}
            onNext={handleNext}
          />
        )}
        {currentStep === 1 && (
          <ExperienceStep
            profile={profile}
            saving={saving}
            setSaving={setSaving}
            onSaved={fetchProfile}
            onNext={handleNext}
          />
        )}
        {currentStep === 2 && (
          <EducationStep
            profile={profile}
            saving={saving}
            setSaving={setSaving}
            onSaved={fetchProfile}
            onNext={handleNext}
          />
        )}
        {currentStep === 3 && (
          <SkillsStep
            profile={profile}
            saving={saving}
            setSaving={setSaving}
            onSaved={fetchProfile}
            onNext={handleNext}
          />
        )}
        {currentStep === 4 && (
          <PreferencesStep
            profile={profile}
            saving={saving}
            setSaving={setSaving}
            onSaved={fetchProfile}
            onFinish={handleFinish}
          />
        )}
      </div>

      {/* Bottom Navigation */}
      <div className="flex justify-between items-center pt-2">
        <Button
          variant="ghost"
          onClick={handleBack}
          disabled={currentStep === 0}
        >
          <ArrowLeft className="mr-1.5 h-4 w-4" />
          Kembali
        </Button>

        {currentStep < STEPS.length - 1 ? (
          <Button variant="ghost" onClick={handleSkip} className="text-muted-foreground">
            <SkipForward className="mr-1.5 h-4 w-4" />
            Lewati
          </Button>
        ) : (
          <Button variant="ghost" onClick={handleFinish} className="text-muted-foreground">
            Selesai Nanti
          </Button>
        )}
      </div>
    </div>
  );
}

// ─── Step 1: Basic Info ────────────────────────────────────

function BasicInfoStep({
  profile,
  saving,
  setSaving,
  onSaved,
  onNext,
}: {
  profile: Profile;
  saving: boolean;
  setSaving: (v: boolean) => void;
  onSaved: () => Promise<void>;
  onNext: () => void;
}) {
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<BasicForm>({
    resolver: zodResolver(basicSchema),
    defaultValues: {
      fullName: profile.fullName ?? "",
      headline: profile.headline ?? "",
      location: profile.location ?? "",
      bio: profile.bio ?? "",
    },
  });

  const onSubmit = async (data: BasicForm) => {
    setSaving(true);
    try {
      await api.put("/profile/me", data);
      toast({ title: "Informasi dasar disimpan", variant: "success" });
      await onSaved();
      onNext();
    } catch {
      toast({ title: "Gagal menyimpan", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5 text-primary" />
          Informasi Dasar
        </CardTitle>
        <CardDescription>
          Ceritakan tentang diri Anda. Ini adalah kesan pertama yang dilihat recruiter.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <FormField label="Nama Lengkap" error={errors.fullName?.message} required>
            <Input {...register("fullName")} placeholder="John Doe" />
          </FormField>

          <FormField label="Headline" error={errors.headline?.message}>
            <Input
              {...register("headline")}
              placeholder="Frontend Developer | React Enthusiast"
            />
          </FormField>

          <FormField label="Lokasi" error={errors.location?.message}>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                {...register("location")}
                placeholder="Jakarta, Indonesia"
                className="pl-9"
              />
            </div>
          </FormField>

          <FormField label="Bio" error={errors.bio?.message}>
            <Textarea
              {...register("bio")}
              placeholder="Ceritakan tentang diri Anda, minat, dan tujuan karir..."
              rows={4}
            />
          </FormField>

          <div className="flex justify-end">
            <Button type="submit" disabled={saving}>
              {saving ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <>
                  Simpan & Lanjut
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

// ─── Step 2: Experience ────────────────────────────────────

function ExperienceStep({
  profile,
  saving,
  setSaving,
  onSaved,
  onNext,
}: {
  profile: Profile;
  saving: boolean;
  setSaving: (v: boolean) => void;
  onSaved: () => Promise<void>;
  onNext: () => void;
}) {
  const { toast } = useToast();
  const [experiences, setExperiences] = useState<Experience[]>(profile.experiences ?? []);
  const [showForm, setShowForm] = useState(false);
  const [isFreshGrad, setIsFreshGrad] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<ExperienceForm>({
    resolver: zodResolver(experienceSchema),
    defaultValues: { isCurrent: false },
  });

  const isCurrent = watch("isCurrent");

  const refreshData = async () => {
    await onSaved();
    // Re-fetch from updated profile
    try {
      const res = await api.get<Profile>("/profile/me");
      setExperiences(res.data.experiences ?? []);
    } catch { /* ignore */ }
  };

  const openAdd = () => {
    reset({ company: "", position: "", description: "", startDate: "", endDate: "", isCurrent: false, location: "" });
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    reset();
  };

  const onSubmit = async (data: ExperienceForm) => {
    setSaving(true);
    try {
      const payload = { ...data, endDate: data.isCurrent ? undefined : data.endDate || undefined };
      await api.post("/profile/me/experience", payload);
      toast({ title: "Pengalaman ditambahkan", variant: "success" });
      closeForm();
      await refreshData();
    } catch {
      toast({ title: "Gagal menyimpan pengalaman", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/profile/me/experience/${id}`);
      toast({ title: "Pengalaman dihapus", variant: "success" });
      await refreshData();
    } catch {
      toast({ title: "Gagal menghapus", variant: "destructive" });
    }
  };

  const canProceed = experiences.length > 0 || isFreshGrad;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Briefcase className="h-5 w-5 text-primary" />
          Pengalaman Kerja
        </CardTitle>
        <CardDescription>
          Tambahkan minimal 1 pengalaman kerja, atau pilih "Fresh Graduate" jika belum punya.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Fresh Graduate toggle */}
        <button
          type="button"
          onClick={() => {
            setIsFreshGrad(!isFreshGrad);
            if (!isFreshGrad) setShowForm(false);
          }}
          className={cn(
            "w-full flex items-center gap-3 p-4 rounded-lg border-2 transition-colors text-left",
            isFreshGrad
              ? "border-primary bg-primary/5"
              : "border-muted-foreground/20 hover:border-muted-foreground/40"
          )}
        >
          <div
            className={cn(
              "w-5 h-5 rounded-full border-2 flex items-center justify-center",
              isFreshGrad ? "border-primary bg-primary" : "border-muted-foreground/40"
            )}
          >
            {isFreshGrad && <Check className="h-3 w-3 text-primary-foreground" />}
          </div>
          <div>
            <p className="font-medium">Saya Fresh Graduate</p>
            <p className="text-sm text-muted-foreground">Belum memiliki pengalaman kerja</p>
          </div>
        </button>

        {!isFreshGrad && (
          <>
            {/* Added experiences */}
            {experiences.map((exp) => (
              <div
                key={exp.id}
                className="flex items-start justify-between p-4 rounded-lg border bg-card"
              >
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold">{exp.position}</h4>
                  <p className="text-sm text-muted-foreground">{exp.company}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {exp.startDate?.slice(0, 7)} – {exp.isCurrent ? "Sekarang" : exp.endDate?.slice(0, 7) ?? ""}
                  </p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => handleDelete(exp.id)}>
                  <X className="h-4 w-4 text-muted-foreground" />
                </Button>
              </div>
            ))}

            {/* Add form */}
            {showForm ? (
              <Card className="border-primary/30">
                <CardContent className="pt-6">
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField label="Perusahaan" error={errors.company?.message} required>
                        <Input {...register("company")} placeholder="PT Teknologi Indonesia" />
                      </FormField>
                      <FormField label="Posisi" error={errors.position?.message} required>
                        <Input {...register("position")} placeholder="Frontend Developer" />
                      </FormField>
                    </div>

                    <FormField label="Deskripsi" error={errors.description?.message}>
                      <Textarea {...register("description")} placeholder="Tanggung jawab dan pencapaian..." rows={3} />
                    </FormField>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <FormField label="Mulai" error={errors.startDate?.message} required>
                        <Input type="date" {...register("startDate")} />
                      </FormField>
                      <FormField label="Selesai" error={errors.endDate?.message}>
                        <Input type="date" {...register("endDate")} disabled={isCurrent} />
                      </FormField>
                      <FormField label=" " error={undefined}>
                        <label className="flex items-center gap-2 h-10 text-sm">
                          <input type="checkbox" {...register("isCurrent")} className="rounded border-input" />
                          Masih bekerja di sini
                        </label>
                      </FormField>
                    </div>

                    <FormField label="Lokasi" error={errors.location?.message}>
                      <Input {...register("location")} placeholder="Jakarta, Indonesia" />
                    </FormField>

                    <div className="flex gap-2 justify-end">
                      <Button type="button" variant="outline" onClick={closeForm}>Batal</Button>
                      <Button type="submit" disabled={saving}>
                        {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Simpan"}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            ) : (
              <Button variant="outline" onClick={openAdd} className="w-full">
                <Briefcase className="mr-2 h-4 w-4" /> Tambah Pengalaman
              </Button>
            )}
          </>
        )}

        <Separator />

        <div className="flex justify-end">
          <Button onClick={onNext} disabled={!canProceed}>
            Simpan & Lanjut
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Step 3: Education ─────────────────────────────────────

function EducationStep({
  profile,
  saving,
  setSaving,
  onSaved,
  onNext,
}: {
  profile: Profile;
  saving: boolean;
  setSaving: (v: boolean) => void;
  onSaved: () => Promise<void>;
  onNext: () => void;
}) {
  const { toast } = useToast();
  const [educations, setEducations] = useState<Education[]>(profile.educations ?? []);
  const [showForm, setShowForm] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EducationForm>({
    resolver: zodResolver(educationSchema),
  });

  const refreshData = async () => {
    await onSaved();
    try {
      const res = await api.get<Profile>("/profile/me");
      setEducations(res.data.educations ?? []);
    } catch { /* ignore */ }
  };

  const openAdd = () => {
    reset({ institution: "", degree: "", field: "", startYear: new Date().getFullYear(), endYear: undefined, gpa: undefined });
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    reset();
  };

  const onSubmit = async (data: EducationForm) => {
    setSaving(true);
    try {
      await api.post("/profile/me/education", data);
      toast({ title: "Pendidikan ditambahkan", variant: "success" });
      closeForm();
      await refreshData();
    } catch {
      toast({ title: "Gagal menyimpan pendidikan", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/profile/me/education/${id}`);
      toast({ title: "Pendidikan dihapus", variant: "success" });
      await refreshData();
    } catch {
      toast({ title: "Gagal menghapus", variant: "destructive" });
    }
  };

  const canProceed = educations.length > 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <GraduationCap className="h-5 w-5 text-primary" />
          Pendidikan
        </CardTitle>
        <CardDescription>
          Tambahkan riwayat pendidikan Anda. Minimal 1 entri.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Added educations */}
        {educations.map((edu) => (
          <div
            key={edu.id}
            className="flex items-start justify-between p-4 rounded-lg border bg-card"
          >
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold">{edu.degree} – {edu.field}</h4>
              <p className="text-sm text-muted-foreground">{edu.institution}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {edu.startYear}{edu.endYear ? ` – ${edu.endYear}` : ""}{edu.gpa ? ` · IPK: ${edu.gpa}` : ""}
              </p>
            </div>
            <Button variant="ghost" size="icon" onClick={() => handleDelete(edu.id)}>
              <X className="h-4 w-4 text-muted-foreground" />
            </Button>
          </div>
        ))}

        {/* Add form */}
        {showForm ? (
          <Card className="border-primary/30">
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <FormField label="Institusi" error={errors.institution?.message} required>
                  <Input {...register("institution")} placeholder="Universitas Indonesia" />
                </FormField>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField label="Jenjang" error={errors.degree?.message} required>
                    <Input {...register("degree")} placeholder="S1 / Bachelor" />
                  </FormField>
                  <FormField label="Bidang Studi" error={errors.field?.message} required>
                    <Input {...register("field")} placeholder="Teknik Informatika" />
                  </FormField>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField label="Tahun Mulai" error={errors.startYear?.message} required>
                    <Input type="number" {...register("startYear")} placeholder="2018" />
                  </FormField>
                  <FormField label="Tahun Lulus" error={errors.endYear?.message}>
                    <Input type="number" {...register("endYear")} placeholder="2022" />
                  </FormField>
                  <FormField label="IPK" error={errors.gpa?.message}>
                    <Input type="number" step="0.01" {...register("gpa")} placeholder="3.75" />
                  </FormField>
                </div>

                <div className="flex gap-2 justify-end">
                  <Button type="button" variant="outline" onClick={closeForm}>Batal</Button>
                  <Button type="submit" disabled={saving}>
                    {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Simpan"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        ) : (
          <Button variant="outline" onClick={openAdd} className="w-full">
            <GraduationCap className="mr-2 h-4 w-4" /> Tambah Pendidikan
          </Button>
        )}

        <Separator />

        <div className="flex justify-end">
          <Button onClick={onNext} disabled={!canProceed}>
            Simpan & Lanjut
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Step 4: Skills ────────────────────────────────────────

function SkillsStep({
  profile,
  saving,
  setSaving,
  onSaved,
  onNext,
}: {
  profile: Profile;
  saving: boolean;
  setSaving: (v: boolean) => void;
  onSaved: () => Promise<void>;
  onNext: () => void;
}) {
  const { toast } = useToast();
  const [skills, setSkills] = useState<UserSkill[]>(profile.skills ?? []);
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState(3);

  const levelLabels = ["", "Pemula", "Dasar", "Menengah", "Mahir", "Ahli"];

  const refreshData = async () => {
    await onSaved();
    try {
      const res = await api.get<Profile>("/profile/me");
      setSkills(res.data.skills ?? []);
    } catch { /* ignore */ }
  };

  // Debounced skill search
  useEffect(() => {
    if (searchQuery.length < 2) {
      setSuggestions([]);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const res = await api.get(`/profile/skills/search?q=${encodeURIComponent(searchQuery)}`);
        const names: string[] = res.data.map((s: { name: string }) => s.name);
        setSuggestions(names);
        setShowSuggestions(true);
      } catch { /* ignore */ }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleAdd = async (name: string) => {
    setSaving(true);
    try {
      await api.post("/profile/me/skills", { name, level: selectedLevel });
      toast({ title: `Skill "${name}" ditambahkan`, variant: "success" });
      setSearchQuery("");
      setShowSuggestions(false);
      await refreshData();
    } catch {
      toast({ title: "Gagal menambahkan skill", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/profile/me/skills/${id}`);
      toast({ title: "Skill dihapus", variant: "success" });
      await refreshData();
    } catch {
      toast({ title: "Gagal menghapus skill", variant: "destructive" });
    }
  };

  const MIN_SKILLS = 3;
  const canProceed = skills.length >= MIN_SKILLS;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-primary" />
          Skill & Keahlian
        </CardTitle>
        <CardDescription>
          Tambahkan minimal {MIN_SKILLS} skill yang Anda miliki. Gunakan autocomplete untuk saran.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Search & Add */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (e.target.value.length >= 2) setShowSuggestions(true);
              }}
              onFocus={() => { if (suggestions.length > 0) setShowSuggestions(true); }}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              placeholder="Cari skill (misal: React, Python, Public Speaking...)"
              className="pl-9"
            />
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute z-10 mt-1 w-full rounded-md border bg-popover shadow-md max-h-48 overflow-auto">
                {suggestions.map((name) => (
                  <button
                    key={name}
                    type="button"
                    className="flex w-full items-center px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      handleAdd(name);
                    }}
                  >
                    <Zap className="mr-2 h-4 w-4 text-muted-foreground" />
                    {name}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-sm text-muted-foreground">Level:</span>
            {[1, 2, 3, 4, 5].map((lvl) => (
              <button
                key={lvl}
                type="button"
                onClick={() => setSelectedLevel(lvl)}
                className={cn(
                  "px-3 py-1 text-xs rounded-full border transition-colors",
                  selectedLevel === lvl
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-background hover:bg-accent"
                )}
              >
                {levelLabels[lvl]}
              </button>
            ))}
            {searchQuery && !suggestions.includes(searchQuery) && (
              <Button
                size="sm"
                disabled={saving}
                onMouseDown={(e) => {
                  e.preventDefault();
                  handleAdd(searchQuery);
                }}
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4 mr-1" />}
                Tambah &quot;{searchQuery}&quot;
              </Button>
            )}
          </div>
        </div>

        {/* Skills list */}
        <div className="flex flex-wrap gap-2">
          {skills.map((skill) => (
            <div
              key={skill.id}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full border bg-card group"
            >
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((lvl) => (
                  <div
                    key={lvl}
                    className={cn("w-2 h-2 rounded-full", lvl <= skill.level ? "bg-primary" : "bg-muted")}
                  />
                ))}
              </div>
              <span className="text-sm font-medium">{skill.name}</span>
              <span className="text-xs text-muted-foreground">{levelLabels[skill.level]}</span>
              {skill.verified && <Check className="h-3.5 w-3.5 text-green-500" />}
              <button
                onClick={() => handleDelete(skill.id)}
                className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
              </button>
            </div>
          ))}
        </div>

        {skills.length < MIN_SKILLS && (
          <p className="text-sm text-amber-600 flex items-center gap-1.5">
            <AlertTriangle className="h-4 w-4" />
            Tambahkan minimal {MIN_SKILLS} skill untuk melanjutkan ({skills.length}/{MIN_SKILLS})
          </p>
        )}

        <Separator />

        <div className="flex justify-end">
          <Button onClick={onNext} disabled={!canProceed}>
            Simpan & Lanjut
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Step 5: Preferences ──────────────────────────────────

function PreferencesStep({
  profile,
  saving,
  setSaving,
  onSaved,
  onFinish,
}: {
  profile: Profile;
  saving: boolean;
  setSaving: (v: boolean) => void;
  onSaved: () => Promise<void>;
  onFinish: () => void;
}) {
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<PreferenceForm>({
    resolver: zodResolver(preferenceSchema),
    defaultValues: {
      targetPosition: profile.headline ?? "",
      expectedSalary: profile.expectedSalary ?? undefined,
      jobType: profile.jobType ?? [],
      preferredLocations: profile.preferredLocations ?? [],
      remotePreference: profile.remotePreference ?? "",
    },
  });

  const onSubmit = async (data: PreferenceForm) => {
    setSaving(true);
    try {
      await api.put("/profile/me", data);
      toast({ title: "Preferensi disimpan", variant: "success" });
      await onSaved();
      onFinish();
    } catch {
      toast({ title: "Gagal menyimpan preferensi", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const jobTypes = [
    { value: "FULL_TIME", label: "Full Time" },
    { value: "PART_TIME", label: "Part Time" },
    { value: "CONTRACT", label: "Kontrak" },
    { value: "FREELANCE", label: "Freelance" },
    { value: "INTERNSHIP", label: "Magang" },
  ];

  const remoteOptions = [
    { value: "onsite", label: "On-site" },
    { value: "hybrid", label: "Hybrid" },
    { value: "remote", label: "Remote" },
    { value: "flexible", label: "Fleksibel" },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5 text-primary" />
          Preferensi Kerja
        </CardTitle>
        <CardDescription>
          Atur preferensi pekerjaan agar kami bisa memberikan rekomendasi yang tepat.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <FormField label="Posisi Target" error={errors.targetPosition?.message}>
            <Input
              {...register("targetPosition")}
              placeholder="Frontend Developer"
            />
          </FormField>

          <FormField label="Ekspektasi Gaji (Rp)" error={errors.expectedSalary?.message}>
            <Input
              type="number"
              {...register("expectedSalary")}
              placeholder="10000000"
            />
          </FormField>

          <FormField label="Tipe Pekerjaan" error={undefined}>
            <Controller
              control={control}
              name="jobType"
              render={({ field }) => (
                <div className="flex flex-wrap gap-2">
                  {jobTypes.map((jt) => {
                    const selected = field.value?.includes(jt.value);
                    return (
                      <button
                        key={jt.value}
                        type="button"
                        onClick={() => {
                          const current = field.value ?? [];
                          field.onChange(
                            selected ? current.filter((v) => v !== jt.value) : [...current, jt.value]
                          );
                        }}
                        className={cn(
                          "px-3 py-1.5 text-sm rounded-full border transition-colors",
                          selected
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-background hover:bg-accent"
                        )}
                      >
                        {jt.label}
                      </button>
                    );
                  })}
                </div>
              )}
            />
          </FormField>

          <FormField label="Lokasi Preferensi" error={undefined}>
            <Controller
              control={control}
              name="preferredLocations"
              render={({ field }) => (
                <LocationPicker value={field.value ?? []} onChange={field.onChange} />
              )}
            />
          </FormField>

          <FormField label="Preferensi Remote" error={undefined}>
            <Controller
              control={control}
              name="remotePreference"
              render={({ field }) => (
                <div className="flex flex-wrap gap-2">
                  {remoteOptions.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => field.onChange(field.value === opt.value ? "" : opt.value)}
                      className={cn(
                        "px-3 py-1.5 text-sm rounded-full border transition-colors",
                        field.value === opt.value
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-background hover:bg-accent"
                      )}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            />
          </FormField>

          <Separator />

          <div className="flex justify-end">
            <Button type="submit" disabled={saving}>
              {saving ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <>
                  <PartyPopper className="mr-2 h-4 w-4" />
                  Simpan & Selesai
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

// ─── Location Picker ───────────────────────────────────────

function LocationPicker({
  value,
  onChange,
}: {
  value: string[];
  onChange: (val: string[]) => void;
}) {
  const [input, setInput] = useState("");

  const addLocation = () => {
    const trimmed = input.trim();
    if (trimmed && !value.includes(trimmed)) {
      onChange([...value, trimmed]);
    }
    setInput("");
  };

  const removeLocation = (loc: string) => {
    onChange(value.filter((l) => l !== loc));
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addLocation();
            }
          }}
          placeholder="Ketik lokasi dan tekan Enter"
        />
        <Button type="button" variant="outline" onClick={addLocation}>
          <MapPin className="h-4 w-4" />
        </Button>
      </div>
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {value.map((loc) => (
            <Badge key={loc} variant="secondary" className="gap-1">
              <MapPin className="h-3 w-3" />
              {loc}
              <button type="button" onClick={() => removeLocation(loc)} className="ml-1 hover:text-destructive">
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Reusable FormField ────────────────────────────────────

function FormField({
  label,
  error,
  required,
  children,
}: {
  label: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label>
        {label}
        {required && <span className="text-destructive ml-0.5">*</span>}
      </Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
