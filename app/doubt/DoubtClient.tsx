"use client";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Loader2, Sparkles, Volume2, ImagePlus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api-client";
import { EXAMS } from "@/lib/exams";
import { useUser } from "@/lib/use-user";
import { useExamSubjects } from "@/lib/use-exam-subjects";

type Resp = { id: string; answer: string; steps: string[]; concept: string };

const MAX_BYTES = 5 * 1024 * 1024;

export function DoubtClient() {
  const { user } = useUser();
  const [q, setQ] = useState("");
  const [lang, setLang] = useState<"en" | "hi">("en");
  const [exam, setExam] = useState<string>("");
  const [subjectSlug, setSubjectSlug] = useState<string>("");
  const [imageDataUrls, setImageDataUrls] = useState<string[]>([]);
  const [resp, setResp] = useState<Resp | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const MAX_IMAGES = 4;
  const { subjects, loading: loadingSubjects } = useExamSubjects(exam);

  useEffect(() => {
    if (user?.examTrack && EXAMS.some((e) => e.slug === user.examTrack) && !exam) {
      setExam(user.examTrack);
    }
  }, [user?.examTrack, exam]);

  useEffect(() => {
    setSubjectSlug("");
  }, [exam]);

  function onPickFiles(picked: FileList | null) {
    if (!picked || picked.length === 0) return;
    setErr(null);
    const remaining = MAX_IMAGES - imageDataUrls.length;
    if (remaining <= 0) {
      setErr(`Up to ${MAX_IMAGES} images allowed`);
      return;
    }
    const arr = Array.from(picked).slice(0, remaining);
    const accepted: string[] = [];
    let pending = arr.length;
    let firstError: string | null = null;
    for (const f of arr) {
      if (!/^image\/(png|jpeg|jpg|webp)$/.test(f.type)) {
        pending -= 1;
        if (!firstError) firstError = "Each image must be PNG, JPEG or WEBP";
        if (pending === 0 && accepted.length > 0) setImageDataUrls((p) => [...p, ...accepted]);
        if (pending === 0 && firstError) setErr(firstError);
        continue;
      }
      if (f.size > MAX_BYTES) {
        pending -= 1;
        if (!firstError) firstError = "Each image must be under 5 MB";
        if (pending === 0 && accepted.length > 0) setImageDataUrls((p) => [...p, ...accepted]);
        if (pending === 0 && firstError) setErr(firstError);
        continue;
      }
      const reader = new FileReader();
      reader.onload = () => {
        accepted.push(reader.result as string);
        pending -= 1;
        if (pending === 0) {
          setImageDataUrls((p) => [...p, ...accepted]);
          if (firstError) setErr(firstError);
        }
      };
      reader.onerror = () => {
        pending -= 1;
        if (!firstError) firstError = "Could not read one of the images";
        if (pending === 0) {
          if (accepted.length > 0) setImageDataUrls((p) => [...p, ...accepted]);
          setErr(firstError);
        }
      };
      reader.readAsDataURL(f);
    }
  }

  function removeImage(idx: number) {
    setImageDataUrls((p) => p.filter((_, i) => i !== idx));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!q.trim() && imageDataUrls.length === 0) return;
    setLoading(true); setErr(null); setResp(null);
    const r = await api<Resp>("/api/ai/doubt", {
      method: "POST",
      body: JSON.stringify({
        question: q.trim() || (imageDataUrls.length > 1
          ? "Explain what's shown across these images."
          : "Explain what's shown in this image."),
        language: lang,
        imageDataUrls: imageDataUrls.length > 0 ? imageDataUrls : undefined,
        examSlug: exam || undefined,
        subjectSlug: subjectSlug || undefined,
      }),
    });
    setLoading(false);
    if (!r.ok) {
      if (r.error.code === "UNAUTHENTICATED") setErr("Sign in to use the doubt solver.");
      else setErr(r.error.message ?? r.error.code);
      return;
    }
    setResp(r.data);
  }

  function speak(text: string) {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = lang === "hi" ? "hi-IN" : "en-IN";
    u.rate = 0.95;
    window.speechSynthesis.speak(u);
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="glass rounded-2xl p-4 gradient-border grid sm:grid-cols-2 gap-3">
        <label className="block">
          <span className="text-xs text-muted-foreground">Class / Exam</span>
          <select
            value={exam}
            onChange={(e) => setExam(e.target.value)}
            className="mt-1 w-full bg-background border border-border rounded-md px-3 py-2 text-sm"
          >
            <option value="">— Any —</option>
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
            disabled={!exam || subjects.length === 0}
            className="mt-1 w-full bg-background border border-border rounded-md px-3 py-2 text-sm disabled:opacity-60"
          >
            <option value="">All subjects</option>
            {subjects.map((s) => <option key={s.slug} value={s.slug}>{s.name}</option>)}
          </select>
        </label>
      </div>
      <div className="glass rounded-2xl p-5 gradient-border">
        <textarea
          value={q}
          onChange={(e) => setQ(e.target.value)}
          rows={4}
          maxLength={2000}
          placeholder="e.g. Explain the difference between mitosis and meiosis with a real-life analogy."
          className="w-full bg-transparent outline-none resize-none text-sm md:text-base"
        />
        {imageDataUrls.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {imageDataUrls.map((src, i) => (
              <div key={i} className="relative">
                <img src={src} alt={`Uploaded ${i + 1}`} className="max-h-32 rounded-lg border border-border" />
                <button
                  type="button"
                  onClick={() => removeImage(i)}
                  className="absolute -top-2 -right-2 bg-background border border-border rounded-full p-1 hover:bg-muted"
                  aria-label={`Remove image ${i + 1}`}
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/40">
          <div className="flex items-center gap-1 text-xs">
            <button
              type="button"
              onClick={() => setLang("en")}
              className={`px-2 py-1 rounded ${lang === "en" ? "bg-brand-500/20 text-brand-500" : "text-muted-foreground"}`}
            >English</button>
            <button
              type="button"
              onClick={() => setLang("hi")}
              className={`px-2 py-1 rounded ${lang === "hi" ? "bg-brand-500/20 text-brand-500" : "text-muted-foreground"}`}
            >हिंदी</button>
            <input
              ref={fileRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              multiple
              hidden
              onChange={(e) => {
                onPickFiles(e.target.files);
                if (fileRef.current) fileRef.current.value = "";
              }}
            />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={imageDataUrls.length >= MAX_IMAGES}
              className="ml-1 px-2 py-1 rounded text-muted-foreground hover:bg-muted inline-flex items-center gap-1 disabled:opacity-50"
            >
              <ImagePlus className="h-3.5 w-3.5" />
              {imageDataUrls.length === 0
                ? "Images"
                : `${imageDataUrls.length}/${MAX_IMAGES} images`}
            </button>
            <span className="ml-2 text-muted-foreground">{q.length}/2000</span>
          </div>
          <Button type="submit" disabled={loading || (!q.trim() && imageDataUrls.length === 0)}>
            {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Thinking…</> : <><Sparkles className="h-4 w-4" /> Solve</>}
          </Button>
        </div>
      </div>

      {err && <p className="text-sm text-red-500">{err}</p>}

      {resp && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-2xl p-6 gradient-border space-y-4"
        >
          <div>
            <div className="flex items-center justify-between">
              <h3 className="text-xs uppercase tracking-wide text-muted-foreground">Answer</h3>
              <button
                type="button"
                onClick={() => speak([resp.answer, ...resp.steps, resp.concept].join(". "))}
                className="text-xs text-brand-500 hover:underline inline-flex items-center gap-1"
              >
                <Volume2 className="h-3.5 w-3.5" /> Listen
              </button>
            </div>
            <p className="mt-1 font-medium">{resp.answer}</p>
          </div>
          <div>
            <h3 className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Step-by-step</h3>
            <ol className="list-decimal pl-5 space-y-1 text-sm">
              {resp.steps.map((s, i) => <li key={i}>{s}</li>)}
            </ol>
          </div>
          {resp.concept && (
            <div>
              <h3 className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Concept recap</h3>
              <p className="text-sm text-muted-foreground">{resp.concept}</p>
            </div>
          )}
        </motion.div>
      )}
    </form>
  );
}
