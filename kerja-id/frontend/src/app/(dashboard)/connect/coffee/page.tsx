"use client";

import { useState, useEffect, useCallback } from "react";
import api from "@/lib/api";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Coffee,
  Clock,
  Sparkles,
  MessageCircle,
  Building2,
  MapPin,
  Calendar,
  Loader2,
  RefreshCw,
  Lightbulb,
  ChevronDown,
  ChevronUp,
  Timer,
  UserCheck,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────────

interface MatchedProfessional {
  id: string;
  name: string;
  title: string;
  company: string;
  photoUrl?: string;
  location?: string;
  matchReason: string;
  matchScore: number;
  availability: "available" | "busy" | "unavailable";
  expertise?: string[];
  iceBreakers?: string[];
}

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

function getAvailabilityBadge(availability: MatchedProfessional["availability"]) {
  switch (availability) {
    case "available":
      return { label: "Available", color: "text-green-700", bg: "bg-green-100", dot: "bg-green-500" };
    case "busy":
      return { label: "Busy", color: "text-yellow-700", bg: "bg-yellow-100", dot: "bg-yellow-500" };
    case "unavailable":
      return { label: "Unavailable", color: "text-red-700", bg: "bg-red-100", dot: "bg-red-500" };
  }
}

// ─── Request Chat Dialog ─────────────────────────────────────────────────────────

function RequestChatDialog({
  open,
  onOpenChange,
  professional,
  onSent,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  professional: MatchedProfessional | null;
  onSent: () => void;
}) {
  const [duration, setDuration] = useState<15 | 30>(15);
  const [sending, setSending] = useState(false);
  const [showIceBreakers, setShowIceBreakers] = useState(false);

  useEffect(() => {
    if (open) {
      setDuration(15);
      setShowIceBreakers(false);
    }
  }, [open]);

  const handleRequest = async () => {
    if (!professional) return;
    setSending(true);
    try {
      await api.post(`/connect/coffee/${professional.id}/request`, { duration });
      onSent();
      onOpenChange(false);
    } catch (err) {
      console.error("Failed to request chat:", err);
    } finally {
      setSending(false);
    }
  };

  if (!professional) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Request Coffee Chat</DialogTitle>
          <DialogDescription>
            Schedule a virtual coffee chat with {professional.name}.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Professional info */}
          <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
            <Avatar className="h-12 w-12">
              <AvatarImage src={professional.photoUrl} />
              <AvatarFallback className={cn("text-white", getAvatarColor(professional.name))}>
                {getInitials(professional.name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{professional.name}</p>
              <p className="text-sm text-muted-foreground">
                {professional.title} · {professional.company}
              </p>
            </div>
          </div>

          {/* Match reason */}
          <div className="flex items-start gap-2 p-3 bg-primary/5 border border-primary/10 rounded-lg">
            <Sparkles className="h-4 w-4 text-primary mt-0.5 shrink-0" />
            <div>
              <p className="text-xs font-medium text-primary">Why we matched you</p>
              <p className="text-sm text-muted-foreground mt-0.5">{professional.matchReason}</p>
            </div>
          </div>

          {/* Duration selector */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Chat Duration</label>
            <div className="grid grid-cols-2 gap-3">
              {[15, 30].map((d) => (
                <button
                  key={d}
                  className={cn(
                    "flex flex-col items-center gap-1 p-4 rounded-lg border-2 transition-all",
                    duration === d
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/30"
                  )}
                  onClick={() => setDuration(d as 15 | 30)}
                >
                  <Timer className={cn("h-5 w-5", duration === d ? "text-primary" : "text-muted-foreground")} />
                  <span className="text-sm font-medium">{d} minutes</span>
                  <span className="text-xs text-muted-foreground">
                    {d === 15 ? "Quick intro" : "Deep dive"}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Ice breakers */}
          {professional.iceBreakers && professional.iceBreakers.length > 0 && (
            <div className="space-y-2">
              <button
                className="flex items-center gap-2 text-sm font-medium text-primary hover:underline"
                onClick={() => setShowIceBreakers(!showIceBreakers)}
              >
                <Lightbulb className="h-4 w-4" />
                Ice Breaker Suggestions
                {showIceBreakers ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
              </button>
              {showIceBreakers && (
                <div className="space-y-2 pl-6">
                  {professional.iceBreakers.map((ib, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-2 text-sm text-muted-foreground p-2 bg-muted/50 rounded"
                    >
                      <MessageCircle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                      <span>{ib}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleRequest} disabled={sending}>
            {sending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Coffee className="h-4 w-4 mr-2" />
            )}
            Request {duration}-min Chat
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Professional Card ───────────────────────────────────────────────────────────

function ProfessionalCard({
  professional,
  onRequest,
}: {
  professional: MatchedProfessional;
  onRequest: () => void;
}) {
  const avail = getAvailabilityBadge(professional.availability);

  return (
    <Card className="transition-all hover:shadow-md">
      <CardContent className="p-5 space-y-4">
        {/* Header */}
        <div className="flex items-start gap-3">
          <Avatar className="h-12 w-12 shrink-0">
            <AvatarImage src={professional.photoUrl} />
            <AvatarFallback className={cn("text-white", getAvatarColor(professional.name))}>
              {getInitials(professional.name)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-semibold">{professional.name}</p>
                <p className="text-sm text-muted-foreground">{professional.title}</p>
              </div>
              <Badge variant="outline" className={cn("text-xs shrink-0", avail.bg, avail.color, "border-0")}>
                <div className={cn("h-1.5 w-1.5 rounded-full mr-1.5", avail.dot)} />
                {avail.label}
              </Badge>
            </div>
            <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Building2 className="h-3 w-3" />
                {professional.company}
              </span>
              {professional.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {professional.location}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Match reason */}
        <div className="flex items-start gap-2 p-3 bg-primary/5 rounded-lg">
          <Sparkles className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
          <p className="text-xs text-muted-foreground leading-relaxed">
            {professional.matchReason}
          </p>
        </div>

        {/* Match score */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Match score:</span>
          <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all"
              style={{ width: `${professional.matchScore}%` }}
            />
          </div>
          <span className="text-xs font-medium">{professional.matchScore}%</span>
        </div>

        {/* Expertise tags */}
        {professional.expertise && professional.expertise.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {professional.expertise.map((exp) => (
              <Badge key={exp} variant="secondary" className="text-[10px]">
                {exp}
              </Badge>
            ))}
          </div>
        )}

        {/* Action */}
        <Button
          className="w-full"
          disabled={professional.availability === "unavailable"}
          onClick={onRequest}
        >
          <Coffee className="h-4 w-4 mr-2" />
          {professional.availability === "unavailable"
            ? "Currently Unavailable"
            : "Request Chat"}
        </Button>
      </CardContent>
    </Card>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────────

export default function CoffeeChatPage() {
  const [professionals, setProfessionals] = useState<MatchedProfessional[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [requestTarget, setRequestTarget] = useState<MatchedProfessional | null>(null);
  const [showRequestDialog, setShowRequestDialog] = useState(false);

  const fetchMatches = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get<MatchedProfessional[]>("/connect/coffee");
      setProfessionals(Array.isArray(res.data) ? res.data : res.data.data || []);
    } catch (err) {
      console.error("Failed to fetch matches:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMatches();
  }, [fetchMatches]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchMatches();
    } finally {
      setRefreshing(false);
    }
  };

  if (loading) {
    return (
      <div className="p-4 md:p-6 space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-72 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Coffee className="h-6 w-6 text-amber-600" />
            Coffee Chat
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            AI-matched professionals based on your career goals and interests
          </p>
        </div>
        <Button variant="outline" onClick={handleRefresh} disabled={refreshing}>
          <RefreshCw className={cn("h-4 w-4 mr-2", refreshing && "animate-spin")} />
          Refresh Matches
        </Button>
      </div>

      {/* How it works */}
      <Card className="bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
            <div className="flex flex-col items-center gap-2">
              <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-amber-600" />
              </div>
              <p className="text-sm font-medium">AI Matching</p>
              <p className="text-xs text-muted-foreground">Based on your profile & goals</p>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center">
                <Clock className="h-5 w-5 text-amber-600" />
              </div>
              <p className="text-sm font-medium">Choose Duration</p>
              <p className="text-xs text-muted-foreground">15 or 30 minute chats</p>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center">
                <MessageCircle className="h-5 w-5 text-amber-600" />
              </div>
              <p className="text-sm font-medium">Ice Breakers</p>
              <p className="text-xs text-muted-foreground">Conversation starters provided</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Professionals Grid */}
      {professionals.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Coffee className="h-12 w-12 text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-medium">No matches yet</h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-md">
            Complete your profile to get AI-matched with professionals in your industry.
          </p>
          <Button className="mt-4" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Find Matches
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {professionals.map((p) => (
            <ProfessionalCard
              key={p.id}
              professional={p}
              onRequest={() => {
                setRequestTarget(p);
                setShowRequestDialog(true);
              }}
            />
          ))}
        </div>
      )}

      {/* Request Dialog */}
      <RequestChatDialog
        open={showRequestDialog}
        onOpenChange={setShowRequestDialog}
        professional={requestTarget}
        onSent={fetchMatches}
      />
    </div>
  );
}
