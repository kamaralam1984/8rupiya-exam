"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Loader2, FileText, Sparkles, ListChecks, Calculator, BookOpen, Youtube } from "lucide-react";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api-client";

type Resp = {
  title: string;
  tldr: string;
  keyPoints: string[];
  formulas: string[];
  examTip: string;
  miniQuiz: { stem: string; options: string[]; correctIndex: number; explanation: string }[];
};

export function SummariesClient() {
  const [mode, setMode] = useState<"paste" | "youtube">("paste");
  const [text, setText] = useState("");
  const [ytUrl, setYtUrl] = useState("");
  const [subject, setSubject] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<Resp | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [reveal, setReveal] = useState<Record<number, boolean>>({});

  async function run() {
    setErr(null);
    setLoading(true);
    setData(null);
    const url = mode === "youtube" ? "/api/ai/summarize-youtube" : "/api/ai/summarize";
    const body = mode === "youtube" ? { url: ytUrl, subject } : { text, subject };
    const r = await api<Resp>(url, { method: "POST", body: JSON.stringify(body) });
    setLoading(false);
    if (!r.ok) {
      setErr(
        r.error.code === "UNAUTHENTICATED" ? "Sign in to summarize."
        : r.error.code === "NO_TRANSCRIPT" ? "Video pe captions off hain ya region-locked hai."
        : r.error.code === "BAD_URL" ? "Valid YouTube URL daalo (e.g. https://youtu.be/XXX)."
        : r.error.message ?? "Failed",
      );
      return;
    }
    setData(r.data);
  }

  const canRun =
    mode === "youtube" ? ytUrl.trim().length > 8 : text.trim().length >= 100;

  return (
    <div className="space-y-5">
      <div className="neon-card p-6 space-y-4">
        <div className="flex gap-2">
          <button
            onClick={() => setMode("paste")}
            className={`text-xs rounded-full px-3 py-1.5 border transition ${
              mode === "paste" ? "border-[#1e3a8a] bg-[#1e3a8a]/10 text-[#1e3a8a] dark:bg-brand-500/10 dark:border-brand-500 dark:text-foreground" : "border-border text-muted-foreground"
            }`}
          >
            <FileText className="inline h-3 w-3 mr-1" /> Paste notes
          </button>
          <button
            onClick={() => setMode("youtube")}
            className={`text-xs rounded-full px-3 py-1.5 border transition ${
              mode === "youtube" ? "border-rose-600 bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:border-rose-500 dark:text-rose-200" : "border-border text-muted-foreground"
            }`}
          >
            <Youtube className="inline h-3 w-3 mr-1" /> YouTube URL
          </button>
        </div>

        <div>
          <label className="text-xs text-muted-foreground">Subject / topic (helps AI)</label>
          <input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="e.g., Class 12 Physics — Electrostatics"
            className="mt-1 w-full bg-background border border-border rounded-md px-3 py-2 text-sm"
          />
        </div>

        {mode === "paste" ? (
          <div>
            <label className="text-xs text-muted-foreground">Paste lecture text, transcript or your notes</label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={10}
              maxLength={12000}
              placeholder="Paste up to ~12,000 characters…"
              className="mt-1 w-full bg-background border border-border rounded-md px-3 py-2 text-sm font-mono"
            />
            <p className="mt-1 text-[10px] text-muted-foreground">{text.length}/12000</p>
          </div>
        ) : (
          <div>
            <label className="text-xs text-muted-foreground">YouTube video URL or 11-char ID</label>
            <input
              value={ytUrl}
              onChange={(e) => setYtUrl(e.target.value)}
              placeholder="https://youtu.be/dQw4w9WgXcQ"
              className="mt-1 w-full bg-background border border-border rounded-md px-3 py-2 text-sm"
            />
            <p className="mt-1 text-[10px] text-muted-foreground">
              AI captions fetch karega aur summary + 5 MCQs generate karega. Captions disabled videos ka kaam nahi karega.
            </p>
          </div>
        )}

        <Button onClick={run} disabled={loading || !canRun} className="btn-ai">
          {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Summarizing…</> : <><Sparkles className="h-4 w-4" /> Generate summary</>}
        </Button>
        {err && <p className="text-sm text-rose-400">{err}</p>}
      </div>

      {data && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <div className="neon-card p-6 bg-gradient-to-br from-purple-500/10 to-cyan-500/5">
            <FileText className="h-5 w-5 text-purple-300" />
            <h2 className="mt-2 font-display text-2xl font-bold">{data.title}</h2>
            <p className="mt-3 text-sm text-muted-foreground italic">TL;DR — {data.tldr}</p>
          </div>

          <div className="neon-card p-5">
            <p className="ai-chip mb-3"><ListChecks className="h-3 w-3 text-cyan-300" /> Key points</p>
            <ul className="space-y-2 text-sm">
              {data.keyPoints.map((p, i) => <li key={i} className="flex gap-2"><span className="text-cyan-300">▹</span><span>{p}</span></li>)}
            </ul>
          </div>

          {data.formulas?.length > 0 && (
            <div className="neon-card p-5">
              <p className="ai-chip mb-3"><Calculator className="h-3 w-3 text-amber-300" /> Formulas & equations</p>
              <ul className="space-y-1 text-sm font-mono">
                {data.formulas.map((f, i) => <li key={i} className="text-amber-200">{f}</li>)}
              </ul>
            </div>
          )}

          <div className="neon-card p-5 bg-gradient-to-br from-emerald-500/10 to-transparent">
            <p className="ai-chip mb-3"><BookOpen className="h-3 w-3 text-emerald-300" /> Exam tip</p>
            <p className="text-sm">{data.examTip}</p>
          </div>

          {data.miniQuiz?.length > 0 && (
            <div className="neon-card p-5">
              <p className="ai-chip mb-3"><Sparkles className="h-3 w-3 text-purple-300" /> Mini quiz</p>
              <div className="space-y-4">
                {data.miniQuiz.map((q, i) => (
                  <div key={i} className="border border-border rounded-md p-3">
                    <p className="text-sm font-medium">Q{i + 1}. {q.stem}</p>
                    <div className="mt-2 space-y-1">
                      {q.options.map((opt, j) => {
                        const correct = j === q.correctIndex;
                        return (
                          <div key={j} className={`text-sm px-3 py-1.5 rounded border ${reveal[i] && correct ? "border-emerald-500/60 bg-emerald-500/10 text-emerald-200" : "border-border"}`}>
                            <span className="font-mono mr-2">{String.fromCharCode(65 + j)}.</span>{opt}
                          </div>
                        );
                      })}
                    </div>
                    <button
                      onClick={() => setReveal((p) => ({ ...p, [i]: !p[i] }))}
                      className="mt-2 text-xs text-brand-500 hover:underline"
                    >{reveal[i] ? "Hide" : "Reveal"} answer</button>
                    {reveal[i] && <p className="mt-1 text-xs text-muted-foreground">{q.explanation}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
