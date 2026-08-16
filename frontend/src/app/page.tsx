"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";
import {
  FileText,
  Search,
  GitBranch,
  Target,
  MessageSquare,
  DollarSign,
  Users,
  MapPin,
  Heart,
  BarChart3,
  ArrowRight,
  Sparkles,
  Upload,
  Brain,
  Trophy,
  Star,
  ChevronDown,
  Check,
  Zap,
  Crown,
  Quote,
} from "lucide-react";

const features = [
  { icon: Search, title: "Job Aggregator", desc: "Lowongan dari 20+ platform dalam satu tempat" },
  { icon: FileText, title: "CV Optimizer AI", desc: "Buat CV yang lolos ATS dengan bantuan AI" },
  { icon: Target, title: "SkillGap Analyzer", desc: "Tahu skill yang dibutuhkan industri" },
  { icon: MessageSquare, title: "InterviewSim", desc: "Latihan interview dengan AI coach" },
  { icon: GitBranch, title: "JobTracker", desc: "CRM pribadi untuk pencarian kerja" },
  { icon: DollarSign, title: "SalaryInsight", desc: "Data gaji transparan Indonesia" },
  { icon: Users, title: "ConnectPro", desc: "Networking dengan mentor & profesional" },
  { icon: MapPin, title: "KerjaDariMana", desc: "Remote work & lowongan daerah" },
  { icon: Heart, title: "JobWell", desc: "Dukungan kesehatan mental job seeker" },
  { icon: BarChart3, title: "Analytics", desc: "Insight pencarian kerja personal" },
];

const howItWorks = [
  {
    icon: Upload,
    step: "1",
    title: "Buat Profil & Upload CV",
    desc: "Daftar gratis, lengkapi profil, dan upload CV Anda. AI kami akan langsung menganalisisnya.",
  },
  {
    icon: Brain,
    step: "2",
    title: "Dapatkan Rekomendasi AI",
    desc: "Kami cocokkan profil Anda dengan lowongan terbaik, analisis skill gap, dan sarankan perbaikan CV.",
  },
  {
    icon: Trophy,
    step: "3",
    title: "Lamar & Raih Karir Impian",
    desc: "Lamar langsung, latihan interview, dan track semua lamaran dalam satu dashboard.",
  },
];

const testimonials = [
  {
    name: "Rina Wijaya",
    role: "Frontend Developer di Tokopedia",
    avatar: "RW",
    content:
      "Berkat CV Optimizer dari KERJA.ID, CV saya langsung lolos ATS dan dapat interview dalam 2 minggu! Fitur SkillGap juga membantu saya tahu skill apa yang harus dipelajari.",
    rating: 5,
  },
  {
    name: "Dian Pratama",
    role: "Product Manager di Gojek",
    avatar: "DP",
    content:
      "InterviewSim benar-benar game changer. Saya jadi lebih percaya diri saat interview karena sudah latihan dengan AI coach. Highly recommended untuk semua job seeker!",
    rating: 5,
  },
  {
    name: "Budi Santoso",
    role: "Data Analyst di Shopee",
    avatar: "BS",
    content:
      "SalaryInsight membantu saya negosiasi gaji dengan data yang valid. Akhirnya saya dapat offer 30% lebih tinggi dari ekspektasi awal. Terima kasih KERJA.ID!",
    rating: 5,
  },
];

const pricingPlans = [
  {
    name: "Free",
    price: "Gratis",
    priceNote: "Selamanya",
    desc: "Cukup untuk mulai mencari kerja",
    icon: Zap,
    features: [
      "Job Aggregator — akses semua lowongan",
      "CV Optimizer — 3 analisis per bulan",
      "JobTracker — track 10 lamaran",
      "SkillGap Analyzer — dasar",
      "SalaryInsight — lihat data gaji",
    ],
    cta: "Mulai Gratis",
    popular: false,
  },
  {
    name: "Pro",
    price: "Rp 99rb",
    priceNote: "/bulan",
    desc: "Untuk job seeker yang serius",
    icon: Star,
    features: [
      "Semua fitur Free",
      "CV Optimizer — unlimited + ATS score",
      "JobTracker — unlimited lamaran",
      "InterviewSim — 10 sesi per bulan",
      "SkillGap — rekomendasi kursus",
      "ConnectPro — 2 mentor session",
      "Priority support",
    ],
    cta: "Upgrade Pro",
    popular: true,
  },
  {
    name: "Premium",
    price: "Rp 199rb",
    priceNote: "/bulan",
    desc: "Akses penuh semua fitur",
    icon: Crown,
    features: [
      "Semua fitur Pro",
      "InterviewSim — unlimited",
      "ConnectPro — unlimited mentor",
      "MicroIntern — akses proyek eksklusif",
      "CV review oleh recruiter asli",
      "JobWell — konseling karir",
      "Dedicated career advisor",
    ],
    cta: "Upgrade Premium",
    popular: false,
  },
];

const faqs = [
  {
    q: "Apakah KERJA.ID benar-benar gratis?",
    a: "Ya! Paket Free kami selamanya gratis dan mencakup fitur inti seperti Job Aggregator, CV Optimizer dasar, dan JobTracker. Untuk fitur lebih lengkap seperti InterviewSim unlimited dan mentor session, tersedia paket Pro dan Premium.",
  },
  {
    q: "Bagaimana CV Optimizer bekerja?",
    a: "CV Optimizer menggunakan AI untuk menganalisis CV Anda terhadap standar ATS (Applicant Tracking System). Kami akan memberikan skor, menunjukkan bagian yang perlu diperbaiki, dan menyarankan kata kunci yang relevan dengan posisi target Anda.",
  },
  {
    q: "Apakah data saya aman?",
    a: "Keamanan data adalah prioritas utama kami. Semua data dienkripsi end-to-end, dan kami tidak pernah membagikan informasi pribadi Anda kepada pihak ketiga tanpa persetujuan Anda. Anda bisa mengatur visibilitas profil sesuai keinginan.",
  },
  {
    q: "InterviewSim itu apa?",
    a: "InterviewSim adalah simulator interview berbasis AI. Anda bisa berlatih interview behavioral, technical, dan case study dalam bahasa Indonesia atau Inggris. AI akan memberikan feedback real-time tentang jawaban, bahasa tubuh, dan saran perbaikan.",
  },
  {
    q: "Bisakah saya batalkan langganan kapan saja?",
    a: "Tentu! Anda bisa membatalkan langganan kapan saja tanpa biaya tambahan. Akses ke fitur premium akan tetap aktif sampai akhir periode billing. Tidak ada kontrak jangka panjang.",
  },
  {
    q: "Bagaimana cara kerja SkillGap Analyzer?",
    a: "SkillGap Analyzer membandingkan skill yang Anda miliki dengan demand industri saat ini. Kami menggunakan data real-time dari ribuan lowongan kerja untuk menunjukkan skill mana yang perlu Anda tingkatkan, lengkap dengan rekomendasi kursus.",
  },
];

export default function HomePage() {
  const { isAuthenticated } = useAuth();
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary/5 to-background py-20 md:py-32">
        <div className="container text-center">
          <div className="inline-flex items-center gap-2 rounded-full border bg-muted px-4 py-1.5 text-sm mb-6">
            <Sparkles className="h-4 w-4 text-primary" />
            Powered by AI & Community
          </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
            Cari Kerja <span className="text-primary">Gak Harus Susah</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Super-app pencari kerja Indonesia. CV optimizer, job aggregator, interview coach,
            salary insight — semua dalam satu platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href={isAuthenticated ? "/dashboard" : "/auth/register"}>
              <Button size="lg" className="text-base px-8">
                {isAuthenticated ? "Ke Dashboard" : "Mulai Gratis"}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/jobs/search">
              <Button size="lg" variant="outline" className="text-base px-8">
                Cari Lowongan
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">10 Modul, 1 Platform</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Semua kebutuhan pencari kerja Indonesia di satu tempat
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {features.map((f) => (
              <Card key={f.title} className="hover:shadow-md transition-shadow cursor-pointer">
                <CardHeader className="p-4">
                  <f.icon className="h-8 w-8 text-primary mb-2" />
                  <CardTitle className="text-sm">{f.title}</CardTitle>
                  <CardDescription className="text-xs">{f.desc}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-muted/50">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Cara Kerjanya</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              3 langkah sederhana untuk memulai karir impian Anda
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {howItWorks.map((step, idx) => (
              <div key={step.step} className="relative text-center">
                {/* Connector line */}
                {idx < howItWorks.length - 1 && (
                  <div className="hidden md:block absolute top-12 left-[60%] w-[80%] border-t-2 border-dashed border-primary/30" />
                )}
                <div className="relative inline-flex items-center justify-center w-24 h-24 rounded-full bg-primary/10 mb-6">
                  <step.icon className="h-10 w-10 text-primary" />
                  <span className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold flex items-center justify-center">
                    {step.step}
                  </span>
                </div>
                <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
                <p className="text-muted-foreground text-sm max-w-xs mx-auto">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Kata Mereka</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Ribuan pencari kerja sudah merasakan manfaat KERJA.ID
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <Card key={t.name} className="relative">
                <CardContent className="pt-6">
                  <Quote className="h-8 w-8 text-primary/20 mb-4" />
                  <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                    {t.content}
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                      {t.avatar}
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{t.name}</p>
                      <p className="text-xs text-muted-foreground">{t.role}</p>
                    </div>
                  </div>
                  <div className="flex gap-0.5 mt-3">
                    {Array.from({ length: t.rating }).map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 bg-muted/50">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Harga yang Transparan</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Mulai gratis, upgrade kapan saja sesuai kebutuhan
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {pricingPlans.map((plan) => (
              <Card
                key={plan.name}
                className={cn(
                  "relative flex flex-col",
                  plan.popular && "border-primary shadow-lg scale-[1.02]"
                )}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground px-3 py-1">
                      Paling Populer
                    </Badge>
                  </div>
                )}
                <CardHeader className="text-center pb-2">
                  <plan.icon className="h-8 w-8 text-primary mx-auto mb-2" />
                  <CardTitle>{plan.name}</CardTitle>
                  <div className="mt-2">
                    <span className="text-3xl font-bold">{plan.price}</span>
                    <span className="text-muted-foreground text-sm"> {plan.priceNote}</span>
                  </div>
                  <CardDescription className="mt-1">{plan.desc}</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col">
                  <ul className="space-y-2.5 flex-1">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm">
                        <Check className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                  <Link href="/auth/register" className="mt-6">
                    <Button
                      className="w-full"
                      variant={plan.popular ? "default" : "outline"}
                    >
                      {plan.cta}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20">
        <div className="container max-w-3xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Pertanyaan Umum</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Jawaban atas pertanyaan yang sering diajukan
            </p>
          </div>
          <div className="space-y-3">
            {faqs.map((faq, idx) => (
              <Card
                key={idx}
                className="cursor-pointer hover:shadow-sm transition-shadow"
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
              >
                <CardContent className="py-4">
                  <div className="flex items-center justify-between gap-4">
                    <h3 className="font-medium text-sm md:text-base">{faq.q}</h3>
                    <ChevronDown
                      className={cn(
                        "h-5 w-5 text-muted-foreground shrink-0 transition-transform",
                        openFaq === idx && "rotate-180"
                      )}
                    />
                  </div>
                  {openFaq === idx && (
                    <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                      {faq.a}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container text-center">
          <h2 className="text-3xl font-bold mb-4">Siap Mulai Karir Impianmu?</h2>
          <p className="text-lg opacity-90 mb-8 max-w-xl mx-auto">
            Bergabung dengan ribuan pencari kerja yang sudah merasakan kemudahan KERJA.ID
          </p>
          <Link href={isAuthenticated ? "/dashboard" : "/auth/register"}>
            <Button size="lg" variant="secondary" className="text-base px-8">
              {isAuthenticated ? "Ke Dashboard" : "Daftar Sekarang — Gratis!"}
            </Button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
