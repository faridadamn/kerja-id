"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { timeAgo, cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Bell,
  BellRing,
  Check,
  CheckCheck,
  Briefcase,
  Clock,
  AlertCircle,
  Settings,
  Filter,
  Trash2,
  ExternalLink,
} from "lucide-react";

// Types
interface Notification {
  id: string;
  type: "JOB_ALERT" | "REMINDER" | "SYSTEM" | "APPLICATION_UPDATE";
  title: string;
  description: string;
  isRead: boolean;
  createdAt: string;
  link?: string;
  metadata?: Record<string, any>;
}

type FilterTab = "all" | "unread" | "job_alert" | "reminder" | "system";

const NOTIFICATION_ICONS: Record<string, React.ElementType> = {
  JOB_ALERT: Briefcase,
  REMINDER: Clock,
  SYSTEM: AlertCircle,
  APPLICATION_UPDATE: CheckCheck,
};

const NOTIFICATION_COLORS: Record<string, string> = {
  JOB_ALERT: "text-blue-600 bg-blue-50",
  REMINDER: "text-amber-600 bg-amber-50",
  SYSTEM: "text-purple-600 bg-purple-50",
  APPLICATION_UPDATE: "text-green-600 bg-green-50",
};

export default function NotificationsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<FilterTab>("all");
  const [markingAll, setMarkingAll] = useState(false);

  const fetchNotifications = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await api.get<Notification[]>("/alerts");
      setNotifications(res.data);
    } catch {
      // silent fail
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const markAsRead = async (id: string) => {
    try {
      await api.put(`/alerts/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
    } catch {
      // silent fail
    }
  };

  const markAllAsRead = async () => {
    setMarkingAll(true);
    try {
      const unread = notifications.filter((n) => !n.isRead);
      await Promise.all(unread.map((n) => api.put(`/alerts/${n.id}/read`)));
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch {
      // silent fail
    } finally {
      setMarkingAll(false);
    }
  };

  const handleClick = async (notification: Notification) => {
    if (!notification.isRead) {
      await markAsRead(notification.id);
    }
    if (notification.link) {
      router.push(notification.link);
    }
  };

  const filtered = notifications.filter((n) => {
    if (filter === "all") return true;
    if (filter === "unread") return !n.isRead;
    return n.type === filter;
  });

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  // Split into unread/read for display
  const unreadNotifications = filtered.filter((n) => !n.isRead);
  const readNotifications = filtered.filter((n) => n.isRead);

  const renderNotificationItem = (notification: Notification) => {
    const Icon = NOTIFICATION_ICONS[notification.type] || Bell;
    const colorClass = NOTIFICATION_COLORS[notification.type] || "text-gray-600 bg-gray-50";

    return (
      <div
        key={notification.id}
        onClick={() => handleClick(notification)}
        className={cn(
          "flex items-start gap-4 p-4 rounded-lg cursor-pointer transition-colors",
          "hover:bg-accent/50",
          !notification.isRead && "bg-blue-50/50 dark:bg-blue-950/20"
        )}
      >
        {/* Icon */}
        <div className={cn("flex-shrink-0 p-2 rounded-full", colorClass)}>
          <Icon className="h-5 w-5" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p
              className={cn(
                "text-sm leading-snug",
                !notification.isRead ? "font-semibold" : "font-medium"
              )}
            >
              {notification.title}
            </p>
            <div className="flex items-center gap-2 flex-shrink-0">
              {!notification.isRead && (
                <span className="h-2 w-2 rounded-full bg-blue-600" />
              )}
              {notification.link && (
                <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
              )}
            </div>
          </div>
          <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">
            {notification.description}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {timeAgo(notification.createdAt)}
          </p>
        </div>
      </div>
    );
  };

  const renderSkeleton = () => (
    <div className="space-y-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex items-start gap-4 p-4">
          <Skeleton className="h-9 w-9 rounded-full flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-1/4" />
          </div>
        </div>
      ))}
    </div>
  );

  const renderEmpty = () => (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="rounded-full bg-muted p-4 mb-4">
        <Bell className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="font-semibold text-lg">Tidak ada notifikasi</h3>
      <p className="text-sm text-muted-foreground mt-1 max-w-sm">
        {filter === "unread"
          ? "Semua notifikasi sudah dibaca. Kamu akan mendapat notifikasi baru saat ada kecocokan pekerjaan atau pengingat."
          : "Belum ada notifikasi. Kamu akan mendapat notifikasi saat ada kecocokan pekerjaan, pengingat, atau pembaruan sistem."}
      </p>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-6 max-w-3xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <BellRing className="h-6 w-6" />
            Pusat Notifikasi
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {unreadCount > 0
              ? `${unreadCount} notifikasi belum dibaca`
              : "Semua notifikasi sudah dibaca"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={markAllAsRead}
              disabled={markingAll}
            >
              <CheckCheck className="h-4 w-4 mr-2" />
              {markingAll ? "Memproses..." : "Tandai semua dibaca"}
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/alerts")}
            title="Preferensi Alert"
          >
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Filter Tabs */}
      <Tabs
        value={filter}
        onValueChange={(v) => setFilter(v as FilterTab)}
        className="mb-6"
      >
        <TabsList className="w-full overflow-x-auto flex-nowrap justify-start">
          <TabsTrigger value="all" className="flex items-center gap-1.5">
            <Filter className="h-3.5 w-3.5" />
            Semua
          </TabsTrigger>
          <TabsTrigger value="unread" className="flex items-center gap-1.5">
            <Bell className="h-3.5 w-3.5" />
            Belum Dibaca
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-1 h-5 min-w-5 px-1.5 text-xs">
                {unreadCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="JOB_ALERT" className="flex items-center gap-1.5">
            <Briefcase className="h-3.5 w-3.5" />
            Pekerjaan
          </TabsTrigger>
          <TabsTrigger value="REMINDER" className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" />
            Pengingat
          </TabsTrigger>
          <TabsTrigger value="SYSTEM" className="flex items-center gap-1.5">
            <AlertCircle className="h-3.5 w-3.5" />
            Sistem
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Notification List */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-4">{renderSkeleton()}</div>
          ) : filtered.length === 0 ? (
            renderEmpty()
          ) : (
            <div className="divide-y">
              {/* Unread Section */}
              {unreadNotifications.length > 0 && (
                <div>
                  <div className="px-4 py-2 bg-muted/50">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Belum Dibaca
                    </p>
                  </div>
                  <div className="divide-y">
                    {unreadNotifications.map(renderNotificationItem)}
                  </div>
                </div>
              )}

              {/* Read Section */}
              {readNotifications.length > 0 && (
                <div>
                  <div className="px-4 py-2 bg-muted/50">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Sudah Dibaca
                    </p>
                  </div>
                  <div className="divide-y">
                    {readNotifications.map(renderNotificationItem)}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Footer info */}
      {filtered.length > 0 && (
        <p className="text-xs text-muted-foreground text-center mt-4">
          Menampilkan {filtered.length} dari {notifications.length} notifikasi
        </p>
      )}
    </div>
  );
}
