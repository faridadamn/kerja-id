"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Phone, ExternalLink, Heart, Shield, Clock, Star, AlertTriangle } from "lucide-react";

interface Partner {
  id: string;
  name: string;
  description: string;
  logo: string;
  services: string[];
  pricing: string;
  discount?: string;
  url: string;
  rating: number;
}

const partners: Partner[] = [
  {
    id: "1",
    name: "Halodoc",
    description: "Konsultasi dengan psikolog profesional via chat atau video call",
    logo: "🏥",
    services: ["Konsultasi Psikolog", "Terapi Online", "Assessment Mental Health"],
    pricing: "Mulai Rp 50.000",
    discount: "Diskon 20% untuk user KERJA.ID",
    url: "https://halodoc.com",
    rating: 4.7,
  },
  {
    id: "2",
    name: "Riliv",
    description: "Meditasi dan konseling mental health berbasis mindfulness",
    logo: "🧘",
    services: ["Meditasi Guided", "Konseling", "Self-Help Program"],
    pricing: "Mulai Rp 35.000/bulan",
    discount: "7 hari gratis untuk user baru",
    url: "https://riliv.co",
    rating: 4.5,
  },
  {
    id: "3",
    name: "Sama",
    description: "Platform kesehatan mental dengan pendekatan evidence-based",
    logo: "🧠",
    services: ["Terapi CBT", "Konseling Karir", "Group Therapy"],
    pricing: "Mulai Rp 100.000",
    discount: "Sesi pertama Rp 50.000",
    url: "https://sama.id",
    rating: 4.6,
  },
];

const hotlines = [
  { name: "Halo Kemkes", number: "1500-567", desc: "Layanan kesehatan 24 jam" },
  { name: "Into The Light", number: "021-7884-2580", desc: "Pencegahan bunuh diri" },
  { name: "LSM Jangan Bunuh Diri", number: "021-9696-9231", desc: "Crisis hotline 24/7" },
];

export default function ProfessionalHelpPage() {
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null);

  return (
    <div className="container py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Heart className="h-8 w-8 text-red-500" />
          Bantuan Profesional
        </h1>
        <p className="text-muted-foreground mt-2">
          Kesehatan mental sama pentingnya dengan kesehatan fisik. Jangan ragu untuk mencari bantuan.
        </p>
      </div>

      {/* Emergency Hotlines */}
      <Card className="border-red-200 bg-red-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-800">
            <AlertTriangle className="h-5 w-5" />
            Hotline Darurat
          </CardTitle>
          <CardDescription className="text-red-700">
            Jika kamu atau seseorang yang kamu kenal dalam bahaya, segera hubungi:
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-3">
            {hotlines.map((h) => (
              <div key={h.name} className="flex items-center gap-3 p-3 rounded-lg bg-white border">
                <Phone className="h-5 w-5 text-red-600" />
                <div>
                  <div className="font-semibold text-sm">{h.name}</div>
                  <div className="text-lg font-bold text-red-700">{h.number}</div>
                  <div className="text-xs text-muted-foreground">{h.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Partners */}
      <div>
        <h2 className="text-xl font-bold mb-4">Partner Kesehatan Mental</h2>
        <div className="grid md:grid-cols-3 gap-4">
          {partners.map((p) => (
            <Card key={p.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setSelectedPartner(p)}>
              <CardHeader>
                <div className="flex items-start gap-3">
                  <span className="text-3xl">{p.logo}</span>
                  <div>
                    <CardTitle className="text-lg">{p.name}</CardTitle>
                    <div className="flex items-center gap-1 mt-1">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm">{p.rating}</span>
                    </div>
                  </div>
                </div>
                <CardDescription className="mt-2">{p.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex flex-wrap gap-1">
                  {p.services.map((s) => (
                    <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>
                  ))}
                </div>
                <div className="text-sm font-medium">{p.pricing}</div>
                {p.discount && (
                  <div className="text-sm text-green-700 bg-green-50 rounded px-2 py-1">
                    🎉 {p.discount}
                  </div>
                )}
                <a href={p.url} target="_blank" rel="noopener noreferrer">
                  <Button className="w-full" variant="outline">
                    Kunjungi {p.name} <ExternalLink className="ml-2 h-4 w-4" />
                  </Button>
                </a>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Info */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start gap-3">
            <Shield className="h-6 w-6 text-primary mt-1" />
            <div>
              <h3 className="font-semibold mb-2">Privasi Terjamin</h3>
              <p className="text-sm text-muted-foreground">
                Semua sesi konseling bersifat rahasia dan dilindungi oleh undang-undang privasi.
                KERJA.ID tidak menyimpan data konselingmu. Partner kami adalah platform resmi
                dengan psikolog berlisensi.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
