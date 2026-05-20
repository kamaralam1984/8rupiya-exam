"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Loader2, Search, Archive, Sparkles, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api-client";
import { EXAMS } from "@/lib/exams";
import { useUser } from "@/lib/use-user";
import { useExamSubjects } from "@/lib/use-exam-subjects";
import { cn } from "@/lib/utils";

type Question = {
  id: string;
  stem: string;
  options: string[];
  correctIndex: number;
  difficulty: string;
  language: string;
  year: number | null;
  topic: string | null;
  examSlug: string | null;
  subject: { name: string; slug: string } | null;
};

type Resp = {
  items: Question[];
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
  years: { year: number; count: number }[];
};

const CURRENT = new Date().getFullYear();

export function PyqClient() {
  const { user } = useUser();
  const [exam, setExam] = useState(EXAMS[0].slug);
  const [subjectSlug, setSubjectSlug] = useState("");
  const [yearFrom, setYearFrom] = useState<number>(CURRENT - 10);
  const [yearTo, setYearTo] = useState<number>(CURRENT - 1);
  const [topic, setTopic] = useState("");
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [data, setData] = useState<Resp | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [reveal, setReveal] = useState<Record<string, boolean>>({});
  const { subjects, loading: loadingSubjects } = useExamSubjects(exam);

  useEffect(() => {
    if (user?.examTrack && EXAMS.some((e) => e.slug === user.examTrack)) {
      setExam(user.examTrack);
    }
  }, [user?.examTrack]);

  useEffect(() => {
    setSubjectSlug("");
    setPage(1);
  }, [exam]);

  async function search(opts?: { page?: number }) {
    setLoading(true);
    setErr(null);
    const p = opts?.page ?? page;
    const sp = new URLSearchParams({
      examSlug: exam,
      page: String(p),
      pageSize: "20",
    });
    if (subjectSlug) sp.set("subjectSlug", subjectSlug);
    if (yearFrom) sp.set("yearFrom", String(yearFrom));
    if (yearTo) sp.set("yearTo", String(yearTo));
    if (topic.trim()) sp.set("topic", topic.trim());
    if (q.trim()) sp.set("q", q.trim());
    const r = await api<Resp>(`/api/pyq?${sp.toString()}`);
    setLoading(false);
    if (!r.ok) {
      setErr(r.error.code === "UNAUTHENTICATED" ? "Sign in to view previous-year questions." : (r.error.message ?? r.error.code));
      return;
    }
    setData(r.data);
    setPage(p);
  }

  useEffect(() => {
    search({ page: 1 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exam, subjectSlug]);

  const byYear = useMemo(() => {
    if (!data) return [];
    const groups = new Map<number, Question[]>();
    for (const item of data.items) {
      const y = item.year ?? 0;
      if (!groups.has(y)) groups.set(y, []);
      groups.get(y)!.push(item);
    }
    return Array.from(groups.entries()).sort((a, b) => b[0] - a[0]);
  }, [data]);

  return (
    <div className="space-y-5">
      {/* Filter bar */}
      <div className="glass rounded-2xl p-5 gradient-border grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
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
        <div className="grid grid-cols-2 gap-2">
          <label className="block">
            <span className="text-xs text-muted-foreground">Year from</span>
            <Input type="number" min={1990} max={CURRENT}
              value={yearFrom}
              onChange={(e) => setYearFrom(parseInt(e.target.value) || yearFrom)}
            />
          </label>
          <label className="block">
            <span className="text-xs text-muted-foreground">to</span>
            <Input type="number" min={1990} max={CURRENT}
              value={yearTo}
              onChange={(e) => setYearTo(parseInt(e.target.value) || yearTo)}
            />
          </label>
        </div>
        <label className="block">
          <span className="text-xs text-muted-foreground">Topic / keyword</span>
          <Input value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="e.g. Algebra" />
        </label>
      </div>

      <div className="flex flex-wrap items-center gap-3 justify-between">
        <div className="flex items-center gap-2 max-w-md flex-1">
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search question text…"
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); search({ page: 1 }); } }}
          />
          <Button onClick={() => search({ page: 1 })} disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            Search
          </Button>
        </div>
        <Link href={`/predict?examSlug=${exam}&subjectSlug=${subjectSlug}`}>
          <Button variant="outline" className="gap-1">
            <Sparkles className="h-4 w-4" /> AI predict for 2026
          </Button>
        </Link>
      </div>

      {/* Per-year coverage */}
      {data && data.years.length > 0 && (
        <div className="glass rounded-xl p-3 flex flex-wrap gap-2 gradient-border">
          <span className="text-xs text-muted-foreground inline-flex items-center gap-1">
            <Calendar className="h-3 w-3" /> Coverage:
          </span>
          {data.years.map((y) => (
            <button
              key={y.year}
              onClick={() => { setYearFrom(y.year); setYearTo(y.year); search({ page: 1 }); }}
              className="text-xs px-2 py-1 rounded-md border border-border hover:border-brand-500/50"
            >
              {y.year} · <span className="text-muted-foreground">{y.count}</span>
            </button>
          ))}
        </div>
      )}

      {err && <p className="text-sm text-red-500">{err}</p>}

      {/* Results */}
      {!data ? (
        <div className="text-center py-10">
          <Loader2 className="h-6 w-6 animate-spin text-brand-500 mx-auto" />
        </div>
      ) : data.items.length === 0 ? (
        <div className="glass rounded-2xl p-8 text-center gradient-border">
          <Archive className="h-8 w-8 text-muted-foreground mx-auto" />
          <p className="mt-3 text-sm text-muted-foreground">
            No previous-year questions for these filters yet. Admin can upload past papers from{" "}
            <Link href="/admin/pdfs" className="text-brand-500 hover:underline">/admin/pdfs</Link> in
            "Previous-Year Paper" mode.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {byYear.map(([year, items]) => (
            <section key={year}>
              <div className="flex items-center gap-2 mb-2">
                <span className="font-display text-lg font-semibold">{year}</span>
                <span className="text-xs text-muted-foreground">· {items.length} question{items.length !== 1 ? "s" : ""}</span>
              </div>
              <div className="space-y-3">
                {items.map((it) => (
                  <motion.div
                    key={it.id}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass rounded-xl p-4 gradient-border"
                  >
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <div className="flex items-center gap-2">
                        {it.subject?.name && <span className="px-2 py-0.5 rounded bg-muted">{it.subject.name}</span>}
                        {it.topic && <span>{it.topic}</span>}
                      </div>
                      <span>{it.difficulty}</span>
                    </div>
                    <p className="mt-2 text-sm md:text-base font-medium leading-relaxed">{it.stem}</p>
                    <div className="mt-3 grid gap-1.5">
                      {it.options.map((opt, j) => {
                        const isCorrect = j === it.correctIndex;
                        const shown = reveal[it.id];
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
                            <span className="font-mono mr-2 text-muted-foreground">{String.fromCharCode(65 + j)}.</span>
                            {opt}
                          </div>
                        );
                      })}
                    </div>
                    <button
                      onClick={() => setReveal((p) => ({ ...p, [it.id]: !p[it.id] }))}
                      className="mt-2 text-xs text-brand-500 hover:underline"
                    >
                      {reveal[it.id] ? "Hide answer" : "Reveal answer"}
                    </button>
                  </motion.div>
                ))}
              </div>
            </section>
          ))}

          {/* Pagination */}
          {data.pageCount > 1 && (
            <div className="flex items-center justify-center gap-2 pt-2">
              <Button
                variant="ghost"
                size="sm"
                disabled={page <= 1 || loading}
                onClick={() => search({ page: page - 1 })}
              >Prev</Button>
              <span className="text-xs text-muted-foreground">
                Page {page} of {data.pageCount} · {data.total} total
              </span>
              <Button
                variant="ghost"
                size="sm"
                disabled={page >= data.pageCount || loading}
                onClick={() => search({ page: page + 1 })}
              >Next</Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
