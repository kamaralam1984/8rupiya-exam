"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, ListChecks } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Dialog } from "@/components/ui/dialog";
import { TestTimer } from "@/components/test-timer";
import { TestNavigator, type NavStatus } from "@/components/test-navigator";
import { QuestionCard, type Question } from "@/components/question-card";
import { api } from "@/lib/api-client";
import { useToast } from "@/components/ui/toaster";
import { prefetchTranslations } from "@/lib/translate-cache";

type AnswerState = {
  selected: number | null;
  flagged: boolean;
  seen: boolean;
  timeSpentMs: number;
};

export type TestRunnerProps = {
  attemptId: string;
  testSetSlug: string;
  durationMin: number;
  questions: Question[];
};

export function TestRunner(props: TestRunnerProps) {
  const router = useRouter();
  const toast = useToast();
  const { attemptId, questions, durationMin } = props;
  const total = questions.length;

  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<AnswerState[]>(() =>
    questions.map(() => ({ selected: null, flagged: false, seen: false, timeSpentMs: 0 }))
  );
  const [submitting, setSubmitting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [navOpen, setNavOpen] = useState(false);
  const [timeLeft, setTimeLeft] = useState(durationMin * 60);

  const startedAtRef = useRef(Date.now());
  const lastTickRef = useRef(Date.now());
  const violationsRef = useRef<{ kind: string; at: number }[]>([]);
  const [violationToast, setViolationToast] = useState<string | null>(null);

  // Prefetch translations for both languages in the background so toggling is instant.
  useEffect(() => {
    const ids = questions.map((q) => q.id);
    if (ids.length === 0) return;
    const sourceLangs = new Set(questions.map((q) => (q.language ?? "en") as "en" | "hi"));
    // For each language NOT in the source set, prefetch translations
    for (const target of ["en", "hi"] as const) {
      if (sourceLangs.size === 1 && sourceLangs.has(target)) continue;
      prefetchTranslations({ questionIds: ids, targetLang: target }).catch(() => {});
    }
  }, [questions]);

  // anti-cheat: log tab switches, paste, copy, fullscreen exits
  useEffect(() => {
    const log = (kind: string) => {
      violationsRef.current.push({ kind, at: Date.now() });
      setViolationToast(kind);
      setTimeout(() => setViolationToast(null), 2500);
    };
    const onVis = () => { if (document.hidden) log("tab-hidden"); };
    const onBlur = () => log("window-blur");
    const onPaste = (e: ClipboardEvent) => { log("paste"); e.preventDefault(); };
    const onCopy = (e: ClipboardEvent) => { log("copy"); e.preventDefault(); };
    const onCtx = (e: MouseEvent) => { log("context-menu"); e.preventDefault(); };
    document.addEventListener("visibilitychange", onVis);
    window.addEventListener("blur", onBlur);
    document.addEventListener("paste", onPaste);
    document.addEventListener("copy", onCopy);
    document.addEventListener("contextmenu", onCtx);
    return () => {
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("blur", onBlur);
      document.removeEventListener("paste", onPaste);
      document.removeEventListener("copy", onCopy);
      document.removeEventListener("contextmenu", onCtx);
    };
  }, []);

  // accumulate time-on-question
  useEffect(() => {
    lastTickRef.current = Date.now();
    setAnswers((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], seen: true };
      return next;
    });
    return () => {
      const now = Date.now();
      const delta = now - lastTickRef.current;
      setAnswers((prev) => {
        const next = [...prev];
        next[index] = { ...next[index], timeSpentMs: next[index].timeSpentMs + delta };
        return next;
      });
    };
  }, [index]);

  const statuses: NavStatus[] = useMemo(
    () =>
      answers.map((a) => {
        if (a.flagged && a.selected !== null) return "review-answered";
        if (a.flagged) return "review";
        if (a.selected !== null) return "answered";
        if (a.seen) return "skipped";
        return "unseen";
      }),
    [answers]
  );

  const answered = useMemo(
    () => answers.filter((a) => a.selected !== null).length,
    [answers]
  );

  const select = (i: number) => {
    setAnswers((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], selected: i };
      return next;
    });
    // Auto-advance to next question after a short pause
    if (index < total - 1) {
      setTimeout(() => setIndex((cur) => Math.min(total - 1, cur + 1)), 500);
    }
  };

  const clear = () =>
    setAnswers((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], selected: null };
      return next;
    });

  const toggleFlag = () =>
    setAnswers((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], flagged: !next[index].flagged };
      return next;
    });

  const jump = (i: number) => {
    setIndex(i);
    setNavOpen(false);
  };
  const prev = () => setIndex((i) => Math.max(0, i - 1));
  const next = () => setIndex((i) => Math.min(total - 1, i + 1));

  const submit = useCallback(async () => {
    setSubmitting(true);
    const payload = {
      attemptId,
      violations: violationsRef.current,
      answers: questions.map((q, i) => ({
        questionId: q.id,
        selectedIndex: answers[i].selected ?? -1,
        timeSpentMs: answers[i].timeSpentMs,
        flagged: answers[i].flagged,
        guessed: false,
      })),
    };
    const r = await api("/api/attempts/submit", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    setSubmitting(false);
    if (!r.ok) {
      toast(r.error.message ?? r.error.code, "error");
      return;
    }
    toast("Submitted! Loading your report…", "success");
    router.push(`/attempt/${attemptId}/result`);
  }, [attemptId, answers, questions, router]);

  // warn on tab close
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, []);

  // keyboard nav
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;
      if (["1", "2", "3", "4"].includes(e.key)) {
        select(parseInt(e.key) - 1);
      } else if (e.key === "ArrowLeft") prev();
      else if (e.key === "ArrowRight") next();
      else if (e.key.toLowerCase() === "f") toggleFlag();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index]);

  const q = questions[index];

  return (
    <div className="container py-6 md:py-8">
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground">Attempt</span>
          <code className="text-xs px-2 py-0.5 rounded bg-muted">{attemptId.slice(0, 8)}</code>
        </div>
        <div className="flex items-center gap-2">
          <TestTimer
            startedAt={startedAtRef.current}
            durationMin={durationMin}
            onExpire={submit}
            onTick={setTimeLeft}
          />
          <button
            className="md:hidden glass rounded-md px-3 py-1.5 text-xs font-medium"
            onClick={() => setNavOpen(true)}
          >
            <ListChecks className="h-4 w-4 inline mr-1" /> Palette
          </button>
        </div>
      </div>

      {(() => {
        const timePercent = (timeLeft / (durationMin * 60)) * 100;
        const hue = Math.max(0, Math.min(120, timePercent * 1.2));
        const barColor = `hsl(${hue}, 80%, 45%)`;
        const timeLabel = timeLeft <= 60 ? "text-red-500" : timeLeft <= 300 ? "text-amber-500" : "";
        return (
          <>
            <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
              <span>{answered}/{total} answered</span>
              <span className={timeLabel}>Time remaining</span>
            </div>
            <Progress value={(answered / total) * 100} className="mb-1.5 h-2" />
            <div className="mb-6 h-1.5 w-full rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-1000"
                style={{ width: `${timePercent}%`, backgroundColor: barColor }}
              />
            </div>
          </>
        );
      })()}

      <div className="grid md:grid-cols-[1fr_280px] gap-6">
        <div>
          <motion.div
            key={q.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            <QuestionCard
              q={q}
              index={index}
              total={total}
              selected={answers[index].selected}
              flagged={answers[index].flagged}
              onSelect={select}
              onToggleFlag={toggleFlag}
              onClear={clear}
            />
          </motion.div>
          <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
            <Button variant="outline" onClick={prev} disabled={index === 0}>
              <ArrowLeft className="h-4 w-4" /> Previous
            </Button>
            <div className="flex items-center gap-2">
              <Button variant="ghost" onClick={() => setConfirmOpen(true)}>
                Submit test
              </Button>
              <Button onClick={next} disabled={index === total - 1}>
                Next <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
        <div className="hidden md:block">
          <TestNavigator
            total={total}
            current={index}
            statuses={statuses}
            onJump={jump}
          />
        </div>
      </div>

      <Dialog open={navOpen} onOpenChange={setNavOpen} className="max-w-sm">
        <TestNavigator total={total} current={index} statuses={statuses} onJump={jump} />
      </Dialog>

      {violationToast && (
        <div className="fixed top-4 right-4 z-50 glass rounded-lg px-3 py-2 text-xs text-amber-500 gradient-border">
          ⚠ Activity flagged: {violationToast}
        </div>
      )}

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <h3 className="font-display text-xl font-bold">Submit your test?</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          You've answered <strong>{answered}</strong> of <strong>{total}</strong> questions.
          Once submitted you cannot change your answers.
        </p>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setConfirmOpen(false)}>Keep going</Button>
          <Button onClick={submit} disabled={submitting}>
            {submitting ? "Submitting…" : "Submit now"}
          </Button>
        </div>
      </Dialog>
    </div>
  );
}
