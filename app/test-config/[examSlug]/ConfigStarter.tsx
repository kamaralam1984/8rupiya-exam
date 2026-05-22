"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Clock, BookOpen, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TestRunner } from "@/components/test-runner";
import { api } from "@/lib/api-client";
import type { Question } from "@/components/question-card";

const Q_OPTIONS = [25, 50, 100, 200, 300];
const DEFAULT_TIMES: Record<number, number> = {
  25: 30,
  50: 45,
  100: 60,
  200: 90,
  300: 120,
};
const TIME_OPTIONS = [15, 30, 45, 60, 90, 120];

type StartResp = {
  attemptId: string;
  testSetSlug: string;
  durationMin: number;
  questions: Question[];
};

type State =
  | { kind: "config" }
  | { kind: "loading" }
  | { kind: "error"; message: string }
  | { kind: "ready"; data: StartResp };

export function ConfigStarter({
  examSlug,
  examName,
  subjects,
}: {
  examSlug: string;
  examName: string;
  subjects: string[];
}) {
  const router = useRouter();
  const [qCount, setQCount] = useState(50);
  const [timeMin, setTimeMin] = useState(DEFAULT_TIMES[50]);
  const [timeCustom, setTimeCustom] = useState(false);
  const [subject, setSubject] = useState<string | null>(null);
  const [state, setState] = useState<State>({ kind: "config" });

  function handleQCount(n: number) {
    setQCount(n);
    if (!timeCustom) setTimeMin(DEFAULT_TIMES[n]);
  }

  async function startTest() {
    setState({ kind: "loading" });
    const r = await api<StartResp>("/api/attempts/start-custom", {
      method: "POST",
      body: JSON.stringify({ examSlug, questionCount: qCount, durationMin: timeMin, subject: subject ?? undefined }),
    });
    if (!r.ok) {
      if (r.error.code === "UNAUTHENTICATED") {
        router.push(`/signin?next=/test-config/${examSlug}`);
        return;
      }
      setState({ kind: "error", message: r.error.message ?? r.error.code });
      return;
    }
    setState({ kind: "ready", data: r.data });
  }

  if (state.kind === "loading") {
    return (
      <div className="container py-20 grid place-items-center">
        <Loader2 className="h-6 w-6 animate-spin text-brand-500" />
        <p className="mt-3 text-sm text-muted-foreground">Preparing your custom test…</p>
      </div>
    );
  }

  if (state.kind === "error") {
    return (
      <div className="container py-16 max-w-md">
        <div className="glass rounded-2xl p-7 gradient-border">
          <h1 className="font-display text-xl font-bold">Could not start test</h1>
          <p className="mt-2 text-sm text-red-500">{state.message}</p>
          <div className="mt-4 flex gap-2">
            <Button onClick={() => setState({ kind: "config" })}>Try again</Button>
          </div>
        </div>
      </div>
    );
  }

  if (state.kind === "ready") {
    return (
      <TestRunner
        attemptId={state.data.attemptId}
        testSetSlug={state.data.testSetSlug}
        durationMin={state.data.durationMin}
        questions={state.data.questions}
      />
    );
  }

  return (
    <div className="container py-12 max-w-lg">
      <div className="glass rounded-3xl p-8 gradient-border space-y-8">
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Custom Mock</p>
          <h1 className="font-display text-2xl font-bold mt-1">
            {examName} <span className="gradient-text">Mock Test</span>
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Apni pasand ke questions aur time ke saath practice karo
          </p>
        </div>

        {/* Subject selection */}
        {subjects.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Layers className="h-4 w-4 text-brand-500" />
              <p className="font-semibold text-sm">Kaunsa subject?</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSubject(null)}
                className={`px-4 py-2 rounded-xl text-sm font-medium border transition-colors ${
                  subject === null
                    ? "bg-brand-500 text-white border-brand-500"
                    : "glass border-white/10 hover:border-brand-500/50"
                }`}
              >
                All Subjects
              </button>
              {subjects.map((s) => (
                <button
                  key={s}
                  onClick={() => setSubject(s)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium border transition-colors ${
                    subject === s
                      ? "bg-brand-500 text-white border-brand-500"
                      : "glass border-white/10 hover:border-brand-500/50"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Question count */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <BookOpen className="h-4 w-4 text-brand-500" />
            <p className="font-semibold text-sm">Kitne questions?</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {Q_OPTIONS.map((n) => (
              <button
                key={n}
                onClick={() => handleQCount(n)}
                className={`px-4 py-2 rounded-xl text-sm font-medium border transition-colors ${
                  qCount === n
                    ? "bg-brand-500 text-white border-brand-500"
                    : "glass border-white/10 hover:border-brand-500/50"
                }`}
              >
                {n} Q
              </button>
            ))}
          </div>
        </div>

        {/* Time selection */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Clock className="h-4 w-4 text-brand-500" />
            <p className="font-semibold text-sm">Kitna time?</p>
            <span className="text-xs text-muted-foreground ml-auto">
              (auto: {DEFAULT_TIMES[qCount]} min)
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {TIME_OPTIONS.map((t) => (
              <button
                key={t}
                onClick={() => { setTimeMin(t); setTimeCustom(t !== DEFAULT_TIMES[qCount]); }}
                className={`px-4 py-2 rounded-xl text-sm font-medium border transition-colors ${
                  timeMin === t
                    ? "bg-brand-500 text-white border-brand-500"
                    : "glass border-white/10 hover:border-brand-500/50"
                }`}
              >
                {t} min
              </button>
            ))}
          </div>
        </div>

        {/* Summary */}
        <div className="glass rounded-xl p-4 text-sm text-muted-foreground space-y-1.5">
          <div className="flex justify-between">
            <span>Questions</span>
            <span className="text-foreground font-medium">{qCount}</span>
          </div>
          <div className="flex justify-between">
            <span>Time limit</span>
            <span className="text-foreground font-medium">{timeMin} minutes</span>
          </div>
          <div className="flex justify-between">
            <span>Avg per question</span>
            <span className="text-foreground font-medium">
              {((timeMin * 60) / qCount).toFixed(0)}s
            </span>
          </div>
          <div className="flex justify-between">
            <span>Subject</span>
            <span className="text-foreground font-medium">{subject ?? "All subjects"}</span>
          </div>
          <div className="flex justify-between">
            <span>Source</span>
            <span className="text-foreground font-medium">PDF question bank</span>
          </div>
        </div>

        <Button size="lg" className="w-full" onClick={startTest}>
          Start Test
        </Button>
      </div>
    </div>
  );
}
