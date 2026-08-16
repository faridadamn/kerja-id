"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/lib/api";
import type { Mentor, CommunityGroup } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Users,
  Star,
  Search,
  ArrowRight,
  MessageSquare,
  TrendingUp,
  Handshake,
  Sparkles,
  Globe,
  BookOpen,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

const AVAILABILITY_LABEL: Record<string, string> = {
  available: "Tersedia",
  busy: "Sibuk",
  unavailable: "Tidak Tersedia",
};

const AVAILABILITY_VARIANT: Record<string, "success" | "warning" | "secondary"> = {
  available: "success",
  busy: "warning",
  unavailable: "secondary",
};

const GROUP_TYPE_LABEL: Record<string, string> = {
  industry: "Industri",
  skill: "Skill",
  location: "Lokasi",
  alumni: "Alumni",
};

const GROUP_TYPE_ICON: Record<string, React.ReactNode> = {
  industry: <Globe className="h-4 w-4" />,
  skill: <BookOpen className="h-4 w-4" />,
  location: <Globe className="h-4 w-4" />,
  alumni: <Users className="h-4 w-4" />,
};

/* ------------------------------------------------------------------ */
/*  Skeletons                                                         */
/* ------------------------------------------------------------------ */

function MentorCardSkeleton() {
  return (
    <Card>
      <CardContent className="p-5 space-y-3">
        <div className="flex items-center gap-3">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
        <Skeleton className="h-3 w-full" />
        <div className="flex gap-2">
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>
      </CardContent>
    </Card>
  );
}

function GroupCardSkeleton() {
  return (
    <Card>
      <CardContent className="p-4 space-y-2">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-20" />
      </CardContent>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function ConnectPage() {
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [groups, setGroups] = useState<CommunityGroup[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function fetchData() {
      setLoading(true);
      try {
        const [mentorsRes, groupsRes] = await Promise.allSettled([
          api.get<{ mentors?: Mentor[]; data?: Mentor[] }>("/connect/mentors", {
            params: { limit: 6, sort: "rating" },
          }),
          api.get<{ groups?: CommunityGroup[]; data?: CommunityGroup[] }>("/connect/community", {
            params: { limit: 4 },
          }),
        ]);

        if (cancelled) return;

        if (mentorsRes.status === "fulfilled") {
          const d = mentorsRes.value.data;
          setMentors(d.mentors ?? d.data ?? []);
        }

        if (groupsRes.status === "fulfilled") {
          const d = groupsRes.value.data;
          setGroups(d.groups ?? d.data ?? []);
        }
      } catch {
        // silent fail
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchData();
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-10 max-w-7xl mx-auto">
      {/* ---------------------------------------------------------- */}
      {/*  Hero                                                       */}
      {/* ---------------------------------------------------------- */}
      <section className="text-center space-y-4 py-6">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
          ConnectPro Networking
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
          Perluas jaringan profesional kamu. Terhubung dengan mentor berpengalaman,
          bergabung dengan komunitas, dan temukan peluang referral.
        </p>
        <div className="flex flex-wrap justify-center gap-3 pt-2">
          <Button asChild size="lg">
            <Link href="/connect/mentors">
              <Search className="mr-2 h-4 w-4" />
              Cari Mentor
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/connect/community">
              <Users className="mr-2 h-4 w-4" />
              Jelajahi Komunitas
            </Link>
          </Button>
        </div>
      </section>

      {/* ---------------------------------------------------------- */}
      {/*  Featured Mentors                                           */}
      {/* ---------------------------------------------------------- */}
      <section>
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-xl md:text-2xl font-bold flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-amber-500" />
              Mentor Unggulan
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Belajar dari para profesional terbaik di bidangnya
            </p>
          </div>
          <Button asChild variant="ghost" size="sm">
            <Link href="/connect/mentors">
              Lihat Semua <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </div>

        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <MentorCardSkeleton key={i} />
            ))}
          </div>
        ) : mentors.length === 0 ? (
          <Card>
            <CardContent className="py-10 text-center">
              <p className="text-muted-foreground">Belum ada mentor tersedia.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {mentors.map((mentor) => (
              <Link key={mentor.id} href={`/connect/mentors/${mentor.id}`}>
                <Card className="hover:shadow-md transition-shadow group h-full">
                  <CardContent className="p-5 space-y-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12">
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
                          {mentor.title} · {mentor.company}
                        </p>
                      </div>
                      <Badge variant={AVAILABILITY_VARIANT[mentor.availability]} className="text-[10px] shrink-0">
                        {AVAILABILITY_LABEL[mentor.availability]}
                      </Badge>
                    </div>

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

                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                        {mentor.rating.toFixed(1)} ({mentor.reviewCount})
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageSquare className="h-3.5 w-3.5" />
                        {mentor.sessionCount} sesi
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* ---------------------------------------------------------- */}
      {/*  Community Groups Preview                                   */}
      {/* ---------------------------------------------------------- */}
      <section>
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-xl md:text-2xl font-bold flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-500" />
              Komunitas Populer
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Bergabung dengan grup yang sesuai minat dan industri kamu
            </p>
          </div>
          <Button asChild variant="ghost" size="sm">
            <Link href="/connect/community">
              Lihat Semua <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </div>

        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <GroupCardSkeleton key={i} />
            ))}
          </div>
        ) : groups.length === 0 ? (
          <Card>
            <CardContent className="py-10 text-center">
              <p className="text-muted-foreground">Belum ada komunitas tersedia.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {groups.map((group) => (
              <Link key={group.id} href={`/connect/community/${group.id}`}>
                <Card className="hover:shadow-md transition-shadow group h-full">
                  <CardContent className="p-4 space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        {GROUP_TYPE_ICON[group.type]}
                      </div>
                      <Badge variant="outline" className="text-[10px]">
                        {GROUP_TYPE_LABEL[group.type]}
                      </Badge>
                    </div>
                    <h3 className="font-semibold text-sm group-hover:text-primary transition-colors line-clamp-1">
                      {group.name}
                    </h3>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {group.description}
                    </p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {group.memberCount.toLocaleString("id-ID")} anggota
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* ---------------------------------------------------------- */}
      {/*  Referral Marketplace Preview                               */}
      {/* ---------------------------------------------------------- */}
      <section>
        <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
          <CardContent className="p-6 md:p-8">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary shrink-0">
                <Handshake className="h-8 w-8" />
              </div>
              <div className="flex-1 text-center md:text-left">
                <h3 className="text-lg md:text-xl font-bold">Referral Marketplace</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Dapatkan referensi dari profesional yang sudah bekerja di perusahaan impian kamu.
                  Tingkatkan peluang kamu untuk dipanggil interview.
                </p>
              </div>
              <div className="flex gap-3">
                <Button asChild>
                  <Link href="/connect/mentors">
                    <TrendingUp className="mr-2 h-4 w-4" />
                    Cari Referral
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
