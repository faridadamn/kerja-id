"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/api";
import type { CommunityGroupDetail, CommunityPost, CommunityMember } from "@/lib/types";
import { timeAgo } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Users,
  ArrowLeft,
  Heart,
  MessageSquare,
  Send,
  ExternalLink,
  Loader2,
  Globe,
  BookOpen,
  MapPin,
  GraduationCap,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const GROUP_TYPE_LABEL: Record<string, string> = {
  industry: "Industri",
  skill: "Skill",
  location: "Lokasi",
  alumni: "Alumni",
};

const GROUP_TYPE_ICON: Record<string, React.ReactNode> = {
  industry: <Globe className="h-4 w-4" />,
  skill: <BookOpen className="h-4 w-4" />,
  location: <MapPin className="h-4 w-4" />,
  alumni: <GraduationCap className="h-4 w-4" />,
};

/* ------------------------------------------------------------------ */
/*  Skeleton                                                           */
/* ------------------------------------------------------------------ */

function DetailSkeleton() {
  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-6xl mx-auto space-y-6">
      <Skeleton className="h-8 w-32" />
      <Card>
        <CardContent className="p-6 space-y-3">
          <Skeleton className="h-6 w-64" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </CardContent>
      </Card>
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-9 w-9 rounded-full" />
                  <Skeleton className="h-4 w-32" />
                </div>
                <Skeleton className="h-16 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div>
          <Card>
            <CardContent className="p-4 space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <Skeleton className="h-4 w-28" />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Post Card                                                          */
/* ------------------------------------------------------------------ */

function PostCard({
  post,
  onLike,
  onComment,
}: {
  post: CommunityPost;
  onLike: (id: string) => void;
  onComment: (id: string, text: string) => void;
}) {
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmitComment = async () => {
    if (!commentText.trim()) return;
    setSubmitting(true);
    try {
      await onComment(post.id, commentText);
      setCommentText("");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card>
      <CardContent className="p-4 space-y-3">
        {/* Author */}
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9">
            <AvatarImage src={post.authorPhotoUrl} alt={post.authorName} />
            <AvatarFallback className="text-xs">
              {post.authorName
                .split(" ")
                .map((n) => n[0])
                .join("")
                .slice(0, 2)}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-medium">{post.authorName}</p>
            <p className="text-xs text-muted-foreground">{timeAgo(post.createdAt)}</p>
          </div>
        </div>

        {/* Content */}
        <p className="text-sm leading-relaxed whitespace-pre-wrap">{post.content}</p>

        {/* Link */}
        {post.link && (
          <a
            href={post.link}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-sm text-primary hover:underline"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            {post.link}
          </a>
        )}

        {/* Actions */}
        <div className="flex items-center gap-4 pt-2 border-t">
          <button
            className={`flex items-center gap-1.5 text-sm transition-colors ${
              post.isLiked
                ? "text-red-500"
                : "text-muted-foreground hover:text-red-500"
            }`}
            onClick={() => onLike(post.id)}
          >
            <Heart
              className={`h-4 w-4 ${post.isLiked ? "fill-current" : ""}`}
            />
            {post.likes}
          </button>
          <button
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors"
            onClick={() => setShowComments(!showComments)}
          >
            <MessageSquare className="h-4 w-4" />
            {post.commentCount}
          </button>
        </div>

        {/* Comments section */}
        {showComments && (
          <div className="space-y-3 pt-2 border-t">
            {post.comments && post.comments.length > 0 ? (
              post.comments.map((comment) => (
                <div key={comment.id} className="flex gap-2">
                  <Avatar className="h-7 w-7 shrink-0">
                    <AvatarImage src={comment.authorPhotoUrl} alt={comment.authorName} />
                    <AvatarFallback className="text-[10px]">
                      {comment.authorName
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2">
                      <span className="text-xs font-medium">{comment.authorName}</span>
                      <span className="text-[10px] text-muted-foreground">
                        {timeAgo(comment.createdAt)}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">{comment.content}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-muted-foreground text-center py-2">
                Belum ada komentar
              </p>
            )}

            {/* Add comment */}
            <div className="flex gap-2">
              <Input
                placeholder="Tulis komentar..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmitComment();
                  }
                }}
                className="text-sm h-8"
              />
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8 shrink-0"
                disabled={!commentText.trim() || submitting}
                onClick={handleSubmitComment}
              >
                <Send className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/*  Member Sidebar Item                                                */
/* ------------------------------------------------------------------ */

function MemberItem({ member }: { member: CommunityMember }) {
  return (
    <div className="flex items-center gap-2.5">
      <Avatar className="h-8 w-8">
        <AvatarImage src={member.photoUrl} alt={member.name} />
        <AvatarFallback className="text-[10px]">
          {member.name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .slice(0, 2)}
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <p className="text-sm truncate">{member.name}</p>
      </div>
      {member.role === "admin" && (
        <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
          Admin
        </Badge>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function CommunityDetailPage() {
  const params = useParams();
  const router = useRouter();
  const groupId = params.id as string;

  const [group, setGroup] = useState<CommunityGroupDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // New post
  const [postContent, setPostContent] = useState("");
  const [postLink, setPostLink] = useState("");
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function fetchGroup() {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get<{ data: CommunityGroupDetail } | CommunityGroupDetail>(
          `/connect/community/${groupId}`
        );
        const d = res.data;
        const data = "data" in d ? (d as any).data : d;
        if (!cancelled) setGroup(data as CommunityGroupDetail);
      } catch {
        if (!cancelled) setError("Gagal memuat data komunitas.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchGroup();
    return () => { cancelled = true; };
  }, [groupId]);

  const handleCreatePost = async () => {
    if (!postContent.trim()) return;
    setPosting(true);
    try {
      const res = await api.post(`/connect/community/${groupId}/posts`, {
        content: postContent,
        link: postLink || undefined,
      });
      const newPost = res.data;
      setGroup((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          posts: [newPost, ...prev.posts],
        };
      });
      setPostContent("");
      setPostLink("");
    } catch {
      setError("Gagal membuat post. Silakan coba lagi.");
    } finally {
      setPosting(false);
    }
  };

  const handleLike = async (postId: string) => {
    try {
      await api.post(`/connect/community/${groupId}/posts/${postId}/like`);
      setGroup((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          posts: prev.posts.map((p) =>
            p.id === postId
              ? {
                  ...p,
                  isLiked: !p.isLiked,
                  likes: p.isLiked ? p.likes - 1 : p.likes + 1,
                }
              : p
          ),
        };
      });
    } catch {
      // silent
    }
  };

  const handleComment = async (postId: string, text: string) => {
    try {
      const res = await api.post(`/connect/community/${groupId}/posts/${postId}/comments`, {
        content: text,
      });
      const newComment = res.data;
      setGroup((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          posts: prev.posts.map((p) =>
            p.id === postId
              ? {
                  ...p,
                  comments: [...(p.comments || []), newComment],
                  commentCount: p.commentCount + 1,
                }
              : p
          ),
        };
      });
    } catch {
      // silent
    }
  };

  if (loading) return <DetailSkeleton />;

  if (error && !group) {
    return (
      <div className="p-4 md:p-6 lg:p-8 max-w-6xl mx-auto">
        <Button variant="ghost" onClick={() => router.back()} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> Kembali
        </Button>
        <Card>
          <CardContent className="py-16 text-center">
            <p className="text-muted-foreground">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!group) return null;

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-6xl mx-auto space-y-6">
      {/* Back button */}
      <Button variant="ghost" onClick={() => router.back()} className="gap-2">
        <ArrowLeft className="h-4 w-4" /> Kembali
      </Button>

      {/* Group Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0">
              {GROUP_TYPE_ICON[group.type] ?? <Users className="h-7 w-7" />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h1 className="text-xl md:text-2xl font-bold">{group.name}</h1>
                  <div className="flex items-center gap-3 mt-1">
                    <Badge variant="outline">{GROUP_TYPE_LABEL[group.type]}</Badge>
                    <span className="text-sm text-muted-foreground flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {group.memberCount.toLocaleString("id-ID")} anggota
                    </span>
                  </div>
                </div>
              </div>
              {group.description && (
                <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
                  {group.description}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error banner */}
      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Main content */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left - Posts */}
        <div className="lg:col-span-2 space-y-4">
          {/* Create post */}
          <Card>
            <CardContent className="p-4 space-y-3">
              <Textarea
                placeholder="Bagikan sesuatu dengan komunitas..."
                value={postContent}
                onChange={(e) => setPostContent(e.target.value)}
                rows={3}
              />
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Link opsional..."
                  value={postLink}
                  onChange={(e) => setPostLink(e.target.value)}
                  className="flex-1 h-9 text-sm"
                />
                <Button
                  onClick={handleCreatePost}
                  disabled={!postContent.trim() || posting}
                  size="sm"
                >
                  {posting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Send className="mr-1.5 h-3.5 w-3.5" />
                      Post
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Posts feed */}
          {group.posts && group.posts.length > 0 ? (
            group.posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onLike={handleLike}
                onComment={handleComment}
              />
            ))
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <MessageSquare className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground">
                  Belum ada postingan. Jadilah yang pertama!
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right - Members sidebar */}
        <div>
          <Card className="sticky top-4">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Users className="h-4 w-4" />
                Anggota ({group.members?.length ?? 0})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {group.members && group.members.length > 0 ? (
                <div className="space-y-3 max-h-[600px] overflow-y-auto">
                  {group.members.map((member) => (
                    <MemberItem key={member.id} member={member} />
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Belum ada anggota.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
