"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { useAuth } from "@/hooks/use-auth";
import type { Profile } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Settings,
  Shield,
  Bell,
  AlertTriangle,
  Lock,
  Mail,
  Eye,
  EyeOff,
  Save,
  Trash2,
  User,
  Globe,
  Phone,
  DollarSign,
  CheckCircle2,
  Loader2,
} from "lucide-react";

/* ── component ─────────────────────────────────────────────────────── */

export default function SettingsPage() {
  const { user, fetchUser } = useAuth();

  /* ── privacy state ──────────────────────────────────────────────── */
  const [privacy, setPrivacy] = useState({
    isPublic: true,
    showEmail: false,
    showPhone: false,
    showSalary: false,
  });
  const [profileLoaded, setProfileLoaded] = useState(false);

  /* ── password state ─────────────────────────────────────────────── */
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);

  /* ── notification state ─────────────────────────────────────────── */
  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    pushAlerts: true,
    digestFrequency: "daily" as "daily" | "weekly" | "never",
  });

  /* ── delete state ───────────────────────────────────────────────── */
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleteText, setDeleteText] = useState("");

  /* ── ui state ───────────────────────────────────────────────────── */
  const [saving, setSaving] = useState(false);
  const [changingPw, setChangingPw] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  /* ── load profile ───────────────────────────────────────────────── */
  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await api.get<Profile>("/profile/me");
        const p = res.data;
        setPrivacy({
          isPublic: p.isPublic ?? true,
          showEmail: p.showEmail ?? false,
          showPhone: p.showPhone ?? false,
          showSalary: p.showSalary ?? false,
        });
      } catch {
        // silent
      } finally {
        setProfileLoaded(true);
      }
    }
    loadProfile();
  }, []);

  /* ── flash message helper ───────────────────────────────────────── */
  function flash(type: "success" | "error", msg: string) {
    if (type === "success") setSuccessMsg(msg);
    else setErrorMsg(msg);
    setTimeout(() => {
      setSuccessMsg("");
      setErrorMsg("");
    }, 4000);
  }

  /* ── save privacy ───────────────────────────────────────────────── */
  async function handleSavePrivacy() {
    setSaving(true);
    try {
      await api.put("/profile/me", privacy);
      flash("success", "Pengaturan privasi berhasil disimpan");
    } catch {
      flash("error", "Gagal menyimpan pengaturan privasi");
    } finally {
      setSaving(false);
    }
  }

  /* ── change password ────────────────────────────────────────────── */
  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!currentPassword || !newPassword) {
      flash("error", "Semua field wajib diisi");
      return;
    }
    if (newPassword.length < 8) {
      flash("error", "Password baru minimal 8 karakter");
      return;
    }
    if (newPassword !== confirmPassword) {
      flash("error", "Konfirmasi password tidak cocok");
      return;
    }

    setChangingPw(true);
    try {
      await api.post("/auth/change-password", { currentPassword, newPassword });
      flash("success", "Password berhasil diubah");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Gagal mengubah password";
      flash("error", msg);
    } finally {
      setChangingPw(false);
    }
  }

  /* ── delete account ─────────────────────────────────────────────── */
  async function handleDeleteAccount() {
    if (deleteText !== "HAPUS") return;
    setDeleting(true);
    try {
      await api.delete("/auth/me");
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      window.location.href = "/auth/login";
    } catch {
      flash("error", "Gagal menghapus akun. Silakan coba lagi.");
      setDeleting(false);
    }
  }

  /* ── loading skeleton ───────────────────────────────────────────── */
  if (!profileLoaded) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  /* ── render ──────────────────────────────────────────────────────── */
  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto space-y-6">
      {/* header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Settings className="h-6 w-6 text-primary" />
          Pengaturan
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Kelola akun, privasi, dan preferensi notifikasi
        </p>
      </div>

      {/* flash messages */}
      {successMsg && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          {successMsg}
        </div>
      )}
      {errorMsg && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-red-800 text-sm">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          {errorMsg}
        </div>
      )}

      <Tabs defaultValue="account" className="space-y-4">
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="account" className="gap-1.5">
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">Akun</span>
          </TabsTrigger>
          <TabsTrigger value="privacy" className="gap-1.5">
            <Shield className="h-4 w-4" />
            <span className="hidden sm:inline">Privasi</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-1.5">
            <Bell className="h-4 w-4" />
            <span className="hidden sm:inline">Notifikasi</span>
          </TabsTrigger>
          <TabsTrigger value="danger" className="gap-1.5">
            <AlertTriangle className="h-4 w-4" />
            <span className="hidden sm:inline">Danger</span>
          </TabsTrigger>
        </TabsList>

        {/* ── Account Tab ────────────────────────────────────────────── */}
        <TabsContent value="account" className="space-y-4">
          {/* email */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email
              </CardTitle>
              <CardDescription>Email akun kamu (tidak bisa diubah)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <Input value={user?.email || ""} disabled className="max-w-sm bg-muted" />
                {user?.emailVerified && (
                  <Badge variant="success" className="shrink-0">Terverifikasi</Badge>
                )}
              </div>
            </CardContent>
          </Card>

          {/* change password */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Lock className="h-4 w-4" />
                Ubah Password
              </CardTitle>
              <CardDescription>Pastikan password baru minimal 8 karakter</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleChangePassword} className="space-y-4 max-w-sm">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Password Saat Ini</Label>
                  <div className="relative">
                    <Input
                      id="currentPassword"
                      type={showCurrentPw ? "text" : "password"}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Masukkan password lama"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPw(!showCurrentPw)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showCurrentPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newPassword">Password Baru</Label>
                  <div className="relative">
                    <Input
                      id="newPassword"
                      type={showNewPw ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Minimal 8 karakter"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPw(!showNewPw)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showNewPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Konfirmasi Password Baru</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Ulangi password baru"
                  />
                </div>
                <Button type="submit" disabled={changingPw}>
                  {changingPw ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Menyimpan...
                    </>
                  ) : (
                    <>
                      <Lock className="h-4 w-4 mr-2" />
                      Ubah Password
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Privacy Tab ───────────────────────────────────────────── */}
        <TabsContent value="privacy" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Pengaturan Privasi
              </CardTitle>
              <CardDescription>Atur siapa yang bisa melihat informasi profil kamu</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    Profil Publik
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Profil kamu bisa dilihat oleh employer dan pengguna lain
                  </p>
                </div>
                <Switch
                  checked={privacy.isPublic}
                  onCheckedChange={(v) => setPrivacy((p) => ({ ...p, isPublic: v }))}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Tampilkan Email
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Email kamu akan terlihat di profil publik
                  </p>
                </div>
                <Switch
                  checked={privacy.showEmail}
                  onCheckedChange={(v) => setPrivacy((p) => ({ ...p, showEmail: v }))}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    Tampilkan Nomor Telepon
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Nomor telepon akan terlihat di profil publik
                  </p>
                </div>
                <Switch
                  checked={privacy.showPhone}
                  onCheckedChange={(v) => setPrivacy((p) => ({ ...p, showPhone: v }))}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Tampilkan Ekspektasi Gaji
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Ekspektasi gaji akan terlihat di profil publik
                  </p>
                </div>
                <Switch
                  checked={privacy.showSalary}
                  onCheckedChange={(v) => setPrivacy((p) => ({ ...p, showSalary: v }))}
                />
              </div>
              <div className="pt-2">
                <Button onClick={handleSavePrivacy} disabled={saving}>
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Menyimpan...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Simpan Privasi
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Notifications Tab ──────────────────────────────────────── */}
        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Bell className="h-4 w-4" />
                Preferensi Notifikasi
              </CardTitle>
              <CardDescription>Atur bagaimana kamu ingin menerima notifikasi</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Email Alerts</Label>
                  <p className="text-sm text-muted-foreground">
                    Terima notifikasi penting via email
                  </p>
                </div>
                <Switch
                  checked={notifications.emailAlerts}
                  onCheckedChange={(v) =>
                    setNotifications((n) => ({ ...n, emailAlerts: v }))
                  }
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Push Alerts</Label>
                  <p className="text-sm text-muted-foreground">
                    Terima notifikasi push di browser
                  </p>
                </div>
                <Switch
                  checked={notifications.pushAlerts}
                  onCheckedChange={(v) =>
                    setNotifications((n) => ({ ...n, pushAlerts: v }))
                  }
                />
              </div>
              <Separator />
              <div className="space-y-3">
                <Label className="text-base">Digest Frequency</Label>
                <p className="text-sm text-muted-foreground">
                  Seberapa sering kamu ingin menerima ringkasan aktivitas
                </p>
                <div className="flex gap-2">
                  {(["daily", "weekly", "never"] as const).map((freq) => (
                    <button
                      key={freq}
                      onClick={() =>
                        setNotifications((n) => ({ ...n, digestFrequency: freq }))
                      }
                      className={`px-4 py-2 rounded-md text-sm font-medium border transition-colors ${
                        notifications.digestFrequency === freq
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-background text-foreground border-input hover:bg-accent"
                      }`}
                    >
                      {freq === "daily" ? "Harian" : freq === "weekly" ? "Mingguan" : "Tidak"}
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Danger Zone Tab ────────────────────────────────────────── */}
        <TabsContent value="danger" className="space-y-4">
          <Card className="border-red-200">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2 text-red-600">
                <AlertTriangle className="h-4 w-4" />
                Danger Zone
              </CardTitle>
              <CardDescription>
                Tindakan di bawah ini tidak bisa dibatalkan
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                <h4 className="font-semibold text-red-800 mb-1">Hapus Akun</h4>
                <p className="text-sm text-red-700 mb-4">
                  Menghapus akun akan menghilangkan semua data kamu secara permanen,
                  termasuk profil, lamaran, CV, dan seluruh riwayat. Tindakan ini tidak
                  bisa dibatalkan.
                </p>

                {!deleteConfirm ? (
                  <Button
                    variant="destructive"
                    onClick={() => setDeleteConfirm(true)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Hapus Akun Saya
                  </Button>
                ) : (
                  <div className="space-y-3">
                    <p className="text-sm font-medium text-red-800">
                      Ketik <span className="font-bold">HAPUS</span> untuk mengonfirmasi:
                    </p>
                    <Input
                      value={deleteText}
                      onChange={(e) => setDeleteText(e.target.value)}
                      placeholder="Ketik HAPUS"
                      className="max-w-xs border-red-300 focus-visible:ring-red-500"
                      autoFocus
                    />
                    <div className="flex gap-2">
                      <Button
                        variant="destructive"
                        disabled={deleteText !== "HAPUS" || deleting}
                        onClick={handleDeleteAccount}
                      >
                        {deleting ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Menghapus...
                          </>
                        ) : (
                          <>
                            <Trash2 className="h-4 w-4 mr-2" />
                            Ya, Hapus Permanen
                          </>
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setDeleteConfirm(false);
                          setDeleteText("");
                        }}
                      >
                        Batal
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
