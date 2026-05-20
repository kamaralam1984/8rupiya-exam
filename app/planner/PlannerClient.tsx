"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Loader2, Calendar, BookOpen, Sparkles, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api-client";
import { EXAMS } from "@/lib/exams";
import { useUser } from "@/lib/use-user";
import { useExamSubjects } from "@/lib/use-exam-subjects";

type Plan = {
  id: string;
  examName: string;
  summary: string;
  weeks: { weekNumber: number; focus: string; days: { day: number; tasks: string[]; mockTest: boolean }[] }[];
  tips: string[];
};

export function PlannerClient() {
  const { user } = useUser();
  const [exam, setExam] = useState(EXAMS[0].slug);
  const [subjectSlug, setSubjectSlug] = useState("");
  const [days, setDays] = useState(30);
  const [hours, setHours] = useState(2);
  const [goal, setGoal] = useState("");
  const [lang, setLang] = useState<"en" | "hi">("en");
  const [plan, setPlan] = useState<Plan | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const { subjects, loading: loadingSubjects } = useExamSubjects(exam);

  useEffect(() => {
    if (user?.examTrack && EXAMS.some((e) => e.slug === user.examTrack)) {
      setExam(user.examTrack);
    }
  }, [user?.examTrack]);

  useEffect(() => {
    setSubjectSlug("");
  }, [exam]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setErr(null);
    const r = await api<Plan>("/api/ai/plan", {
      method: "POST",
      body: JSON.stringify({
        examSlug: exam,
        subjectSlug: subjectSlug || undefined,
        days,
        hoursDaily: hours,
        goal: goal || undefined,
        language: lang,
      }),
    });
    setLoading(false);
    if (!r.ok) {
      setErr(r.error.code === "UNAUTHENTICATED" ? "Sign in to build a plan." : (r.error.message ?? r.error.code));
      return;
    }
    setPlan(r.data);
  }

  return (
    <div className="space-y-5">
      <form onSubmit={submit} className="glass rounded-2xl p-5 gradient-border grid sm:grid-cols-2 gap-4">
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
          <span className="text-xs text-muted-foreground">Days available</span>
          <input
            type="number" min={3} max={180} value={days}
            onChange={(e) => setDays(parseInt(e.target.value) || 30)}
            className="mt-1 w-full bg-background border border-border rounded-md px-3 py-2 text-sm"
          />
        </label>
        <label className="block">
          <span className="text-xs text-muted-foreground">Daily hours</span>
          <input
            type="number" min={0.5} max={12} step={0.5} value={hours}
            onChange={(e) => setHours(parseFloat(e.target.value) || 2)}
            className="mt-1 w-full bg-background border border-border rounded-md px-3 py-2 text-sm"
          />
        </label>
        <label className="block">
          <span className="text-xs text-muted-foreground">Language</span>
          <select
            value={lang}
            onChange={(e) => setLang(e.target.value as "en" | "hi")}
            className="mt-1 w-full bg-background border border-border rounded-md px-3 py-2 text-sm"
          >
            <option value="en">English</option>
            <option value="hi">हिंदी</option>
          </select>
        </label>
        <label className="block sm:col-span-2">
          <span className="text-xs text-muted-foreground">Optional goal</span>
          <input
            type="text" maxLength={200} value={goal}
            onChange={(e) => setGoal(e.target.value)}
            placeholder="e.g. Improve quantitative aptitude, score 90+ in mock"
            className="mt-1 w-full bg-background border border-border rounded-md px-3 py-2 text-sm"
          />
        </label>
        <div className="sm:col-span-2 flex justify-end">
          <Button type="submit" disabled={loading}>
            {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Building…</> : <><Sparkles className="h-4 w-4" /> Generate plan</>}
          </Button>
        </div>
      </form>

      {err && <p className="text-sm text-red-500">{err}</p>}

      {plan && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
          <div className="glass rounded-2xl p-5 gradient-border">
            <h2 className="font-display text-xl font-bold">{plan.examName}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{plan.summary}</p>
          </div>
          {plan.weeks.map((w) => (
            <div key={w.weekNumber} className="glass rounded-2xl p-5 gradient-border">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-brand-500" />
                <h3 className="font-display font-semibold">Week {w.weekNumber}</h3>
                <span className="text-xs text-muted-foreground">· {w.focus}</span>
              </div>
              <div className="mt-3 grid sm:grid-cols-2 gap-2">
                {w.days.map((d) => (
                  <div key={d.day} className="rounded-lg border border-border/40 p-3">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Day {d.day}</span>
                      {d.mockTest && (
                        <span className="inline-flex items-center gap-1 text-brand-500">
                          <BookOpen className="h-3 w-3" /> Mock
                        </span>
                      )}
                    </div>
                    <ul className="mt-2 space-y-1 text-sm">
                      {d.tasks.map((t, i) => (
                        <li key={i} className="flex gap-2">
                          <CheckCircle2 className="h-3.5 w-3.5 text-muted-foreground mt-0.5 shrink-0" />
                          <span>{t}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          ))}
          {plan.tips?.length > 0 && (
            <div className="glass rounded-2xl p-5 gradient-border">
              <h3 className="font-display font-semibold mb-2">Smart tips</h3>
              <ul className="space-y-1 text-sm list-disc pl-5">
                {plan.tips.map((t, i) => <li key={i}>{t}</li>)}
              </ul>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
