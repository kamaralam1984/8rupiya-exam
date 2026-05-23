"use client";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Loader2, Send, Users, MessageCircle, Crown, Sparkles, ArrowUpRight } from "lucide-react";
import { api } from "@/lib/api-client";
import { useUser } from "@/lib/use-user";

type Room = {
  id: string;
  slug: string;
  name: string;
  examSlug: string | null;
  description: string | null;
  isPaid: boolean;
  _count: { messages: number };
};

type Msg = {
  id: string;
  body: string;
  createdAt: string;
  user: { name: string; role: string };
};

const TOPPER_POSTS = [
  { name: "Rahul V.", rank: "NEET AIR 47", avatar: "🦊", text: "Genetics 3 baar dohraya. Mistake review notebook + SRS flashcards — yahi formula tha." },
  { name: "Sneha I.", rank: "JEE Adv AIR 112", avatar: "🐯", text: "Calculus mein doubt? Direct message karo. Aaj 8 PM ke baad reply." },
  { name: "Akash S.", rank: "SSC CGL AIR 8", avatar: "🐼", text: "Reasoning daily 30 min — same time. Stop chasing motivation, build system." },
];

export function CommunityClient() {
  const { user } = useUser();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [activeSlug, setActiveSlug] = useState<string | null>(null);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [draft, setDraft] = useState("");
  const [loadingRooms, setLoadingRooms] = useState(true);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const pollRef = useRef<number | null>(null);
  const lastSeenAt = useRef<string | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  // Initial load
  useEffect(() => {
    (async () => {
      setLoadingRooms(true);
      const r = await api<{ rooms: Room[] }>("/api/community/rooms");
      setLoadingRooms(false);
      if (!r.ok) { setErr(r.error.message ?? "Failed"); return; }
      setRooms(r.data.rooms);
      if (r.data.rooms.length && !activeSlug) setActiveSlug(r.data.rooms[0].slug);
    })();
  }, []);

  // Load messages on room change + start polling
  useEffect(() => {
    if (!activeSlug) return;
    setMessages([]);
    lastSeenAt.current = null;
    setLoadingMsgs(true);
    (async () => {
      const r = await api<{ messages: Msg[] }>(`/api/community/rooms/${activeSlug}/messages?limit=80`);
      setLoadingMsgs(false);
      if (!r.ok) return;
      setMessages(r.data.messages);
      const last = r.data.messages[r.data.messages.length - 1];
      if (last) lastSeenAt.current = last.createdAt;
      setTimeout(() => scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight }), 100);
    })();

    startPolling();
    return stopPolling;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSlug]);

  function startPolling() {
    stopPolling();
    pollRef.current = window.setInterval(async () => {
      if (!activeSlug || !lastSeenAt.current) return;
      const r = await api<{ messages: Msg[] }>(
        `/api/community/rooms/${activeSlug}/messages?after=${encodeURIComponent(lastSeenAt.current)}`,
      );
      if (!r.ok || r.data.messages.length === 0) return;
      setMessages((prev) => [...prev, ...r.data.messages]);
      lastSeenAt.current = r.data.messages[r.data.messages.length - 1].createdAt;
      setTimeout(() => scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" }), 50);
    }, 3000);
  }
  function stopPolling() {
    if (pollRef.current != null) { clearInterval(pollRef.current); pollRef.current = null; }
  }

  async function send() {
    const b = draft.trim();
    if (!b || !activeSlug) return;
    setDraft("");
    const r = await api<{ message: Msg }>(`/api/community/rooms/${activeSlug}/messages`, {
      method: "POST",
      body: JSON.stringify({ body: b }),
    });
    if (!r.ok) {
      setErr(r.error.code === "UNAUTHENTICATED" ? "Sign in to chat." : r.error.message ?? "Failed to send");
      return;
    }
    setMessages((prev) => [...prev, r.data.message]);
    lastSeenAt.current = r.data.message.createdAt;
    setTimeout(() => scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" }), 50);
  }

  return (
    <div className="grid lg:grid-cols-[260px_1fr_280px] gap-6">
      {/* LEFT — room list */}
      <div className="lg:max-h-[640px] lg:overflow-y-auto">
        <p className="ai-chip mb-3"><Users className="h-3 w-3" /> Rooms</p>
        {loadingRooms && <Loader2 className="h-4 w-4 animate-spin text-brand-500" />}
        <div className="space-y-2">
          {rooms.map((r) => (
            <button
              key={r.id}
              onClick={() => setActiveSlug(r.slug)}
              className={`w-full text-left rounded-lg px-3 py-2 border transition ${
                activeSlug === r.slug
                  ? "border-[#1e3a8a] bg-[#1e3a8a]/10 dark:bg-brand-500/10 dark:border-brand-500"
                  : "border-border hover:bg-muted/40"
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <p className="font-semibold text-sm leading-tight">{r.name}</p>
                {r.isPaid && <span className="text-[10px] text-amber-600 dark:text-amber-300">PRO</span>}
              </div>
              <p className="text-[11px] text-muted-foreground">{r._count.messages} msgs · {r.examSlug ?? "general"}</p>
            </button>
          ))}
        </div>
      </div>

      {/* CENTER — chat */}
      <div className="neon-card border border-border flex flex-col h-[640px]">
        <div className="px-5 py-3 border-b border-border flex items-center gap-2">
          <MessageCircle className="h-4 w-4 text-[#1e3a8a] dark:text-brand-500" />
          <p className="font-display font-bold">{rooms.find((r) => r.slug === activeSlug)?.name ?? "Select a room"}</p>
          <span className="ml-auto text-xs text-muted-foreground">live · polls every 3s</span>
        </div>

        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
          {loadingMsgs && <Loader2 className="h-5 w-5 animate-spin text-brand-500" />}
          {!loadingMsgs && messages.length === 0 && (
            <p className="text-sm text-muted-foreground text-center mt-10">
              Pehla message tum bhejo — bas keep it respectful 🙏
            </p>
          )}
          {messages.map((m) => {
            const isMe = user && (m.user.name === (user.name ?? user.email?.split("@")[0]));
            return (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-2 ${isMe ? "justify-end" : ""}`}
              >
                {!isMe && (
                  <div className="grid h-8 w-8 place-items-center rounded-full bg-[#1e3a8a] text-white text-xs font-semibold shrink-0">
                    {(m.user.name?.[0] ?? "U").toUpperCase()}
                  </div>
                )}
                <div className={`max-w-[70%] rounded-2xl px-3 py-2 text-sm ${
                  isMe
                    ? "bg-[#1e3a8a] text-white"
                    : "bg-muted/60 text-foreground"
                }`}>
                  {!isMe && (
                    <p className="text-[10px] font-bold text-[#1e3a8a] dark:text-cyan-300 mb-0.5">
                      {m.user.name} {m.user.role === "ADMIN" && <span className="text-amber-600 dark:text-amber-300">★</span>}
                    </p>
                  )}
                  <p className="whitespace-pre-wrap break-words">{m.body}</p>
                  <p className="text-[9px] opacity-70 mt-0.5">{new Date(m.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}</p>
                </div>
              </motion.div>
            );
          })}
        </div>

        <div className="px-4 py-3 border-t border-border flex gap-2">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
            placeholder={user ? "Type a message…" : "Sign in to chat"}
            disabled={!user || !activeSlug}
            maxLength={800}
            className="flex-1 bg-background border border-border rounded-md px-3 py-2 text-sm"
          />
          <button
            onClick={send}
            disabled={!user || !activeSlug || draft.trim().length === 0}
            className="btn-ai !px-4 !py-2 text-sm disabled:opacity-50"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
        {err && <p className="px-4 pb-2 text-xs text-rose-500">{err}</p>}
      </div>

      {/* RIGHT — topper feed */}
      <div className="lg:max-h-[640px] lg:overflow-y-auto">
        <p className="ai-chip mb-3"><Crown className="h-3 w-3 text-amber-600 dark:text-amber-300" /> Toppers</p>
        <div className="space-y-3">
          {TOPPER_POSTS.map((p, i) => (
            <div key={i} className="neon-card p-4 border border-border">
              <div className="flex items-start gap-2">
                <span className="text-xl">{p.avatar}</span>
                <div>
                  <p className="font-bold text-sm">{p.name}</p>
                  <p className="text-[11px] text-muted-foreground">{p.rank}</p>
                </div>
              </div>
              <p className="mt-2 text-xs leading-relaxed">{p.text}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 neon-card p-4 border border-border">
          <Sparkles className="h-4 w-4 text-purple-600 dark:text-purple-300" />
          <p className="mt-2 font-bold text-sm">Private group?</p>
          <p className="text-xs text-muted-foreground">Family plan se invite-only rooms.</p>
          <Link href="/pricing" className="mt-2 inline-flex items-center gap-1 text-xs text-[#1e3a8a] dark:text-brand-500 hover:underline">
            See Family plan <ArrowUpRight className="h-3 w-3" />
          </Link>
        </div>
      </div>
    </div>
  );
}
