"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Loader2, Sparkles, Target, TrendingUp, Calendar, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api-client";
import { EXAMS } from "@/lib/exams";
import { useUser } from "@/lib/use-user";
import { useExamSubjects } from "@/lib/use-exam-subjects";
import { cn } from "@/lib/utils";

type Trend = { topic: string; yearsSeen: number; averageMarks?: number; rising?: boolean };
type Question = {
  stem: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  difficulty: string;
  topic: string;
  predictionScore: number;
  basedOnYears: number[];
};
type Resp = {
  jobId: string;
  title: string;
  rationale: string;
  topicTrend: Trend[];
  questions: Question[];
  stats: { pyqCount: number; topicsAnalyzed: number; yearRange: { from: number; to: number } };
};

function scoreColor(s: number) {
  if (s >= 75) return "text-emerald-500 border-emerald-500/50 bg-emerald-500/10";
  if (s >= 60) return "text-amber-400 border-amber-500/50 bg-amber-500/10";
  return "text-rose-400 border-rose-500/50 bg-rose-500/10";
}

export function Predict2026Client() {
  const { user } = useUser();
  const NEXT_YEAR = new Date().getFullYear() + 1;
  const [exam, setExam] = useState(EXAMS[0].slug);
  const [subjectSlug, setSubjectSlug] = useState("");
  const [targetYear, setTargetYear] = useState(NEXT_YEAR);
  const [count, setCount] = useState(20);
  const [minScore, setMinScore] = useState(60);
  const [reveal, setReveal] = useState<Record<number, boolean>>({});
  const [resp, setResp] = useState<Resp | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const { subjects, loading: loadingSubjects } = useExamSubjects(exam);

  useEffect(() => {
    if (user?.examTrack && EXAMS.some((e) => e.slug === user.examTrack)) {
      setExam(user.examTrack);
    }
  }, [user?.examTrack]);

  useEffect(() => setSubjectSlug(""), [exam]);

  async function submit() {
    setLoading(true); setErr(null); setResp(null); setReveal({});
    const r = await api<Resp>("/api/ai/predict-pyq", {
      method: "POST",
      body: JSON.stringify({
        examSlug: exam,
        subjectSlug: subjectSlug || undefined,
        targetYear,
        count,
        minScore,
      }),
    });
    setLoading(false);
    if (!r.ok) {
      setErr(r.error.message ?? r.error.code);
      return;
    }
    setResp(r.data);
  }

  return (
    <div className="space-y-5">
      <div className="glass rounded-2xl p-5 gradient-border grid sm:grid-cols-2 lg:grid-cols-5 gap-3">
        <label className="block">
          <span className="text-xs text-muted-foreground">Exam</span>
          <select
            value={exam}
            onChange={(e) => setExam(e.target.value)}
            className="mt-1 w-full bg-background border border-border rounded-md px-3 py-2 text-sm"
          >
            {EXAMS.map((e) => <option key={e.slug} value={e.slug}>{e.name}</option>)}
          </select>
        </label>
        <label className="block">
          <span className="text-xs text-muted-foreground">
            Subject {loadingSubjects && <Loader2 className="inline h-3 w-3 animate-spin" />}
          </span>
          <select
            value={subjectSlug}
            onChange={(e) => setSubjectSlug(e.target.value)}
            disabled={subjects.length === 0}
            className="mt-1 w-full bg-background border border-border rounded-md px-3 py-2 text-sm disabled:opacity-60"
          >
            <option value="">All subjects</option>
            {subjects.map((s) => <option key={s.slug} value={s.slug}>{s.name}</option>)}
          </select>
        </label>
        <label className="block">
          <span className="text-xs text-muted-foreground">Target year</span>
          <Input type="number" min={NEXT_YEAR} max={NEXT_YEAR + 2}
            value={targetYear} onChange={(e) => setTargetYear(parseInt(e.target.value) || NEXT_YEAR)} />
        </label>
        <label className="block">
          <span className="text-xs text-muted-foreground">Question count</span>
          <Input type="number" min={5} max={40} value={count}
            onChange={(e) => setCount(parseInt(e.target.value) || 20)} />
        </label>
        <label className="block">
          <span className="text-xs text-muted-foreground">Min confidence %</span>
          <Input type="number" min={40} max={95} value={minScore}
            onChange={(e) => setMinScore(parseInt(e.target.value) || 60)} />
        </label>
      </div>

      <div className="flex justify-between items-center">
        <p className="text-xs text-muted-foreground">
          Uses last 10 years of PYQ data. Powered by paid LLM (high reasoning).
        </p>
        <Button onClick={submit} disabled={loading} size="lg">
          {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Analyzing…</> :
            <><Sparkles className="h-4 w-4" /> Predict {targetYear}</>}
        </Button>
      </div>

      {err && (
        <div className="glass rounded-xl p-4 border border-amber-500/40 bg-amber-500/5 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
          <div className="text-sm">
            <p>{err}</p>
            <Link href="/admin/pdfs" className="text-brand-500 hover:underline text-xs">→ Upload past papers</Link>
          </div>
        </div>
      )}

      {resp && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
          {/* Stats + rationale */}
          <div className="glass rounded-2xl p-5 gradient-border">
            <h2 className="font-display text-xl font-bold">{resp.title}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{resp.rationale}</p>
            <div className="mt-3 flex flex-wrap gap-2 text-xs">
              <span className="px-2 py-1 rounded bg-muted inline-flex items-center gap-1">
                <Calendar className="h-3 w-3" /> {resp.stats.yearRange.from}-{resp.stats.yearRange.to}
              </span>
              <span className="px-2 py-1 rounded bg-muted">{resp.stats.pyqCount} PYQs analyzed</span>
              <span className="px-2 py-1 rounded bg-muted">{resp.stats.topicsAnalyzed} topics</span>
            </div>
          </div>

          {/* Topic trend chart-lite */}
          {resp.topicTrend.length > 0 && (
            <div className="glass rounded-2xl p-5 gradient-border">
              <h3 className="font-display font-semibold inline-flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-brand-500" /> Topic frequency over past decade
              </h3>
              <div className="mt-3 space-y-2">
                {resp.topicTrend.slice(0, 10).map((t) => {
                  const max = Math.max(...resp.topicTrend.map((x) => x.yearsSeen));
                  const pct = (t.yearsSeen / max) * 100;
                  return (
                    <div key={t.topic} className="flex items-center gap-3">
                      <span className="text-xs w-40 truncate" title={t.topic}>{t.topic}</span>
                      <div className="flex-1 h-2 bg-muted rounded overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-brand-500 to-accent" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-xs text-muted-foreground w-10 text-right">{t.yearsSeen}y</span>
                      {t.rising && <span className="text-[10px] text-emerald-500">↑ rising</span>}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Predicted questions */}
          {resp.questions.map((q, i) => (
            <div key={i} className="glass rounded-2xl p-5 gradient-border">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Q{i + 1} · {q.topic}</span>
                  <span className="text-muted-foreground">{q.difficulty}</span>
                </div>
                <span className={cn("px-2 py-1 rounded-full border font-medium", scoreColor(q.predictionScore))}>
                  {q.predictionScore}% likely
                </span>
              </div>
              <p className="mt-3 font-medium">{q.stem}</p>
              <div className="mt-3 space-y-1.5">
                {q.options.map((opt, j) => {
                  const isCorrect = j === q.correctIndex;
                  const shown = reveal[i];
                  return (
                    <div
                      key={j}
                      className={cn(
                        "text-sm rounded-md px-3 py-2 border",
                        shown && isCorrect
                          ? "border-emerald-500/60 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                          : "border-border"
                      )}
                    >
                      <span className="font-mono mr-2 text-muted-foreground">{String.fromCharCode(65 + j)}.</span>{opt}
                    </div>
                  );
                })}
              </div>
              <div className="mt-3 flex items-center justify-between">
                <button
                  onClick={() => setReveal((p) => ({ ...p, [i]: !p[i] }))}
                  className="text-xs text-brand-500 hover:underline inline-flex items-center gap-1"
                >
                  <Target className="h-3.5 w-3.5" /> {reveal[i] ? "Hide answer" : "Reveal answer"}
                </button>
                {q.basedOnYears?.length > 0 && (
                  <span className="text-[11px] text-muted-foreground">
                    Based on: {q.basedOnYears.join(", ")}
                  </span>
                )}
              </div>
              {reveal[i] && (
                <p className="mt-2 text-sm text-muted-foreground">{q.explanation}</p>
              )}
            </div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
