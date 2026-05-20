"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Loader2, FileText, Sparkles, BookOpen, ListChecks, X, Plus, Archive } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api-client";
import { EXAMS } from "@/lib/exams";
import { cn } from "@/lib/utils";

type Mode = "book" | "questions" | "pyq";

type Pdf = {
  id: string;
  filename: string;
  storagePath: string;
  status: string;
  pageCount: number | null;
  fileSize: number | null;
  createdAt: string;
  exam: { name: string; slug: string } | null;
  _count: { questions: number };
};

type Subject = { id: string; name: string; slug: string };
type ExamDetail = { subjects: Subject[] };

const DEFAULTS = {
  durationMin: 60,
  totalQuestions: 50,
  easyPct: 30,
  mediumPct: 50,
  hardPct: 20,
  language: "en" as "en" | "hi",
  autoCreateTestSet: true,
  isPremium: false,
};

function humanSize(bytes: number | null) {
  if (!bytes) return "—";
  const mb = bytes / (1024 * 1024);
  return mb >= 1 ? `${mb.toFixed(1)} MB` : `${(bytes / 1024).toFixed(0)} KB`;
}

export function PdfAdminView() {
  const [pdfs, setPdfs] = useState<Pdf[] | null>(null);
  const [mode, setMode] = useState<Mode>("book");
  const [examSlug, setExamSlug] = useState("");
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [subjectSlug, setSubjectSlug] = useState("");
  const [title, setTitle] = useState("");
  const [durationMin, setDurationMin] = useState(DEFAULTS.durationMin);
  const [totalQuestions, setTotalQuestions] = useState(DEFAULTS.totalQuestions);
  const [easyPct, setEasyPct] = useState(DEFAULTS.easyPct);
  const [mediumPct, setMediumPct] = useState(DEFAULTS.mediumPct);
  const [hardPct, setHardPct] = useState(DEFAULTS.hardPct);
  const [language, setLanguage] = useState<"en" | "hi">(DEFAULTS.language);
  const [autoCreateTestSet, setAutoCreateTestSet] = useState(DEFAULTS.autoCreateTestSet);
  const [isPremium, setIsPremium] = useState(DEFAULTS.isPremium);

  const [year, setYear] = useState<number>(new Date().getFullYear() - 1);
  const [files, setFiles] = useState<File[]>([]);
  const fileRef = useRef<HTMLInputElement | null>(null);

  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [perFile, setPerFile] = useState<Record<string, { status: "queued" | "uploading" | "done" | "error"; message?: string }>>({});
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const pctSum = easyPct + mediumPct + hardPct;
  const pctValid = mode !== "book" || pctSum === 100;

  async function refresh() {
    const r = await api<Pdf[]>("/api/admin/pdfs");
    if (r.ok) setPdfs(r.data);
  }
  useEffect(() => { refresh(); }, []);

  // load subjects whenever exam changes
  useEffect(() => {
    setSubjects([]);
    setSubjectSlug("");
    if (!examSlug) return;
    let active = true;
    (async () => {
      const r = await api<ExamDetail>(`/api/exams/${examSlug}`);
      if (!active) return;
      if (r.ok) setSubjects(r.data.subjects);
    })();
    return () => {
      active = false;
    };
  }, [examSlug]);

  const distributionPreview = useMemo(() => {
    const easy = Math.round((easyPct / 100) * totalQuestions);
    const medium = Math.round((mediumPct / 100) * totalQuestions);
    const hard = Math.max(0, totalQuestions - easy - medium);
    return { easy, medium, hard };
  }, [easyPct, mediumPct, hardPct, totalQuestions]);

  function autoBalance(field: "easy" | "medium" | "hard", val: number) {
    val = Math.max(0, Math.min(100, val));
    if (field === "easy") {
      const remaining = 100 - val;
      const ratio = mediumPct + hardPct;
      const m = ratio > 0 ? Math.round((mediumPct / ratio) * remaining) : Math.round(remaining / 2);
      setEasyPct(val);
      setMediumPct(m);
      setHardPct(remaining - m);
    } else if (field === "medium") {
      const remaining = 100 - val;
      const ratio = easyPct + hardPct;
      const e = ratio > 0 ? Math.round((easyPct / ratio) * remaining) : Math.round(remaining / 2);
      setMediumPct(val);
      setEasyPct(e);
      setHardPct(remaining - e);
    } else {
      const remaining = 100 - val;
      const ratio = easyPct + mediumPct;
      const e = ratio > 0 ? Math.round((easyPct / ratio) * remaining) : Math.round(remaining / 2);
      setHardPct(val);
      setEasyPct(e);
      setMediumPct(remaining - e);
    }
  }

  function addFiles(picked: FileList | null) {
    if (!picked || picked.length === 0) return;
    const arr = Array.from(picked).filter((f) => /\.pdf$/i.test(f.name) || f.type === "application/pdf");
    // de-dupe by name+size
    setFiles((prev) => {
      const seen = new Set(prev.map((p) => `${p.name}:${p.size}`));
      const merged = [...prev];
      for (const f of arr) {
        const key = `${f.name}:${f.size}`;
        if (!seen.has(key)) {
          merged.push(f);
          seen.add(key);
        }
      }
      return merged;
    });
  }

  function removeFile(idx: number) {
    setFiles((prev) => prev.filter((_, i) => i !== idx));
  }

  async function uploadOne(file: File, config: object): Promise<{ ok: boolean; data?: any; error?: string }> {
    const fd = new FormData();
    fd.append("file", file);
    fd.append("config", JSON.stringify(config));
    return new Promise((resolve) => {
      const xhr = new XMLHttpRequest();
      xhr.open("POST", "/api/admin/pdfs/upload");
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) setProgress(Math.round((e.loaded / e.total) * 100));
      };
      xhr.onerror = () => resolve({ ok: false, error: "Network error" });
      xhr.onload = () => {
        try {
          const body = JSON.parse(xhr.responseText);
          if (body?.ok) resolve({ ok: true, data: body.data });
          else resolve({ ok: false, error: body?.error?.message ?? `HTTP ${xhr.status}` });
        } catch {
          resolve({ ok: false, error: `HTTP ${xhr.status}` });
        }
      };
      xhr.send(fd);
    });
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setMsg(null);
    if (files.length === 0) { setErr("Please choose at least one PDF"); return; }
    if (!pctValid) { setErr("Difficulty mix must sum to 100"); return; }
    if (!examSlug) { setErr("Please select an exam"); return; }

    const baseConfig = {
      mode,
      examSlug,
      subjectSlug: subjectSlug || undefined,
      year: mode === "pyq" ? year : undefined,
      durationMin,
      totalQuestions,
      easyPct,
      mediumPct,
      hardPct,
      language,
      autoCreateTestSet,
      isPremium,
    };

    setBusy(true);
    const trimmedTitle = title.trim();
    let success = 0;
    const failures: string[] = [];
    const initStatus: typeof perFile = {};
    for (const f of files) initStatus[`${f.name}:${f.size}`] = { status: "queued" };
    setPerFile(initStatus);

    for (let i = 0; i < files.length; i++) {
      const f = files[i];
      const key = `${f.name}:${f.size}`;
      setCurrentIdx(i);
      setProgress(0);
      setPerFile((p) => ({ ...p, [key]: { status: "uploading" } }));

      // Per-file title: if user gave one, suffix with index; else use filename
      const config = {
        ...baseConfig,
        title: trimmedTitle
          ? files.length > 1 ? `${trimmedTitle} — ${i + 1}` : trimmedTitle
          : f.name.replace(/\.pdf$/i, ""),
      };

      const result = await uploadOne(f, config);
      if (result.ok) {
        success += 1;
        setPerFile((p) => ({
          ...p,
          [key]: { status: "done", message: `pdf=${result.data.pdfId.slice(0, 8)} · job=${result.data.jobId.slice(0, 8)}` },
        }));
      } else {
        failures.push(`${f.name}: ${result.error}`);
        setPerFile((p) => ({ ...p, [key]: { status: "error", message: result.error } }));
      }
    }

    setBusy(false);
    setProgress(0);
    if (success === files.length) {
      setMsg(`Queued ${success} PDF${success !== 1 ? "s" : ""} for ingestion.`);
      setFiles([]);
      if (fileRef.current) fileRef.current.value = "";
      setTitle("");
      setTimeout(() => setPerFile({}), 4000);
    } else if (success > 0) {
      setMsg(`${success} of ${files.length} uploaded.`);
      setErr(failures.join("; "));
    } else {
      setErr(failures.join("; ") || "All uploads failed");
    }
    refresh();
  }

  return (
    <section className="container pt-10 pb-20">
      <header className="mb-6">
        <Link href="/admin" className="text-xs text-muted-foreground hover:underline">← Admin home</Link>
        <h1 className="mt-1 font-display text-3xl font-bold">PDF → Test Set</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Upload a PDF (up to 200 MB). Choose how the AI should treat it.
        </p>
      </header>

      <form onSubmit={submit} className="glass rounded-2xl p-5 gradient-border space-y-5">
        {/* Mode tabs */}
        <div>
          <span className="text-xs text-muted-foreground">Upload type</span>
          <div className="mt-1 grid sm:grid-cols-3 gap-2">
            <ModeCard
              active={mode === "book"}
              onClick={() => setMode("book")}
              icon={BookOpen}
              title="Book / Notes"
              sub="AI generates fresh MCQs from book text."
            />
            <ModeCard
              active={mode === "questions"}
              onClick={() => setMode("questions")}
              icon={ListChecks}
              title="Question Bank"
              sub="AI extracts existing MCQs verbatim."
            />
            <ModeCard
              active={mode === "pyq"}
              onClick={() => setMode("pyq")}
              icon={Archive}
              title="Previous-Year Paper"
              sub="Tag year + exam. Powers /pyq search & 2026 prediction."
            />
          </div>
          {mode === "pyq" && (
            <div className="mt-3 grid sm:grid-cols-3 gap-3">
              <label className="block">
                <span className="text-xs text-muted-foreground">Exam year *</span>
                <Input
                  type="number" min={1990} max={new Date().getFullYear()}
                  value={year}
                  onChange={(e) => setYear(parseInt(e.target.value) || year)}
                />
              </label>
            </div>
          )}
        </div>

        {/* File picker */}
        <div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">PDF files (one or many)</span>
            {files.length > 0 && (
              <button
                type="button"
                onClick={() => { setFiles([]); if (fileRef.current) fileRef.current.value = ""; }}
                className="text-xs text-muted-foreground hover:text-foreground"
                disabled={busy}
              >Clear all</button>
            )}
          </div>
          <div className="mt-1 flex items-center gap-3">
            <input
              ref={fileRef}
              type="file"
              accept="application/pdf,.pdf"
              multiple
              onChange={(e) => { addFiles(e.target.files); if (fileRef.current) fileRef.current.value = ""; }}
              className="block w-full text-sm file:mr-3 file:rounded-md file:border-0 file:bg-brand-500 file:px-3 file:py-2 file:text-white file:cursor-pointer file:hover:bg-brand-600"
            />
          </div>
          {files.length > 0 && (
            <ul className="mt-3 space-y-1.5 max-h-56 overflow-auto">
              {files.map((f, i) => {
                const key = `${f.name}:${f.size}`;
                const s = perFile[key];
                return (
                  <li key={key} className="flex items-center gap-2 text-xs rounded-md border border-border px-2 py-1.5">
                    <FileText className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    <span className="flex-1 truncate">{f.name}</span>
                    <span className="text-muted-foreground shrink-0">{humanSize(f.size)}</span>
                    {s?.status === "uploading" && (
                      <span className="inline-flex items-center gap-1 text-brand-500"><Loader2 className="h-3 w-3 animate-spin" /> {progress}%</span>
                    )}
                    {s?.status === "done" && <span className="text-emerald-500">✓ queued</span>}
                    {s?.status === "error" && <span className="text-red-500 truncate max-w-[160px]" title={s.message}>✗ {s.message}</span>}
                    {!s && !busy && (
                      <button
                        type="button"
                        onClick={() => removeFile(i)}
                        className="text-muted-foreground hover:text-red-500"
                        aria-label="Remove"
                      ><X className="h-3.5 w-3.5" /></button>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
          <p className="mt-2 text-[11px] text-muted-foreground inline-flex items-center gap-1">
            <Plus className="h-3 w-3" /> Pick the input again to add more files.
          </p>
        </div>

        {/* Exam + Subject */}
        <div className="grid sm:grid-cols-2 gap-4">
          <label className="block">
            <span className="text-xs text-muted-foreground">Exam *</span>
            <select
              value={examSlug}
              onChange={(e) => setExamSlug(e.target.value)}
              required
              className="mt-1 w-full bg-background border border-border rounded-md px-3 py-2 text-sm"
            >
              <option value="">— Select exam —</option>
              {EXAMS.map((e) => <option key={e.slug} value={e.slug}>{e.name}</option>)}
            </select>
          </label>
          <label className="block">
            <span className="text-xs text-muted-foreground">Subject (optional)</span>
            <select
              value={subjectSlug}
              onChange={(e) => setSubjectSlug(e.target.value)}
              disabled={subjects.length === 0}
              className="mt-1 w-full bg-background border border-border rounded-md px-3 py-2 text-sm disabled:opacity-50"
            >
              <option value="">— Any —</option>
              {subjects.map((s) => <option key={s.slug} value={s.slug}>{s.name}</option>)}
            </select>
          </label>
        </div>

        {/* Title */}
        <label className="block">
          <span className="text-xs text-muted-foreground">Test set title (optional)</span>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. CTET Maths — Chapter 1 Mock" />
        </label>

        {/* Duration + Total */}
        <div className="grid sm:grid-cols-3 gap-4">
          <label className="block">
            <span className="text-xs text-muted-foreground">Duration (min)</span>
            <Input type="number" min={5} max={360}
              value={durationMin}
              onChange={(e) => setDurationMin(Math.max(5, Math.min(360, parseInt(e.target.value) || 0)))}
            />
          </label>
          <label className="block">
            <span className="text-xs text-muted-foreground">
              {mode === "questions" ? "Max questions to extract" : "Total questions"}
            </span>
            <Input type="number" min={5} max={500}
              value={totalQuestions}
              onChange={(e) => setTotalQuestions(Math.max(5, Math.min(500, parseInt(e.target.value) || 0)))}
            />
          </label>
          <label className="block">
            <span className="text-xs text-muted-foreground">Language</span>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as "en" | "hi")}
              className="mt-1 w-full bg-background border border-border rounded-md px-3 py-2 text-sm"
            >
              <option value="en">English</option>
              <option value="hi">हिंदी</option>
            </select>
          </label>
        </div>

        {/* Difficulty mix — only relevant for book mode */}
        {mode === "book" ? (
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Difficulty mix (must total 100%)</span>
              <span className={`text-xs ${pctValid ? "text-emerald-500" : "text-amber-500"}`}>
                Sum: {pctSum}%
              </span>
            </div>
            <div className="mt-2 grid sm:grid-cols-3 gap-3">
              <PctSlider label="Easy"   value={easyPct}   onChange={(v) => autoBalance("easy", v)} color="bg-emerald-500" />
              <PctSlider label="Normal" value={mediumPct} onChange={(v) => autoBalance("medium", v)} color="bg-amber-500" />
              <PctSlider label="Hard"   value={hardPct}   onChange={(v) => autoBalance("hard", v)} color="bg-rose-500" />
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Preview: {distributionPreview.easy} easy · {distributionPreview.medium} normal · {distributionPreview.hard} hard
            </p>
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-border p-3 text-xs text-muted-foreground">
            {mode === "pyq"
              ? "Previous-year paper: each question is tagged with the exam year and stored verbatim for /pyq search and 2026 prediction."
              : "Question-bank mode keeps each question's original difficulty label from the source. No mix to configure."}
          </div>
        )}

        {/* Options */}
        <div className="flex flex-wrap items-center gap-5">
          <label className="inline-flex items-center gap-2 text-sm">
            <input type="checkbox" checked={autoCreateTestSet} onChange={(e) => setAutoCreateTestSet(e.target.checked)} />
            Auto-create test set
          </label>
          <label className="inline-flex items-center gap-2 text-sm">
            <input type="checkbox" checked={isPremium} onChange={(e) => setIsPremium(e.target.checked)} />
            Premium (₹8 unlock)
          </label>
        </div>

        {/* Upload */}
        <div className="flex items-center justify-between gap-3 pt-2 border-t border-border/40">
          {busy && (
            <div className="flex-1 max-w-md">
              <div className="h-2 bg-muted rounded overflow-hidden">
                <div className="h-full bg-brand-500 transition-all" style={{ width: `${progress}%` }} />
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Uploading file {currentIdx + 1} of {files.length} — {progress}%
              </p>
            </div>
          )}
          <div className="ml-auto">
            <Button type="submit" disabled={busy || !pctValid || files.length === 0}>
              {busy ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Uploading…</>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  {files.length > 1
                    ? `Upload ${files.length} files`
                    : mode === "questions" ? "Upload & extract" : "Upload & generate"}
                </>
              )}
            </Button>
          </div>
        </div>

        {err && <p className="text-sm text-red-500">{err}</p>}
        {msg && <p className="text-sm text-emerald-500">{msg}</p>}
      </form>

      <div className="mt-8">
        <h2 className="font-display text-lg font-semibold mb-3">Recent uploads</h2>
        {!pdfs ? (
          <Loader2 className="h-5 w-5 animate-spin text-brand-500" />
        ) : pdfs.length === 0 ? (
          <p className="text-sm text-muted-foreground">No PDFs yet.</p>
        ) : (
          <div className="space-y-2">
            {pdfs.map((p) => (
              <div key={p.id} className="glass rounded-xl p-3 flex items-center gap-3">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{p.filename}</p>
                  <p className="text-xs text-muted-foreground">
                    {p.exam?.name ?? "Uncategorized"} · {p.status} · {p._count.questions} questions · {humanSize(p.fileSize)}
                  </p>
                </div>
                <span className="text-xs text-muted-foreground">{new Date(p.createdAt).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function ModeCard({
  active, onClick, icon: Icon, title, sub,
}: { active: boolean; onClick: () => void; icon: any; title: string; sub: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "text-left rounded-xl border p-3 transition flex items-start gap-3",
        active ? "border-brand-500 ring-2 ring-brand-500/30 bg-brand-500/5" : "border-border hover:border-brand-500/50"
      )}
    >
      <span className={cn(
        "h-9 w-9 grid place-items-center rounded-lg shrink-0",
        active ? "bg-brand-500 text-white" : "bg-muted text-muted-foreground"
      )}>
        <Icon className="h-5 w-5" />
      </span>
      <div className="min-w-0">
        <p className="text-sm font-semibold">{title}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>
      </div>
    </button>
  );
}

function PctSlider({ label, value, onChange, color }: { label: string; value: number; onChange: (v: number) => void; color: string }) {
  return (
    <div>
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium">{value}%</span>
      </div>
      <input
        type="range"
        min={0}
        max={100}
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        className="w-full"
      />
      <div className="h-1 bg-muted rounded overflow-hidden mt-1">
        <div className={`h-full ${color}`} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}
