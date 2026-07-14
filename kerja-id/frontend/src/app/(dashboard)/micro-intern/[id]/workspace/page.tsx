"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import api from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, Clock, Upload, MessageSquare, FileText, Send } from "lucide-react";

interface Milestone {
  id: string;
  title: string;
  deliverable: string;
  deadline: string;
  status: "PENDING" | "IN_PROGRESS" | "SUBMITTED" | "APPROVED" | "REJECTED";
}

interface Submission {
  id: string;
  milestoneId: string;
  files: string[];
  submittedAt: string;
  feedback?: string;
}

interface Message {
  id: string;
  sender: "me" | "employer";
  content: string;
  createdAt: string;
}

export default function ProjectWorkspacePage() {
  const params = useParams();
  const { toast } = useToast();
  const [tab, setTab] = useState("milestones");
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [params.id]);

  const fetchData = async () => {
    try {
      const res = await api.get(`/micro-intern/${params.id}/workspace`);
      setMilestones(res.data.milestones || []);
      setMessages(res.data.messages || []);
    } catch {
      // Demo data
      setMilestones([
        { id: "1", title: "Wireframe & Mockup", deliverable: "Figma file dengan 5 halaman", deadline: "2026-07-20", status: "APPROVED" },
        { id: "2", title: "UI Development", deliverable: "React components + responsive", deadline: "2026-07-27", status: "IN_PROGRESS" },
        { id: "3", title: "Integration & Testing", deliverable: "API integration + unit tests", deadline: "2026-08-03", status: "PENDING" },
      ]);
      setMessages([
        { id: "1", sender: "employer", content: "Halo! Selamat diterima di project ini. Silakan mulai dari wireframe dulu ya.", createdAt: "2026-07-14T10:00:00Z" },
        { id: "2", sender: "me", content: "Siap! Saya mulai hari ini.", createdAt: "2026-07-14T10:05:00Z" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const submitDeliverable = async (milestoneId: string) => {
    try {
      await api.post(`/micro-intern/${params.id}/submit`, { milestoneId });
      toast({ title: "Deliverable berhasil dikirim!" });
      fetchData();
    } catch {
      toast({ title: "Gagal mengirim deliverable", variant: "destructive" });
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;
    try {
      await api.post(`/micro-intern/${params.id}/messages`, { content: newMessage });
      setMessages([...messages, { id: Date.now().toString(), sender: "me", content: newMessage, createdAt: new Date().toISOString() }]);
      setNewMessage("");
    } catch {
      toast({ title: "Gagal mengirim pesan", variant: "destructive" });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "APPROVED": return "bg-green-100 text-green-800";
      case "SUBMITTED": return "bg-blue-100 text-blue-800";
      case "IN_PROGRESS": return "bg-yellow-100 text-yellow-800";
      case "REJECTED": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="container py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Project Workspace</h1>
        <p className="text-muted-foreground">Kelola milestone, kumpulkan deliverable, dan komunikasi dengan employer</p>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="milestones">Milestone</TabsTrigger>
          <TabsTrigger value="chat">Chat</TabsTrigger>
          <TabsTrigger value="submissions">Riwayat Submit</TabsTrigger>
        </TabsList>

        <TabsContent value="milestones" className="space-y-4">
          {milestones.map((m, i) => (
            <Card key={m.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="mt-1">
                      {m.status === "APPROVED" ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : m.status === "IN_PROGRESS" ? (
                        <Clock className="h-5 w-5 text-yellow-500" />
                      ) : (
                        <div className="h-5 w-5 rounded-full border-2 border-gray-300" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold">Milestone {i + 1}: {m.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1">Deliverable: {m.deliverable}</p>
                      <p className="text-xs text-muted-foreground mt-1">Deadline: {new Date(m.deadline).toLocaleDateString("id-ID")}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusColor(m.status)}>{m.status.replace("_", " ")}</Badge>
                    {(m.status === "IN_PROGRESS" || m.status === "PENDING") && (
                      <Button size="sm" onClick={() => submitDeliverable(m.id)}>
                        <Upload className="h-4 w-4 mr-1" /> Submit
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="chat" className="space-y-4">
          <Card>
            <CardContent className="p-4">
              <div className="space-y-3 max-h-96 overflow-y-auto mb-4">
                {messages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.sender === "me" ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[70%] rounded-lg px-4 py-2 ${msg.sender === "me" ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                      <p className="text-sm">{msg.content}</p>
                      <p className="text-xs opacity-70 mt-1">{new Date(msg.createdAt).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Separator className="mb-3" />
              <div className="flex gap-2">
                <Textarea placeholder="Tulis pesan..." value={newMessage} onChange={(e) => setNewMessage(e.target.value)} rows={1} className="flex-1" />
                <Button onClick={sendMessage} size="icon"><Send className="h-4 w-4" /></Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="submissions" className="space-y-4">
          {milestones.filter((m) => m.status === "APPROVED" || m.status === "SUBMITTED").length === 0 ? (
            <Card><CardContent className="p-8 text-center text-muted-foreground">Belum ada submit</CardContent></Card>
          ) : (
            milestones.filter((m) => m.status === "APPROVED" || m.status === "SUBMITTED").map((m) => (
              <Card key={m.id}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-primary" />
                    <div>
                      <h4 className="font-medium">{m.title}</h4>
                      <p className="text-sm text-muted-foreground">Status: <Badge className={getStatusColor(m.status)}>{m.status}</Badge></p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
