"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { unwrapArray } from "@/lib/api-response";
import { cn, formatDateShort, timeAgo } from "@/lib/utils";
import type { Application, ApplicationStatus } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
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
  Search,
  Filter,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Building2,
  Calendar,
  ExternalLink,
  Trash2,
  RefreshCw,
  Briefcase,
  Loader2,
  ChevronRight,
  CheckSquare,
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
  { key: "WITHDRAWN", label: "Withdrawn", color: "text-slate-700", bg: "bg-slate-100", dot: "bg-slate-500" },
];

const STATUS_MAP = Object.fromEntries(STATUSES.map((s) => [s.key, s])) as Record<
  ApplicationStatus,
  (typeof STATUSES)[number]
>;

type SortField = "company" | "position" | "status" | "appliedAt" | "updatedAt";
type SortDir = "asc" | "desc";

// ─── Helpers ─────────────────────────────────────────────────────────────────────

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

function getNextAction(app: Application): string {
  if (app.followUpAt) {
    const followDate = new Date(app.followUpAt);
    const now = new Date();
    if (followDate > now) return `Follow-up ${formatDateShort(app.followUpAt!)}`;
    return "Follow-up overdue!";
  }
  switch (app.status) {
    case "SAVED": return "Submit application";
    case "APPLIED": return "Wait for response";
    case "SCREENING": return "Prepare for screening";
    case "INTERVIEW": return "Prepare for interview";
    case "OFFER": return "Review offer";
    case "ACCEPTED": return "Onboarding prep";
    case "REJECTED": return "Move on";
    case "WITHDRAWN": return "—";
    default: return "—";
  }
}

// ─── Bulk Actions Dialog ─────────────────────────────────────────────────────────

function BulkStatusDialog({
  open,
  onOpenChange,
  selectedCount,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedCount: number;
  onConfirm: (status: ApplicationStatus) => void;
}) {
  const [newStatus, setNewStatus] = useState<ApplicationStatus>("APPLIED");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Change Status for {selectedCount} Applications</DialogTitle>
          <DialogDescription>
            Select the new status for all selected applications.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <Select value={newStatus} onValueChange={(v) => setNewStatus(v as ApplicationStatus)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUSES.map((s) => (
                <SelectItem key={s.key} value={s.key}>
                  <div className="flex items-center gap-2">
                    <div className={cn("h-2 w-2 rounded-full", s.dot)} />
                    {s.label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={() => { onConfirm(newStatus); onOpenChange(false); }}>
            Apply
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Mobile Card ─────────────────────────────────────────────────────────────────

function ApplicationCard({
  app,
  selected,
  onSelect,
  onNavigate,
}: {
  app: Application;
  selected: boolean;
  onSelect: () => void;
  onNavigate: () => void;
}) {
  const statusInfo = STATUS_MAP[app.status];

  return (
    <Card
      className={cn(
        "cursor-pointer transition-all hover:shadow-md",
        selected && "ring-2 ring-primary"
      )}
      onClick={onNavigate}
    >
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div
              className={cn(
                "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-xs font-bold text-white",
                getCompanyColor(app.company)
              )}
              onClick={(e) => { e.stopPropagation(); onSelect(); }}
            >
              {selected ? <CheckSquare className="h-5 w-5" /> : getInitials(app.company)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-semibold truncate">{app.position}</p>
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <Building2 className="h-3 w-3" />
                {app.company}
              </p>
            </div>
          </div>
          <Badge
            variant="outline"
            className={cn("text-xs shrink-0 ml-2", statusInfo.bg, statusInfo.color, "border-0")}
          >
            {statusInfo.label}
          </Badge>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            <span>Applied: {app.appliedAt ? formatDateShort(app.appliedAt) : "—"}</span>
          </div>
          <div className="flex items-center gap-1">
            <RefreshCw className="h-3 w-3" />
            <span>Updated: {timeAgo(app.updatedAt)}</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t">
          <p className="text-xs text-muted-foreground">
            Next: <span className="font-medium text-foreground">{getNextAction(app)}</span>
          </p>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────────

export default function TrackerListPage() {
  const router = useRouter();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterSource, setFilterSource] = useState<string>("all");
  const [sortField, setSortField] = useState<SortField>("updatedAt");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [showBulkStatus, setShowBulkStatus] = useState(false);
  const [showBulkDelete, setShowBulkDelete] = useState(false);
  const [bulkLoading, setBulkLoading] = useState(false);

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

  // Sort
  const sorted = [...applications].sort((a, b) => {
    let cmp = 0;
    switch (sortField) {
      case "company":
        cmp = a.company.localeCompare(b.company);
        break;
      case "position":
        cmp = a.position.localeCompare(b.position);
        break;
      case "status":
        cmp = a.status.localeCompare(b.status);
        break;
      case "appliedAt":
        cmp = new Date(a.appliedAt || 0).getTime() - new Date(b.appliedAt || 0).getTime();
        break;
      case "updatedAt":
        cmp = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
        break;
    }
    return sortDir === "asc" ? cmp : -cmp;
  });

  const sources = Array.from(new Set(applications.map((a) => a.source).filter(Boolean))) as string[];

  // Selection
  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selected.size === sorted.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(sorted.map((a) => a.id)));
    }
  };

  // Bulk actions
  const handleBulkStatusChange = async (status: ApplicationStatus) => {
    setBulkLoading(true);
    try {
      await Promise.all(
        Array.from(selected).map((id) =>
          api.put(`/applications/${id}/status`, { status })
        )
      );
      setApplications((prev) =>
        prev.map((app) =>
          selected.has(app.id)
            ? { ...app, status, updatedAt: new Date().toISOString() }
            : app
        )
      );
      setSelected(new Set());
    } catch (err) {
      console.error("Bulk status change failed:", err);
    } finally {
      setBulkLoading(false);
    }
  };

  const handleBulkDelete = async () => {
    setBulkLoading(true);
    try {
      await Promise.all(
        Array.from(selected).map((id) => api.delete(`/applications/${id}`))
      );
      setApplications((prev) => prev.filter((app) => !selected.has(app.id)));
      setSelected(new Set());
    } catch (err) {
      console.error("Bulk delete failed:", err);
    } finally {
      setBulkLoading(false);
    }
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ArrowUpDown className="h-3 w-3 ml-1 opacity-30" />;
    return sortDir === "asc" ? (
      <ArrowUp className="h-3 w-3 ml-1" />
    ) : (
      <ArrowDown className="h-3 w-3 ml-1" />
    );
  };

  if (loading) {
    return (
      <div className="p-4 md:p-6 space-y-4">
        <Skeleton className="h-8 w-48" />
        <div className="flex gap-3">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 w-40" />
          <Skeleton className="h-10 w-40" />
        </div>
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-4">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Job Tracker — List View</h1>
        <p className="text-sm text-muted-foreground">
          {applications.length} application{applications.length !== 1 ? "s" : ""} tracked
        </p>
      </div>

      {/* Filters & Sort */}
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
      </div>

      {/* Bulk Actions Bar */}
      {selected.size > 0 && (
        <div className="flex items-center gap-3 p-3 bg-primary/5 border border-primary/20 rounded-lg">
          <span className="text-sm font-medium">{selected.size} selected</span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowBulkStatus(true)}
            disabled={bulkLoading}
          >
            <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
            Change Status
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setShowBulkDelete(true)}
            disabled={bulkLoading}
          >
            <Trash2 className="h-3.5 w-3.5 mr-1.5" />
            Delete
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setSelected(new Set())}>
            Clear
          </Button>
        </div>
      )}

      {/* Desktop Table */}
      {sorted.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Briefcase className="h-12 w-12 text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-medium">No applications found</h3>
          <p className="text-sm text-muted-foreground mt-1">
            {applications.length === 0
              ? "Start tracking your job applications"
              : "Try adjusting your filters"}
          </p>
        </div>
      ) : (
        <>
          {/* Desktop Table (hidden on mobile) */}
          <div className="hidden md:block border rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="py-3 px-4 w-10">
                      <Checkbox
                        checked={selected.size === sorted.length && sorted.length > 0}
                        onCheckedChange={toggleSelectAll}
                      />
                    </th>
                    <th
                      className="text-left py-3 px-4 font-medium cursor-pointer select-none hover:bg-muted/80"
                      onClick={() => handleSort("company")}
                    >
                      <div className="flex items-center">
                        Company <SortIcon field="company" />
                      </div>
                    </th>
                    <th
                      className="text-left py-3 px-4 font-medium cursor-pointer select-none hover:bg-muted/80"
                      onClick={() => handleSort("position")}
                    >
                      <div className="flex items-center">
                        Position <SortIcon field="position" />
                      </div>
                    </th>
                    <th
                      className="text-left py-3 px-4 font-medium cursor-pointer select-none hover:bg-muted/80"
                      onClick={() => handleSort("status")}
                    >
                      <div className="flex items-center">
                        Status <SortIcon field="status" />
                      </div>
                    </th>
                    <th
                      className="text-left py-3 px-4 font-medium cursor-pointer select-none hover:bg-muted/80"
                      onClick={() => handleSort("appliedAt")}
                    >
                      <div className="flex items-center">
                        Applied Date <SortIcon field="appliedAt" />
                      </div>
                    </th>
                    <th
                      className="text-left py-3 px-4 font-medium cursor-pointer select-none hover:bg-muted/80"
                      onClick={() => handleSort("updatedAt")}
                    >
                      <div className="flex items-center">
                        Last Update <SortIcon field="updatedAt" />
                      </div>
                    </th>
                    <th className="text-left py-3 px-4 font-medium">Next Action</th>
                    <th className="py-3 px-4 w-10" />
                  </tr>
                </thead>
                <tbody>
                  {sorted.map((app) => {
                    const statusInfo = STATUS_MAP[app.status];
                    const isSelected = selected.has(app.id);
                    return (
                      <tr
                        key={app.id}
                        className={cn(
                          "border-b last:border-b-0 cursor-pointer transition-colors",
                          isSelected ? "bg-primary/5" : "hover:bg-muted/30"
                        )}
                        onClick={() => router.push(`/tracker/${app.id}`)}
                      >
                        <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={() => toggleSelect(app.id)}
                          />
                        </td>
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
                            <span className="font-medium">{app.company}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">{app.position}</td>
                        <td className="py-3 px-4">
                          <Badge
                            variant="outline"
                            className={cn("text-xs", statusInfo.bg, statusInfo.color, "border-0")}
                          >
                            {statusInfo.label}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-muted-foreground text-xs">
                          {app.appliedAt ? formatDateShort(app.appliedAt) : "—"}
                        </td>
                        <td className="py-3 px-4 text-muted-foreground text-xs">
                          {timeAgo(app.updatedAt)}
                        </td>
                        <td className="py-3 px-4 text-xs">
                          {getNextAction(app)}
                        </td>
                        <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => router.push(`/tracker/${app.id}`)}
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

          {/* Mobile Cards (hidden on desktop) */}
          <div className="md:hidden space-y-3">
            {sorted.map((app) => (
              <ApplicationCard
                key={app.id}
                app={app}
                selected={selected.has(app.id)}
                onSelect={() => toggleSelect(app.id)}
                onNavigate={() => router.push(`/tracker/${app.id}`)}
              />
            ))}
          </div>
        </>
      )}

      {/* Bulk Status Dialog */}
      <BulkStatusDialog
        open={showBulkStatus}
        onOpenChange={setShowBulkStatus}
        selectedCount={selected.size}
        onConfirm={handleBulkStatusChange}
      />

      {/* Bulk Delete Dialog */}
      <Dialog open={showBulkDelete} onOpenChange={setShowBulkDelete}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete {selected.size} Applications</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the selected applications? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBulkDelete(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleBulkDelete} disabled={bulkLoading}>
              {bulkLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Delete All
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
