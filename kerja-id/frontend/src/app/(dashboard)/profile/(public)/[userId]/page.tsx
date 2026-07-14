"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import api from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { cn, formatDate, formatSalary } from "@/lib/utils";
import type {
  Profile,
  Experience,
  Education,
  UserSkill,
  Certification,
  PortfolioItem,
} from "@/lib/types";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

import {
  MapPin,
  Globe,
  Linkedin,
  Github,
  Briefcase,
  GraduationCap,
  Zap,
  Award,
  FolderOpen,
  Share2,
  Check,
  ExternalLink,
  DollarSign,
  Clock,
} from "lucide-react";

// ─── Main Page ─────────────────────────────────────────────

export default function PublicProfilePage() {
  const params = useParams();
  const userId = params.userId as string;
  const { toast } = useToast();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const fetchProfile = useCallback(async () => {
    try {
      const res = await api.get<Profile>(`/profile/${userId}`);
      setProfile(res.data);
    } catch (err: any) {
      if (err?.response?.status === 404) {
        setNotFound(true);
      } else {
        toast({ title: "Gagal memuat profil", variant: "destructive" });
      }
    } finally {
      setLoading(false);
    }
  }, [userId, toast]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleShare = async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      toast({ title: "Link profil disalin!", variant: "success" });
    } catch {
      toast({ title: "Gagal menyalin link", variant: "destructive" });
    }
  };

  // Loading skeleton
  if (loading) {
    return <ProfileSkeleton />;
  }

  // Not found
  if (notFound || !profile) {
    return (
      <div className="container mx-auto max-w-3xl px-4 py-16 text-center">
        <div className="text-6xl mb-4">🔍</div>
        <h1 className="text-2xl font-bold mb-2">Profil Tidak Ditemukan</h1>
        <p className="text-muted-foreground">
          Profil yang Anda cari tidak tersedia atau telah dihapus.
        </p>
      </div>
    );
  }

  const initials = profile.fullName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="container mx-auto max-w-3xl px-4 py-6 md:py-10 space-y-6">
      {/* Header Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
            <Avatar className="h-24 w-24 shrink-0">
              <AvatarImage src={profile.photoUrl} alt={profile.fullName} />
              <AvatarFallback className="text-2xl font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 text-center sm:text-left min-w-0">
              <h1 className="text-2xl font-bold">{profile.fullName}</h1>
              {profile.headline && (
                <p className="text-muted-foreground mt-1">{profile.headline}</p>
              )}

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mt-3">
                {profile.location && (
                  <span className="flex items-center gap-1 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    {profile.location}
                  </span>
                )}
                {profile.showSalary !== false && profile.expectedSalary && (
                  <span className="flex items-center gap-1 text-sm text-muted-foreground">
                    <DollarSign className="h-4 w-4" />
                    {formatSalary(profile.expectedSalary)}
                  </span>
                )}
              </div>

              {/* Social Links */}
              <div className="flex items-center justify-center sm:justify-start gap-2 mt-3">
                {profile.website && (
                  <a
                    href={profile.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    <Globe className="h-5 w-5" />
                  </a>
                )}
                {profile.linkedinUrl && (
                  <a
                    href={profile.linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    <Linkedin className="h-5 w-5" />
                  </a>
                )}
                {profile.githubUrl && (
                  <a
                    href={profile.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    <Github className="h-5 w-5" />
                  </a>
                )}
              </div>
            </div>

            <Button variant="outline" size="sm" onClick={handleShare} className="shrink-0">
              <Share2 className="mr-1.5 h-4 w-4" />
              Bagikan
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* About */}
      {profile.bio && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Tentang</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed whitespace-pre-line text-muted-foreground">
              {profile.bio}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Experience */}
      {profile.experiences && profile.experiences.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              Pengalaman
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {profile.experiences.map((exp, i) => (
              <div key={exp.id}>
                {i > 0 && <Separator className="mb-5" />}
                <ExperienceItem exp={exp} />
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Education */}
      {profile.educations && profile.educations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <GraduationCap className="h-5 w-5" />
              Pendidikan
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {profile.educations.map((edu, i) => (
              <div key={edu.id}>
                {i > 0 && <Separator className="mb-5" />}
                <EducationItem edu={edu} />
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Skills */}
      {profile.skills && profile.skills.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Keahlian
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {profile.skills.map((skill) => (
                <SkillItem key={skill.id} skill={skill} />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Certifications */}
      {profile.certifications && profile.certifications.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Award className="h-5 w-5" />
              Sertifikasi
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {profile.certifications.map((cert, i) => (
              <div key={cert.id}>
                {i > 0 && <Separator className="mb-4" />}
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-medium">{cert.name}</h4>
                    <p className="text-sm text-muted-foreground">{cert.issuer}</p>
                    {cert.date && (
                      <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDate(cert.date)}
                      </p>
                    )}
                  </div>
                  {cert.url && (
                    <a
                      href={cert.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-primary transition-colors"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Portfolio */}
      {profile.portfolioItems && profile.portfolioItems.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <FolderOpen className="h-5 w-5" />
              Portofolio
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {profile.portfolioItems.map((item) => (
                <PortfolioCard key={item.id} item={item} />
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ─── Sub-components ────────────────────────────────────────

function ExperienceItem({ exp }: { exp: Experience }) {
  return (
    <div className="flex items-start gap-4">
      <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
        <Briefcase className="h-5 w-5 text-muted-foreground" />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-semibold">{exp.position}</h4>
        <p className="text-sm text-muted-foreground">{exp.company}</p>
        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {formatDate(exp.startDate)} –{" "}
          {exp.isCurrent ? "Sekarang" : exp.endDate ? formatDate(exp.endDate) : ""}
          {exp.location ? ` · ${exp.location}` : ""}
        </p>
        {exp.description && (
          <p className="text-sm mt-2 text-muted-foreground whitespace-pre-line">
            {exp.description}
          </p>
        )}
      </div>
    </div>
  );
}

function EducationItem({ edu }: { edu: Education }) {
  return (
    <div className="flex items-start gap-4">
      <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
        <GraduationCap className="h-5 w-5 text-muted-foreground" />
      </div>
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
    </div>
  );
}

function SkillItem({ skill }: { skill: UserSkill }) {
  const levelLabels = ["", "Pemula", "Dasar", "Menengah", "Mahir", "Ahli"];
  const percentage = (skill.level / 5) * 100;

  return (
    <div className="flex items-center gap-3 p-3 rounded-lg border bg-card">
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-sm font-medium truncate">{skill.name}</span>
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-muted-foreground">
              {levelLabels[skill.level]}
            </span>
            {skill.verified && (
              <Check className="h-3.5 w-3.5 text-green-500" />
            )}
          </div>
        </div>
        <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    </div>
  );
}

function PortfolioCard({ item }: { item: PortfolioItem }) {
  return (
    <div className="rounded-lg border bg-card overflow-hidden hover:shadow-md transition-shadow">
      {item.images.length > 0 && (
        <div className="aspect-video bg-muted overflow-hidden">
          <img
            src={item.images[0]}
            alt={item.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <div className="p-4">
        <h4 className="font-semibold">{item.title}</h4>
        {item.description && (
          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
            {item.description}
          </p>
        )}
        {item.url && (
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-sm text-primary hover:underline mt-2"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            Lihat Proyek
          </a>
        )}
      </div>
    </div>
  );
}

// ─── Loading Skeleton ──────────────────────────────────────

function ProfileSkeleton() {
  return (
    <div className="container mx-auto max-w-3xl px-4 py-6 md:py-10 space-y-6">
      {/* Header */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
            <Skeleton className="h-24 w-24 rounded-full shrink-0" />
            <div className="flex-1 space-y-3 text-center sm:text-left">
              <Skeleton className="h-7 w-48 mx-auto sm:mx-0" />
              <Skeleton className="h-5 w-64 mx-auto sm:mx-0" />
              <div className="flex gap-3 justify-center sm:justify-start">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-28" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* About */}
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-24" />
        </CardHeader>
        <CardContent className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </CardContent>
      </Card>

      {/* Experience */}
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-32" />
        </CardHeader>
        <CardContent className="space-y-5">
          {[1, 2].map((i) => (
            <div key={i} className="flex gap-4">
              <Skeleton className="h-10 w-10 rounded-lg shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-48" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Skills */}
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-24" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-16 w-full rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
