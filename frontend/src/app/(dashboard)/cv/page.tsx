"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";
import { formatDateShort } from "@/lib/utils";
import type { CvVersion } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  FileText,
  Plus,
  Upload,
  Edit3,
  Trash2,
  Star,
  MoreVertical,
  Sparkles,
  Briefcase,
} from "lucide-react";

export default function CvDashboardPage() {
  const router = useRouter();
  const [cvs, setCvs] = useState<CvVersion[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    fetchCvs();
  }, []);

  async function fetchCvs() {
    try {
      const res = await api.get<CvVersion[]>("/cv");
      setCvs(res.data);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Hapus CV ini? Tindakan ini tidak dapat dibatalkan.")) return;
    setDeletingId(id);
    try {
      await api.delete(`/cv/${id}`);
      setCvs((prev) => prev.filter((c) => c.id !== id));
    } catch {
      alert("Gagal menghapus CV.");
    } finally {
      setDeletingId(null);
    }
  }

  async function handleSetDefault(id: string) {
    try {
      await api.put(`/cv/${id}`, { isDefault: true });
      setCvs((prev) =>
        prev.map((c) => ({ ...c, isDefault: c.id === id }))
      );
    } catch {
      alert("Gagal mengatur CV default.");
    }
  }

  function getScoreColor(score?: number) {
    if (!score) return "text-muted-foreground";
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  }

  function getScoreBadgeVariant(score?: number): "success" | "warning" | "destructive" | "secondary" {
    if (!score) return "secondary";
    if (score >= 80) return "success";
    if (score >= 60) return "warning";
    return "destructive";
  }

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <div className="flex gap-2">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-56 w-full rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <FileText className="h-6 w-6" />
            CV Saya
          </h1>
          <p className="text-muted-foreground mt-1">
            Kelola dan optimalkan CV Anda untuk setiap lamaran
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/cv/analyze">
              <Upload className="h-4 w-4 mr-2" />
              Upload CV
            </Link>
          </Button>
          <Button asChild>
            <Link href="/cv/builder">
              <Plus className="h-4 w-4 mr-2" />
              Buat CV Baru
            </Link>
          </Button>
        </div>
      </div>

      {/* CV List */}
      {cvs.length === 0 ? (
        <Card className="p-12">
          <div className="flex flex-col items-center justify-center text-center space-y-4">
            <div className="p-4 rounded-full bg-muted">
              <FileText className="h-12 w-12 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold">Belum Ada CV</h3>
            <p className="text-muted-foreground max-w-md">
              Buat CV pertama Anda atau upload CV yang sudah ada untuk dianalisis
              dan dioptimalkan dengan AI.
            </p>
            <div className="flex gap-3 pt-2">
              <Button variant="outline" asChild>
                <Link href="/cv/analyze">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload CV
                </Link>
              </Button>
              <Button asChild>
                <Link href="/cv/builder">
                  <Sparkles className="h-4 w-4 mr-2" />
                  Buat CV Baru
                </Link>
              </Button>
            </div>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {cvs.map((cv) => (
            <Card key={cv.id} className="relative group hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1 flex-1 min-w-0">
                    <CardTitle className="text-base truncate">{cv.name}</CardTitle>
                    {cv.targetPosition && (
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <Briefcase className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate">{cv.targetPosition}</span>
                      </p>
                    )}
                  </div>
                  {cv.isDefault && (
                    <Badge variant="default" className="ml-2 shrink-0">
                      <Star className="h-3 w-3 mr-1" />
                      Default
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Template preview placeholder */}
                <div className="h-32 rounded-md bg-muted flex items-center justify-center border border-dashed">
                  <div className="text-center">
                    <FileText className="h-8 w-8 mx-auto text-muted-foreground" />
                    <p className="text-xs text-muted-foreground mt-1">
                      {cv.templateId || "default"} template
                    </p>
                  </div>
                </div>

                {/* ATS Score */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Skor ATS</span>
                  <Badge variant={getScoreBadgeVariant(cv.atsScore)}>
                    {cv.atsScore ?? "N/A"}
                  </Badge>
                </div>

                {/* Last edited */}
                <p className="text-xs text-muted-foreground">
                  Terakhir diubah: {formatDateShort(cv.updatedAt)}
                </p>

                {/* Actions */}
                <div className="flex gap-2 pt-2 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => router.push(`/cv/builder?id=${cv.id}`)}
                  >
                    <Edit3 className="h-3.5 w-3.5 mr-1" />
                    Edit
                  </Button>
                  {!cv.isDefault && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSetDefault(cv.id)}
                      title="Jadikan default"
                    >
                      <Star className="h-3.5 w-3.5" />
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(cv.id)}
                    disabled={deletingId === cv.id}
                    className="text-destructive hover:text-destructive"
                    title="Hapus CV"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
