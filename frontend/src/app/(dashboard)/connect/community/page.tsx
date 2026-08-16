"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import api from "@/lib/api";
import type { CommunityGroup, CommunityGroupsResponse } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Users,
  Search,
  Globe,
  BookOpen,
  MapPin,
  GraduationCap,
  Plus,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const GROUP_TYPE_OPTIONS = [
  { value: "all", label: "Semua Tipe" },
  { value: "industry", label: "Industri" },
  { value: "skill", label: "Skill" },
  { value: "location", label: "Lokasi" },
  { value: "alumni", label: "Alumni" },
];

const GROUP_TYPE_LABEL: Record<string, string> = {
  industry: "Industri",
  skill: "Skill",
  location: "Lokasi",
  alumni: "Alumni",
};

const GROUP_TYPE_VARIANT: Record<string, "default" | "secondary" | "outline" | "success" | "warning"> = {
  industry: "default",
  skill: "secondary",
  location: "outline",
  alumni: "success",
};

const GROUP_TYPE_ICON: Record<string, React.ReactNode> = {
  industry: <Globe className="h-5 w-5" />,
  skill: <BookOpen className="h-5 w-5" />,
  location: <MapPin className="h-5 w-5" />,
  alumni: <GraduationCap className="h-5 w-5" />,
};

/* ------------------------------------------------------------------ */
/*  Skeleton                                                           */
/* ------------------------------------------------------------------ */

function GroupCardSkeleton() {
  return (
    <Card>
      <CardContent className="p-5 space-y-3">
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-lg" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-3 w-20" />
          </div>
        </div>
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-3/4" />
        <div className="flex items-center justify-between">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-9 w-20" />
        </div>
      </CardContent>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function CommunityPage() {
  const [groups, setGroups] = useState<CommunityGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [groupType, setGroupType] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Create group dialog
  const [createOpen, setCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newType, setNewType] = useState("industry");

  const fetchGroups = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = { page, limit: 12 };
      if (search) params.q = search;
      if (groupType !== "all") params.type = groupType;

      const res = await api.get<CommunityGroupsResponse | { data: CommunityGroupsResponse }>(
        "/connect/community",
        { params }
      );
      const d = res.data;
      const data = "groups" in d ? d : (d as any).data;
      setGroups(data.groups ?? []);
      setTotalPages(data.totalPages ?? 1);
      setTotal(data.total ?? 0);
    } catch {
      setGroups([]);
    } finally {
      setLoading(false);
    }
  }, [page, search, groupType]);

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  useEffect(() => {
    setPage(1);
  }, [search, groupType]);

  const handleJoin = async (groupId: string) => {
    try {
      await api.post(`/connect/community/${groupId}/join`);
      setGroups((prev) =>
        prev.map((g) =>
          g.id === groupId
            ? { ...g, isJoined: true, memberCount: g.memberCount + 1 }
            : g
        )
      );
    } catch {
      // silent
    }
  };

  const handleCreate = async () => {
    if (!newName.trim()) return;
    setCreating(true);
    try {
      await api.post("/connect/community", {
        name: newName,
        description: newDescription,
        type: newType,
      });
      setCreateOpen(false);
      setNewName("");
      setNewDescription("");
      setNewType("industry");
      fetchGroups();
    } catch {
      // silent
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Komunitas</h1>
          <p className="text-muted-foreground mt-1">
            Bergabung dengan komunitas profesional dan perluas jaringan kamu
          </p>
        </div>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Buat Grup
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Buat Grup Baru</DialogTitle>
              <DialogDescription>
                Buat komunitas baru untuk menghubungkan profesional dengan minat yang sama.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="group-name">Nama Grup</Label>
                <Input
                  id="group-name"
                  placeholder="Contoh: Data Science Indonesia"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="group-desc">Deskripsi</Label>
                <Textarea
                  id="group-desc"
                  placeholder="Jelaskan tentang grup ini..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label>Tipe Grup</Label>
                <Select value={newType} onValueChange={setNewType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {GROUP_TYPE_OPTIONS.filter((o) => o.value !== "all").map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setCreateOpen(false)}>
                Batal
              </Button>
              <Button onClick={handleCreate} disabled={!newName.trim() || creating}>
                {creating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Membuat...
                  </>
                ) : (
                  "Buat Grup"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari komunitas..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={groupType} onValueChange={setGroupType}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Tipe Grup" />
              </SelectTrigger>
              <SelectContent>
                {GROUP_TYPE_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <p className="text-sm text-muted-foreground mt-3">
            {total} komunitas ditemukan
          </p>
        </CardContent>
      </Card>

      {/* Groups Grid */}
      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <GroupCardSkeleton key={i} />
          ))}
        </div>
      ) : groups.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center space-y-3">
            <Users className="h-12 w-12 mx-auto text-muted-foreground" />
            <p className="text-muted-foreground">
              Tidak ada komunitas yang sesuai dengan pencarian kamu.
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setSearch("");
                setGroupType("all");
              }}
            >
              Reset Filter
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {groups.map((group) => (
            <Card key={group.id} className="hover:shadow-md transition-shadow group">
              <CardContent className="p-5 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
                    {GROUP_TYPE_ICON[group.type]}
                  </div>
                  <div className="min-w-0 flex-1">
                    <Link href={`/connect/community/${group.id}`}>
                      <h3 className="font-semibold text-sm group-hover:text-primary transition-colors truncate">
                        {group.name}
                      </h3>
                    </Link>
                    <Badge
                      variant={GROUP_TYPE_VARIANT[group.type]}
                      className="text-[10px] mt-0.5"
                    >
                      {GROUP_TYPE_LABEL[group.type]}
                    </Badge>
                  </div>
                </div>

                <p className="text-xs text-muted-foreground line-clamp-2">
                  {group.description}
                </p>

                <div className="flex items-center justify-between pt-1 border-t">
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Users className="h-3.5 w-3.5" />
                    {group.memberCount.toLocaleString("id-ID")} anggota
                  </span>
                  {group.isJoined ? (
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/connect/community/${group.id}`}>Lihat</Link>
                    </Button>
                  ) : (
                    <Button size="sm" onClick={() => handleJoin(group.id)}>
                      Gabung
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              const pageNum = i + 1;
              return (
                <Button
                  key={pageNum}
                  variant={page === pageNum ? "default" : "outline"}
                  size="icon"
                  onClick={() => setPage(pageNum)}
                  className="h-9 w-9"
                >
                  {pageNum}
                </Button>
              );
            })}
            {totalPages > 5 && <span className="px-2 text-muted-foreground">...</span>}
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
