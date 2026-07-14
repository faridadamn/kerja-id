import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/providers/auth-provider";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "KERJA.ID — Cari Kerja Gak Harus Susah",
  description: "Super-app pencari kerja Indonesia. CV optimizer, job aggregator, interview coach, dan banyak lagi.",
  keywords: ["kerja", "loker", "lowongan kerja", "indonesia", "cv", "interview", "karir"],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body className={inter.className}>
        <AuthProvider>
          {children}
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
