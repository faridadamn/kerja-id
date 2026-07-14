"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Eye, EyeOff, Check, X } from "lucide-react";

import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const registerSchema = z
  .object({
    fullName: z
      .string()
      .min(1, "Nama lengkap wajib diisi")
      .min(2, "Nama minimal 2 karakter"),
    email: z.string().min(1, "Email wajib diisi").email("Format email tidak valid"),
    password: z
      .string()
      .min(1, "Password wajib diisi")
      .min(8, "Password minimal 8 karakter"),
    confirmPassword: z.string().min(1, "Konfirmasi password wajib diisi"),
    agreeTerms: z.literal(true, {
      errorMap: () => ({ message: "Anda harus menyetujui syarat & ketentuan" }),
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Password tidak cocok",
    path: ["confirmPassword"],
  });

type RegisterValues = z.infer<typeof registerSchema>;

function getPasswordStrength(password: string): {
  score: number;
  label: string;
  color: string;
} {
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;

  if (score <= 1) return { score, label: "Lemah", color: "bg-red-500" };
  if (score <= 2) return { score, label: "Cukup", color: "bg-orange-500" };
  if (score <= 3) return { score, label: "Baik", color: "bg-yellow-500" };
  if (score <= 4) return { score, label: "Kuat", color: "bg-emerald-500" };
  return { score, label: "Sangat Kuat", color: "bg-emerald-600" };
}

function PasswordCriteria({ password }: { password: string }) {
  const checks = [
    { label: "Minimal 8 karakter", met: password.length >= 8 },
    { label: "Huruf besar & kecil", met: /[a-z]/.test(password) && /[A-Z]/.test(password) },
    { label: "Angka", met: /\d/.test(password) },
    { label: "Karakter khusus", met: /[^a-zA-Z0-9]/.test(password) },
  ];

  return (
    <ul className="space-y-1 mt-2">
      {checks.map((c) => (
        <li key={c.label} className="flex items-center gap-1.5 text-xs">
          {c.met ? (
            <Check className="h-3 w-3 text-emerald-500" />
          ) : (
            <X className="h-3 w-3 text-muted-foreground" />
          )}
          <span className={c.met ? "text-emerald-600" : "text-muted-foreground"}>
            {c.label}
          </span>
        </li>
      ))}
    </ul>
  );
}

export default function RegisterPage() {
  const router = useRouter();
  const { register: registerUser } = useAuth();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
      agreeTerms: false as unknown as true,
    },
  });

  const watchPassword = watch("password", "");
  const strength = useMemo(() => getPasswordStrength(watchPassword), [watchPassword]);

  const onSubmit = async (data: RegisterValues) => {
    try {
      await registerUser(data.fullName, data.email, data.password);
      toast({ title: "Akun berhasil dibuat!", description: "Selamat datang di KERJA.ID." });
      router.push("/dashboard");
    } catch (err: any) {
      const message =
        err?.response?.data?.message || err?.message || "Gagal mendaftar. Silakan coba lagi.";
      toast({
        variant: "destructive",
        title: "Registrasi gagal",
        description: message,
      });
    }
  };

  const handleGoogleRegister = async () => {
    setIsGoogleLoading(true);
    try {
      // TODO: implement Google SSO redirect
      toast({
        title: "Segera hadir",
        description: "Daftar dengan Google belum tersedia.",
      });
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <>
      <CardHeader className="px-0 pt-0">
        <CardTitle className="text-2xl">Buat Akun</CardTitle>
        <CardDescription>
          Daftar untuk mulai menggunakan KERJA.ID.
        </CardDescription>
      </CardHeader>

      <CardContent className="px-0 pb-0 space-y-6">
        {/* Google SSO */}
        <Button
          type="button"
          variant="outline"
          className="w-full h-11"
          onClick={handleGoogleRegister}
          disabled={isGoogleLoading || isSubmitting}
        >
          {isGoogleLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
          )}
          Daftar dengan Google
        </Button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <Separator />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">atau</span>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Full Name */}
          <div className="space-y-2">
            <Label htmlFor="fullName">Nama Lengkap</Label>
            <Input
              id="fullName"
              type="text"
              placeholder="John Doe"
              autoComplete="name"
              disabled={isSubmitting}
              {...register("fullName")}
            />
            {errors.fullName && (
              <p className="text-sm text-destructive">{errors.fullName.message}</p>
            )}
          </div>

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

          {/* Password */}
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Minimal 8 karakter"
                autoComplete="new-password"
                disabled={isSubmitting}
                {...register("password")}
              />
              <button
                type="button"
                tabIndex={-1}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && (
              <p className="text-sm text-destructive">{errors.password.message}</p>
            )}

            {/* Strength indicator */}
            {watchPassword.length > 0 && (
              <div className="space-y-1.5">
                <div className="flex gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div
                      key={i}
                      className={`h-1.5 flex-1 rounded-full transition-colors ${
                        i < strength.score ? strength.color : "bg-muted"
                      }`}
                    />
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  Kekuatan: <span className="font-medium">{strength.label}</span>
                </p>
                <PasswordCriteria password={watchPassword} />
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
                placeholder="Ulangi password"
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
                {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
            )}
          </div>

          {/* Terms */}
          <div className="flex items-start gap-2">
            <input
              id="agreeTerms"
              type="checkbox"
              className="mt-0.5 h-4 w-4 rounded border-input accent-emerald-600"
              disabled={isSubmitting}
              {...register("agreeTerms")}
            />
            <Label htmlFor="agreeTerms" className="font-normal text-sm leading-snug cursor-pointer">
              Saya menyetujui{" "}
              <Link
                href="/terms"
                className="text-emerald-600 hover:underline"
                target="_blank"
              >
                Syarat & Ketentuan
              </Link>{" "}
              dan{" "}
              <Link
                href="/privacy"
                className="text-emerald-600 hover:underline"
                target="_blank"
              >
                Kebijakan Privasi
              </Link>
            </Label>
          </div>
          {errors.agreeTerms && (
            <p className="text-sm text-destructive">{errors.agreeTerms.message}</p>
          )}

          {/* Submit */}
          <Button type="submit" className="w-full h-11" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Mendaftarkan...
              </>
            ) : (
              "Buat Akun"
            )}
          </Button>
        </form>

        {/* Login link */}
        <p className="text-center text-sm text-muted-foreground">
          Sudah punya akun?{" "}
          <Link
            href="/auth/login"
            className="font-medium text-emerald-600 hover:text-emerald-700 hover:underline"
          >
            Masuk
          </Link>
        </p>
      </CardContent>
    </>
  );
}
