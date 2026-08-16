"use client";

import { useState, useEffect, useCallback } from "react";
import api from "@/lib/api";
import { unwrapArray } from "@/lib/api-response";
import { cn, formatDateShort, timeAgo } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
  Search,
  Building2,
  Send,
  Clock,
  Eye,
  UserCheck,
  Award,
  X,
  Loader2,
  UserPlus,
  ExternalLink,
  MessageSquare,
  Briefcase,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────────

interface ReferralRequest {
  id: string;
  company: string;
  position: string;
  employeeName: string;
  employeeTitle?: string;
  employeePhoto?: string;
  message: string;
  status: "pending" | "reviewed" | "interviewed" | "hired" | "rejected";
  createdAt: string;
  updatedAt: string;
  job?: {
    id: string;
    title: string;
    company: string;
  };
}

interface SearchResult {
  id: string;
  name: string;
  title: string;
  company: string;
  photoUrl?: string;
  isConnected?: boolean;
}

// ─── Constants ───────────────────────────────────────────────────────────────────

const REFERRAL_STATUSES = [
  { key: "pending", label: "Pending", icon: Clock, color: "text-yellow-700", bg: "bg-yellow-100", dot: "bg-yellow-500" },
  { key: "reviewed", label: "Reviewed", icon: Eye, color: "text-blue-700", bg: "bg-blue-100", dot: "bg-blue-500" },
  { key: "interviewed", label: "Interviewed", icon: UserCheck, color: "text-purple-700", bg: "bg-purple-100", dot: "bg-purple-500" },
  { key: "hired", label: "Hired", icon: Award, color: "text-green-700", bg: "bg-green-100", dot: "bg-green-500" },
  { key: "rejected", label: "Rejected", icon: X, color: "text-red-700", bg: "bg-red-100", dot: "bg-red-500" },
] as const;

const STATUS_MAP = Object.fromEntries(REFERRAL_STATUSES.map((s) => [s.key, s])) as Record<
  string,
  (typeof REFERRAL_STATUSES)[number]
>;

// ─── Helpers ─────────────────────────────────────────────────────────────────────

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function getAvatarColor(name: string): string {
  const colors = [
    "bg-blue-500", "bg-purple-500", "bg-green-500", "bg-orange-500",
    "bg-pink-500", "bg-teal-500", "bg-indigo-500", "bg-red-500",
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

// ─── Request Referral Dialog ─────────────────────────────────────────────────────

function RequestReferralDialog({
  open,
  onOpenChange,
  target,
  onSent,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  target: SearchResult | null;
  onSent: () => void;
}) {
  const [form, setForm] = useState({
    jobId: "",
    message: "",
  });
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (open) {
      setForm({ jobId: "", message: "" });
    }
  }, [open]);

  const handleSend = async () => {
    if (!target || !form.message.trim()) return;
    setSending(true);
    try {
      await api.post("/connect/referral", {
        employeeId: target.id,
        company: target.company,
        jobId: form.jobId || undefined,
        message: form.message.trim(),
      });
      onSent();
      onOpenChange(false);
    } catch (err) {
      console.error("Failed to send referral request:", err);
    } finally {
      setSending(false);
    }
  };

  if (!target) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>Request Referral</DialogTitle>
          <DialogDescription>
            Send a referral request to {target.name} at {target.company}.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Target info */}
          <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
            <Avatar className="h-10 w-10">
              <AvatarImage src={target.photoUrl} />
              <AvatarFallback className={cn("text-white text-sm", getAvatarColor(target.name))}>
                {getInitials(target.name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium text-sm">{target.name}</p>
              <p className="text-xs text-muted-foreground">
                {target.title} · {target.company}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="jobId">Job Position (optional)</Label>
            <Input
              id="jobId"
              placeholder="Paste job ID or URL from KERJA.ID"
              value={form.jobId}
              onChange={(e) => setForm({ ...form, jobId: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Message *</Label>
            <Textarea
              id="message"
              placeholder={`Hi ${target.name.split(" ")[0]}, I'm interested in opportunities at ${target.company}. Would you be willing to refer me? I'd be happy to share my resume and discuss further.`}
              rows={5}
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
            />
            <p className="text-xs text-muted-foreground">
              Tip: Mention the specific role and why you're a good fit.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSend} disabled={!form.message.trim() || sending}>
            {sending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Send className="h-4 w-4 mr-2" />
            )}
            Send Request
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Referral Card ───────────────────────────────────────────────────────────────

function ReferralCard({ referral }: { referral: ReferralRequest }) {
  const statusInfo = STATUS_MAP[referral.status];
  const StatusIcon = statusInfo?.icon || Clock;

  return (
    <Card className="transition-all hover:shadow-md">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Avatar className="h-10 w-10 shrink-0">
            <AvatarImage src={referral.employeePhoto} />
            <AvatarFallback className={cn("text-white text-sm", getAvatarColor(referral.employeeName))}>
              {getInitials(referral.employeeName)}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-medium text-sm">{referral.position}</p>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Building2 className="h-3 w-3" />
                  {referral.company} · via {referral.employeeName}
                </p>
              </div>
              <Badge
                variant="outline"
                className={cn("text-xs shrink-0", statusInfo?.bg, statusInfo?.color, "border-0")}
              >
                <StatusIcon className="h-3 w-3 mr-1" />
                {statusInfo?.label}
              </Badge>
            </div>

            <p className="text-xs text-muted-foreground line-clamp-2">
              <MessageSquare className="h-3 w-3 inline mr-1" />
              {referral.message}
            </p>

            <div className="flex items-center justify-between pt-2 border-t">
              <span className="text-[10px] text-muted-foreground">
                Sent {timeAgo(referral.createdAt)}
              </span>
              <span className="text-[10px] text-muted-foreground">
                Updated {timeAgo(referral.updatedAt)}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────────

export default function ReferralPage() {
  const [referrals, setReferrals] = useState<ReferralRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [activeTab, setActiveTab] = useState("my-requests");
  const [filterStatus, setFilterStatus] = useState("all");
  const [requestTarget, setRequestTarget] = useState<SearchResult | null>(null);
  const [showRequestDialog, setShowRequestDialog] = useState(false);

  const fetchReferrals = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get<ReferralRequest[]>("/connect/referral");
      setReferrals(unwrapArray<ReferralRequest>(res.data));
    } catch (err) {
      console.error("Failed to fetch referrals:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReferrals();
  }, [fetchReferrals]);

  // Search for employees
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setSearching(true);
    try {
      const res = await api.get<SearchResult[]>("/connect/referral/search", {
        params: { q: searchQuery.trim() },
      });
      setSearchResults(unwrapArray<SearchResult>(res.data));
    } catch (err) {
      console.error("Search failed:", err);
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  const filteredReferrals = referrals.filter((r) => {
    if (filterStatus !== "all" && r.status !== filterStatus) return false;
    return true;
  });

  // Stats
  const statusCounts = REFERRAL_STATUSES.reduce(
    (acc, s) => {
      acc[s.key] = referrals.filter((r) => r.status === s.key).length;
      return acc;
    },
    {} as Record<string, number>
  );

  if (loading) {
    return (
      <div className="p-4 md:p-6 space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-full max-w-md" />
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Referral Requests</h1>
        <p className="text-sm text-muted-foreground">
          Get referred by employees at your target companies
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {REFERRAL_STATUSES.map((s) => {
          const Icon = s.icon;
          return (
            <Card key={s.key} className="cursor-pointer hover:shadow-md transition-all" onClick={() => { setFilterStatus(s.key); setActiveTab("my-requests"); }}>
              <CardContent className="p-3 text-center">
                <div className="flex items-center justify-center gap-1.5 mb-1">
                  <div className={cn("h-2 w-2 rounded-full", s.dot)} />
                  <span className="text-xs font-medium">{s.label}</span>
                </div>
                <p className="text-2xl font-bold">{statusCounts[s.key]}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="my-requests">
            My Requests
            <Badge variant="secondary" className="ml-1.5 text-[10px] px-1.5">
              {referrals.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="find-referral">Find Referral</TabsTrigger>
        </TabsList>

        {/* ─── My Requests Tab ──────────────────────────────────────────────────── */}
        <TabsContent value="my-requests" className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {REFERRAL_STATUSES.map((s) => (
                  <SelectItem key={s.key} value={s.key}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {filteredReferrals.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <UserPlus className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-medium">No referral requests</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {referrals.length === 0
                  ? "Start by finding someone who can refer you"
                  : "Try adjusting your status filter"}
              </p>
              {referrals.length === 0 && (
                <Button className="mt-4" onClick={() => setActiveTab("find-referral")}>
                  <Search className="h-4 w-4 mr-2" />
                  Find Referral
                </Button>
              )}
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {filteredReferrals.map((r) => (
                <ReferralCard key={r.id} referral={r} />
              ))}
            </div>
          )}
        </TabsContent>

        {/* ─── Find Referral Tab ────────────────────────────────────────────────── */}
        <TabsContent value="find-referral" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Search for Employees</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by company name or employee..."
                    className="pl-9"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  />
                </div>
                <Button onClick={handleSearch} disabled={!searchQuery.trim() || searching}>
                  {searching ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Search"
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Search Results */}
          {searchResults.length > 0 && (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                {searchResults.length} result{searchResults.length !== 1 ? "s" : ""} found
              </p>
              {searchResults.map((person) => (
                <Card key={person.id} className="transition-all hover:shadow-md">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3 min-w-0">
                        <Avatar className="h-10 w-10 shrink-0">
                          <AvatarImage src={person.photoUrl} />
                          <AvatarFallback className={cn("text-white text-sm", getAvatarColor(person.name))}>
                            {getInitials(person.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="font-medium text-sm">{person.name}</p>
                          <p className="text-xs text-muted-foreground truncate">
                            {person.title} · {person.company}
                          </p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        disabled={person.isConnected}
                        onClick={() => {
                          setRequestTarget(person);
                          setShowRequestDialog(true);
                        }}
                      >
                        {person.isConnected ? (
                          <>
                            <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />
                            Requested
                          </>
                        ) : (
                          <>
                            <Send className="h-3.5 w-3.5 mr-1.5" />
                            Request
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Empty search state */}
          {searchQuery && !searching && searchResults.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <AlertCircle className="h-8 w-8 text-muted-foreground/50 mb-3" />
              <p className="text-sm text-muted-foreground">No results found. Try a different search term.</p>
            </div>
          )}

          {/* Initial state */}
          {!searchQuery && searchResults.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Building2 className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-medium">Find someone to refer you</h3>
              <p className="text-sm text-muted-foreground mt-1 max-w-md">
                Search for employees at companies you're interested in. A referral can significantly boost your chances.
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Request Dialog */}
      <RequestReferralDialog
        open={showRequestDialog}
        onOpenChange={setShowRequestDialog}
        target={requestTarget}
        onSent={fetchReferrals}
      />
    </div>
  );
}
