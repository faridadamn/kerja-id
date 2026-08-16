"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, Loader2, Mail, CheckCircle2 } from "lucide-react";

import api from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const forgotSchema = z.object({
  email: z.string().min(1, "Email wajib diisi").email("Format email tidak valid"),
});

type ForgotValues = z.infer<typeof forgotSchema>;

export default function ForgotPasswordPage() {
  const { toast } = useToast();
  const [isSuccess, setIsSuccess] = useState(false);
  const [sentEmail, setSentEmail] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotValues>({
    resolver: zodResolver(forgotSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = async (data: ForgotValues) => {
    try {
      await api.post("/auth/forgot-password", { email: data.email });
      setSentEmail(data.email);
      setIsSuccess(true);
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Gagal mengirim email. Silakan coba lagi.";
      toast({
        variant: "destructive",
        title: "Gagal",
        description: message,
      });
    }
  };

  if (isSuccess) {
    return (
      <>
        <CardHeader className="px-0 pt-0 items-center text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100">
            <CheckCircle2 className="h-7 w-7 text-emerald-600" />
          </div>
          <CardTitle className="text-2xl">Email Terkirim</CardTitle>
          <CardDescription className="max-w-sm">
            Kami telah mengirimkan link reset password ke{" "}
            <span className="font-medium text-foreground">{sentEmail}</span>.
            Silakan cek inbox atau folder spam kamu.
          </CardDescription>
        </CardHeader>

        <CardContent className="px-0 pb-0 space-y-4">
          <Button asChild className="w-full h-11">
            <Link href="/auth/login">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Kembali ke Login
            </Link>
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            Tidak menerima email?{" "}
            <button
              type="button"
              className="font-medium text-emerald-600 hover:text-emerald-700 hover:underline"
              onClick={() => setIsSuccess(false)}
            >
              Kirim ulang
            </button>
          </p>
        </CardContent>
      </>
    );
  }

  return (
    <>
      <CardHeader className="px-0 pt-0">
        <CardTitle className="text-2xl">Lupa Password</CardTitle>
        <CardDescription>
          Masukkan email yang terdaftar. Kami akan mengirimkan link untuk reset password.
        </CardDescription>
      </CardHeader>

      <CardContent className="px-0 pb-0 space-y-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="nama@email.com"
              autoComplete="email"
              disabled={isSubmitting}
              {...register("email")}
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>

          {/* Submit */}
          <Button type="submit" className="w-full h-11" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Mengirim...
              </>
            ) : (
              <>
                <Mail className="mr-2 h-4 w-4" />
                Kirim Link Reset
              </>
            )}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          <Link
            href="/auth/login"
            className="font-medium text-emerald-600 hover:text-emerald-700 hover:underline inline-flex items-center gap-1"
          >
            <ArrowLeft className="h-3 w-3" />
            Kembali ke login
          </Link>
        </p>
      </CardContent>
    </>
  );
}
