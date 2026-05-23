"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Loader2, Flame, CheckCircle2, XCircle, Sparkles, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api-client";
import { EXAMS } from "@/lib/exams";
import { useUser } from "@/lib/use-user";
import Link from "next/link";

type Q = {
  id: string;
  stem: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  topic?: string;
  difficulty?: string;
};
type Resp = { date: string; examSlug: string; authed: boolean; questions: Q[] };

export function DppClient() {
  const { user } = useUser();
  const [exam, setExam] = useState(EXAMS[0].slug);
  const [data, setData] = useState<Resp | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (user?.examTrack && EXAMS.some((e) => e.slug === user.examTrack)) setExam(user.examTrack);
  }, [user?.examTrack]);

  async function load() {
    setErr(null);
    setLoading(true);
    setAnswers({});
    setSubmitted(false);
    const r = await api<Resp>(`/api/dpp/today?exam=${exam}`);
    setLoading(false);
    if (!r.ok) { setErr(r.error.message ?? "Failed"); return; }
    setData(r.data);
  }

  useEffect(() => { load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [exam]);

  const correct = data?.questions.reduce((s, q, i) => s + (answers[i] === q.correctIndex ? 1 : 0), 0) ?? 0;
  const allDone = data ? Object.keys(answers).length === data.questions.length : false;

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
        <div className="ai-chip ml-auto">
          <Flame className="h-3 w-3 text-orange-300" /> Streak: {user?.streak ?? 0}
        </div>
        {data && <span className="text-xs text-muted-foreground">{data.date}</span>}
      </div>

      {err && <p className="text-sm text-rose-400">{err}</p>}

      {loading && (
        <div className="neon-card p-10 text-center">
          <Loader2 className="h-8 w-8 mx-auto animate-spin text-brand-500" />
          <p className="mt-3 text-sm text-muted-foreground">Today's DPP loading…</p>
        </div>
      )}

      {data?.questions.map((q, i) => {
        const picked = answers[i];
        const isCorrect = picked === q.correctIndex;
        return (
          <motion.div
            key={q.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            className="neon-card p-5"
          >
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Q{i + 1} · {q.topic || "Mixed"}</span>
              <span>{q.difficulty}</span>
            </div>
            <p className="mt-2 font-medium">{q.stem}</p>
            <div className="mt-3 space-y-2">
              {q.options.map((opt, j) => {
                const isPicked = picked === j;
                const showCorrect = submitted && j === q.correctIndex;
                const showWrong = submitted && isPicked && j !== q.correctIndex;
                return (
                  <button
                    key={j}
                    onClick={() => !submitted && setAnswers((p) => ({ ...p, [i]: j }))}
                    disabled={submitted}
                    className={`w-full text-left rounded-md px-4 py-2.5 border text-sm transition ${
                      showCorrect
                        ? "border-emerald-500/60 bg-emerald-500/10 text-emerald-200"
                        : showWrong
                        ? "border-rose-500/60 bg-rose-500/10 text-rose-200"
                        : isPicked
                        ? "border-brand-500/60 bg-brand-500/10"
                        : "border-border hover:border-foreground/30"
                    }`}
                  >
                    <span className="font-mono mr-2 text-muted-foreground">{String.fromCharCode(65 + j)}.</span>
                    {opt}
                  </button>
                );
              })}
            </div>
            {submitted && (
              <div className="mt-3 flex items-start gap-2 text-sm">
                {isCorrect ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
                )}
                <span className="text-muted-foreground">{q.explanation || "No explanation available."}</span>
              </div>
            )}
          </motion.div>
        );
      })}

      {data && !submitted && (
        <Button onClick={() => setSubmitted(true)} disabled={!allDone} className="btn-ai">
          <Target className="h-4 w-4" /> Submit DPP {!allDone && `(${Object.keys(answers).length}/${data.questions.length})`}
        </Button>
      )}

      {submitted && data && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          className="neon-card p-6 bg-gradient-to-br from-emerald-500/10 to-cyan-500/5">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Today's score</p>
          <p className="font-display text-6xl font-bold ai-gradient-text-cyan">{correct}/{data.questions.length}</p>
          <p className="mt-2 text-sm text-muted-foreground">
            <Sparkles className="inline h-3.5 w-3.5 text-purple-300" /> Wrong answers ko SRS deck mein add karo for retention.
          </p>
          <div className="mt-4 flex gap-3 flex-wrap">
            <Link href="/revise" className="btn-ai">Add to Revise →</Link>
            <Link href="/battle" className="btn-ghost-ai">Battle 1v1</Link>
          </div>
        </motion.div>
      )}
    </div>
  );
}
