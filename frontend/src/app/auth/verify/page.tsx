"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";

import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type Status = "loading" | "success" | "error";

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<Status>("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const token = searchParams.get("token");
    if (!token) {
      setStatus("error");
      setMessage("Token verifikasi tidak ditemukan.");
      return;
    }

    let cancelled = false;

    const verify = async () => {
      try {
        const res = await api.get<{ message: string }>(`/auth/verify`, {
          params: { token },
        });
        if (!cancelled) {
          setStatus("success");
          setMessage(res.data.message || "Email berhasil diverifikasi!");
        }
      } catch (err: any) {
        if (!cancelled) {
          setStatus("error");
          setMessage(
            err?.response?.data?.message ||
              "Token tidak valid atau sudah kadaluarsa."
          );
        }
      }
    };

    verify();

    return () => {
      cancelled = true;
    };
  }, [searchParams]);

  return (
    <>
      <CardHeader className="px-0 pt-0 items-center text-center">
        {/* Loading */}
        {status === "loading" && (
          <>
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100">
              <Loader2 className="h-7 w-7 text-emerald-600 animate-spin" />
            </div>
            <CardTitle className="text-2xl">Memverifikasi Email</CardTitle>
            <CardDescription>
              Memverifikasi email Anda, mohon tunggu...
            </CardDescription>
          </>
        )}

        {/* Success */}
        {status === "success" && (
          <>
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100">
              <CheckCircle className="h-7 w-7 text-emerald-600" />
            </div>
            <CardTitle className="text-2xl">Email Terverifikasi!</CardTitle>
            <CardDescription className="max-w-sm">{message}</CardDescription>
          </>
        )}

        {/* Error */}
        {status === "error" && (
          <>
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-100">
              <XCircle className="h-7 w-7 text-red-600" />
            </div>
            <CardTitle className="text-2xl">Verifikasi Gagal</CardTitle>
            <CardDescription className="max-w-sm">{message}</CardDescription>
          </>
        )}
      </CardHeader>

      <CardContent className="px-0 pb-0 space-y-4">
        {status === "success" && (
          <Button asChild className="w-full h-11">
            <Link href="/dashboard">Ke Dashboard</Link>
          </Button>
        )}

        {status === "error" && (
          <Button asChild variant="outline" className="w-full h-11">
            <Link href="/auth/login">Kembali ke Login</Link>
          </Button>
        )}
      </CardContent>
    </>
  );
}
