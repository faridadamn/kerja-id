"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Star, Send, ArrowLeft } from "lucide-react";

export default function ReviewPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) {
      toast({ title: "Beri rating dulu ya", variant: "destructive" });
      return;
    }
    try {
      setSubmitting(true);
      await api.post(`/micro-intern/${params.id}/review`, { rating, comment });
      setSubmitted(true);
      toast({ title: "Review berhasil dikirim! Terima kasih 🙏" });
    } catch {
      toast({ title: "Gagal mengirim review", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="container py-8 max-w-lg mx-auto">
        <Card>
          <CardContent className="p-8 text-center space-y-4">
            <div className="text-5xl">🎉</div>
            <h2 className="text-2xl font-bold">Terima Kasih!</h2>
            <p className="text-muted-foreground">Review kamu sangat membantu untuk membangun komunitas yang lebih baik</p>
            <Button onClick={() => router.push("/micro-intern/my-projects")}>Kembali ke Projects</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-8 max-w-lg mx-auto space-y-6">
      <Button variant="ghost" onClick={() => router.back()}>
        <ArrowLeft className="h-4 w-4 mr-2" /> Kembali
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Beri Review</CardTitle>
          <CardDescription>Bagaimana pengalamanmu mengerjakan project ini?</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Star Rating */}
          <div className="space-y-2">
            <Label>Rating</Label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(star)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    className={`h-8 w-8 ${
                      star <= (hoverRating || rating)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                </button>
              ))}
            </div>
            {rating > 0 && (
              <p className="text-sm text-muted-foreground">
                {rating === 1 ? "😩 Kurang memuaskan" : rating === 2 ? "😟 Cukup" : rating === 3 ? "😐 Biasa saja" : rating === 4 ? "🙂 Bagus" : "😄 Luar biasa!"}
              </p>
            )}
          </div>

          {/* Comment */}
          <div className="space-y-2">
            <Label>Komentar (opsional)</Label>
            <Textarea
              placeholder="Ceritakan pengalamanmu bekerja di project ini..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={5}
            />
          </div>

          <Button onClick={handleSubmit} disabled={submitting || rating === 0} className="w-full">
            {submitting ? "Mengirim..." : "Kirim Review"}
            <Send className="ml-2 h-4 w-4" />
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
