"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  RefreshCw,
  Sparkles,
  MessageSquare,
  History,
  Trophy,
  Heart,
  Lightbulb,
  Copy,
  Check,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import api from "@/lib/api";
import { formatDate, timeAgo } from "@/lib/utils";

interface ReframeEntry {
  id: string;
  originalMessage: string;
  reframeResult: string;
  createdAt: string;
}

export default function ReframePage() {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [history, setHistory] = useState<ReframeEntry[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [copied, setCopied] = useState(false);
  const [totalReframes, setTotalReframes] = useState(0);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await api.get<ReframeEntry[]>("/wellness/reframe");
      setHistory(res.data);
      setTotalReframes(res.data.length);
    } catch {
      // Use mock data
      const mockHistory: ReframeEntry[] = [
        {
          id: "1",
          originalMessage:
            '"Terima kasih atas lamaran Anda, tetapi saat ini kami memilih kandidat lain yang lebih sesuai dengan kebutuhan posisi."',
          reframeResult:
            "Rejection ini bukan tentang nilai kamu sebagai pribadi. Perusahaan sedang mencari fit spesifik — mungkin dari segi pengalaman atau skill tertentu yang belum kamu miliki SAAT INI. Ini adalah data, bukan vonnis. Gunakan informasi ini untuk: 1) Mengasah skill yang diminta, 2) Mencari perusahaan yang lebih cocok dengan profilmu, 3) Memperbaiki CV atau interview skill. Kamu sudah sampai di tahap apply — itu artinya kamu berani mencoba. Banyak orang bahkan tidak sampai di sana.",
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: "2",
          originalMessage:
            "Setelah interview, HR bilang 'Kami akan menghubungi Anda' tapi tidak pernah ada kabar.",
          reframeResult:
            "Ghosting memang menyakitkan, tapi ini mencerminkan budaya perusahaan, bukan kualitasmu. Perusahaan yang menghargai kandidat akan memberikan kejelasan. Kamu layak mendapat tempat yang menghargai kamu sejak awal. Gunakan energi yang kamu habiskan untuk menunggu untuk: 1) Melamar ke tempat lain yang lebih menghargai, 2) Follow up sekali jika belum, 3) Fokus pada prospek yang sudah memberi kejelasan. Waktumu berharga — jangan dihabiskan untuk menunggu yang tidak pasti.",
          createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        },
      ];
      setHistory(mockHistory);
      setTotalReframes(12);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleReframe = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setResult(null);

    try {
      const res = await api.post<{ reframe: string }>("/wellness/reframe", {
        message: input,
      });
      setResult(res.data.reframe);
    } catch {
      // Mock response
      await new Promise((r) => setTimeout(r, 1500));
      const mockReframe = `Kamu baru saja menghadapi penolakan, dan itu memang tidak mudah. Tapi mari kita lihat dari sudut pandang berbeda:

**Perspektif Baru:**
Penolakan ini bukan akhir dari perjalananmu — ini adalah bagian dari proses. Setiap orang sukses pernah ditolak berkali-kali sebelum menemukan tempat yang tepat.

**Yang Bisa Kamu Ambil:**
• Ini bukan tentang kamu secara personal — ini tentang fit antara kamu dan posisi saat ini
• Setiap rejection membawa data berharga tentang apa yang perlu ditingkatkan
• Kamu sudah berani mencoba, dan itu sendiri sudah merupakan langkah besar

**Langkah Selanjutnya:**
1. Ambil waktu sejenak untuk merasakan — tidak apa-apa kecewa
2. Refleksi: apakah ada feedback yang bisa digunakan?
3. Bangkit dan lanjutkan — tempat yang tepat sedang menunggumu

Kamu lebih kuat dari yang kamu kira. 💪`;
      setResult(mockReframe);

      // Add to history
      const newEntry: ReframeEntry = {
        id: Date.now().toString(),
        originalMessage: input,
        reframeResult: mockReframe,
        createdAt: new Date().toISOString(),
      };
      setHistory((prev) => [newEntry, ...prev]);
      setTotalReframes((prev) => prev + 1);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="container mx-auto max-w-6xl p-4 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/wellness">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Rejection Reframe</h1>
          <p className="text-muted-foreground">
            Ubah penolakan menjadi pelajaran dan kekuatan
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Input Card */}
          <Card className="border-amber-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <MessageSquare className="h-5 w-5 text-amber-500" />
                Ceritakan Situasimu
              </CardTitle>
              <CardDescription>
                Paste pesan penolakan atau ceritakan situasi yang kamu alami
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder='Contoh: "Terima kasih atas lamaran Anda, tetapi saat ini kami memilih kandidat lain..."'
                value={input}
                onChange={(e) => setInput(e.target.value)}
                rows={5}
              />
              <Button
                onClick={handleReframe}
                disabled={!input.trim() || loading}
                className="w-full bg-amber-500 hover:bg-amber-600 text-white"
              >
                {loading ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Sedang memproses...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Reframe
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Result */}
          {result && (
            <Card className="border-green-200 bg-green-50/50 animate-in fade-in slide-in-from-top-4 duration-300">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Lightbulb className="h-5 w-5 text-green-600" />
                    Reframe
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCopy(result)}
                    className="text-xs"
                  >
                    {copied ? (
                      <>
                        <Check className="h-3 w-3 mr-1" /> Tersalin
                      </>
                    ) : (
                      <>
                        <Copy className="h-3 w-3 mr-1" /> Salin
                      </>
                    )}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none">
                  {result.split("\n").map((line, i) => {
                    if (line.startsWith("**") && line.endsWith("**")) {
                      return (
                        <h4 key={i} className="font-semibold text-green-800 mt-3 mb-1">
                          {line.replace(/\*\*/g, "")}
                        </h4>
                      );
                    }
                    if (line.startsWith("•") || line.startsWith("1.") || line.startsWith("2.") || line.startsWith("3.")) {
                      return (
                        <p key={i} className="text-sm ml-4 mb-0.5">
                          {line}
                        </p>
                      );
                    }
                    if (line.trim() === "") return <br key={i} />;
                    return (
                      <p key={i} className="text-sm mb-1">
                        {line}
                      </p>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* History */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <History className="h-5 w-5 text-blue-500" />
                Riwayat Reframe
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loadingHistory ? (
                <div className="text-center py-8 text-muted-foreground">Memuat...</div>
              ) : history.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <History className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>Belum ada riwayat reframe.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {history.map((entry) => (
                    <div key={entry.id} className="border rounded-lg overflow-hidden">
                      <div className="p-4 bg-gray-50 border-b">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm text-muted-foreground italic line-clamp-2">
                            &ldquo;{entry.originalMessage}&rdquo;
                          </p>
                          <span className="text-xs text-muted-foreground whitespace-nowrap">
                            {timeAgo(entry.createdAt)}
                          </span>
                        </div>
                      </div>
                      <div className="p-4">
                        <p className="text-sm leading-relaxed line-clamp-4">
                          {entry.reframeResult}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Motivational Stats */}
          <Card className="border-pink-200 bg-gradient-to-br from-pink-50 to-white">
            <CardContent className="pt-6 text-center space-y-4">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-pink-100">
                <Trophy className="h-8 w-8 text-pink-600" />
              </div>
              <div>
                <p className="text-3xl font-bold text-pink-600">{totalReframes}</p>
                <p className="text-sm text-muted-foreground">Reframe sudah kamu lalui</p>
              </div>
              <div className="p-3 rounded-lg bg-pink-100/50">
                <p className="text-sm font-medium text-pink-800">
                  Kamu sudah melewati {totalReframes} rejection dan tetap kuat! 💪
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Tips */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Tips Reframe</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-2">
                <span className="text-lg">📝</span>
                <p className="text-sm">
                  Paste pesan email rejection secara lengkap untuk hasil terbaik
                </p>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-lg">💭</span>
                <p className="text-sm">
                  Ceritakan juga perasaanmu, bukan hanya faktanya
                </p>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-lg">🔄</span>
                <p className="text-sm">
                  Reframe bisa dilakukan berkali-kali untuk situasi yang sama
                </p>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-lg">❤️</span>
                <p className="text-sm">
                  Tidak apa-apa merasa kecewa — yang penting kamu bangkit lagi
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Quick Affirmations */}
          <Card className="border-purple-200 bg-purple-50/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Heart className="h-4 w-4 text-purple-500" />
                Afirmasi Hari Ini
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                "Rejection adalah re-direction, bukan re-jection.",
                "Setiap 'tidak' membawamu lebih dekat ke 'ya' yang tepat.",
                "Nilaimu tidak ditentukan oleh satu keputusan orang lain.",
              ].map((aff, i) => (
                <div
                  key={i}
                  className="p-3 rounded-lg bg-white border border-purple-100 text-sm italic text-purple-800"
                >
                  &ldquo;{aff}&rdquo;
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
