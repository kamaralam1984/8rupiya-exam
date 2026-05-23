"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Brain, RefreshCw, Trophy, Target, Clock, CheckCircle2, XCircle, MinusCircle, Sparkles, BookOpen, ChevronDown, ChevronUp, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { api } from "@/lib/api-client";
import { SubjectRadar } from "@/components/charts/subject-radar";
import { ChapterBar } from "@/components/charts/chapter-bar";
import { VoiceButton } from "@/components/voice-button";

type AnswerWithQ = {
  id: string;
  selectedIndex: number | null;
  isCorrect: boolean | null;
  timeSpentMs: number | null;
  flagged: boolean;
  guessed: boolean;
  question: {
    id: string;
    stem: string;
    options: string[];
    correctIndex: number;
    explanation: string | null;
    explanationLong: string | null;
    difficulty: string;
    pdfId: string | null;
    pdfPage: number | null;
    pdfHighlight: string | null;
    subject: { name: string } | null;
    chapter: { name: string } | null;
    pdf: { id: string; filename: string; config: unknown } | null;
  };
};

type Attempt = {
  id: string;
  status: string;
  score: number | null;
  accuracy: number | null;
  durationSec: number | null;
  testSet: { title: string; slug: string; durationMin: number; exam: { slug: string } | null };
  answers: AnswerWithQ[];
  meta: {
    totalQ: number;
    attempted: number;
    correct: number;
    subjectStats: Record<string, { total: number; correct: number; name: string }>;
    chapterStats: Record<string, { total: number; correct: number; name: string; subject: string }>;
  } | null;
};

type WeaknessReport = {
  summary: string;
  weakSubjects: { subject: string; accuracy: number; reason: string }[];
  weakChapters: { chapter: string; subject: string; accuracy: number }[];
  timeManagement: string;
  guessingBehavior: string;
  recommendedPlan: string[];
  passingProbability: number;
  encouragement: string;
};

function fmtTime(s: number | null) {
  if (!s) return "—";
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}m ${r.toString().padStart(2, "0")}s`;
}

export function ResultView({ attemptId }: { attemptId: string }) {
  const [attempt, setAttempt] = useState<Attempt | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [report, setReport] = useState<WeaknessReport | null>(null);
  const [reportLoading, setReportLoading] = useState(false);

  useEffect(() => {
    (async () => {
      const r = await api<Attempt>(`/api/attempts/${attemptId}`);
      if (!r.ok) { setErr(r.error.message ?? r.error.code); return; }
      setAttempt(r.data);
    })();
  }, [attemptId]);

  async function runWeakness() {
    setReportLoading(true);
    const r = await api<WeaknessReport>("/api/ai/weakness", {
      method: "POST",
      body: JSON.stringify({ attemptId, language: "en" }),
    });
    setReportLoading(false);
    if (!r.ok) { setErr(r.error.message ?? r.error.code); return; }
    setReport(r.data);
  }

  if (err) {
    return (
      <div className="container py-16 max-w-md">
        <div className="glass rounded-2xl p-7 gradient-border">
          <h1 className="font-display text-xl font-bold">Could not load result</h1>
          <p className="mt-2 text-sm text-red-500">{err}</p>
        </div>
      </div>
    );
  }

  if (!attempt) {
    return (
      <div className="container py-20 grid place-items-center">
        <Loader2 className="h-6 w-6 animate-spin text-brand-500" />
      </div>
    );
  }

  const acc = (attempt.accuracy ?? 0) * 100;
  const subjects = Object.values(attempt.meta?.subjectStats ?? {});
  const chapters = Object.values(attempt.meta?.chapterStats ?? {});

  return (
    <section className="container pt-10 pb-20 relative">
      {acc >= 70 && <Confetti />}
      <header className="mb-6">
        <p className="text-xs text-muted-foreground">Result</p>
        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="font-display text-3xl md:text-4xl font-bold tracking-tight"
        >
          {attempt.testSet.title}
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-2 text-sm text-muted-foreground"
        >
          {acc >= 80 ? "🎉 Shaandar performance!" : acc >= 50 ? "👏 Achha kaam, aur improvement ka scope hai." : "💪 Galtiyon se seekho — niche har question ka explanation hai."}
        </motion.p>
      </header>

      <div className="grid gap-4 md:grid-cols-4">
        <ResultStat icon={Trophy} label="Score" value={attempt.score?.toFixed(2) ?? "—"} accent animateNumber />
        <ResultStat icon={Target} label="Accuracy" value={`${acc.toFixed(0)}%`} animateNumber />
        <ResultStat
          icon={CheckCircle2}
          label="Correct"
          value={`${attempt.meta?.correct ?? 0} / ${attempt.meta?.totalQ ?? 0}`}
        />
        <ResultStat icon={Clock} label="Time taken" value={fmtTime(attempt.durationSec)} />
      </div>

      {subjects.length >= 2 && (
        <div className="mt-8 glass rounded-2xl p-6 gradient-border">
          <h2 className="font-display text-lg font-semibold mb-2">Subject radar</h2>
          <SubjectRadar
            data={subjects.map((s) => ({
              subject: s.name,
              accuracy: s.total > 0 ? s.correct / s.total : 0,
            }))}
          />
        </div>
      )}

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="glass rounded-2xl p-6 gradient-border">
          <h2 className="font-display text-lg font-semibold">Subject breakdown</h2>
          {subjects.length === 0 ? (
            <p className="mt-3 text-sm text-muted-foreground">No subject data available.</p>
          ) : (
            <div className="mt-4 space-y-4">
              {subjects.map((s) => {
                const pct = s.total > 0 ? (s.correct / s.total) * 100 : 0;
                return (
                  <div key={s.name}>
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{s.name}</span>
                      <span className="text-muted-foreground">
                        {s.correct}/{s.total} · {pct.toFixed(0)}%
                      </span>
                    </div>
                    <Progress value={pct} className="mt-1.5" />
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="glass rounded-2xl p-6 gradient-border">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold">AI weakness report</h2>
            <div className="flex items-center gap-2">
              {report && (
                <VoiceButton text={`Summary: ${report.summary}. Plan: ${report.recommendedPlan.join(". ")}. ${report.encouragement}`} />
              )}
              {!report && (
                <Button onClick={runWeakness} disabled={reportLoading} size="sm">
                  {reportLoading ? (<><Loader2 className="h-4 w-4 animate-spin" /> Analyzing…</>)
                    : (<><Brain className="h-4 w-4" /> Generate</>)}
                </Button>
              )}
            </div>
          </div>
          {!report ? (
            <p className="mt-3 text-sm text-muted-foreground">
              Get a personalized AI report on your weak chapters, time management and a
              recommended study plan.
            </p>
          ) : (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-4 space-y-4 text-sm">
              <p>{report.summary}</p>
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Passing probability</p>
                <Progress value={report.passingProbability * 100} />
                <p className="mt-1 text-xs text-muted-foreground">{(report.passingProbability * 100).toFixed(0)}%</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Recommended plan</p>
                <ul className="space-y-1 list-disc pl-5">
                  {report.recommendedPlan.map((p, i) => <li key={i}>{p}</li>)}
                </ul>
              </div>
              {report.weakChapters.length > 0 && (
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Focus chapters</p>
                  <ul className="space-y-1">
                    {report.weakChapters.slice(0, 5).map((c, i) => (
                      <li key={i} className="flex justify-between">
                        <span>{c.chapter} <span className="text-muted-foreground">({c.subject})</span></span>
                        <span className="text-muted-foreground">{(c.accuracy * 100).toFixed(0)}%</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <p className="text-sm text-brand-500">{report.encouragement}</p>
            </motion.div>
          )}
        </div>
      </div>

      {chapters.length > 0 && (
        <div className="mt-6 glass rounded-2xl p-6 gradient-border">
          <h2 className="font-display text-lg font-semibold">Weakest chapters</h2>
          <div className="mt-3">
            <ChapterBar
              data={chapters.map((c) => ({
                name: c.name,
                subject: c.subject,
                accuracy: c.total > 0 ? c.correct / c.total : 0,
              }))}
            />
          </div>
        </div>
      )}

      <QuestionReview answers={attempt.answers ?? []} />

      <div className="mt-8 flex flex-wrap gap-3">
        <Link href={`/test/${attempt.testSet.slug}`}>
          <Button variant="outline"><RefreshCw className="h-4 w-4" /> Retake test</Button>
        </Link>
        <Link href={attempt.testSet.exam?.slug ? `/exams/${attempt.testSet.exam.slug}` : "/exams"}>
          <Button>Try another exam</Button>
        </Link>
      </div>
    </section>
  );
}

function ResultStat({
  icon: Icon, label, value, accent, animateNumber,
}: { icon: any; label: string; value: string; accent?: boolean; animateNumber?: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92, y: 12 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 220, damping: 18 }}
      className={`glass rounded-2xl p-5 gradient-border ${accent ? "" : ""}`}
    >
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Icon className="h-4 w-4" /> {label}
      </div>
      <div className={`mt-2 font-display text-2xl font-bold ${accent ? "gradient-text" : ""}`}>
        {animateNumber ? <AnimatedNumber target={value} /> : value}
      </div>
    </motion.div>
  );
}

function AnimatedNumber({ target }: { target: string }) {
  const match = target.match(/^([\d.]+)(.*)$/);
  const num = match ? parseFloat(match[1]) : NaN;
  const suffix = match ? match[2] : "";
  const [n, setN] = useState(0);
  useEffect(() => {
    if (isNaN(num)) return;
    const start = performance.now();
    const dur = 900;
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      setN(num * eased);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [num]);
  if (isNaN(num)) return <>{target}</>;
  const decimals = (target.split(".")[1]?.length ?? 0);
  return <>{n.toFixed(decimals)}{suffix}</>;
}

function Confetti() {
  const pieces = useMemo(() =>
    Array.from({ length: 60 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 0.6,
      duration: 2 + Math.random() * 1.5,
      rot: Math.random() * 720 - 360,
      color: ["#f43f5e", "#fb923c", "#fbbf24", "#34d399", "#60a5fa", "#a78bfa"][i % 6],
      size: 6 + Math.random() * 6,
    })),
  []);
  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
      {pieces.map((p) => (
        <motion.span
          key={p.id}
          initial={{ y: -40, x: `${p.x}vw`, rotate: 0, opacity: 1 }}
          animate={{ y: "110vh", rotate: p.rot, opacity: [1, 1, 0] }}
          transition={{ duration: p.duration, delay: p.delay, ease: "easeIn" }}
          style={{
            position: "absolute",
            width: p.size,
            height: p.size * 1.4,
            background: p.color,
            borderRadius: 2,
            top: 0,
          }}
        />
      ))}
    </div>
  );
}

type ReviewFilter = "all" | "wrong" | "correct" | "skipped";

function QuestionReview({ answers }: { answers: AnswerWithQ[] }) {
  const [filter, setFilter] = useState<ReviewFilter>("wrong");

  const counts = useMemo(() => {
    let correct = 0, wrong = 0, skipped = 0;
    for (const a of answers) {
      if (a.selectedIndex === null) skipped++;
      else if (a.isCorrect) correct++;
      else wrong++;
    }
    return { all: answers.length, correct, wrong, skipped };
  }, [answers]);

  const filtered = useMemo(() => answers.filter((a) => {
    if (filter === "all") return true;
    if (filter === "skipped") return a.selectedIndex === null;
    if (filter === "wrong") return a.selectedIndex !== null && !a.isCorrect;
    return a.selectedIndex !== null && a.isCorrect;
  }), [answers, filter]);

  if (answers.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="mt-10"
    >
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="h-4 w-4 text-brand-500" />
        <h2 className="font-display text-xl font-semibold">Question-by-question review</h2>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        <FilterChip active={filter === "wrong"} onClick={() => setFilter("wrong")} tone="rose">
          ❌ Galat · {counts.wrong}
        </FilterChip>
        <FilterChip active={filter === "skipped"} onClick={() => setFilter("skipped")} tone="amber">
          ⏭ Skip · {counts.skipped}
        </FilterChip>
        <FilterChip active={filter === "correct"} onClick={() => setFilter("correct")} tone="emerald">
          ✅ Sahi · {counts.correct}
        </FilterChip>
        <FilterChip active={filter === "all"} onClick={() => setFilter("all")} tone="brand">
          Sab · {counts.all}
        </FilterChip>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={filter}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25 }}
          className="space-y-4"
        >
          {filtered.length === 0 ? (
            <div className="glass rounded-2xl p-8 text-center text-sm text-muted-foreground">
              Is category me koi question nahi.
            </div>
          ) : (
            filtered.map((a, idx) => (
              <ReviewCard key={a.id} answer={a} index={idx} totalIndex={answers.indexOf(a) + 1} />
            ))
          )}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}

function FilterChip({
  active, onClick, tone, children,
}: { active: boolean; onClick: () => void; tone: "rose" | "amber" | "emerald" | "brand"; children: React.ReactNode }) {
  const tones: Record<string, string> = {
    rose: "data-[active=true]:bg-rose-500/20 data-[active=true]:text-rose-400 data-[active=true]:ring-rose-500/40",
    amber: "data-[active=true]:bg-amber-500/20 data-[active=true]:text-amber-400 data-[active=true]:ring-amber-500/40",
    emerald: "data-[active=true]:bg-emerald-500/20 data-[active=true]:text-emerald-400 data-[active=true]:ring-emerald-500/40",
    brand: "data-[active=true]:bg-brand-500/20 data-[active=true]:text-brand-500 data-[active=true]:ring-brand-500/40",
  };
  return (
    <button
      type="button"
      data-active={active}
      onClick={onClick}
      className={`text-xs px-3 py-1.5 rounded-full glass ring-1 ring-transparent transition ${tones[tone]}`}
    >
      {children}
    </button>
  );
}

function ReviewCard({ answer, index, totalIndex }: { answer: AnswerWithQ; index: number; totalIndex: number }) {
  const q = answer.question;
  const skipped = answer.selectedIndex === null;
  const correct = !!answer.isCorrect;
  const statusBadge = skipped
    ? { Icon: MinusCircle, label: "Skip kiya", color: "text-amber-400 bg-amber-500/10 ring-amber-500/30" }
    : correct
    ? { Icon: CheckCircle2, label: "Sahi", color: "text-emerald-400 bg-emerald-500/10 ring-emerald-500/30" }
    : { Icon: XCircle, label: "Galat", color: "text-rose-400 bg-rose-500/10 ring-rose-500/30" };

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.05, 0.4), type: "spring", stiffness: 240, damping: 22 }}
      className="glass rounded-2xl p-5 gradient-border"
    >
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full ring-1 ${statusBadge.color}`}>
          <statusBadge.Icon className="h-3.5 w-3.5" />
          {statusBadge.label}
        </span>
        <span className="text-muted-foreground">Q{totalIndex}</span>
        {q.subject && <span className="px-1.5 py-0.5 rounded bg-muted text-muted-foreground">{q.subject.name}</span>}
        {q.chapter && <span className="text-muted-foreground">· {q.chapter.name}</span>}
        <span className="text-muted-foreground">· {q.difficulty}</span>
      </div>

      <p className="mt-3 font-medium leading-relaxed">{q.stem}</p>

      <ol className="mt-3 space-y-1.5 text-sm">
        {q.options.map((opt, i) => {
          const isCorrect = i === q.correctIndex;
          const isPicked = i === answer.selectedIndex;
          let cls = "border-white/5 bg-white/[0.02] text-muted-foreground";
          let prefix: React.ReactNode = String.fromCharCode(65 + i);
          if (isCorrect) {
            cls = "border-emerald-500/40 bg-emerald-500/10 text-emerald-200";
          }
          if (isPicked && !isCorrect) {
            cls = "border-rose-500/40 bg-rose-500/10 text-rose-200";
          }
          return (
            <motion.li
              key={i}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.08 + i * 0.04 }}
              className={`flex items-start gap-2 rounded-lg border px-3 py-2 ${cls}`}
            >
              <span className="font-mono text-xs mt-0.5 opacity-70">{prefix}.</span>
              <span className="flex-1">{opt}</span>
              <span className="text-xs whitespace-nowrap">
                {isCorrect && "✅ Sahi answer"}
                {isPicked && !isCorrect && " 👈 Aapka jawaab"}
                {isPicked && isCorrect && " 👈 Aapne chuna"}
              </span>
            </motion.li>
          );
        })}
      </ol>

      {q.explanation && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25 }}
          className="mt-3 rounded-lg border border-brand-500/20 bg-brand-500/5 p-3 text-sm"
        >
          <p className="text-xs uppercase tracking-wide text-brand-500 font-semibold mb-1">
            {skipped ? "Sahi answer kaise mile" : correct ? "Yeh sahi kaise hai" : "Yeh sahi kaise hai (aap kahaan galti kiye)"}
          </p>
          <p className="leading-relaxed text-muted-foreground">{q.explanation}</p>
        </motion.div>
      )}

      {/* Step-by-step zero-level explanation + Open in Book — for wrong/skipped only */}
      {!correct && <DeepExplain question={q} />}
    </motion.div>
  );
}

/* ──────────────────────────────────────────────────────────────────────── */

function DeepExplain({ question }: { question: AnswerWithQ["question"] }) {
  const [open, setOpen] = useState<boolean>(Boolean(question.explanationLong));
  const [loading, setLoading] = useState(false);
  const [text, setText] = useState<string | null>(question.explanationLong);
  const [err, setErr] = useState<string | null>(null);

  async function load() {
    if (text) { setOpen(true); return; }
    setLoading(true);
    setErr(null);
    const r = await api<{ explanation: string; cached: boolean }>("/api/ai/explain", {
      method: "POST",
      body: JSON.stringify({ questionId: question.id, language: "en" }),
    });
    setLoading(false);
    if (!r.ok) {
      setErr(r.error.message ?? r.error.code);
      return;
    }
    setText(r.data.explanation);
    setOpen(true);
  }

  const hasBook = !!question.pdfId;
  const bookHref = hasBook
    ? `/library/${question.pdfId}?page=${question.pdfPage ?? 1}${
        question.pdfHighlight ? `&hl=${encodeURIComponent(question.pdfHighlight)}` : ""
      }`
    : null;

  return (
    <div className="mt-3 flex flex-col gap-2">
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={text ? () => setOpen((v) => !v) : load}
          disabled={loading}
          className="gap-1.5"
        >
          {loading ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Lightbulb className="h-3.5 w-3.5 text-amber-400" />
          )}
          {text
            ? open
              ? "Step-by-step chhupao"
              : "Step-by-step dekho"
            : "Step-by-step samjhao (zero level)"}
          {text && (open ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />)}
        </Button>

        {hasBook && bookHref && (
          <Link href={bookHref}>
            <Button type="button" size="sm" variant="outline" className="gap-1.5">
              <BookOpen className="h-3.5 w-3.5 text-emerald-400" />
              Book mein dekho
            </Button>
          </Link>
        )}
      </div>

      {err && <p className="text-xs text-rose-400">⚠ {err}</p>}

      <AnimatePresence initial={false}>
        {open && text && (
          <motion.div
            key="deep"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="rounded-lg border border-emerald-500/25 bg-emerald-500/5 p-3 text-sm leading-relaxed">
              <p className="text-xs uppercase tracking-wide text-emerald-400 font-semibold mb-2 flex items-center gap-1">
                <Lightbulb className="h-3.5 w-3.5" /> Step-by-step samajh (zero level)
              </p>
              <DeepExplainBody text={text} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * Renders the cached explanation string with very light Markdown support:
 * lines starting with `**Concept:**` / `**Step-by-step:**` / `**Why students get this wrong:**`
 * become bold headings; numeric "1.", "2.", … lines become an ordered list.
 */
function DeepExplainBody({ text }: { text: string }) {
  const lines = text.split("\n").filter((l) => l.length > 0);
  return (
    <div className="space-y-2 text-muted-foreground">
      {lines.map((line, i) => {
        if (/^\*\*[^*]+\*\*\s*$/.test(line.trim())) {
          return (
            <p key={i} className="text-foreground font-semibold mt-2 first:mt-0">
              {line.replace(/\*\*/g, "")}
            </p>
          );
        }
        // Inline bold prefix like "**Concept:** Newton's First Law"
        const m = line.match(/^\*\*([^*]+)\*\*\s*(.*)$/);
        if (m) {
          return (
            <p key={i}>
              <span className="text-foreground font-semibold">{m[1]} </span>
              <span>{m[2]}</span>
            </p>
          );
        }
        return <p key={i}>{line}</p>;
      })}
    </div>
  );
}
