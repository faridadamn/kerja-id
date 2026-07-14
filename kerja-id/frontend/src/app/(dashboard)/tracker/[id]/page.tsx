"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import api from "@/lib/api";
import { cn, formatDate, formatDateShort, timeAgo } from "@/lib/utils";
import type { Application, ApplicationStatus, ApplicationTimeline } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  ArrowLeft,
  Building2,
  Calendar,
  Clock,
  Edit3,
  ExternalLink,
  Globe,
  Loader2,
  Mail,
  Phone,
  Plus,
  Save,
  StickyNote,
  Trash2,
  User,
} from "lucide-react";

// ─── Constants ───────────────────────────────────────────────────────────────────

const STATUSES: { key: ApplicationStatus; label: string; color: string; bg: string }[] = [
  { key: "SAVED", label: "Saved", color: "text-gray-700", bg: "bg-gray-100" },
  { key: "APPLIED", label: "Applied", color: "text-blue-700", bg: "bg-blue-100" },
  { key: "SCREENING", label: "Screening", color: "text-yellow-700", bg: "bg-yellow-100" },
  { key: "INTERVIEW", label: "Interview", color: "text-purple-700", bg: "bg-purple-100" },
  { key: "OFFER", label: "Offer", color: "text-green-700", bg: "bg-green-100" },
  { key: "ACCEPTED", label: "Accepted", color: "text-emerald-700", bg: "bg-emerald-100" },
  { key: "REJECTED", label: "Rejected", color: "text-red-700", bg: "bg-red-100" },
];

const STATUS_MAP = Object.fromEntries(STATUSES.map((s) => [s.key, s])) as Record<
  ApplicationStatus,
  (typeof STATUSES)[number]
>;

const TIMELINE_ICONS: Record<string, string> = {
  status_change: "🔄",
  note: "📝",
  created: "✨",
  follow_up: "⏰",
  interview: "🎤",
  offer: "🎉",
  rejection: "❌",
};

// ─── Page ────────────────────────────────────────────────────────────────────────

export default function ApplicationDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [application, setApplication] = useState<Application | null>(null);
  const [timeline, setTimeline] = useState<ApplicationTimeline[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  // Edit state
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    position: "",
    company: "",
    source: "",
    sourceUrl: "",
    recruiterName: "",
    recruiterEmail: "",
    recruiterPhone: "",
    notes: "",
    followUpAt: "",
  });
  const [saving, setSaving] = useState(false);

  // Note state
  const [newNote, setNewNote] = useState("");
  const [addingNote, setAddingNote] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const fetchApplication = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get<Application>(`/applications/${id}`);
      setApplication(res.data);
      setEditForm({
        position: res.data.position,
        company: res.data.company,
        source: res.data.source || "",
        sourceUrl: res.data.sourceUrl || "",
        recruiterName: res.data.recruiterName || "",
        recruiterEmail: res.data.recruiterEmail || "",
        recruiterPhone: res.data.recruiterPhone || "",
        notes: res.data.notes || "",
        followUpAt: res.data.followUpAt ? res.data.followUpAt.split("T")[0] : "",
      });
    } catch (err) {
      console.error("Failed to fetch application:", err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  const fetchTimeline = useCallback(async () => {
    try {
      const res = await api.get<ApplicationTimeline[]>(`/applications/${id}/timeline`);
      setTimeline(Array.isArray(res.data) ? res.data : res.data.data || []);
    } catch (err) {
      console.error("Failed to fetch timeline:", err);
    }
  }, [id]);

  useEffect(() => {
    fetchApplication();
    fetchTimeline();
  }, [fetchApplication, fetchTimeline]);

  const handleStatusChange = async (status: ApplicationStatus) => {
    try {
      await api.put(`/applications/${id}/status`, { status });
      setApplication((prev) =>
        prev ? { ...prev, status, updatedAt: new Date().toISOString() } : prev
      );
      fetchTimeline();
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  const handleSaveEdit = async () => {
    setSaving(true);
    try {
      await api.put(`/applications/${id}`, {
        position: editForm.position.trim(),
        company: editForm.company.trim(),
        source: editForm.source.trim() || undefined,
        sourceUrl: editForm.sourceUrl.trim() || undefined,
        recruiterName: editForm.recruiterName.trim() || undefined,
        recruiterEmail: editForm.recruiterEmail.trim() || undefined,
        recruiterPhone: editForm.recruiterPhone.trim() || undefined,
        notes: editForm.notes.trim() || undefined,
        followUpAt: editForm.followUpAt || undefined,
      });
      setEditing(false);
      fetchApplication();
    } catch (err) {
      console.error("Failed to save:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleAddNote = async () => {
    if (!newNote.trim()) return;
    setAddingNote(true);
    try {
      await api.post(`/applications/${id}/notes`, { note: newNote.trim() });
      setNewNote("");
      fetchTimeline();
      fetchApplication();
    } catch (err) {
      console.error("Failed to add note:", err);
    } finally {
      setAddingNote(false);
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/applications/${id}`);
      router.push("/tracker");
    } catch (err) {
      console.error("Failed to delete:", err);
    }
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-8 w-24" />
        <Skeleton className="h-12 w-2/3" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!application) {
    return (
      <div className="p-6 flex flex-col items-center justify-center py-20">
        <h2 className="text-xl font-semibold">Application not found</h2>
        <p className="text-muted-foreground mt-2">This application may have been deleted.</p>
        <Button className="mt-4" variant="outline" onClick={() => router.push("/tracker")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Tracker
        </Button>
      </div>
    );
  }

  const statusInfo = STATUS_MAP[application.status];

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-4xl mx-auto">
      {/* Back */}
      <Button variant="ghost" size="sm" onClick={() => router.push("/tracker")}>
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Tracker
      </Button>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold">{application.position}</h1>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Building2 className="h-4 w-4" />
            <span className="text-lg">{application.company}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge
            variant="outline"
            className={cn("text-sm px-3 py-1", statusInfo.bg, statusInfo.color, "border-0")}
          >
            {statusInfo.label}
          </Badge>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setDeleteConfirm(id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Quick Status Change */}
      <Card>
        <CardContent className="py-4">
          <div className="flex flex-wrap gap-2">
            <span className="text-sm text-muted-foreground mr-2 self-center">Move to:</span>
            {STATUSES.filter((s) => s.key !== application.status).map((s) => (
              <Button
                key={s.key}
                variant="outline"
                size="sm"
                className={cn("text-xs", s.color)}
                onClick={() => handleStatusChange(s.key)}
              >
                {s.label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="timeline">Timeline ({timeline.length})</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
        </TabsList>

        {/* ─── Overview Tab ──────────────────────────────────────────────────────── */}
        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Application Details</CardTitle>
              {!editing ? (
                <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
                  <Edit3 className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setEditing(false)}>
                    Cancel
                  </Button>
                  <Button size="sm" onClick={handleSaveEdit} disabled={saving}>
                    {saving ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4 mr-2" />
                    )}
                    Save
                  </Button>
                </div>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              {editing ? (
                /* Edit Form */
                <div className="grid gap-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Position</Label>
                      <Input
                        value={editForm.position}
                        onChange={(e) => setEditForm({ ...editForm, position: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Company</Label>
                      <Input
                        value={editForm.company}
                        onChange={(e) => setEditForm({ ...editForm, company: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Source</Label>
                      <Input
                        value={editForm.source}
                        onChange={(e) => setEditForm({ ...editForm, source: e.target.value })}
                        placeholder="e.g. LinkedIn"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Source URL</Label>
                      <Input
                        value={editForm.sourceUrl}
                        onChange={(e) => setEditForm({ ...editForm, sourceUrl: e.target.value })}
                        placeholder="https://..."
                      />
                    </div>
                  </div>
                  <Separator />
                  <p className="text-sm font-medium">Contact Info</p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Recruiter Name</Label>
                      <Input
                        value={editForm.recruiterName}
                        onChange={(e) =>
                          setEditForm({ ...editForm, recruiterName: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Recruiter Email</Label>
                      <Input
                        value={editForm.recruiterEmail}
                        onChange={(e) =>
                          setEditForm({ ...editForm, recruiterEmail: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Recruiter Phone</Label>
                      <Input
                        value={editForm.recruiterPhone}
                        onChange={(e) =>
                          setEditForm({ ...editForm, recruiterPhone: e.target.value })
                        }
                      />
                    </div>
                  </div>
                  <Separator />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Follow-up Date</Label>
                      <Input
                        type="date"
                        value={editForm.followUpAt}
                        onChange={(e) =>
                          setEditForm({ ...editForm, followUpAt: e.target.value })
                        }
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Notes</Label>
                    <Textarea
                      rows={4}
                      value={editForm.notes}
                      onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                    />
                  </div>
                </div>
              ) : (
                /* Display */
                <div className="grid gap-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <InfoItem icon={<Briefcase className="h-4 w-4" />} label="Position" value={application.position} />
                    <InfoItem icon={<Building2 className="h-4 w-4" />} label="Company" value={application.company} />
                    <InfoItem
                      icon={<Globe className="h-4 w-4" />}
                      label="Source"
                      value={application.source || "—"}
                      href={application.sourceUrl}
                    />
                    <InfoItem
                      icon={<Calendar className="h-4 w-4" />}
                      label="Applied"
                      value={application.appliedAt ? formatDate(application.appliedAt) : "—"}
                    />
                  </div>

                  {(application.recruiterName || application.recruiterEmail || application.recruiterPhone) && (
                    <>
                      <Separator />
                      <p className="text-sm font-medium">Contact Info</p>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <InfoItem
                          icon={<User className="h-4 w-4" />}
                          label="Recruiter"
                          value={application.recruiterName || "—"}
                        />
                        <InfoItem
                          icon={<Mail className="h-4 w-4" />}
                          label="Email"
                          value={application.recruiterEmail || "—"}
                          href={application.recruiterEmail ? `mailto:${application.recruiterEmail}` : undefined}
                        />
                        <InfoItem
                          icon={<Phone className="h-4 w-4" />}
                          label="Phone"
                          value={application.recruiterPhone || "—"}
                          href={application.recruiterPhone ? `tel:${application.recruiterPhone}` : undefined}
                        />
                      </div>
                    </>
                  )}

                  {application.followUpAt && (
                    <>
                      <Separator />
                      <InfoItem
                        icon={<Clock className="h-4 w-4" />}
                        label="Follow-up Date"
                        value={formatDate(application.followUpAt)}
                      />
                    </>
                  )}

                  {application.notes && (
                    <>
                      <Separator />
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Notes</p>
                        <p className="text-sm whitespace-pre-wrap">{application.notes}</p>
                      </div>
                    </>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── Timeline Tab ──────────────────────────────────────────────────────── */}
        <TabsContent value="timeline" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Activity Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              {timeline.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No timeline events yet.
                </p>
              ) : (
                <div className="relative">
                  <div className="absolute left-4 top-0 bottom-0 w-px bg-border" />
                  <div className="space-y-6">
                    {timeline.map((event) => (
                      <div key={event.id} className="relative pl-10">
                        <div className="absolute left-2.5 top-1 h-3 w-3 rounded-full bg-primary border-2 border-background" />
                        <div>
                          <p className="text-sm font-medium">{event.action}</p>
                          {event.description && (
                            <p className="text-sm text-muted-foreground mt-0.5">
                              {event.description}
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground mt-1">
                            {timeAgo(event.createdAt)} · {formatDate(event.createdAt)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── Notes Tab ──────────────────────────────────────────────────────────── */}
        <TabsContent value="notes" className="space-y-4">
          {/* Add note */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex gap-2">
                <Textarea
                  placeholder="Add a note..."
                  rows={2}
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  className="flex-1"
                />
                <Button
                  onClick={handleAddNote}
                  disabled={!newNote.trim() || addingNote}
                  className="self-end"
                >
                  {addingNote ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Plus className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Notes list from timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">All Notes</CardTitle>
            </CardHeader>
            <CardContent>
              {(() => {
                const noteEvents = timeline.filter(
                  (e) => e.action.toLowerCase().includes("note") || e.action.toLowerCase().includes("added")
                );
                if (noteEvents.length === 0) {
                  return (
                    <p className="text-sm text-muted-foreground text-center py-8">
                      No notes yet. Add one above.
                    </p>
                  );
                }
                return (
                  <div className="space-y-4">
                    {noteEvents.map((event) => (
                      <div
                        key={event.id}
                        className="flex items-start gap-3 p-3 rounded-lg bg-muted/50"
                      >
                        <StickyNote className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm whitespace-pre-wrap">{event.description || event.action}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {timeAgo(event.createdAt)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Delete Confirmation */}
      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Application</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this application? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Helper Components ───────────────────────────────────────────────────────────

function Briefcase(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
      <rect width="20" height="14" x="2" y="6" rx="2" />
    </svg>
  );
}

function InfoItem({
  icon,
  label,
  value,
  href,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  href?: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="text-muted-foreground mt-0.5">{icon}</div>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        {href ? (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-primary hover:underline flex items-center gap-1"
          >
            {value}
            <ExternalLink className="h-3 w-3" />
          </a>
        ) : (
          <p className="text-sm font-medium">{value}</p>
        )}
      </div>
    </div>
  );
}
