"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Bell,
  BellRing,
  Mail,
  Smartphone,
  Monitor,
  Briefcase,
  MapPin,
  Code,
  Save,
  ArrowLeft,
  CheckCircle2,
  Zap,
  CalendarDays,
  CalendarClock,
  X,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Types
interface AlertPreferences {
  enabled: boolean;
  frequency: "REAL_TIME" | "DAILY_DIGEST" | "WEEKLY_DIGEST";
  minMatchScore: number;
  channels: {
    push: boolean;
    email: boolean;
    inApp: boolean;
  };
  jobTypes: string[];
  locations: string[];
  skills: string[];
}

const JOB_TYPES = [
  { value: "FULL_TIME", label: "Full Time" },
  { value: "PART_TIME", label: "Part Time" },
  { value: "CONTRACT", label: "Kontrak" },
  { value: "FREELANCE", label: "Freelance" },
  { value: "INTERNSHIP", label: "Magang" },
];

const FREQUENCY_OPTIONS = [
  { value: "REAL_TIME", label: "Real-time", icon: Zap, desc: "Dapatkan notifikasi segera saat ada kecocokan" },
  { value: "DAILY_DIGEST", label: "Harian", icon: CalendarDays, desc: "Ringkasan dikirim setiap pagi" },
  { value: "WEEKLY_DIGEST", label: "Mingguan", icon: CalendarClock, desc: "Ringkasan dikirim setiap Senin" },
];

export default function AlertsPage() {
  const router = useRouter();
  const [prefs, setPrefs] = useState<AlertPreferences>({
    enabled: true,
    frequency: "REAL_TIME",
    minMatchScore: 70,
    channels: { push: true, email: true, inApp: true },
    jobTypes: [],
    locations: [],
    skills: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Tag input states
  const [skillInput, setSkillInput] = useState("");
  const [locationInput, setLocationInput] = useState("");

  const fetchPreferences = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await api.get<AlertPreferences>("/alerts/preferences");
      setPrefs(res.data);
    } catch {
      // Use defaults
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPreferences();
  }, [fetchPreferences]);

  const handleSave = async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      await api.put("/alerts/preferences", prefs);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch {
      // silent fail
    } finally {
      setIsSaving(false);
    }
  };

  const toggleJobType = (type: string) => {
    setPrefs((prev) => ({
      ...prev,
      jobTypes: prev.jobTypes.includes(type)
        ? prev.jobTypes.filter((t) => t !== type)
        : [...prev.jobTypes, type],
    }));
  };

  const addSkill = () => {
    const trimmed = skillInput.trim();
    if (trimmed && !prefs.skills.includes(trimmed)) {
      setPrefs((prev) => ({ ...prev, skills: [...prev.skills, trimmed] }));
      setSkillInput("");
    }
  };

  const removeSkill = (skill: string) => {
    setPrefs((prev) => ({ ...prev, skills: prev.skills.filter((s) => s !== skill) }));
  };

  const addLocation = () => {
    const trimmed = locationInput.trim();
    if (trimmed && !prefs.locations.includes(trimmed)) {
      setPrefs((prev) => ({ ...prev, locations: [...prev.locations, trimmed] }));
      setLocationInput("");
    }
  };

  const removeLocation = (loc: string) => {
    setPrefs((prev) => ({ ...prev, locations: prev.locations.filter((l) => l !== loc) }));
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    addFn: () => void
  ) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addFn();
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-2xl space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-72" />
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-48 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-2xl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="icon" onClick={() => router.push("/notifications")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <BellRing className="h-6 w-6" />
            Preferensi Alert
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Atur notifikasi sesuai kebutuhanmu
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Master Toggle */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">Notifikasi Aktif</CardTitle>
                <CardDescription>
                  Matikan untuk berhenti menerima semua notifikasi
                </CardDescription>
              </div>
              <Switch
                checked={prefs.enabled}
                onCheckedChange={(checked) =>
                  setPrefs((prev) => ({ ...prev, enabled: checked }))
                }
              />
            </div>
          </CardHeader>
        </Card>

        {/* Frequency */}
        <Card className={cn(!prefs.enabled && "opacity-50 pointer-events-none")}>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Frekuensi Notifikasi</CardTitle>
            <CardDescription>Seberapa sering kamu ingin menerima alert</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {FREQUENCY_OPTIONS.map((opt) => {
                const Icon = opt.icon;
                const isSelected = prefs.frequency === opt.value;
                return (
                  <button
                    key={opt.value}
                    onClick={() =>
                      setPrefs((prev) => ({ ...prev, frequency: opt.value as AlertPreferences["frequency"] }))
                    }
                    className={cn(
                      "flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all text-center",
                      isSelected
                        ? "border-primary bg-primary/5"
                        : "border-transparent bg-muted hover:bg-muted/80"
                    )}
                  >
                    <Icon className={cn("h-6 w-6", isSelected ? "text-primary" : "text-muted-foreground")} />
                    <span className={cn("text-sm font-medium", isSelected && "text-primary")}>
                      {opt.label}
                    </span>
                    <span className="text-xs text-muted-foreground">{opt.desc}</span>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Match Score */}
        <Card className={cn(!prefs.enabled && "opacity-50 pointer-events-none")}>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Skor Kecocokan Minimum</CardTitle>
            <CardDescription>
              Hanya tampilkan pekerjaan dengan skor kecocokan ≥ {prefs.minMatchScore}%
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Slider
                value={[prefs.minMatchScore]}
                onValueChange={([val]) =>
                  setPrefs((prev) => ({ ...prev, minMatchScore: val }))
                }
                min={50}
                max={100}
                step={5}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>50%</span>
                <span className="font-medium text-foreground">{prefs.minMatchScore}%</span>
                <span>100%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Channel Preferences */}
        <Card className={cn(!prefs.enabled && "opacity-50 pointer-events-none")}>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Kanal Notifikasi</CardTitle>
            <CardDescription>Pilih bagaimana kamu ingin menerima notifikasi</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { key: "push" as const, label: "Push Notification", desc: "Notifikasi langsung ke perangkat", icon: Smartphone },
              { key: "email" as const, label: "Email", desc: "Dikirim ke alamat email terdaftar", icon: Mail },
              { key: "inApp" as const, label: "In-App", desc: "Notifikasi di dalam aplikasi", icon: Monitor },
            ].map((ch) => {
              const Icon = ch.icon;
              return (
                <div key={ch.key} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-md bg-muted">
                      <Icon className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>
                      <Label className="text-sm font-medium">{ch.label}</Label>
                      <p className="text-xs text-muted-foreground">{ch.desc}</p>
                    </div>
                  </div>
                  <Switch
                    checked={prefs.channels[ch.key]}
                    onCheckedChange={(checked) =>
                      setPrefs((prev) => ({
                        ...prev,
                        channels: { ...prev.channels, [ch.key]: checked },
                      }))
                    }
                  />
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Job Type Preferences */}
        <Card className={cn(!prefs.enabled && "opacity-50 pointer-events-none")}>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Briefcase className="h-4 w-4" />
              Tipe Pekerjaan
            </CardTitle>
            <CardDescription>Pilih tipe pekerjaan yang ingin dipantau</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {JOB_TYPES.map((type) => {
                const isSelected = prefs.jobTypes.includes(type.value);
                return (
                  <button
                    key={type.value}
                    onClick={() => toggleJobType(type.value)}
                    className={cn(
                      "inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border-2 text-sm font-medium transition-all",
                      isSelected
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-transparent bg-muted text-muted-foreground hover:bg-muted/80"
                    )}
                  >
                    {isSelected && <CheckCircle2 className="h-3.5 w-3.5" />}
                    {type.label}
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Location Preferences */}
        <Card className={cn(!prefs.enabled && "opacity-50 pointer-events-none")}>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Lokasi Preferensi
            </CardTitle>
            <CardDescription>Tambahkan lokasi yang kamu minati</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-2">
              <Input
                placeholder="Contoh: Jakarta, Bandung, Remote"
                value={locationInput}
                onChange={(e) => setLocationInput(e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, addLocation)}
              />
              <Button variant="outline" onClick={addLocation} disabled={!locationInput.trim()}>
                Tambah
              </Button>
            </div>
            {prefs.locations.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {prefs.locations.map((loc) => (
                  <Badge key={loc} variant="secondary" className="gap-1 pr-1">
                    <MapPin className="h-3 w-3" />
                    {loc}
                    <button
                      onClick={() => removeLocation(loc)}
                      className="ml-1 rounded-full hover:bg-muted-foreground/20 p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Skill Preferences */}
        <Card className={cn(!prefs.enabled && "opacity-50 pointer-events-none")}>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Code className="h-4 w-4" />
              Preferensi Skill
            </CardTitle>
            <CardDescription>Tambahkan skill yang ingin kamu cari</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-2">
              <Input
                placeholder="Contoh: React, Python, UI/UX"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, addSkill)}
              />
              <Button variant="outline" onClick={addSkill} disabled={!skillInput.trim()}>
                Tambah
              </Button>
            </div>
            {prefs.skills.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {prefs.skills.map((skill) => (
                  <Badge key={skill} variant="secondary" className="gap-1 pr-1">
                    <Code className="h-3 w-3" />
                    {skill}
                    <button
                      onClick={() => removeSkill(skill)}
                      className="ml-1 rounded-full hover:bg-muted-foreground/20 p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex items-center justify-end gap-3 pb-8">
          {saveSuccess && (
            <p className="text-sm text-green-600 flex items-center gap-1">
              <CheckCircle2 className="h-4 w-4" />
              Preferensi berhasil disimpan!
            </p>
          )}
          <Button onClick={handleSave} disabled={isSaving} size="lg">
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? "Menyimpan..." : "Simpan Preferensi"}
          </Button>
        </div>
      </div>
    </div>
  );
}
