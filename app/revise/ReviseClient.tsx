"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, RefreshCw, Brain, Sparkles, ThumbsUp, ThumbsDown, Zap, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api-client";
import { EXAMS } from "@/lib/exams";
import { useUser } from "@/lib/use-user";

type Card = {
  id: string;
  stem: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  topic?: string;
};
type Resp = { cards: Card[]; stats: { total: number; due: number; added: number } };

const GRADES = [
  { v: 0, label: "Forgot", subtitle: "+1 day", color: "from-rose-500 to-pink-600", icon: ThumbsDown },
  { v: 1, label: "Hard", subtitle: "+3 days", color: "from-amber-500 to-orange-600", icon: Brain },
  { v: 2, label: "Good", subtitle: "+6 days", color: "from-cyan-500 to-blue-600", icon: ThumbsUp },
  { v: 3, label: "Easy", subtitle: "+10 days", color: "from-emerald-500 to-teal-600", icon: Zap },
] as const;

export function ReviseClient() {
  const { user } = useUser();
  const [exam, setExam] = useState(EXAMS[0].slug);
  const [data, setData] = useState<Resp | null>(null);
  const [idx, setIdx] = useState(0);
  const [reveal, setReveal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [reviewed, setReviewed] = useState(0);

  useEffect(() => {
    if (user?.examTrack && EXAMS.some((e) => e.slug === user.examTrack)) setExam(user.examTrack);
  }, [user?.examTrack]);

  async function load() {
    setLoading(true);
    setErr(null);
    setIdx(0);
    setReveal(false);
    setReviewed(0);
    const r = await api<Resp>(`/api/srs/next?exam=${exam}&limit=15`);
    setLoading(false);
    if (!r.ok) {
      setErr(r.error.code === "UNAUTHENTICATED" ? "Sign in to revise." : r.error.message ?? "Failed");
      return;
    }
    setData(r.data);
  }

  useEffect(() => { load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [exam]);

  async function grade(g: number) {
    if (!data) return;
    const card = data.cards[idx];
    if (!card) return;
    await api(`/api/srs/review`, {
      method: "POST",
      body: JSON.stringify({ questionId: card.id, grade: g }),
    }).catch(() => {});
    setReviewed((n) => n + 1);
    if (idx + 1 >= data.cards.length) {
      load();
    } else {
      setIdx((i) => i + 1);
      setReveal(false);
    }
  }

  const card = data?.cards[idx];

  return (
    <div className="space-y-5">
      <div className="neon-card p-5 flex items-center gap-3 flex-wrap">
        <select
          value={exam}
          onChange={(e) => setExam(e.target.value)}
          className="bg-background border border-border rounded-md px-3 py-2 text-sm"
        >
          {EXAMS.map((e) => <option key={e.slug} value={e.slug}>{e.name}</option>)}
        </select>
        <Button variant="ghost" onClick={load} disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />} Refresh
        </Button>
        <div className="ml-auto flex items-center gap-3 text-xs text-muted-foreground">
          <span><Sparkles className="inline h-3 w-3 text-purple-300" /> Reviewed today: <span className="text-foreground font-mono">{reviewed}</span></span>
          {data && <span>Due: <span className="text-rose-300 font-mono">{data.stats.due}</span> / In deck: <span className="text-foreground font-mono">{data.stats.total}</span></span>}
        </div>
      </div>

      {err && <p className="text-sm text-rose-400">{err}</p>}

      {loading && !card && (
        <div className="neon-card p-10 text-center">
          <Loader2 className="h-8 w-8 mx-auto animate-spin text-brand-500" />
          <p className="mt-3 text-sm text-muted-foreground">Loading cards…</p>
        </div>
      )}

      {!loading && data && data.cards.length === 0 && (
        <div className="neon-card p-10 text-center">
          <Brain className="h-10 w-10 mx-auto text-emerald-300" />
          <p className="mt-3 font-display text-lg">No cards due — bahut achha! 🎉</p>
          <p className="text-sm text-muted-foreground">New cards bhi nahi mile is exam mein. Doosra exam try karo.</p>
        </div>
      )}

      <AnimatePresence mode="wait">
        {card && (
          <motion.div
            key={card.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="neon-card p-6 space-y-4"
          >
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Card {idx + 1} of {data!.cards.length}</span>
              {card.topic && <span className="ai-chip">{card.topic}</span>}
            </div>
            <p className="font-medium text-lg">{card.stem}</p>
            <div className="space-y-2">
              {card.options.map((opt, j) => {
                const correct = j === card.correctIndex;
                return (
                  <div
                    key={j}
                    className={`rounded-md px-4 py-2.5 border text-sm ${
                      reveal && correct
                        ? "border-emerald-500/60 bg-emerald-500/10 text-emerald-200"
                        : "border-border"
                    }`}
                  >
                    <span className="font-mono mr-2 text-muted-foreground">{String.fromCharCode(65 + j)}.</span>
                    {opt}
                  </div>
                );
              })}
            </div>
            {reveal && card.explanation && (
              <div className="text-sm text-muted-foreground border-l-2 border-purple-500/40 pl-3">
                {card.explanation}
              </div>
            )}
            <div className="flex justify-between gap-3">
              <Button variant="ghost" onClick={() => setReveal((r) => !r)}>
                {reveal ? <><EyeOff className="h-4 w-4" /> Hide</> : <><Eye className="h-4 w-4" /> Reveal</>}
              </Button>
            </div>
            {reveal && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
                {GRADES.map((g) => (
                  <button
                    key={g.v}
                    onClick={() => grade(g.v)}
                    className={`rounded-lg p-3 text-left bg-gradient-to-br ${g.color}/20 border border-border hover:border-foreground/30 transition`}
                  >
                    <g.icon className="h-4 w-4" />
                    <p className="mt-2 text-sm font-bold">{g.label}</p>
                    <p className="text-[10px] text-muted-foreground">{g.subtitle}</p>
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
