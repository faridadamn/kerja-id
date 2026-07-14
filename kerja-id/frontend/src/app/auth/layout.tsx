"use client";

import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left: branding panel (hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700 p-12 flex-col justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-3xl font-bold text-white tracking-tight">
            KERJA<span className="text-emerald-200">.ID</span>
          </span>
        </Link>

        <div className="space-y-6">
          <h1 className="text-4xl font-bold text-white leading-tight">
            Cari Kerja Gak Harus Susah.
          </h1>
          <p className="text-lg text-emerald-100 max-w-md">
            CV optimizer, job aggregator, interview coach — semua dalam satu platform untuk karirmu.
          </p>

          <div className="flex gap-8 pt-4">
            <div>
              <p className="text-3xl font-bold text-white">50K+</p>
              <p className="text-emerald-200 text-sm">Lowongan Aktif</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-white">12K+</p>
              <p className="text-emerald-200 text-sm">Pengguna</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-white">95%</p>
              <p className="text-emerald-200 text-sm">ATS Score Avg</p>
            </div>
          </div>
        </div>

        <p className="text-emerald-200 text-sm">
          &copy; {new Date().getFullYear()} KERJA.ID — All rights reserved.
        </p>
      </div>

      {/* Right: form area */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10 bg-background">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden mb-8 text-center">
            <Link href="/" className="inline-flex items-center gap-1">
              <span className="text-2xl font-bold text-foreground tracking-tight">
                KERJA<span className="text-emerald-600">.ID</span>
              </span>
            </Link>
          </div>

          {children}
        </div>
      </div>
    </div>
  );
}
