"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Users,
  MessageCircle,
  ThumbsUp,
  Plus,
  Shield,
  Heart,
  Send,
  UserCircle,
  Clock,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import api from "@/lib/api";
import { timeAgo } from "@/lib/utils";

interface CommunityPost {
  id: string;
  author: string;
  group: string;
  content: string;
  likes: number;
  replies: number;
  liked: boolean;
  createdAt: string;
  replyList?: Reply[];
}

interface Reply {
  id: string;
  author: string;
  content: string;
  likes: number;
  createdAt: string;
}

const GROUPS = [
  {
    id: "fresh-graduate",
    name: "Fresh Graduate Support",
    description: "Dukungan untuk lulusan baru yang memulai karir",
    emoji: "🎓",
    color: "bg-blue-100 text-blue-700",
  },
  {
    id: "career-changers",
    name: "Career Changers",
    description: "Berbagi pengalaman ganti karir",
    emoji: "🔄",
    color: "bg-purple-100 text-purple-700",
  },
  {
    id: "long-term-seekers",
    name: "Long-term Job Seekers",
    description: "Untuk yang sudah lama mencari kerja",
    emoji: "💪",
    color: "bg-amber-100 text-amber-700",
  },
];

const GUIDELINES = [
  "Jaga kesopanan dan saling menghormati",
  "Posting secara anonim jika lebih nyaman",
  "Dilarang spam atau promosi berlebihan",
  "Dukung sesama, jangan jatuhkan",
  "Lapor konten yang tidak pantas",
];

export default function CommunityPage() {
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeGroup, setActiveGroup] = useState("all");
  const [newPost, setNewPost] = useState("");
  const [posting, setPosting] = useState(false);
  const [showNewPost, setShowNewPost] = useState(false);
  const [expandedPost, setExpandedPost] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const res = await api.get<CommunityPost[]>("/wellness/community");
      setPosts(res.data);
    } catch {
      // Use mock data for demo
      setPosts([
        {
          id: "1",
          author: "Anonim",
          group: "fresh-graduate",
          content:
            "Hari ini dapat rejection ke-5 bulan ini. Awalnya sedih, tapi mulai sadar bahwa setiap rejection mengajarkan sesuatu. Keep going teman-teman! 💪",
          likes: 24,
          replies: 8,
          liked: false,
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          replyList: [
            {
              id: "r1",
              author: "Anonim",
              content: "Semangat ya! Aku juga di posisi yang sama. Kita pasti bisa! 🤗",
              likes: 5,
              createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
            },
          ],
        },
        {
          id: "2",
          author: "Anonim",
          group: "career-changers",
          content:
            "Setelah 5 tahun di accounting, akhirnya nekat switch ke UX Design. Bulan pertama bootcamp, rasanya overwhelmed banget. Tapi exciting! Ada yang pernah experience serupa?",
          likes: 31,
          replies: 12,
          liked: true,
          createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: "3",
          author: "Anonim",
          group: "long-term-seekers",
          content:
            "Sudah 8 bulan mencari kerja. Kadang ngerasa hopeless, tapi komunitas ini bikin aku ngerasa nggak sendirian. Terima kasih untuk semua yang selalu support. ❤️",
          likes: 45,
          replies: 15,
          liked: false,
          createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: "4",
          author: "Anonim",
          group: "fresh-graduate",
          content:
            "Tips dari aku: sebelum interview, riset dulu company culture-nya. Aku pernah ditolak karena ternyata value-nya nggak cocok, dan itu OKE. Lebih baik ditolak daripada masuk lingkungan yang toxic.",
          likes: 67,
          replies: 20,
          liked: false,
          createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async () => {
    if (!newPost.trim()) return;
    setPosting(true);
    try {
      const res = await api.post("/wellness/community", {
        content: newPost,
        group: activeGroup === "all" ? "fresh-graduate" : activeGroup,
      });
      setPosts((prev) => [res.data, ...prev]);
      setNewPost("");
      setShowNewPost(false);
    } catch {
      // Optimistic add
      const mockPost: CommunityPost = {
        id: Date.now().toString(),
        author: "Anonim",
        group: activeGroup === "all" ? "fresh-graduate" : activeGroup,
        content: newPost,
        likes: 0,
        replies: 0,
        liked: false,
        createdAt: new Date().toISOString(),
      };
      setPosts((prev) => [mockPost, ...prev]);
      setNewPost("");
      setShowNewPost(false);
    } finally {
      setPosting(false);
    }
  };

  const handleLike = async (postId: string) => {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? { ...p, liked: !p.liked, likes: p.liked ? p.likes - 1 : p.likes + 1 }
          : p
      )
    );
  };

  const filteredPosts =
    activeGroup === "all" ? posts : posts.filter((p) => p.group === activeGroup);

  return (
    <div className="container mx-auto max-w-6xl p-4 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/wellness">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Komunitas Dukungan</h1>
          <p className="text-muted-foreground">Berbagi cerita dan saling menguatkan</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-4">
          {/* Group Tabs */}
          <Tabs value={activeGroup} onValueChange={setActiveGroup}>
            <TabsList className="w-full justify-start overflow-x-auto">
              <TabsTrigger value="all">Semua</TabsTrigger>
              {GROUPS.map((g) => (
                <TabsTrigger key={g.id} value={g.id} className="gap-1">
                  <span>{g.emoji}</span>
                  <span className="hidden sm:inline">{g.name}</span>
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          {/* New Post Button */}
          {!showNewPost ? (
            <Button
              onClick={() => setShowNewPost(true)}
              className="w-full justify-start gap-2 bg-pink-600 hover:bg-pink-700"
            >
              <Plus className="h-4 w-4" />
              Bagikan pengalamanmu (anonim)
            </Button>
          ) : (
            <Card className="border-pink-200">
              <CardContent className="pt-6 space-y-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                  <UserCircle className="h-5 w-5" />
                  <span>Posting sebagai Anonim</span>
                </div>
                <Textarea
                  placeholder="Ceritakan pengalamanmu, berikan dukungan, atau tanyakan sesuatu..."
                  value={newPost}
                  onChange={(e) => setNewPost(e.target.value)}
                  rows={4}
                />
                <div className="flex gap-2 justify-end">
                  <Button variant="ghost" onClick={() => setShowNewPost(false)}>
                    Batal
                  </Button>
                  <Button
                    onClick={handleCreatePost}
                    disabled={!newPost.trim() || posting}
                    className="bg-pink-600 hover:bg-pink-700"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    {posting ? "Mengirim..." : "Kirim"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Posts List */}
          {loading ? (
            <div className="text-center py-12 text-muted-foreground">Memuat postingan...</div>
          ) : filteredPosts.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>Belum ada postingan di grup ini.</p>
              <p className="text-sm">Jadi yang pertama berbagi!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredPosts.map((post) => {
                const group = GROUPS.find((g) => g.id === post.group);
                return (
                  <Card key={post.id} className="hover:border-pink-200 transition-colors">
                    <CardContent className="pt-6 space-y-3">
                      {/* Post Header */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-400 to-purple-400 flex items-center justify-center text-white text-xs font-bold">
                            A
                          </div>
                          <div>
                            <span className="text-sm font-medium">{post.author}</span>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              {timeAgo(post.createdAt)}
                              {group && (
                                <Badge variant="secondary" className={`text-xs ${group.color}`}>
                                  {group.emoji} {group.name}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Post Content */}
                      <p className="text-sm leading-relaxed">{post.content}</p>

                      {/* Actions */}
                      <div className="flex items-center gap-4 pt-2 border-t">
                        <button
                          onClick={() => handleLike(post.id)}
                          className={`flex items-center gap-1.5 text-sm transition-colors ${
                            post.liked
                              ? "text-pink-600"
                              : "text-muted-foreground hover:text-pink-600"
                          }`}
                        >
                          <Heart
                            className={`h-4 w-4 ${post.liked ? "fill-current" : ""}`}
                          />
                          {post.likes}
                        </button>
                        <button
                          onClick={() =>
                            setExpandedPost(expandedPost === post.id ? null : post.id)
                          }
                          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-blue-600 transition-colors"
                        >
                          <MessageCircle className="h-4 w-4" />
                          {post.replies}
                        </button>
                      </div>

                      {/* Replies */}
                      {expandedPost === post.id && (
                        <div className="space-y-3 pt-3 border-t animate-in fade-in slide-in-from-top-2 duration-200">
                          {post.replyList?.map((reply) => (
                            <div
                              key={reply.id}
                              className="flex gap-2 p-2 rounded-lg bg-gray-50"
                            >
                              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-gray-400 to-gray-500 flex items-center justify-center text-white text-[10px] font-bold">
                                A
                              </div>
                              <div>
                                <div className="flex items-center gap-2 text-xs">
                                  <span className="font-medium">{reply.author}</span>
                                  <span className="text-muted-foreground">
                                    {timeAgo(reply.createdAt)}
                                  </span>
                                </div>
                                <p className="text-sm mt-0.5">{reply.content}</p>
                              </div>
                            </div>
                          ))}

                          {/* Reply Input */}
                          <div className="flex gap-2">
                            <input
                              type="text"
                              placeholder="Tulis balasan..."
                              value={replyText}
                              onChange={(e) => setReplyText(e.target.value)}
                              className="flex-1 text-sm rounded-md border border-input bg-background px-3 py-2"
                            />
                            <Button size="sm" disabled={!replyText.trim()}>
                              <Send className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Groups */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Grup Dukungan</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {GROUPS.map((group) => (
                <button
                  key={group.id}
                  onClick={() => setActiveGroup(group.id)}
                  className={`w-full text-left p-3 rounded-lg border transition-colors ${
                    activeGroup === group.id
                      ? "border-pink-300 bg-pink-50"
                      : "hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{group.emoji}</span>
                    <div>
                      <h4 className="text-sm font-medium">{group.name}</h4>
                      <p className="text-xs text-muted-foreground">{group.description}</p>
                    </div>
                  </div>
                </button>
              ))}
            </CardContent>
          </Card>

          {/* Guidelines */}
          <Card className="border-amber-200 bg-amber-50/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Shield className="h-4 w-4 text-amber-600" />
                Panduan Komunitas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {GUIDELINES.map((g, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <span className="text-amber-500 mt-0.5">•</span>
                    {g}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Statistik Komunitas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Anggota aktif</span>
                <span className="font-semibold">1,247</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Postingan minggu ini</span>
                <span className="font-semibold">89</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Dukungan diberikan</span>
                <span className="font-semibold">3,456</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
