"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Loader2, Sparkles, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api-client";
import { EXAMS } from "@/lib/exams";
import { useUser } from "@/lib/use-user";
import { useExamSubjects } from "@/lib/use-exam-subjects";

type Question = {
  stem: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  difficulty: string;
  topic: string;
};

type PredictResp = { title: string; rationale: string; questions: Question[] };

type JobState =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "polling"; jobId: string }
  | { kind: "done"; data: PredictResp }
  | { kind: "error"; message: string };

export function PredictClient() {
  const { user } = useUser();
  const [exam, setExam] = useState(EXAMS[0].slug);
  const [subjectSlug, setSubjectSlug] = useState("");
  const [count, setCount] = useState(15);
  const [state, setState] = useState<JobState>({ kind: "idle" });
  const [reveal, setReveal] = useState<Record<number, boolean>>({});
  const { subjects, loading: loadingSubjects } = useExamSubjects(exam);

  // Default exam to user's selected track, once known
  useEffect(() => {
    if (user?.examTrack && EXAMS.some((e) => e.slug === user.examTrack)) {
      setExam(user.examTrack);
    }
  }, [user?.examTrack]);

  // Reset subject when exam changes
  useEffect(() => {
    setSubjectSlug("");
  }, [exam]);

  useEffect(() => {
    if (state.kind !== "polling") return;
    let cancelled = false;
    const tick = async () => {
      const r = await api<{ id: string; status: string; output?: PredictResp; error?: string }>(
        `/api/ai/predict?jobId=${state.jobId}`
      );
      if (cancelled) return;
      if (!r.ok) {
        setState({ kind: "error", message: r.error.message ?? r.error.code });
        return;
      }
      if (r.data.status === "COMPLETED" && r.data.output) {
        setState({ kind: "done", data: r.data.output });
      } else if (r.data.status === "FAILED") {
        setState({ kind: "error", message: r.data.error ?? "Job failed" });
      } else {
        setTimeout(tick, 2500);
      }
    };
    tick();
    return () => { cancelled = true; };
  }, [state]);

  async function submit() {
    setState({ kind: "loading" });
    const r = await api<{ jobId: string; status: string }>("/api/ai/predict", {
      method: "POST",
      body: JSON.stringify({
        examSlug: exam,
        subjectSlug: subjectSlug || undefined,
        count,
      }),
    });
    if (!r.ok) {
      setState({ kind: "error", message: r.error.code === "UNAUTHENTICATED" ? "Sign in to generate." : (r.error.message ?? r.error.code) });
      return;
    }
    setState({ kind: "polling", jobId: r.data.jobId });
  }

  return (
    <div className="space-y-5">
      <div className="glass rounded-2xl p-5 gradient-border grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <label className="block">
          <span className="text-xs text-muted-foreground">Class / Exam</span>
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
          <span className="text-xs text-muted-foreground">Question count</span>
          <input
            type="number"
            min={5}
            max={50}
            value={count}
            onChange={(e) => setCount(parseInt(e.target.value) || 15)}
            className="mt-1 w-full bg-background border border-border rounded-md px-3 py-2 text-sm"
          />
        </label>
        <div className="flex items-end">
          <Button
            onClick={submit}
            disabled={state.kind === "loading" || state.kind === "polling"}
            className="w-full"
          >
            {state.kind === "loading" || state.kind === "polling" ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Generating…</>
            ) : (
              <><Sparkles className="h-4 w-4" /> Generate</>
            )}
          </Button>
        </div>
      </div>

      {state.kind === "polling" && (
        <div className="glass rounded-xl p-4 text-sm text-muted-foreground inline-flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" /> AI is building your predicted set — usually 10-20 seconds.
        </div>
      )}

      {state.kind === "error" && <p className="text-sm text-red-500">{state.message}</p>}

      {state.kind === "done" && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <div className="glass rounded-2xl p-5 gradient-border">
            <h2 className="font-display text-xl font-bold">{state.data.title}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{state.data.rationale}</p>
          </div>
          {state.data.questions.map((q, i) => (
            <div key={i} className="glass rounded-2xl p-5 gradient-border">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Q{i + 1} · {q.topic}</span>
                <span>{q.difficulty}</span>
              </div>
              <p className="mt-2 font-medium">{q.stem}</p>
              <div className="mt-3 space-y-1">
                {q.options.map((opt, j) => {
                  const correct = j === q.correctIndex;
                  const shown = reveal[i];
                  return (
                    <div
                      key={j}
                      className={`text-sm rounded-md px-3 py-2 border ${
                        shown && correct
                          ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                          : "border-border"
                      }`}
                    >
                      <span className="font-mono mr-2">{String.fromCharCode(65 + j)}.</span>{opt}
                    </div>
                  );
                })}
              </div>
              <button
                onClick={() => setReveal((p) => ({ ...p, [i]: !p[i] }))}
                className="mt-3 text-xs text-brand-500 hover:underline inline-flex items-center gap-1"
              >
                <Target className="h-3.5 w-3.5" /> {reveal[i] ? "Hide answer" : "Reveal answer"}
              </button>
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
