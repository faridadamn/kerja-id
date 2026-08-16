"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { unwrapArray } from "@/lib/api-response";
import { cn, formatDateShort, timeAgo } from "@/lib/utils";
import type { Application, ApplicationStatus } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
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
} from "@/components/ui/dialog";
import {
  LayoutGrid,
  List,
  Plus,
  Search,
  Filter,
  Building2,
  Calendar,
  ExternalLink,
  StickyNote,
  ArrowRight,
  ChevronDown,
  MoreHorizontal,
  Briefcase,
  Loader2,
} from "lucide-react";

// ─── Constants ───────────────────────────────────────────────────────────────────

const STATUSES: { key: ApplicationStatus; label: string; color: string; bg: string; dot: string }[] = [
  { key: "SAVED", label: "Saved", color: "text-gray-700", bg: "bg-gray-100", dot: "bg-gray-500" },
  { key: "APPLIED", label: "Applied", color: "text-blue-700", bg: "bg-blue-100", dot: "bg-blue-500" },
  { key: "SCREENING", label: "Screening", color: "text-yellow-700", bg: "bg-yellow-100", dot: "bg-yellow-500" },
  { key: "INTERVIEW", label: "Interview", color: "text-purple-700", bg: "bg-purple-100", dot: "bg-purple-500" },
  { key: "OFFER", label: "Offer", color: "text-green-700", bg: "bg-green-100", dot: "bg-green-500" },
  { key: "ACCEPTED", label: "Accepted", color: "text-emerald-700", bg: "bg-emerald-100", dot: "bg-emerald-500" },
  { key: "REJECTED", label: "Rejected", color: "text-red-700", bg: "bg-red-100", dot: "bg-red-500" },
];

const STATUS_MAP = Object.fromEntries(STATUSES.map((s) => [s.key, s])) as Record<
  ApplicationStatus,
  (typeof STATUSES)[number]
>;

const KANBAN_COLUMNS: ApplicationStatus[] = [
  "SAVED",
  "APPLIED",
  "SCREENING",
  "INTERVIEW",
  "OFFER",
  "ACCEPTED",
  "REJECTED",
];

// ─── Helpers ─────────────────────────────────────────────────────────────────────

function getCardAccent(app: Application): string {
  if (app.status === "REJECTED" || app.status === "WITHDRAWN") return "border-l-red-500";
  const updatedAt = new Date(app.updatedAt);
  const daysSince = (Date.now() - updatedAt.getTime()) / (1000 * 60 * 60 * 24);
  if (daysSince > 14) return "border-l-red-400";
  if (daysSince > 7) return "border-l-yellow-400";
  return "border-l-green-400";
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function getCompanyColor(company: string): string {
  const colors = [
    "bg-blue-500", "bg-purple-500", "bg-green-500", "bg-orange-500",
    "bg-pink-500", "bg-teal-500", "bg-indigo-500", "bg-red-500",
  ];
  let hash = 0;
  for (let i = 0; i < company.length; i++) hash = company.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

// ─── Kanban Card ─────────────────────────────────────────────────────────────────

function KanbanCard({
  app,
  onStatusChange,
  onNavigate,
}: {
  app: Application;
  onStatusChange: (id: string, status: ApplicationStatus) => void;
  onNavigate: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const statusInfo = STATUS_MAP[app.status];
  const accent = getCardAccent(app);
  const companyColor = getCompanyColor(app.company);

  return (
    <Card
      className={cn(
        "cursor-pointer border-l-4 transition-all hover:shadow-md",
        accent,
        expanded && "ring-2 ring-primary/30"
      )}
      onClick={() => setExpanded(!expanded)}
    >
      <CardContent className="p-3 space-y-2">
        {/* Header */}
        <div className="flex items-start gap-2">
          <div
            className={cn(
              "flex h-8 w-8 shrink-0 items-center justify-center rounded text-xs font-bold text-white",
              companyColor
            )}
          >
            {getInitials(app.company)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium leading-tight truncate">{app.position}</p>
            <p className="text-xs text-muted-foreground truncate">{app.company}</p>
          </div>
        </div>

        {/* Meta */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Calendar className="h-3 w-3" />
          <span>{timeAgo(app.updatedAt)}</span>
          {app.source && (
            <>
              <span>·</span>
              <span className="truncate">{app.source}</span>
            </>
          )}
        </div>

        {/* Expanded actions */}
        {expanded && (
          <div className="pt-2 border-t space-y-2" onClick={(e) => e.stopPropagation()}>
            {app.notes && (
              <p className="text-xs text-muted-foreground line-clamp-2">
                <StickyNote className="h-3 w-3 inline mr-1" />
                {app.notes}
              </p>
            )}
            <div className="flex flex-wrap gap-1">
              <Select
                value={app.status}
                onValueChange={(val) => onStatusChange(app.id, val as ApplicationStatus)}
              >
                <SelectTrigger className="h-7 text-xs flex-1 min-w-[100px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUSES.map((s) => (
                    <SelectItem key={s.key} value={s.key}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="w-full h-7 text-xs"
              onClick={() => onNavigate(app.id)}
            >
              View Detail <ArrowRight className="h-3 w-3 ml-1" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Add Application Modal ───────────────────────────────────────────────────────

function AddApplicationModal({
  open,
  onOpenChange,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: () => void;
}) {
  const [form, setForm] = useState({
    position: "",
    company: "",
    source: "",
    sourceUrl: "",
    notes: "",
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    if (!form.position.trim() || !form.company.trim()) return;
    setSaving(true);
    try {
      await api.post("/applications", {
        position: form.position.trim(),
        company: form.company.trim(),
        source: form.source.trim() || undefined,
        sourceUrl: form.sourceUrl.trim() || undefined,
        notes: form.notes.trim() || undefined,
      });
      setForm({ position: "", company: "", source: "", sourceUrl: "", notes: "" });
      onCreated();
      onOpenChange(false);
    } catch (err) {
      console.error("Failed to create application:", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Add Application</DialogTitle>
          <DialogDescription>Manually track a job application.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="position">Position *</Label>
            <Input
              id="position"
              placeholder="e.g. Frontend Developer"
              value={form.position}
              onChange={(e) => setForm({ ...form, position: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="company">Company *</Label>
            <Input
              id="company"
              placeholder="e.g. Tokopedia"
              value={form.company}
              onChange={(e) => setForm({ ...form, company: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="source">Source</Label>
              <Input
                id="source"
                placeholder="e.g. LinkedIn"
                value={form.source}
                onChange={(e) => setForm({ ...form, source: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sourceUrl">URL</Label>
              <Input
                id="sourceUrl"
                placeholder="https://..."
                value={form.sourceUrl}
                onChange={(e) => setForm({ ...form, sourceUrl: e.target.value })}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Any notes about this application..."
              rows={3}
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!form.position.trim() || !form.company.trim() || saving}
          >
            {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Add Application
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── List View ───────────────────────────────────────────────────────────────────

function ListView({
  applications,
  onStatusChange,
  onNavigate,
}: {
  applications: Application[];
  onStatusChange: (id: string, status: ApplicationStatus) => void;
  onNavigate: (id: string) => void;
}) {
  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="text-left py-3 px-4 font-medium">Position</th>
              <th className="text-left py-3 px-4 font-medium">Company</th>
              <th className="text-left py-3 px-4 font-medium">Status</th>
              <th className="text-left py-3 px-4 font-medium">Source</th>
              <th className="text-left py-3 px-4 font-medium">Updated</th>
              <th className="text-left py-3 px-4 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {applications.map((app) => {
              const statusInfo = STATUS_MAP[app.status];
              return (
                <tr
                  key={app.id}
                  className="border-b last:border-b-0 hover:bg-muted/30 cursor-pointer"
                  onClick={() => onNavigate(app.id)}
                >
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div
                        className={cn(
                          "flex h-7 w-7 shrink-0 items-center justify-center rounded text-[10px] font-bold text-white",
                          getCompanyColor(app.company)
                        )}
                      >
                        {getInitials(app.company)}
                      </div>
                      <span className="font-medium">{app.position}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-muted-foreground">{app.company}</td>
                  <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                    <Select
                      value={app.status}
                      onValueChange={(val) => onStatusChange(app.id, val as ApplicationStatus)}
                    >
                      <SelectTrigger
                        className={cn(
                          "h-7 w-[120px] text-xs border-0",
                          statusInfo.bg,
                          statusInfo.color
                        )}
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {STATUSES.map((s) => (
                          <SelectItem key={s.key} value={s.key}>
                            {s.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="py-3 px-4 text-muted-foreground text-xs">
                    {app.source || "—"}
                  </td>
                  <td className="py-3 px-4 text-muted-foreground text-xs">
                    {timeAgo(app.updatedAt)}
                  </td>
                  <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => onNavigate(app.id)}
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────────

export default function TrackerPage() {
  const router = useRouter();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"kanban" | "list">("kanban");
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterSource, setFilterSource] = useState<string>("all");
  const [showAddModal, setShowAddModal] = useState(false);

  const fetchApplications = useCallback(async () => {
    try {
      setLoading(true);
      const params: Record<string, string> = {};
      if (filterStatus !== "all") params.status = filterStatus;
      if (filterSource !== "all") params.source = filterSource;
      if (search.trim()) params.search = search.trim();
      const res = await api.get<Application[]>("/applications", { params });
      setApplications(unwrapArray<Application>(res.data));
    } catch (err) {
      console.error("Failed to fetch applications:", err);
    } finally {
      setLoading(false);
    }
  }, [filterStatus, filterSource, search]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const handleStatusChange = async (id: string, status: ApplicationStatus) => {
    try {
      await api.put(`/applications/${id}/status`, { status });
      setApplications((prev) =>
        prev.map((app) => (app.id === id ? { ...app, status, updatedAt: new Date().toISOString() } : app))
      );
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  const handleNavigate = (id: string) => {
    router.push(`/tracker/${id}`);
  };

  // Derived data
  const filteredApplications = applications.filter((app) => {
    if (search.trim()) {
      const q = search.toLowerCase();
      if (!app.position.toLowerCase().includes(q) && !app.company.toLowerCase().includes(q)) {
        return false;
      }
    }
    return true;
  });

  const kanbanGrouped = KANBAN_COLUMNS.reduce(
    (acc, status) => {
      acc[status] = filteredApplications.filter((app) => app.status === status);
      return acc;
    },
    {} as Record<ApplicationStatus, Application[]>
  );

  const sources = Array.from(new Set(applications.map((a) => a.source).filter(Boolean))) as string[];

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="flex gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-64 w-72 shrink-0" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Job Tracker</h1>
          <p className="text-sm text-muted-foreground">
            Track and manage your job applications
          </p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Application
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search position or company..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-full sm:w-[160px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {STATUSES.map((s) => (
              <SelectItem key={s.key} value={s.key}>
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterSource} onValueChange={setFilterSource}>
          <SelectTrigger className="w-full sm:w-[160px]">
            <SelectValue placeholder="All Sources" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Sources</SelectItem>
            {sources.map((src) => (
              <SelectItem key={src} value={src!}>
                {src}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex border rounded-md overflow-hidden">
          <Button
            variant={view === "kanban" ? "default" : "ghost"}
            size="sm"
            className="rounded-none"
            onClick={() => setView("kanban")}
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
          <Button
            variant={view === "list" ? "default" : "ghost"}
            size="sm"
            className="rounded-none"
            onClick={() => setView("list")}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Content */}
      {filteredApplications.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Briefcase className="h-12 w-12 text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-medium">No applications found</h3>
          <p className="text-sm text-muted-foreground mt-1">
            {applications.length === 0
              ? "Start tracking your job applications"
              : "Try adjusting your filters"}
          </p>
          {applications.length === 0 && (
            <Button className="mt-4" onClick={() => setShowAddModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Application
            </Button>
          )}
        </div>
      ) : view === "kanban" ? (
        /* Kanban View */
        <div className="flex gap-4 overflow-x-auto pb-4">
          {KANBAN_COLUMNS.map((status) => {
            const items = kanbanGrouped[status];
            const statusInfo = STATUS_MAP[status];
            return (
              <div key={status} className="flex-shrink-0 w-[280px]">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className={cn("h-2.5 w-2.5 rounded-full", statusInfo.dot)} />
                    <h3 className="text-sm font-semibold">{statusInfo.label}</h3>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {items.length}
                  </Badge>
                </div>
                <div className="space-y-2 max-h-[calc(100vh-280px)] overflow-y-auto pr-1">
                  {items.map((app) => (
                    <KanbanCard
                      key={app.id}
                      app={app}
                      onStatusChange={handleStatusChange}
                      onNavigate={handleNavigate}
                    />
                  ))}
                  {items.length === 0 && (
                    <div className="border border-dashed rounded-lg p-4 text-center text-xs text-muted-foreground">
                      No applications
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* List View */
        <ListView
          applications={filteredApplications}
          onStatusChange={handleStatusChange}
          onNavigate={handleNavigate}
        />
      )}

      {/* Add Modal */}
      <AddApplicationModal
        open={showAddModal}
        onOpenChange={setShowAddModal}
        onCreated={fetchApplications}
      />
    </div>
  );
}
