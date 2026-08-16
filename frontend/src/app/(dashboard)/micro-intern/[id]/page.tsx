"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";
import { cn, formatSalary, formatDate } from "@/lib/utils";
import type { MicroInternProject, MicroInternApplication } from "@/lib/types";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  ArrowLeft,
  Briefcase,
  Star,
  Clock,
  DollarSign,
  MapPin,
  Wifi,
  Building2,
  Users,
  CheckCircle2,
  FileText,
  Link as LinkIcon,
  Calendar,
  Send,
  Loader2,
  ExternalLink,
} from "lucide-react";

function DifficultyStars({ level, size = "md" }: { level: number; size?: "sm" | "md" | "lg" }) {
  const sizeClass = { sm: "h-3.5 w-3.5", md: "h-4 w-4", lg: "h-5 w-5" }[size];
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={cn(
            sizeClass,
            i < level ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
          )}
        />
      ))}
    </div>
  );
}

function TypeBadge({ type }: { type: string }) {
  const config: Record<string, { label: string; icon: typeof Wifi; variant: "default" | "secondary" | "outline" }> = {
    REMOTE: { label: "Remote", icon: Wifi, variant: "default" },
    ONSITE: { label: "Onsite", icon: Building2, variant: "secondary" },
    HYBRID: { label: "Hybrid", icon: Users, variant: "outline" },
  };
  const c = config[type] || { label: type, icon: Briefcase, variant: "outline" as const };
  const Icon = c.icon;
  return (
    <Badge variant={c.variant} className="flex items-center gap-1 w-fit">
      <Icon className="h-3 w-3" />
      {c.label}
    </Badge>
  );
}

export default function MicroInternDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const projectId = params.id as string;

  const [project, setProject] = useState<MicroInternProject | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Proposal modal
  const [showProposal, setShowProposal] = useState(false);
  const [coverLetter, setCoverLetter] = useState("");
  const [portfolioLinks, setPortfolioLinks] = useState("");
  const [estimatedTimeline, setEstimatedTimeline] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  useEffect(() => {
    async function fetchProject() {
      setIsLoading(true);
      setError(null);
      try {
        const res = await api.get<MicroInternProject>(`/micro-intern/${projectId}`);
        setProject(res.data);
      } catch (err: any) {
        setError(err.response?.data?.message || "Gagal memuat detail project");
      } finally {
        setIsLoading(false);
      }
    }
    if (projectId) fetchProject();
  }, [projectId]);

  const handleSubmitProposal = async () => {
    if (!coverLetter.trim()) {
      setSubmitError("Cover letter wajib diisi");
      return;
    }
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const links = portfolioLinks
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean);
      await api.post(`/micro-intern/${projectId}/apply`, {
        coverLetter: coverLetter.trim(),
        portfolioLinks: links,
        estimatedTimeline: parseInt(estimatedTimeline) || 14,
      });
      setSubmitSuccess(true);
      setTimeout(() => {
        setShowProposal(false);
        setSubmitSuccess(false);
        setCoverLetter("");
        setPortfolioLinks("");
        setEstimatedTimeline("");
      }, 2000);
    } catch (err: any) {
      setSubmitError(err.response?.data?.message || "Gagal mengirim proposal");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <Skeleton className="h-8 w-32 mb-6" />
        <Skeleton className="h-10 w-3/4 mb-4" />
        <Skeleton className="h-6 w-1/2 mb-6" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <Card className="py-16">
          <CardContent className="text-center">
            <Briefcase className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Project tidak ditemukan</h3>
            <p className="text-muted-foreground mb-4">{error || "Project ini tidak tersedia"}</p>
            <Link href="/micro-intern">
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Kembali ke Marketplace
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      {/* Back button */}
      <Link href="/micro-intern" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="h-4 w-4 mr-1" />
        Kembali ke Marketplace
      </Link>

      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <TypeBadge type={project.type} />
          <Badge variant={project.status === "OPEN" ? "success" : "secondary"}>
            {project.status === "OPEN" ? "Terbuka" : project.status === "CLOSED" ? "Ditutup" : project.status}
          </Badge>
        </div>
        <h1 className="text-2xl font-bold mb-2">{project.title}</h1>
        {project.company && (
          <p className="text-muted-foreground flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            {project.company.name}
            {project.company.location && (
              <>
                <span className="text-muted-foreground/50">•</span>
                <MapPin className="h-4 w-4" />
                {project.company.location}
              </>
            )}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Deskripsi Project
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{project.description}</p>
            </CardContent>
          </Card>

          {/* Skills */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Skill yang Dibutuhkan</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {project.skills.map((skill) => (
                  <Badge key={skill} variant="secondary">
                    {skill}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Deliverables */}
          {project.deliverables && project.deliverables.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  Deliverables
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {project.deliverables.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Company info */}
          {project.company && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  Tentang Perusahaan
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="font-medium">{project.company.name}</p>
                {project.company.industry && (
                  <p className="text-sm text-muted-foreground">Industri: {project.company.industry}</p>
                )}
                {project.company.size && (
                  <p className="text-sm text-muted-foreground">Ukuran: {project.company.size}</p>
                )}
                {project.company.description && (
                  <p className="text-sm text-muted-foreground">{project.company.description}</p>
                )}
                {project.company.website && (
                  <a
                    href={project.company.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline inline-flex items-center gap-1"
                  >
                    <ExternalLink className="h-3 w-3" />
                    Website
                  </a>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Project info card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Info Project</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground flex items-center gap-2">
                  <DollarSign className="h-4 w-4" /> Budget
                </span>
                <span className="font-semibold">{formatSalary(project.budget)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground flex items-center gap-2">
                  <Clock className="h-4 w-4" /> Durasi
                </span>
                <span className="font-semibold">{project.duration} hari</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground flex items-center gap-2">
                  <Star className="h-4 w-4" /> Kesulitan
                </span>
                <DifficultyStars level={project.difficulty} size="sm" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground flex items-center gap-2">
                  <Users className="h-4 w-4" /> Pelamar
                </span>
                <span className="font-semibold">{project.applicantCount}</span>
              </div>
              {project.postedAt && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground flex items-center gap-2">
                    <Calendar className="h-4 w-4" /> Diposting
                  </span>
                  <span className="text-sm">{formatDate(project.postedAt)}</span>
                </div>
              )}
              {project.deadline && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground flex items-center gap-2">
                    <Calendar className="h-4 w-4" /> Deadline
                  </span>
                  <span className="text-sm font-medium text-destructive">{formatDate(project.deadline)}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Apply button */}
          {project.status === "OPEN" && (
            <Button
              className="w-full"
              size="lg"
              onClick={() => setShowProposal(true)}
            >
              <Send className="h-4 w-4 mr-2" />
              Ajukan Proposal
            </Button>
          )}

          {/* Related projects */}
          {project.relatedProjects && project.relatedProjects.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Project Terkait</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {project.relatedProjects.map((rp) => (
                  <Link
                    key={rp.id}
                    href={`/micro-intern/${rp.id}`}
                    className="block p-3 rounded-lg border hover:bg-accent transition-colors"
                  >
                    <p className="text-sm font-medium line-clamp-1">{rp.title}</p>
                    <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                      <span>{formatSalary(rp.budget)}</span>
                      <span>•</span>
                      <span>{rp.duration} hari</span>
                    </div>
                  </Link>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Proposal Modal */}
      <Dialog open={showProposal} onOpenChange={setShowProposal}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Ajukan Proposal</DialogTitle>
            <DialogDescription>
              Kirimkan proposal terbaikmu untuk project &ldquo;{project.title}&rdquo;
            </DialogDescription>
          </DialogHeader>

          {submitSuccess ? (
            <div className="py-8 text-center">
              <CheckCircle2 className="h-16 w-16 mx-auto text-green-500 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Proposal Terkirim!</h3>
              <p className="text-muted-foreground">
                Proposal kamu sudah dikirim. Tunggu respons dari perusahaan.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {submitError && (
                <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm">
                  {submitError}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="coverLetter">Cover Letter *</Label>
                <Textarea
                  id="coverLetter"
                  placeholder="Jelaskan mengapa kamu cocok untuk project ini, pengalaman relevan, dan pendekatanmu..."
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  rows={5}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="portfolioLinks">Link Portfolio (satu per baris)</Label>
                <Textarea
                  id="portfolioLinks"
                  placeholder={`https://github.com/kamu/project-1\nhttps://portfolio.kamu.dev/project-2`}
                  value={portfolioLinks}
                  onChange={(e) => setPortfolioLinks(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="timeline">Estimasi Timeline (hari)</Label>
                <Input
                  id="timeline"
                  type="number"
                  placeholder="Contoh: 14"
                  value={estimatedTimeline}
                  onChange={(e) => setEstimatedTimeline(e.target.value)}
                  min={1}
                />
                <p className="text-xs text-muted-foreground">
                  Project ini memiliki durasi {project.duration} hari
                </p>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setShowProposal(false)} disabled={isSubmitting}>
                  Batal
                </Button>
                <Button onClick={handleSubmitProposal} disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Mengirim...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Kirim Proposal
                    </>
                  )}
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
