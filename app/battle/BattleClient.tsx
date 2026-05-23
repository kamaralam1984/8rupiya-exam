"use client";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Swords, Crown, Loader2, Bot, Zap, Trophy, Timer, Sparkles, User as UserIcon, X,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api-client";
import { EXAMS } from "@/lib/exams";
import { useUser } from "@/lib/use-user";

type Q = { id: string; stem: string; options: string[]; correctIndex: number; topic?: string };
type Player = { userId: string; name: string; avatar: string; score: number; answered: number };
type Room = {
  id: string;
  examSlug: string;
  questions: Q[];
  players: Record<string, Player>;
  status: "waiting" | "active" | "ended";
};

type Match = { questions: Q[]; opponentName: string; opponentAvatar: string };
type Mode = "bot" | "multiplayer";
type Phase = "lobby" | "matching" | "playing" | "result";

const BOT_NAMES = ["Aarav", "Diya", "Kabir", "Meera", "Riya", "Ishaan", "Aanya", "Vivaan"];
const BOT_AVATARS = ["🦊", "🐯", "🐼", "🐺", "🦁", "🐲", "🦅", "🐧"];

export function BattleClient() {
  const { user } = useUser();
  const [mode, setMode] = useState<Mode>("multiplayer");
  const [exam, setExam] = useState(EXAMS[0].slug);
  const [phase, setPhase] = useState<Phase>("lobby");

  // bot mode state
  const [match, setMatch] = useState<Match | null>(null);
  const [botScore, setBotScore] = useState(0);

  // multiplayer state
  const [room, setRoom] = useState<Room | null>(null);
  const pollRef = useRef<number | null>(null);

  const [qIdx, setQIdx] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [myScore, setMyScore] = useState(0);
  const [timer, setTimer] = useState(60);
  const startedAt = useRef<number>(0);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (user?.examTrack && EXAMS.some((e) => e.slug === user.examTrack)) setExam(user.examTrack);
  }, [user?.examTrack]);

  useEffect(() => {
    if (phase !== "playing") return;
    setTimer(60);
    startedAt.current = Date.now();
    const id = setInterval(() => {
      setTimer((t) => {
        if (t <= 1) {
          clearInterval(id);
          handleAnswer(-1);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [phase, qIdx]);

  // ===== Multiplayer polling =====
  function startPolling() {
    stopPolling();
    pollRef.current = window.setInterval(async () => {
      // While matching: try to match repeatedly
      if (phase === "matching") {
        const r = await api<{ matched: boolean; room?: Room; queued?: boolean }>(
          "/api/battle/queue", { method: "POST", body: JSON.stringify({ examSlug: exam }) },
        );
        if (!r.ok) return;
        if (r.data.matched && r.data.room) {
          setRoom(r.data.room);
          setQIdx(0); setMyScore(0); setPicked(null);
          stopPolling();
          setTimeout(() => setPhase("playing"), 600);
        }
        return;
      }
      // While playing: fetch state to see opponent progress
      const s = await api<{ inRoom: boolean; room?: Room }>("/api/battle/state");
      if (s.ok && s.data.inRoom && s.data.room) {
        setRoom(s.data.room);
        if (s.data.room.status === "ended") {
          stopPolling();
          setPhase("result");
        }
      }
    }, 1800);
  }
  function stopPolling() {
    if (pollRef.current != null) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }
  useEffect(() => { return () => stopPolling(); }, []);

  // ===== Lobby actions =====
  async function startMatch() {
    setErr(null);
    if (mode === "bot") {
      setPhase("matching");
      const r = await api<Match>(`/api/battle/match?exam=${exam}`, { method: "POST" });
      if (!r.ok) {
        setErr(r.error.code === "UNAUTHENTICATED" ? "Sign in to battle." : r.error.message ?? "Match failed");
        setPhase("lobby");
        return;
      }
      setMatch(r.data);
      setQIdx(0); setMyScore(0); setBotScore(0); setPicked(null);
      setTimeout(() => setPhase("playing"), 900);
    } else {
      // Multiplayer
      setPhase("matching");
      const r = await api<{ matched: boolean; room?: Room; queued?: boolean }>(
        "/api/battle/queue", { method: "POST", body: JSON.stringify({ examSlug: exam }) },
      );
      if (!r.ok) {
        setErr(r.error.code === "UNAUTHENTICATED" ? "Sign in to battle." : r.error.message ?? "Failed");
        setPhase("lobby");
        return;
      }
      if (r.data.matched && r.data.room) {
        setRoom(r.data.room);
        setQIdx(0); setMyScore(0); setPicked(null);
        setTimeout(() => setPhase("playing"), 600);
      } else {
        startPolling();
      }
    }
  }

  async function cancelMatching() {
    stopPolling();
    if (mode === "multiplayer") {
      await api(`/api/battle/queue?examSlug=${exam}`, { method: "DELETE" }).catch(() => {});
    }
    setPhase("lobby");
  }

  // ===== Bot answer =====
  function handleAnswerBot(idx: number) {
    if (!match || picked !== null) return;
    setPicked(idx);
    const q = match.questions[qIdx];
    const correct = idx === q.correctIndex;
    const took = Date.now() - startedAt.current;
    const myPts = correct ? Math.max(40, 100 - Math.floor(took / 600)) : 0;
    if (correct) setMyScore((s) => s + myPts);

    const botCorrect = Math.random() < 0.62;
    const botTook = 4000 + Math.random() * 18000;
    if (botCorrect) setBotScore((s) => s + Math.max(40, 100 - Math.floor(botTook / 600)));

    setTimeout(() => {
      setPicked(null);
      if (qIdx + 1 >= match.questions.length) finishBot(correct ? myScore + myPts : myScore);
      else setQIdx((i) => i + 1);
    }, 1500);
  }

  async function finishBot(finalMyScore: number) {
    setPhase("result");
    await api(`/api/battle/finish`, {
      method: "POST",
      body: JSON.stringify({ score: finalMyScore, opponentScore: botScore, exam }),
    }).catch(() => {});
  }

  // ===== Multiplayer answer =====
  async function handleAnswerMp(idx: number) {
    if (!room || picked !== null) return;
    setPicked(idx);
    const took = Date.now() - startedAt.current;
    const r = await api<{ correct: boolean; points: number; room: Room }>("/api/battle/state", {
      method: "POST",
      body: JSON.stringify({ qIndex: qIdx, picked: idx, tookMs: Math.min(60000, took) }),
    });
    setTimeout(() => {
      setPicked(null);
      if (!r.ok) { setErr(r.error.message ?? "Answer failed"); return; }
      setRoom(r.data.room);
      if (r.data.correct) setMyScore((s) => s + r.data.points);
      const totalQ = r.data.room.questions.length;
      if (qIdx + 1 >= totalQ) {
        // Wait for opponent. Poll until ended.
        if (r.data.room.status !== "ended") startPolling();
        else setPhase("result");
      } else {
        setQIdx((i) => i + 1);
      }
    }, 1100);
  }

  function handleAnswer(idx: number) {
    if (mode === "bot") handleAnswerBot(idx);
    else handleAnswerMp(idx);
  }

  // ===== Render =====
  if (phase === "lobby") {
    return (
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 neon-card p-6">
          <div className="flex items-center gap-2 ai-chip mb-4">
            <Swords className="h-3 w-3 text-rose-300" /> Quick match
          </div>
          <h2 className="font-display text-2xl font-bold">Apna duel chuno</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            10 questions, 60 sec each. Multiplayer mode mein real student ke saath khelo,
            ya solo bot mode try karo.
          </p>

          <div className="mt-5 flex gap-2">
            <button
              onClick={() => setMode("multiplayer")}
              className={`text-xs rounded-full px-3 py-1.5 border transition ${
                mode === "multiplayer"
                  ? "border-rose-600 bg-rose-50 text-rose-700 dark:bg-rose-500/15 dark:border-rose-500 dark:text-rose-200"
                  : "border-border text-muted-foreground"
              }`}
            ><UserIcon className="inline h-3 w-3 mr-1" /> Multiplayer (live)</button>
            <button
              onClick={() => setMode("bot")}
              className={`text-xs rounded-full px-3 py-1.5 border transition ${
                mode === "bot" ? "border-[#1e3a8a] bg-[#1e3a8a]/10 text-[#1e3a8a] dark:bg-brand-500/10 dark:border-brand-500 dark:text-foreground" : "border-border text-muted-foreground"
              }`}
            ><Bot className="inline h-3 w-3 mr-1" /> Solo (vs AI bot)</button>
          </div>

          <label className="mt-5 block text-xs text-muted-foreground">Exam</label>
          <select value={exam} onChange={(e) => setExam(e.target.value)}
            className="mt-1 w-full bg-background border border-border rounded-md px-3 py-2 text-sm">
            {EXAMS.map((e) => <option key={e.slug} value={e.slug}>{e.name}</option>)}
          </select>
          <div className="mt-5 flex gap-3 flex-wrap">
            <Button onClick={startMatch} className="btn-ai"><Zap className="h-4 w-4" /> Start Battle</Button>
            <Link href="/dpp" className="btn-ghost-ai">Try DPP instead</Link>
          </div>
          {err && <p className="mt-3 text-sm text-rose-400">{err}</p>}
        </div>

        <div className="neon-card p-6 bg-gradient-to-br from-amber-500/10 to-orange-500/5">
          <Crown className="h-7 w-7 text-amber-500 dark:text-amber-300" />
          <p className="mt-4 text-3xl font-display font-bold ai-gradient-text">League</p>
          <p className="mt-1 text-sm text-muted-foreground">Top 3 this week</p>
          <ol className="mt-3 space-y-2 text-sm">
            <li className="flex justify-between"><span>👑 Aarav S.</span><span className="font-mono">28,420 XP</span></li>
            <li className="flex justify-between"><span>🥈 Diya M.</span><span className="font-mono">26,110 XP</span></li>
            <li className="flex justify-between"><span>🥉 Kabir K.</span><span className="font-mono">22,600 XP</span></li>
          </ol>
        </div>
      </div>
    );
  }

  if (phase === "matching") {
    return (
      <div className="neon-card p-10 text-center">
        <Loader2 className="h-10 w-10 mx-auto animate-spin text-brand-500" />
        <p className="mt-4 text-lg font-display">
          {mode === "multiplayer" ? "Real player dhundh raha hu…" : "Bot opponent ready kar raha hu…"}
        </p>
        <p className="text-sm text-muted-foreground">
          {mode === "multiplayer"
            ? "Quick match khulta hai usually 5-30 seconds mein. Bot fallback bhi available."
            : "Usually under 5 seconds."}
        </p>
        <button onClick={cancelMatching} className="mt-4 text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1">
          <X className="h-3 w-3" /> Cancel
        </button>
        {mode === "multiplayer" && (
          <button
            onClick={() => { stopPolling(); setMode("bot"); setPhase("lobby"); }}
            className="mt-2 block mx-auto text-xs text-brand-500 hover:underline"
          >Don't wait — switch to bot mode</button>
        )}
      </div>
    );
  }

  // PLAYING — MULTIPLAYER
  if (phase === "playing" && mode === "multiplayer" && room) {
    const q = room.questions[qIdx];
    const me = user ? room.players[user.id] : undefined;
    const opp = Object.values(room.players).find((p) => p.userId !== user?.id);
    if (!q) {
      return <div className="neon-card p-6 text-center">Waiting for opponent to finish…</div>;
    }
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="ai-chip"><UserIcon className="h-3 w-3" /> Live vs {opp?.avatar} {opp?.name}</div>
            <span className="text-xs text-muted-foreground">Q {qIdx + 1}/{room.questions.length}</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm font-display font-bold text-[#1e3a8a] dark:text-foreground">{me?.score ?? 0}</span>
            <span className="text-muted-foreground text-xs">vs</span>
            <span className="text-sm font-display">{opp?.score ?? 0}</span>
            <span className="text-xs text-muted-foreground">(opp Q{opp?.answered ?? 0})</span>
            <div className={`flex items-center gap-1 text-sm font-mono ${timer < 10 ? "text-rose-500" : ""}`}>
              <Timer className="h-3.5 w-3.5" /> {timer}s
            </div>
          </div>
        </div>
        <div className="h-1 rounded-full bg-muted overflow-hidden">
          <motion.div className="h-full bg-[#1e3a8a]" initial={{ width: "100%" }} animate={{ width: `${(timer / 60) * 100}%` }} transition={{ duration: 1, ease: "linear" }} />
        </div>
        <AnimatePresence mode="wait">
          <motion.div key={qIdx} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="neon-card p-6">
            <p className="text-xs text-muted-foreground">{q.topic || "Mixed topic"}</p>
            <p className="mt-2 font-medium text-lg">{q.stem}</p>
            <div className="mt-4 space-y-2">
              {q.options.map((opt, j) => {
                const isPicked = picked === j;
                return (
                  <button key={j} onClick={() => handleAnswer(j)} disabled={picked !== null}
                    className={`w-full text-left rounded-md px-4 py-3 border text-sm transition ${
                      isPicked ? "border-[#1e3a8a] bg-[#1e3a8a]/10" : "border-border hover:border-foreground/40 hover:bg-muted/50"
                    }`}>
                    <span className="font-mono mr-2 text-muted-foreground">{String.fromCharCode(65 + j)}.</span>
                    {opt}
                  </button>
                );
              })}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    );
  }

  // PLAYING — BOT
  if (phase === "playing" && mode === "bot" && match) {
    const q = match.questions[qIdx];
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="ai-chip"><Bot className="h-3 w-3" /> vs {match.opponentAvatar} {match.opponentName}</div>
            <span className="text-xs text-muted-foreground">Q {qIdx + 1}/{match.questions.length}</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm font-display font-bold text-[#1e3a8a] dark:text-foreground">{myScore}</span>
            <span className="text-muted-foreground text-xs">vs</span>
            <span className="text-sm font-display">{botScore}</span>
            <div className={`flex items-center gap-1 text-sm font-mono ${timer < 10 ? "text-rose-500" : ""}`}>
              <Timer className="h-3.5 w-3.5" /> {timer}s
            </div>
          </div>
        </div>
        <div className="h-1 rounded-full bg-muted overflow-hidden">
          <motion.div className="h-full bg-[#1e3a8a]" initial={{ width: "100%" }} animate={{ width: `${(timer / 60) * 100}%` }} transition={{ duration: 1, ease: "linear" }} />
        </div>
        <AnimatePresence mode="wait">
          <motion.div key={qIdx} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="neon-card p-6">
            <p className="text-xs text-muted-foreground">{q.topic || "Mixed topic"}</p>
            <p className="mt-2 font-medium text-lg">{q.stem}</p>
            <div className="mt-4 space-y-2">
              {q.options.map((opt, j) => {
                const isPicked = picked === j;
                const correct = picked !== null && j === q.correctIndex;
                const wrong = isPicked && j !== q.correctIndex;
                return (
                  <button key={j} onClick={() => handleAnswer(j)} disabled={picked !== null}
                    className={`w-full text-left rounded-md px-4 py-3 border text-sm transition ${
                      correct ? "border-emerald-500/60 bg-emerald-500/10 text-emerald-700 dark:text-emerald-200"
                      : wrong ? "border-rose-500/60 bg-rose-500/10 text-rose-700 dark:text-rose-200"
                      : "border-border hover:border-foreground/40 hover:bg-muted/50"
                    }`}>
                    <span className="font-mono mr-2 text-muted-foreground">{String.fromCharCode(65 + j)}.</span>
                    {opt}
                  </button>
                );
              })}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    );
  }

  // RESULT
  if (phase === "result") {
    let mine = myScore, oppScore = botScore, oppName = match?.opponentName ?? "Opponent", oppAvatar = match?.opponentAvatar ?? "🤖";
    if (mode === "multiplayer" && room && user) {
      mine = room.players[user.id]?.score ?? 0;
      const opp = Object.values(room.players).find((p) => p.userId !== user.id);
      if (opp) { oppScore = opp.score; oppName = opp.name; oppAvatar = opp.avatar; }
    }
    const won = mine > oppScore;
    const tied = mine === oppScore;
    return (
      <div className="neon-card p-8 text-center bg-gradient-to-br from-amber-50 to-rose-50 dark:from-purple-500/10 dark:via-pink-500/10 dark:to-rose-500/10">
        <motion.div initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
          <Trophy className={`h-16 w-16 mx-auto ${won ? "text-amber-500" : tied ? "text-cyan-600" : "text-muted-foreground"}`} />
        </motion.div>
        <h2 className="mt-4 font-display text-3xl font-bold">
          {won ? "Victory! 👑" : tied ? "Draw 🤝" : "Good fight ⚔️"}
        </h2>
        <div className="mt-6 grid grid-cols-2 gap-4 max-w-md mx-auto">
          <div className="neon-card p-4">
            <p className="text-xs text-muted-foreground">You</p>
            <p className="font-display text-3xl font-bold text-[#1e3a8a] dark:text-foreground">{mine}</p>
          </div>
          <div className="neon-card p-4">
            <p className="text-xs text-muted-foreground">{oppAvatar} {oppName}</p>
            <p className="font-display text-3xl font-bold">{oppScore}</p>
          </div>
        </div>
        <p className="mt-6 text-sm text-muted-foreground">
          <Sparkles className="inline h-3.5 w-3.5 text-purple-500" /> XP credited.
        </p>
        <div className="mt-6 flex gap-3 justify-center">
          <Button onClick={() => { setRoom(null); setMatch(null); setPhase("lobby"); }} className="btn-ai">
            <Swords className="h-4 w-4" /> Rematch
          </Button>
          <Link href="/dashboard" className="btn-ghost-ai">Dashboard</Link>
        </div>
      </div>
    );
  }

  return null;
}
