"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import api from "@/lib/api";
import type { Mentor, MentorsResponse } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Star,
  Search,
  MessageSquare,
  Video,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  Filter,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const INDUSTRIES = [
  "Teknologi",
  "Finance",
  "Marketing",
  "Konsultasi",
  "Kesehatan",
  "Pendidikan",
  "Manufaktur",
  "E-commerce",
];

const EXPERTISE_AREAS = [
  "Software Engineering",
  "Data Science",
  "Product Management",
  "UX Design",
  "Digital Marketing",
  "Business Development",
  "Leadership",
  "Career Coaching",
];

const AVAILABILITY_OPTIONS = [
  { value: "all", label: "Semua" },
  { value: "available", label: "Tersedia" },
  { value: "busy", label: "Sibuk" },
];

const RATING_OPTIONS = [
  { value: "all", label: "Semua Rating" },
  { value: "4", label: "4+" },
  { value: "3", label: "3+" },
];

const SESSION_TYPE_ICON: Record<string, React.ReactNode> = {
  chat: <MessageSquare className="h-3.5 w-3.5" />,
  video: <Video className="h-3.5 w-3.5" />,
  async_qa: <HelpCircle className="h-3.5 w-3.5" />,
};

const SESSION_TYPE_LABEL: Record<string, string> = {
  chat: "Chat",
  video: "Video",
  async_qa: "Q&A Async",
};

const AVAILABILITY_BADGE: Record<string, { label: string; variant: "success" | "warning" | "secondary" }> = {
  available: { label: "Tersedia", variant: "success" },
  busy: { label: "Sibuk", variant: "warning" },
  unavailable: { label: "Tidak Tersedia", variant: "secondary" },
};

/* ------------------------------------------------------------------ */
/*  Skeleton                                                           */
/* ------------------------------------------------------------------ */

function MentorCardSkeleton() {
  return (
    <Card>
      <CardContent className="p-5 space-y-3">
        <div className="flex items-start gap-3">
          <Skeleton className="h-14 w-14 rounded-full shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-36" />
            <Skeleton className="h-3 w-48" />
          </div>
        </div>
        <Skeleton className="h-3 w-full" />
        <div className="flex gap-2">
          <Skeleton className="h-6 w-20 rounded-full" />
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="h-6 w-24 rounded-full" />
        </div>
        <div className="flex items-center justify-between">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-9 w-28" />
        </div>
      </CardContent>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function MentorsPage() {
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [industry, setIndustry] = useState("all");
  const [expertise, setExpertise] = useState("all");
  const [availability, setAvailability] = useState("all");
  const [minRating, setMinRating] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchMentors = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = { page, limit: 12 };
      if (search) params.q = search;
      if (industry !== "all") params.industry = industry;
      if (expertise !== "all") params.expertise = expertise;
      if (availability !== "all") params.availability = availability;
      if (minRating !== "all") params.minRating = minRating;

      const res = await api.get<MentorsResponse | { data: MentorsResponse }>("/connect/mentors", { params });
      const d = res.data;
      const data = "mentors" in d ? d : (d as any).data;
      setMentors(data.mentors ?? []);
      setTotalPages(data.totalPages ?? 1);
      setTotal(data.total ?? 0);
    } catch {
      setMentors([]);
    } finally {
      setLoading(false);
    }
  }, [page, search, industry, expertise, availability, minRating]);

  useEffect(() => {
    fetchMentors();
  }, [fetchMentors]);

  // Reset page on filter change
  useEffect(() => {
    setPage(1);
  }, [search, industry, expertise, availability, minRating]);

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Direktori Mentor</h1>
        <p className="text-muted-foreground mt-1">
          Temukan mentor yang tepat untuk mempercepat karir kamu
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            <div className="relative lg:col-span-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari mentor..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>

            <Select value={industry} onValueChange={setIndustry}>
              <SelectTrigger>
                <SelectValue placeholder="Industri" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Industri</SelectItem>
                {INDUSTRIES.map((ind) => (
                  <SelectItem key={ind} value={ind}>{ind}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={expertise} onValueChange={setExpertise}>
              <SelectTrigger>
                <SelectValue placeholder="Keahlian" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Keahlian</SelectItem>
                {EXPERTISE_AREAS.map((exp) => (
                  <SelectItem key={exp} value={exp}>{exp}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex gap-2">
              <Select value={availability} onValueChange={setAvailability}>
                <SelectTrigger>
                  <SelectValue placeholder="Ketersediaan" />
                </SelectTrigger>
                <SelectContent>
                  {AVAILABILITY_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center gap-3 mt-3">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={minRating} onValueChange={setMinRating}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Rating" />
              </SelectTrigger>
              <SelectContent>
                {RATING_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span className="text-sm text-muted-foreground">
              {total} mentor ditemukan
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Mentor Grid */}
      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <MentorCardSkeleton key={i} />
          ))}
        </div>
      ) : mentors.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center space-y-3">
            <Search className="h-12 w-12 mx-auto text-muted-foreground" />
            <p className="text-muted-foreground">
              Tidak ada mentor yang sesuai dengan filter kamu.
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setSearch("");
                setIndustry("all");
                setExpertise("all");
                setAvailability("all");
                setMinRating("all");
              }}
            >
              Reset Filter
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {mentors.map((mentor) => {
            const avail = AVAILABILITY_BADGE[mentor.availability];
            return (
              <Card key={mentor.id} className="hover:shadow-md transition-shadow group">
                <CardContent className="p-5 space-y-3">
                  <div className="flex items-start gap-3">
                    <Avatar className="h-14 w-14 shrink-0">
                      <AvatarImage src={mentor.photoUrl} alt={mentor.name} />
                      <AvatarFallback>
                        {mentor.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-sm group-hover:text-primary transition-colors truncate">
                        {mentor.name}
                      </h3>
                      <p className="text-xs text-muted-foreground truncate">
                        {mentor.title}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {mentor.company}
                      </p>
                    </div>
                    <Badge variant={avail.variant} className="text-[10px] shrink-0">
                      {avail.label}
                    </Badge>
                  </div>

                  {/* Industry */}
                  <p className="text-xs text-muted-foreground">
                    {mentor.industry}
                  </p>

                  {/* Expertise tags */}
                  <div className="flex flex-wrap gap-1.5">
                    {mentor.expertise.slice(0, 3).map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-[10px] px-2">
                        {tag}
                      </Badge>
                    ))}
                    {mentor.expertise.length > 3 && (
                      <Badge variant="outline" className="text-[10px] px-2">
                        +{mentor.expertise.length - 3}
                      </Badge>
                    )}
                  </div>

                  {/* Session types */}
                  <div className="flex items-center gap-2">
                    {mentor.sessionTypes.map((type) => (
                      <div
                        key={type}
                        className="flex items-center gap-1 text-[10px] text-muted-foreground"
                        title={SESSION_TYPE_LABEL[type]}
                      >
                        {SESSION_TYPE_ICON[type]}
                        <span>{SESSION_TYPE_LABEL[type]}</span>
                      </div>
                    ))}
                  </div>

                  {/* Stats + CTA */}
                  <div className="flex items-center justify-between pt-1 border-t">
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                        {mentor.rating.toFixed(1)} ({mentor.reviewCount})
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageSquare className="h-3.5 w-3.5" />
                        {mentor.sessionCount} sesi
                      </span>
                    </div>
                    <Button asChild size="sm">
                      <Link href={`/connect/mentors/${mentor.id}`}>Booking Sesi</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
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
