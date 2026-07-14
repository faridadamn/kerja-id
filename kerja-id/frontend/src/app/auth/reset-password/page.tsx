"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CheckCircle, Lock, Loader2, Eye, EyeOff } from "lucide-react";

import api from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const resetSchema = z
  .object({
    newPassword: z
      .string()
      .min(1, "Password wajib diisi")
      .min(8, "Password minimal 8 karakter"),
    confirmPassword: z.string().min(1, "Konfirmasi password wajib diisi"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Password tidak cocok",
    path: ["confirmPassword"],
  });

type ResetValues = z.infer<typeof resetSchema>;

function getPasswordStrength(password: string): {
  label: string;
  color: string;
  percent: number;
} {
  if (!password) return { label: "", color: "bg-muted", percent: 0 };
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 1) return { label: "Lemah", color: "bg-red-500", percent: 25 };
  if (score === 2) return { label: "Sedang", color: "bg-yellow-500", percent: 50 };
  if (score === 3) return { label: "Kuat", color: "bg-emerald-500", percent: 75 };
  return { label: "Sangat Kuat", color: "bg-emerald-600", percent: 100 };
}

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [isSuccess, setIsSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [tokenValid, setTokenValid] = useState(true);

  const token = searchParams.get("token");

  useEffect(() => {
    if (!token) {
      setTokenValid(false);
    }
  }, [token]);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ResetValues>({
    resolver: zodResolver(resetSchema),
    defaultValues: { newPassword: "", confirmPassword: "" },
  });

  const watchPassword = watch("newPassword");
  const strength = getPasswordStrength(watchPassword);

  // Redirect to login after 3s on success
  useEffect(() => {
    if (!isSuccess) return;
    const timer = setTimeout(() => {
      router.push("/auth/login");
    }, 3000);
    return () => clearTimeout(timer);
  }, [isSuccess, router]);

  const onSubmit = async (data: ResetValues) => {
    if (!token) return;
    try {
      await api.post<{ message: string }>("/auth/reset-password", {
        token,
        newPassword: data.newPassword,
      });
      setIsSuccess(true);
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Gagal mereset password. Token mungkin sudah kadaluarsa.";
      toast({
        variant: "destructive",
        title: "Gagal",
        description: message,
      });
    }
  };

  // No token
  if (!tokenValid) {
    return (
      <>
        <CardHeader className="px-0 pt-0 items-center text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-100">
            <Lock className="h-7 w-7 text-red-600" />
          </div>
          <CardTitle className="text-2xl">Link Tidak Valid</CardTitle>
          <CardDescription>
            Token reset password tidak ditemukan atau tidak valid.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-0 pb-0">
          <Button asChild variant="outline" className="w-full h-11">
            <Link href="/auth/login">Kembali ke Login</Link>
          </Button>
        </CardContent>
      </>
    );
  }

  // Success
  if (isSuccess) {
    return (
      <>
        <CardHeader className="px-0 pt-0 items-center text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100">
            <CheckCircle className="h-7 w-7 text-emerald-600" />
          </div>
          <CardTitle className="text-2xl">Password Berhasil Direset!</CardTitle>
          <CardDescription>
            Kamu akan dialihkan ke halaman login dalam beberapa detik.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-0 pb-0">
          <Button asChild className="w-full h-11">
            <Link href="/auth/login">Ke Login</Link>
          </Button>
        </CardContent>
      </>
    );
  }

  // Form
  return (
    <>
      <CardHeader className="px-0 pt-0">
        <CardTitle className="text-2xl">Reset Password</CardTitle>
        <CardDescription>
          Masukkan password baru untuk akun kamu.
        </CardDescription>
      </CardHeader>

      <CardContent className="px-0 pb-0 space-y-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* New Password */}
          <div className="space-y-2">
            <Label htmlFor="newPassword">Password Baru</Label>
            <div className="relative">
              <Input
                id="newPassword"
                type={showPassword ? "text" : "password"}
                placeholder="Minimal 8 karakter"
                autoComplete="new-password"
                disabled={isSubmitting}
                {...register("newPassword")}
              />
              <button
                type="button"
                tabIndex={-1}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {errors.newPassword && (
              <p className="text-sm text-destructive">
                {errors.newPassword.message}
              </p>
            )}

            {/* Strength indicator */}
            {watchPassword && (
              <div className="space-y-1">
                <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${strength.color}`}
                    style={{ width: `${strength.percent}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Kekuatan:{" "}
                  <span className="font-medium">{strength.label}</span>
                </p>
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Konfirmasi Password</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirm ? "text" : "password"}
                placeholder="Ulangi password baru"
                autoComplete="new-password"
                disabled={isSubmitting}
                {...register("confirmPassword")}
              />
              <button
                type="button"
                tabIndex={-1}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                onClick={() => setShowConfirm(!showConfirm)}
              >
                {showConfirm ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-sm text-destructive">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          {/* Submit */}
          <Button type="submit" className="w-full h-11" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Memproses...
              </>
            ) : (
              <>
                <Lock className="mr-2 h-4 w-4" />
                Reset Password
              </>
            )}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          <Link
            href="/auth/login"
            className="font-medium text-emerald-600 hover:text-emerald-700 hover:underline"
          >
            Kembali ke login
          </Link>
        </p>
      </CardContent>
    </>
  );
}
