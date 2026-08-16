"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { formatSalary } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Briefcase,
  Star,
  Clock,
  DollarSign,
  Wifi,
  Building2,
  Users,
  Plus,
  X,
  Eye,
  Send,
  Loader2,
  CheckCircle2,
  FileText,
  ArrowLeft,
} from "lucide-react";

const SKILL_OPTIONS = [
  "React", "Node.js", "Python", "TypeScript", "Go", "Java", "Flutter",
  "UI/UX Design", "Data Analysis", "Machine Learning", "DevOps", "PHP",
  "Laravel", "Vue.js", "Next.js", "Docker", "AWS", "Figma",
];

function DifficultyStars({ level, size = "md" }: { level: number; size?: "sm" | "md" }) {
  const sizeClass = size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4";
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`${sizeClass} ${i < level ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
        />
      ))}
    </div>
  );
}

export default function PostProjectPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");
  const [budget, setBudget] = useState("");
  const [duration, setDuration] = useState("");
  const [difficulty, setDifficulty] = useState<string>("3");
  const [type, setType] = useState<string>("REMOTE");
  const [deliverables, setDeliverables] = useState<string[]>([""]);
  const [deadline, setDeadline] = useState("");

  const [showPreview, setShowPreview] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const addSkill = (skill: string) => {
    const trimmed = skill.trim();
    if (trimmed && !skills.includes(trimmed)) {
      setSkills([...skills, trimmed]);
    }
    setSkillInput("");
  };

  const removeSkill = (skill: string) => {
    setSkills(skills.filter((s) => s !== skill));
  };

  const handleSkillKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addSkill(skillInput);
    }
  };

  const addDeliverable = () => {
    setDeliverables([...deliverables, ""]);
  };

  const updateDeliverable = (index: number, value: string) => {
    const updated = [...deliverables];
    updated[index] = value;
    setDeliverables(updated);
  };

  const removeDeliverable = (index: number) => {
    if (deliverables.length > 1) {
      setDeliverables(deliverables.filter((_, i) => i !== index));
    }
  };

  const isValid =
    title.trim() &&
    description.trim() &&
    skills.length > 0 &&
    budget &&
    duration &&
    deliverables.some((d) => d.trim());

  const handleSubmit = async () => {
    if (!isValid) return;
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      await api.post("/micro-intern", {
        title: title.trim(),
        description: description.trim(),
        skills,
        budget: parseInt(budget),
        duration: parseInt(duration),
        difficulty: parseInt(difficulty) as 1 | 2 | 3 | 4 | 5,
        type,
        deliverables: deliverables.filter((d) => d.trim()),
        deadline: deadline || undefined,
      });
      setSubmitSuccess(true);
      setTimeout(() => {
        router.push("/micro-intern/my-projects");
      }, 2000);
    } catch (err: any) {
      setSubmitError(err.response?.data?.message || "Gagal membuat project");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitSuccess) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        <Card className="py-16">
          <CardContent className="text-center">
            <CheckCircle2 className="h-16 w-16 mx-auto text-green-500 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Project Berhasil Dibuat!</h3>
            <p className="text-muted-foreground mb-4">
              Project kamu sudah dipublikasikan di marketplace.
            </p>
            <p className="text-sm text-muted-foreground">
              Mengalihkan ke halaman project saya...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-3xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Plus className="h-6 w-6 text-primary" />
            Posting Project Baru
          </h1>
          <p className="text-muted-foreground mt-1">
            Buat project micro-intern dan temukan talenta terbaik
          </p>
        </div>
      </div>

      {/* Error */}
      {submitError && (
        <Card className="mb-6 border-destructive">
          <CardContent className="pt-6 text-destructive text-sm">{submitError}</CardContent>
        </Card>
      )}

      {/* Preview mode */}
      {showPreview ? (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Preview Project</CardTitle>
                <Button variant="outline" size="sm" onClick={() => setShowPreview(false)}>
                  Edit
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Badge variant={type === "REMOTE" ? "default" : type === "ONSITE" ? "secondary" : "outline"}>
                  {type === "REMOTE" ? "Remote" : type === "ONSITE" ? "Onsite" : "Hybrid"}
                </Badge>
              </div>
              <h2 className="text-xl font-bold">{title}</h2>
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{description}</p>

              <div>
                <p className="text-sm font-medium mb-2">Skill yang Dibutuhkan</p>
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill) => (
                    <Badge key={skill} variant="secondary">{skill}</Badge>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Budget</p>
                  <p className="font-semibold">{formatSalary(parseInt(budget) || 0)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Durasi</p>
                  <p className="font-semibold">{duration} hari</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Kesulitan</p>
                  <DifficultyStars level={parseInt(difficulty)} size="sm" />
                </div>
                <div>
                  <p className="text-muted-foreground">Tipe</p>
                  <p className="font-semibold">{type}</p>
                </div>
              </div>

              {deliverables.filter(Boolean).length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-2">Deliverables</p>
                  <ul className="space-y-1">
                    {deliverables.filter(Boolean).map((d, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                        {d}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {deadline && (
                <p className="text-sm text-muted-foreground">
                  Deadline: {new Date(deadline).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                </p>
              )}
            </CardContent>
          </Card>

          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={() => setShowPreview(false)}>
              Edit
            </Button>
            <Button className="flex-1" onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Mempublikasikan...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Posting Project
                </>
              )}
            </Button>
          </div>
        </div>
      ) : (
        /* Form */
        <div className="space-y-6">
          {/* Title */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Informasi Dasar</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Judul Project *</Label>
                <Input
                  id="title"
                  placeholder="Contoh: Landing Page E-commerce Responsif"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Deskripsi *</Label>
                <Textarea
                  id="description"
                  placeholder="Jelaskan project secara detail: latar belang, tujuan, scope pekerjaan, dan ekspektasi..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={6}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Tipe *</Label>
                  <Select value={type} onValueChange={setType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="REMOTE">Remote</SelectItem>
                      <SelectItem value="ONSITE">Onsite</SelectItem>
                      <SelectItem value="HYBRID">Hybrid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="deadline">Deadline (opsional)</Label>
                  <Input
                    id="deadline"
                    type="date"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Skills */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Skill yang Dibutuhkan *</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-2">
                <Input
                  placeholder="Ketik skill lalu tekan Enter"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={handleSkillKeyDown}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => addSkill(skillInput)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {SKILL_OPTIONS.filter((s) => !skills.includes(s)).slice(0, 10).map((skill) => (
                  <Button
                    key={skill}
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() => addSkill(skill)}
                  >
                    + {skill}
                  </Button>
                ))}
              </div>
              {skills.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill) => (
                    <Badge key={skill} variant="secondary" className="flex items-center gap-1">
                      {skill}
                      <button
                        type="button"
                        onClick={() => removeSkill(skill)}
                        className="ml-1 hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Budget, Duration, Difficulty */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Detail Project</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="budget">Budget (Rp) *</Label>
                  <Input
                    id="budget"
                    type="number"
                    placeholder="1500000"
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    min={0}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="duration">Durasi (hari) *</Label>
                  <Input
                    id="duration"
                    type="number"
                    placeholder="14"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    min={1}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Tingkat Kesulitan</Label>
                  <Select value={difficulty} onValueChange={setDifficulty}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">⭐ Sangat Mudah</SelectItem>
                      <SelectItem value="2">⭐⭐ Mudah</SelectItem>
                      <SelectItem value="3">⭐⭐⭐ Sedang</SelectItem>
                      <SelectItem value="4">⭐⭐⭐⭐ Sulit</SelectItem>
                      <SelectItem value="5">⭐⭐⭐⭐⭐ Sangat Sulit</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Deliverables */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Deliverables *</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {deliverables.map((deliverable, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    placeholder={`Deliverable ${index + 1}`}
                    value={deliverable}
                    onChange={(e) => updateDeliverable(index, e.target.value)}
                  />
                  {deliverables.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeDeliverable(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" onClick={addDeliverable}>
                <Plus className="h-3.5 w-3.5 mr-1" />
                Tambah Deliverable
              </Button>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setShowPreview(true)}
              disabled={!isValid}
            >
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </Button>
            <Button
              className="flex-1"
              onClick={handleSubmit}
              disabled={!isValid || isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Mempublikasikan...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Posting Project
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
