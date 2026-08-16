"use client";

import { useEffect, useState, useCallback } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import api from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { cn, formatDate } from "@/lib/utils";
import type {
  Profile,
  Experience,
  Education,
  UserSkill,
} from "@/lib/types";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
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
  User,
  Briefcase,
  GraduationCap,
  Zap,
  Settings,
  Save,
  Plus,
  Trash2,
  Pencil,
  X,
  Check,
  Loader2,
  MapPin,
  Globe,
  Linkedin,
  Github,
  DollarSign,
  Search,
} from "lucide-react";

// ─── Schemas ───────────────────────────────────────────────

const basicSchema = z.object({
  fullName: z.string().min(2, "Nama minimal 2 karakter"),
  headline: z.string().optional(),
  bio: z.string().max(500, "Bio maksimal 500 karakter").optional(),
  location: z.string().optional(),
  city: z.string().optional(),
  province: z.string().optional(),
  website: z.string().url("URL tidak valid").or(z.literal("")).optional(),
  linkedinUrl: z.string().url("URL tidak valid").or(z.literal("")).optional(),
  githubUrl: z.string().url("URL tidak valid").or(z.literal("")).optional(),
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
  expectedSalary: z.coerce.number().min(0).optional(),
  jobType: z.array(z.string()).optional(),
  preferredLocations: z.array(z.string()).optional(),
  remotePreference: z.string().optional(),
});

type BasicForm = z.infer<typeof basicSchema>;
type ExperienceForm = z.infer<typeof experienceSchema>;
type EducationForm = z.infer<typeof educationSchema>;
type PreferenceForm = z.infer<typeof preferenceSchema>;

// ─── Main Page ─────────────────────────────────────────────

export default function ProfileEditPage() {
  const { toast } = useToast();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("dasar");

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

  if (loading) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-8 space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-8 text-center">
        <p className="text-muted-foreground">Profil tidak ditemukan.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-6 md:py-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">Edit Profil</h1>
        <p className="text-muted-foreground mt-1">
          Lengkapi profil Anda untuk meningkatkan visibilitas.
        </p>
      </div>

      {/* Completion Progress */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Kelengkapan Profil</span>
            <span className="text-sm font-semibold text-primary">
              {profile.profileCompletion}%
            </span>
          </div>
          <Progress value={profile.profileCompletion} className="h-2" />
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 h-auto md:h-10">
          <TabsTrigger value="dasar" className="gap-1.5 text-xs md:text-sm">
            <User className="h-4 w-4" /> <span className="hidden sm:inline">Dasar</span>
          </TabsTrigger>
          <TabsTrigger value="pengalaman" className="gap-1.5 text-xs md:text-sm">
            <Briefcase className="h-4 w-4" /> <span className="hidden sm:inline">Pengalaman</span>
          </TabsTrigger>
          <TabsTrigger value="pendidikan" className="gap-1.5 text-xs md:text-sm">
            <GraduationCap className="h-4 w-4" /> <span className="hidden sm:inline">Pendidikan</span>
          </TabsTrigger>
          <TabsTrigger value="skill" className="gap-1.5 text-xs md:text-sm">
            <Zap className="h-4 w-4" /> <span className="hidden sm:inline">Skill</span>
          </TabsTrigger>
          <TabsTrigger value="preferensi" className="gap-1.5 text-xs md:text-sm">
            <Settings className="h-4 w-4" /> <span className="hidden sm:inline">Preferensi</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dasar">
          <BasicInfoTab profile={profile} onSaved={fetchProfile} />
        </TabsContent>
        <TabsContent value="pengalaman">
          <ExperienceTab
            experiences={profile.experiences ?? []}
            onChanged={fetchProfile}
          />
        </TabsContent>
        <TabsContent value="pendidikan">
          <EducationTab
            educations={profile.educations ?? []}
            onChanged={fetchProfile}
          />
        </TabsContent>
        <TabsContent value="skill">
          <SkillsTab skills={profile.skills ?? []} onChanged={fetchProfile} />
        </TabsContent>
        <TabsContent value="preferensi">
          <PreferenceTab profile={profile} onSaved={fetchProfile} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ─── Tab: Basic Info ───────────────────────────────────────

function BasicInfoTab({
  profile,
  onSaved,
}: {
  profile: Profile;
  onSaved: () => Promise<void>;
}) {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<BasicForm>({
    resolver: zodResolver(basicSchema),
    defaultValues: {
      fullName: profile.fullName ?? "",
      headline: profile.headline ?? "",
      bio: profile.bio ?? "",
      location: profile.location ?? "",
      city: profile.city ?? "",
      province: profile.province ?? "",
      website: profile.website ?? "",
      linkedinUrl: profile.linkedinUrl ?? "",
      githubUrl: profile.githubUrl ?? "",
    },
  });

  const onSubmit = async (data: BasicForm) => {
    setSaving(true);
    try {
      await api.put("/profile/me", data);
      toast({ title: "Profil berhasil disimpan", variant: "success" });
      await onSaved();
    } catch {
      toast({ title: "Gagal menyimpan profil", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Informasi Dasar</CardTitle>
        <CardDescription>
          Data dasar yang akan ditampilkan di profil publik Anda.
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
              placeholder="Frontend Developer di Tech Corp"
            />
          </FormField>

          <FormField label="Bio" error={errors.bio?.message}>
            <Textarea
              {...register("bio")}
              placeholder="Ceritakan tentang diri Anda..."
              rows={4}
            />
          </FormField>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
            <FormField label="Kota" error={errors.city?.message}>
              <Input {...register("city")} placeholder="Jakarta Selatan" />
            </FormField>
            <FormField label="Provinsi" error={errors.province?.message}>
              <Input {...register("province")} placeholder="DKI Jakarta" />
            </FormField>
          </div>

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField label="Website" error={errors.website?.message}>
              <div className="relative">
                <Globe className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  {...register("website")}
                  placeholder="https://example.com"
                  className="pl-9"
                />
              </div>
            </FormField>
            <FormField label="LinkedIn" error={errors.linkedinUrl?.message}>
              <div className="relative">
                <Linkedin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  {...register("linkedinUrl")}
                  placeholder="https://linkedin.com/in/..."
                  className="pl-9"
                />
              </div>
            </FormField>
            <FormField label="GitHub" error={errors.githubUrl?.message}>
              <div className="relative">
                <Github className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  {...register("githubUrl")}
                  placeholder="https://github.com/..."
                  className="pl-9"
                />
              </div>
            </FormField>
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={saving || !isDirty}>
              {saving ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              Simpan
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

// ─── Tab: Experience ───────────────────────────────────────

function ExperienceTab({
  experiences,
  onChanged,
}: {
  experiences: Experience[];
  onChanged: () => Promise<void>;
}) {
  const { toast } = useToast();
  const [editing, setEditing] = useState<Experience | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<ExperienceForm>({
    resolver: zodResolver(experienceSchema),
    defaultValues: {
      isCurrent: false,
    },
  });

  const isCurrent = watch("isCurrent");

  const openAdd = () => {
    setEditing(null);
    reset({
      company: "",
      position: "",
      description: "",
      startDate: "",
      endDate: "",
      isCurrent: false,
      location: "",
    });
    setShowForm(true);
  };

  const openEdit = (exp: Experience) => {
    setEditing(exp);
    reset({
      company: exp.company,
      position: exp.position,
      description: exp.description ?? "",
      startDate: exp.startDate?.slice(0, 10) ?? "",
      endDate: exp.endDate?.slice(0, 10) ?? "",
      isCurrent: exp.isCurrent,
      location: exp.location ?? "",
    });
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditing(null);
    reset();
  };

  const onSubmit = async (data: ExperienceForm) => {
    setSaving(true);
    try {
      const payload = {
        ...data,
        endDate: data.isCurrent ? undefined : data.endDate || undefined,
      };
      if (editing) {
        await api.put(`/profile/me/experience/${editing.id}`, payload);
        toast({ title: "Pengalaman diperbarui", variant: "success" });
      } else {
        await api.post("/profile/me/experience", payload);
        toast({ title: "Pengalaman ditambahkan", variant: "success" });
      }
      closeForm();
      await onChanged();
    } catch {
      toast({ title: "Gagal menyimpan pengalaman", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeleting(id);
    try {
      await api.delete(`/profile/me/experience/${id}`);
      toast({ title: "Pengalaman dihapus", variant: "success" });
      await onChanged();
    } catch {
      toast({ title: "Gagal menghapus pengalaman", variant: "destructive" });
    } finally {
      setDeleting(null);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle>Pengalaman Kerja</CardTitle>
          <CardDescription>
            Tambahkan riwayat pengalaman kerja Anda.
          </CardDescription>
        </div>
        {!showForm && (
          <Button size="sm" onClick={openAdd}>
            <Plus className="mr-1.5 h-4 w-4" /> Tambah
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Form */}
        {showForm && (
          <Card className="border-primary/30">
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    label="Perusahaan"
                    error={errors.company?.message}
                    required
                  >
                    <Input
                      {...register("company")}
                      placeholder="PT Teknologi Indonesia"
                    />
                  </FormField>
                  <FormField
                    label="Posisi"
                    error={errors.position?.message}
                    required
                  >
                    <Input
                      {...register("position")}
                      placeholder="Frontend Developer"
                    />
                  </FormField>
                </div>

                <FormField label="Deskripsi" error={errors.description?.message}>
                  <Textarea
                    {...register("description")}
                    placeholder="Deskripsikan tanggung jawab dan pencapaian Anda..."
                    rows={3}
                  />
                </FormField>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    label="Tanggal Mulai"
                    error={errors.startDate?.message}
                    required
                  >
                    <Input
                      type="date"
                      {...register("startDate")}
                    />
                  </FormField>
                  <FormField
                    label="Tanggal Selesai"
                    error={errors.endDate?.message}
                  >
                    <Input
                      type="date"
                      {...register("endDate")}
                      disabled={isCurrent}
                    />
                  </FormField>
                  <FormField label=" " error={undefined}>
                    <label className="flex items-center gap-2 h-10 text-sm">
                      <input
                        type="checkbox"
                        {...register("isCurrent")}
                        className="rounded border-input"
                      />
                      Masalah bekerja di sini
                    </label>
                  </FormField>
                </div>

                <FormField label="Lokasi" error={errors.location?.message}>
                  <Input
                    {...register("location")}
                    placeholder="Jakarta, Indonesia"
                  />
                </FormField>

                <div className="flex gap-2 justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={closeForm}
                  >
                    Batal
                  </Button>
                  <Button type="submit" disabled={saving}>
                    {saving ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="mr-2 h-4 w-4" />
                    )}
                    {editing ? "Perbarui" : "Simpan"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* List */}
        {experiences.length === 0 && !showForm && (
          <div className="text-center py-12 text-muted-foreground">
            <Briefcase className="mx-auto h-12 w-12 mb-3 opacity-50" />
            <p>Belum ada pengalaman kerja.</p>
            <Button variant="outline" className="mt-4" onClick={openAdd}>
              <Plus className="mr-1.5 h-4 w-4" /> Tambah Pengalaman
            </Button>
          </div>
        )}

        {experiences.map((exp) => (
          <div
            key={exp.id}
            className="flex items-start justify-between p-4 rounded-lg border bg-card hover:shadow-sm transition-shadow"
          >
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold">{exp.position}</h4>
              <p className="text-sm text-muted-foreground">{exp.company}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {formatDate(exp.startDate)} –{" "}
                {exp.isCurrent ? "Sekarang" : exp.endDate ? formatDate(exp.endDate) : ""}
              </p>
              {exp.description && (
                <p className="text-sm mt-2 text-muted-foreground line-clamp-2">
                  {exp.description}
                </p>
              )}
            </div>
            <div className="flex gap-1 ml-4 shrink-0">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => openEdit(exp)}
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleDelete(exp.id)}
                disabled={deleting === exp.id}
              >
                {deleting === exp.id ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4 text-destructive" />
                )}
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

// ─── Tab: Education ────────────────────────────────────────

function EducationTab({
  educations,
  onChanged,
}: {
  educations: Education[];
  onChanged: () => Promise<void>;
}) {
  const { toast } = useToast();
  const [editing, setEditing] = useState<Education | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EducationForm>({
    resolver: zodResolver(educationSchema),
  });

  const openAdd = () => {
    setEditing(null);
    reset({
      institution: "",
      degree: "",
      field: "",
      startYear: new Date().getFullYear(),
      endYear: undefined,
      gpa: undefined,
    });
    setShowForm(true);
  };

  const openEdit = (edu: Education) => {
    setEditing(edu);
    reset({
      institution: edu.institution,
      degree: edu.degree,
      field: edu.field,
      startYear: edu.startYear,
      endYear: edu.endYear ?? undefined,
      gpa: edu.gpa ?? undefined,
    });
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditing(null);
    reset();
  };

  const onSubmit = async (data: EducationForm) => {
    setSaving(true);
    try {
      if (editing) {
        await api.put(`/profile/me/education/${editing.id}`, data);
        toast({ title: "Pendidikan diperbarui", variant: "success" });
      } else {
        await api.post("/profile/me/education", data);
        toast({ title: "Pendidikan ditambahkan", variant: "success" });
      }
      closeForm();
      await onChanged();
    } catch {
      toast({ title: "Gagal menyimpan pendidikan", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeleting(id);
    try {
      await api.delete(`/profile/me/education/${id}`);
      toast({ title: "Pendidikan dihapus", variant: "success" });
      await onChanged();
    } catch {
      toast({ title: "Gagal menghapus pendidikan", variant: "destructive" });
    } finally {
      setDeleting(null);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle>Pendidikan</CardTitle>
          <CardDescription>
            Tambahkan riwayat pendidikan Anda.
          </CardDescription>
        </div>
        {!showForm && (
          <Button size="sm" onClick={openAdd}>
            <Plus className="mr-1.5 h-4 w-4" /> Tambah
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {showForm && (
          <Card className="border-primary/30">
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  label="Institusi"
                  error={errors.institution?.message}
                  required
                >
                  <Input
                    {...register("institution")}
                    placeholder="Universitas Indonesia"
                  />
                </FormField>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    label="Jenjang"
                    error={errors.degree?.message}
                    required
                  >
                    <Input
                      {...register("degree")}
                      placeholder="S1 / Bachelor"
                    />
                  </FormField>
                  <FormField
                    label="Bidang Studi"
                    error={errors.field?.message}
                    required
                  >
                    <Input
                      {...register("field")}
                      placeholder="Teknik Informatika"
                    />
                  </FormField>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    label="Tahun Mulai"
                    error={errors.startYear?.message}
                    required
                  >
                    <Input
                      type="number"
                      {...register("startYear")}
                      placeholder="2018"
                    />
                  </FormField>
                  <FormField
                    label="Tahun Lulus"
                    error={errors.endYear?.message}
                  >
                    <Input
                      type="number"
                      {...register("endYear")}
                      placeholder="2022"
                    />
                  </FormField>
                  <FormField label="IPK" error={errors.gpa?.message}>
                    <Input
                      type="number"
                      step="0.01"
                      {...register("gpa")}
                      placeholder="3.75"
                    />
                  </FormField>
                </div>

                <div className="flex gap-2 justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={closeForm}
                  >
                    Batal
                  </Button>
                  <Button type="submit" disabled={saving}>
                    {saving ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="mr-2 h-4 w-4" />
                    )}
                    {editing ? "Perbarui" : "Simpan"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {educations.length === 0 && !showForm && (
          <div className="text-center py-12 text-muted-foreground">
            <GraduationCap className="mx-auto h-12 w-12 mb-3 opacity-50" />
            <p>Belum ada data pendidikan.</p>
            <Button variant="outline" className="mt-4" onClick={openAdd}>
              <Plus className="mr-1.5 h-4 w-4" /> Tambah Pendidikan
            </Button>
          </div>
        )}

        {educations.map((edu) => (
          <div
            key={edu.id}
            className="flex items-start justify-between p-4 rounded-lg border bg-card hover:shadow-sm transition-shadow"
          >
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold">
                {edu.degree} – {edu.field}
              </h4>
              <p className="text-sm text-muted-foreground">{edu.institution}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {edu.startYear}
                {edu.endYear ? ` – ${edu.endYear}` : " – Sekarang"}
                {edu.gpa ? ` · IPK: ${edu.gpa}` : ""}
              </p>
            </div>
            <div className="flex gap-1 ml-4 shrink-0">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => openEdit(edu)}
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleDelete(edu.id)}
                disabled={deleting === edu.id}
              >
                {deleting === edu.id ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4 text-destructive" />
                )}
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

// ─── Tab: Skills ───────────────────────────────────────────

function SkillsTab({
  skills,
  onChanged,
}: {
  skills: UserSkill[];
  onChanged: () => Promise<void>;
}) {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState<number>(3);
  const [adding, setAdding] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  // Debounced search
  useEffect(() => {
    if (searchQuery.length < 2) {
      setSuggestions([]);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const res = await api.get(
          `/profile/skills/search?q=${encodeURIComponent(searchQuery)}`
        );
        const names: string[] = res.data.map((s: { name: string }) => s.name);
        setSuggestions(names);
        setShowSuggestions(true);
      } catch {
        // ignore
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleAdd = async (name: string) => {
    setAdding(true);
    try {
      await api.post("/profile/me/skills", { name, level: selectedLevel });
      toast({ title: `Skill "${name}" ditambahkan`, variant: "success" });
      setSearchQuery("");
      setShowSuggestions(false);
      await onChanged();
    } catch {
      toast({ title: "Gagal menambahkan skill", variant: "destructive" });
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeleting(id);
    try {
      await api.delete(`/profile/me/skills/${id}`);
      toast({ title: "Skill dihapus", variant: "success" });
      await onChanged();
    } catch {
      toast({ title: "Gagal menghapus skill", variant: "destructive" });
    } finally {
      setDeleting(null);
    }
  };

  const levelLabels = ["", "Pemula", "Dasar", "Menengah", "Mahir", "Ahli"];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Skill</CardTitle>
        <CardDescription>
          Tambahkan keahlian yang Anda miliki.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Add Skill */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (e.target.value.length >= 2) setShowSuggestions(true);
              }}
              onFocus={() => {
                if (suggestions.length > 0) setShowSuggestions(true);
              }}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              placeholder="Cari atau ketik nama skill..."
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

          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground whitespace-nowrap">
              Level:
            </span>
            <div className="flex gap-1">
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
            </div>
            {searchQuery && !suggestions.includes(searchQuery) && (
              <Button
                size="sm"
                disabled={adding}
                onMouseDown={(e) => {
                  e.preventDefault();
                  handleAdd(searchQuery);
                }}
              >
                {adding ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4 mr-1" />
                )}
                Tambah &quot;{searchQuery}&quot;
              </Button>
            )}
          </div>
        </div>

        <Separator />

        {/* Skills List */}
        {skills.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Zap className="mx-auto h-12 w-12 mb-3 opacity-50" />
            <p>Belum ada skill.</p>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {skills.map((skill) => (
              <div
                key={skill.id}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full border bg-card hover:shadow-sm transition-shadow group"
              >
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((lvl) => (
                    <div
                      key={lvl}
                      className={cn(
                        "w-2 h-2 rounded-full",
                        lvl <= skill.level
                          ? "bg-primary"
                          : "bg-muted"
                      )}
                    />
                  ))}
                </div>
                <span className="text-sm font-medium">{skill.name}</span>
                <span className="text-xs text-muted-foreground">
                  {levelLabels[skill.level]}
                </span>
                {skill.verified && (
                  <Check className="h-3.5 w-3.5 text-green-500" />
                )}
                <button
                  onClick={() => handleDelete(skill.id)}
                  disabled={deleting === skill.id}
                  className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  {deleting === skill.id ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <X className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
                  )}
                </button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Tab: Preferences ─────────────────────────────────────

function PreferenceTab({
  profile,
  onSaved,
}: {
  profile: Profile;
  onSaved: () => Promise<void>;
}) {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isDirty },
  } = useForm<PreferenceForm>({
    resolver: zodResolver(preferenceSchema),
    defaultValues: {
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
      toast({ title: "Preferensi berhasil disimpan", variant: "success" });
      await onSaved();
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
        <CardTitle>Preferensi Kerja</CardTitle>
        <CardDescription>
          Atur preferensi pekerjaan Anda untuk rekomendasi yang lebih baik.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <FormField
            label="Ekspektasi Gaji (Rp)"
            error={errors.expectedSalary?.message}
          >
            <div className="relative">
              <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                type="number"
                {...register("expectedSalary")}
                placeholder="10000000"
                className="pl-9"
              />
            </div>
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
                            selected
                              ? current.filter((v) => v !== jt.value)
                              : [...current, jt.value]
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

          <FormField
            label="Lokasi Preferensi"
            error={undefined}
          >
            <Controller
              control={control}
              name="preferredLocations"
              render={({ field }) => (
                <LocationPicker
                  value={field.value ?? []}
                  onChange={field.onChange}
                />
              )}
            />
          </FormField>

          <FormField
            label="Preferensi Remote"
            error={undefined}
          >
            <Controller
              control={control}
              name="remotePreference"
              render={({ field }) => (
                <Select
                  value={field.value ?? ""}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih preferensi remote" />
                  </SelectTrigger>
                  <SelectContent>
                    {remoteOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </FormField>

          <div className="flex justify-end">
            <Button type="submit" disabled={saving || !isDirty}>
              {saving ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              Simpan
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

// ─── Location Picker (simple tag input) ────────────────────

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
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {value.map((loc) => (
            <Badge key={loc} variant="secondary" className="gap-1">
              <MapPin className="h-3 w-3" />
              {loc}
              <button
                type="button"
                onClick={() => removeLocation(loc)}
                className="ml-1 hover:text-destructive"
              >
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
