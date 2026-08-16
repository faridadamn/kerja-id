"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/api";
import type { MentorDetail, MentorReview } from "@/lib/types";
import { timeAgo } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Star,
  MessageSquare,
  Video,
  HelpCircle,
  ArrowLeft,
  Calendar,
  Clock,
  Building2,
  Briefcase,
  CheckCircle2,
  Loader2,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const SESSION_TYPE_CONFIG: Record<
  string,
  { label: string; icon: React.ReactNode; description: string }
> = {
  chat: {
    label: "Chat",
    icon: <MessageSquare className="h-5 w-5" />,
    description: "Sesi mentoring via chat teks secara real-time",
  },
  video: {
    label: "Video Call",
    icon: <Video className="h-5 w-5" />,
    description: "Sesi tatap muka via video call",
  },
  async_qa: {
    label: "Q&A Async",
    icon: <HelpCircle className="h-5 w-5" />,
    description: "Kirim pertanyaan dan dapatkan jawaban mendalam",
  },
};

const AVAILABILITY_BADGE: Record<
  string,
  { label: string; variant: "success" | "warning" | "secondary" }
> = {
  available: { label: "Tersedia", variant: "success" },
  busy: { label: "Sibuk", variant: "warning" },
  unavailable: { label: "Tidak Tersedia", variant: "secondary" },
};

const TIME_SLOTS = [
  "09:00",
  "09:30",
  "10:00",
  "10:30",
  "11:00",
  "11:30",
  "13:00",
  "13:30",
  "14:00",
  "14:30",
  "15:00",
  "15:30",
  "16:00",
  "16:30",
];

/* ------------------------------------------------------------------ */
/*  Skeleton                                                           */
/* ------------------------------------------------------------------ */

function ProfileSkeleton() {
  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
      <Skeleton className="h-8 w-32" />
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardContent className="p-6 space-y-4">
              <div className="flex items-start gap-4">
                <Skeleton className="h-20 w-20 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-6 w-48" />
                  <Skeleton className="h-4 w-64" />
                  <Skeleton className="h-4 w-40" />
                </div>
              </div>
              <Skeleton className="h-20 w-full" />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </CardContent>
          </Card>
        </div>
        <div className="space-y-6">
          <Card>
            <CardContent className="p-6 space-y-3">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Star Rating Component                                              */
/* ------------------------------------------------------------------ */

function StarRating({ rating, size = "sm" }: { rating: number; size?: "sm" | "md" }) {
  const sizeClass = size === "sm" ? "h-3.5 w-3.5" : "h-5 w-5";
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          className={`${sizeClass} ${
            i < Math.floor(rating)
              ? "fill-amber-400 text-amber-400"
              : i < rating
              ? "fill-amber-400/50 text-amber-400"
              : "text-gray-300"
          }`}
        />
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Review Card                                                        */
/* ------------------------------------------------------------------ */

function ReviewCard({ review }: { review: MentorReview }) {
  return (
    <div className="border rounded-lg p-4 space-y-2">
      <div className="flex items-center gap-3">
        <Avatar className="h-9 w-9">
          <AvatarImage src={review.menteePhotoUrl} alt={review.menteeName} />
          <AvatarFallback className="text-xs">
            {review.menteeName
              .split(" ")
              .map((n) => n[0])
              .join("")
              .slice(0, 2)}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{review.menteeName}</p>
          <p className="text-xs text-muted-foreground">{timeAgo(review.createdAt)}</p>
        </div>
        <StarRating rating={review.rating} />
      </div>
      <p className="text-sm text-muted-foreground">{review.comment}</p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function MentorProfilePage() {
  const params = useParams();
  const router = useRouter();
  const mentorId = params.id as string;

  const [mentor, setMentor] = useState<MentorDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Booking state
  const [selectedSessionType, setSelectedSessionType] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [booking, setBooking] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function fetchMentor() {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get<{ data: MentorDetail } | MentorDetail>(`/connect/mentors/${mentorId}`);
        const d = res.data;
        const data = "data" in d ? (d as any).data : d;
        if (!cancelled) {
          setMentor(data as MentorDetail);
          if ((data as MentorDetail).sessionTypes?.length > 0) {
            setSelectedSessionType((data as MentorDetail).sessionTypes[0]);
          }
        }
      } catch {
        if (!cancelled) setError("Gagal memuat data mentor.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchMentor();
    return () => { cancelled = true; };
  }, [mentorId]);

  const handleBooking = async () => {
    if (!selectedSessionType || !selectedDate || !selectedTime) return;
    setBooking(true);
    try {
      await api.post(`/connect/mentors/${mentorId}/book`, {
        sessionType: selectedSessionType,
        date: selectedDate,
        time: selectedTime,
      });
      setBookingSuccess(true);
    } catch {
      setError("Gagal melakukan booking. Silakan coba lagi.");
    } finally {
      setBooking(false);
    }
  };

  if (loading) return <ProfileSkeleton />;

  if (error && !mentor) {
    return (
      <div className="p-4 md:p-6 lg:p-8 max-w-5xl mx-auto">
        <Button variant="ghost" onClick={() => router.back()} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> Kembali
        </Button>
        <Card>
          <CardContent className="py-16 text-center">
            <p className="text-muted-foreground">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!mentor) return null;

  const avail = AVAILABILITY_BADGE[mentor.availability];
  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
      {/* Back button */}
      <Button variant="ghost" onClick={() => router.back()} className="gap-2">
        <ArrowLeft className="h-4 w-4" /> Kembali
      </Button>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left column - Profile info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profile header */}
          <Card>
            <CardContent className="p-6 space-y-4">
              <div className="flex items-start gap-4">
                <Avatar className="h-20 w-20 shrink-0">
                  <AvatarImage src={mentor.photoUrl} alt={mentor.name} />
                  <AvatarFallback className="text-lg">
                    {mentor.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h1 className="text-xl md:text-2xl font-bold">{mentor.name}</h1>
                      <p className="text-muted-foreground flex items-center gap-1.5 mt-1">
                        <Briefcase className="h-4 w-4" />
                        {mentor.title}
                      </p>
                      <p className="text-muted-foreground flex items-center gap-1.5">
                        <Building2 className="h-4 w-4" />
                        {mentor.company}
                      </p>
                    </div>
                    <Badge variant={avail.variant}>{avail.label}</Badge>
                  </div>

                  <div className="flex items-center gap-4 mt-3 text-sm">
                    <span className="flex items-center gap-1.5">
                      <StarRating rating={mentor.rating} size="sm" />
                      <span className="font-medium">{mentor.rating.toFixed(1)}</span>
                      <span className="text-muted-foreground">({mentor.reviewCount} ulasan)</span>
                    </span>
                    <span className="text-muted-foreground flex items-center gap-1">
                      <MessageSquare className="h-4 w-4" />
                      {mentor.sessionCount} sesi
                    </span>
                  </div>
                </div>
              </div>

              {/* Bio */}
              {mentor.bio && (
                <div className="pt-2 border-t">
                  <p className="text-sm text-muted-foreground leading-relaxed">{mentor.bio}</p>
                </div>
              )}

              {/* Expertise tags */}
              <div className="pt-2 border-t space-y-2">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Keahlian
                </p>
                <div className="flex flex-wrap gap-2">
                  {mentor.expertise.map((tag) => (
                    <Badge key={tag} variant="secondary">{tag}</Badge>
                  ))}
                </div>
              </div>

              {/* Industry */}
              <div className="border-t pt-2">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
                  Industri
                </p>
                <Badge variant="outline">{mentor.industry}</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Session types */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Tipe Sesi Tersedia</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-3 gap-3">
                {mentor.sessionTypes.map((type) => {
                  const config = SESSION_TYPE_CONFIG[type];
                  if (!config) return null;
                  return (
                    <div
                      key={type}
                      className={`border rounded-lg p-4 text-center space-y-2 cursor-pointer transition-all ${
                        selectedSessionType === type
                          ? "border-primary bg-primary/5 ring-1 ring-primary"
                          : "hover:border-primary/50"
                      }`}
                      onClick={() => setSelectedSessionType(type)}
                    >
                      <div className="flex justify-center text-primary">{config.icon}</div>
                      <p className="font-medium text-sm">{config.label}</p>
                      <p className="text-xs text-muted-foreground">{config.description}</p>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Reviews */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Ulasan dari Mentee</CardTitle>
            </CardHeader>
            <CardContent>
              {mentor.reviews && mentor.reviews.length > 0 ? (
                <div className="space-y-4">
                  {mentor.reviews.map((review) => (
                    <ReviewCard key={review.id} review={review} />
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">
                  Belum ada ulasan.
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right column - Booking */}
        <div className="space-y-6">
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Booking Sesi
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {bookingSuccess ? (
                <div className="text-center py-6 space-y-3">
                  <CheckCircle2 className="h-12 w-12 mx-auto text-green-500" />
                  <p className="font-semibold">Booking Berhasil!</p>
                  <p className="text-sm text-muted-foreground">
                    Mentor akan mengkonfirmasi jadwal sesi kamu.
                  </p>
                  <Button variant="outline" onClick={() => setBookingSuccess(false)}>
                    Booking Sesi Lain
                  </Button>
                </div>
              ) : (
                <>
                  {/* Session type selector */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Tipe Sesi</label>
                    <Select value={selectedSessionType} onValueChange={setSelectedSessionType}>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih tipe sesi" />
                      </SelectTrigger>
                      <SelectContent>
                        {mentor.sessionTypes.map((type) => {
                          const config = SESSION_TYPE_CONFIG[type];
                          return config ? (
                            <SelectItem key={type} value={type}>
                              {config.label}
                            </SelectItem>
                          ) : null;
                        })}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Date picker */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Tanggal</label>
                    <Input
                      type="date"
                      value={selectedDate}
                      min={today}
                      onChange={(e) => setSelectedDate(e.target.value)}
                    />
                  </div>

                  {/* Time slot */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-1.5">
                      <Clock className="h-4 w-4" />
                      Waktu
                    </label>
                    <Select value={selectedTime} onValueChange={setSelectedTime}>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih waktu" />
                      </SelectTrigger>
                      <SelectContent>
                        {TIME_SLOTS.map((slot) => (
                          <SelectItem key={slot} value={slot}>
                            {slot}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {error && (
                    <p className="text-sm text-destructive">{error}</p>
                  )}

                  <Button
                    className="w-full"
                    disabled={!selectedSessionType || !selectedDate || !selectedTime || booking}
                    onClick={handleBooking}
                  >
                    {booking ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Memproses...
                      </>
                    ) : (
                      <>
                        <Calendar className="mr-2 h-4 w-4" />
                        Booking Sesi
                      </>
                    )}
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}


