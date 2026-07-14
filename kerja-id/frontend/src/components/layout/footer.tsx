import Link from "next/link";
import { Briefcase } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t bg-muted/50">
      <div className="container py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <Link href="/" className="flex items-center gap-2 font-bold text-lg text-primary mb-4">
              <Briefcase className="h-5 w-5" />
              KERJA.ID
            </Link>
            <p className="text-sm text-muted-foreground">
              Cari kerja gak harus susah. Super-app pencari kerja Indonesia.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-3">Produk</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/jobs/search" className="hover:text-foreground">Cari Lowongan</Link></li>
              <li><Link href="/cv" className="hover:text-foreground">CV Optimizer</Link></li>
              <li><Link href="/tracker" className="hover:text-foreground">JobTracker</Link></li>
              <li><Link href="/salary" className="hover:text-foreground">Salary Insight</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-3">Komunitas</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/community" className="hover:text-foreground">Forum</Link></li>
              <li><Link href="/mentors" className="hover:text-foreground">Mentor</Link></li>
              <li><Link href="/micro-intern" className="hover:text-foreground">Micro Intern</Link></li>
              <li><Link href="/events" className="hover:text-foreground">Events</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-3">Perusahaan</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/about" className="hover:text-foreground">Tentang</Link></li>
              <li><Link href="/contact" className="hover:text-foreground">Kontak</Link></li>
              <li><Link href="/privacy" className="hover:text-foreground">Privasi</Link></li>
              <li><Link href="/terms" className="hover:text-foreground">Syarat & Ketentuan</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
          © 2026 KERJA.ID — All rights reserved.
        </div>
      </div>
    </footer>
  );
}
