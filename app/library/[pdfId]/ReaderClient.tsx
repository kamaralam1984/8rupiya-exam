"use client";
import { useState, useRef } from "react";
import Link from "next/link";
import {
  Loader2, Sparkles, Volume2, ArrowLeft, MessageCircle, BookOpen, X, ChevronUp, ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api-client";
import { cn } from "@/lib/utils";

type Resp = { id: string; answer: string; steps: string[]; concept: string };

type Msg =
  | { role: "user"; text: string }
  | { role: "ai"; data: Resp };

export function ReaderClient({
  pdfId, title, filename, pageCount, subjectSlug, examName,
  initialPage = null, initialHighlight = null,
}: {
  pdfId: string;
  title: string;
  filename: string;
  pageCount: number | null;
  subjectSlug: string | null;
  examName: string;
  initialPage?: number | null;
  initialHighlight?: string | null;
}) {
  const [q, setQ] = useState("");
  const [lang, setLang] = useState<"en" | "hi">("en");
  const [loading, setLoading] = useState(false);
  const [translating, setTranslating] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [panelOpen, setPanelOpen] = useState(true);
  const taRef = useRef<HTMLTextAreaElement | null>(null);

  async function fetchAnswer(rawText: string, targetLang: "en" | "hi") {
    const r = await api<Resp>("/api/ai/doubt", {
      method: "POST",
      body: JSON.stringify({
        question: `[Context: I'm reading "${title}"${subjectSlug ? ` (${subjectSlug})` : ""}] ${rawText}`,
        language: targetLang,
        examSlug: "class-10",
        subjectSlug: subjectSlug ?? undefined,
      }),
    });
    return r;
  }

  async function ask(e: React.FormEvent) {
    e.preventDefault();
    const text = q.trim();
    if (!text) return;
    setMsgs((m) => [...m, { role: "user", text }]);
    setQ("");
    setLoading(true);
    setErr(null);

    const r = await fetchAnswer(text, lang);
    setLoading(false);
    if (!r.ok) {
      setErr(r.error.code === "UNAUTHENTICATED" ? "Sign in to use the doubt solver." : (r.error.message ?? r.error.code));
      return;
    }
    setMsgs((m) => [...m, { role: "ai", data: r.data }]);
    requestAnimationFrame(() => taRef.current?.focus());
  }

  async function switchLang(next: "en" | "hi") {
    if (next === lang) return;
    setLang(next);
    // Find last user question that has an AI reply right after; re-ask in new language and replace that AI reply
    const lastUserIdx = (() => {
      for (let i = msgs.length - 1; i >= 0; i--) {
        if (msgs[i].role === "user") return i;
      }
      return -1;
    })();
    if (lastUserIdx < 0) return;
    const aiIdx = lastUserIdx + 1;
    if (aiIdx >= msgs.length || msgs[aiIdx].role !== "ai") return;
    const userMsg = msgs[lastUserIdx];
    if (userMsg.role !== "user") return;

    setTranslating(true);
    setErr(null);
    const r = await fetchAnswer(userMsg.text, next);
    setTranslating(false);
    if (!r.ok) {
      setErr(next === "hi" ? "Hindi me translate nahi ho paya." : "Could not translate to English.");
      return;
    }
    setMsgs((m) => {
      const copy = [...m];
      copy[aiIdx] = { role: "ai", data: r.data };
      return copy;
    });
  }

  function speak(text: string) {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = lang === "hi" ? "hi-IN" : "en-IN";
    u.rate = 0.95;
    window.speechSynthesis.speak(u);
  }

  // Deep-link to a specific page via the standard PDF URL fragment.
  // Most native browser viewers (and PDF.js) honour #page=N&view=FitH.
  const pageFragment = initialPage ? `page=${initialPage}&` : "";
  const fileUrl = `/api/library/${pdfId}/file#${pageFragment}view=FitH&toolbar=1`;
  const [highlightDismissed, setHighlightDismissed] = useState(false);
  const showHighlight = !!initialHighlight && !highlightDismissed;

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col">
      {/* Toolbar */}
      <div className="container flex items-center justify-between gap-3 py-3 border-b border-border/40">
        <div className="flex items-center gap-2 min-w-0">
          <Link href="/library" className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1">
            <ArrowLeft className="h-3.5 w-3.5" /> Library
          </Link>
          <span className="text-muted-foreground">·</span>
          <BookOpen className="h-4 w-4 text-brand-500 shrink-0" />
          <p className="text-sm font-medium truncate" title={filename}>{title}</p>
          {pageCount && <span className="text-xs text-muted-foreground shrink-0">({pageCount} pages)</span>}
        </div>
        <button
          onClick={() => setPanelOpen((v) => !v)}
          className="md:hidden inline-flex items-center gap-1 text-xs text-brand-500"
        >
          <MessageCircle className="h-4 w-4" /> {panelOpen ? "Hide AI" : "Ask AI"}
        </button>
      </div>

      {/* Reader + Side panel */}
      <div className="flex-1 grid md:grid-cols-[1fr_360px] min-h-0">
        {/* PDF viewer */}
        <div className={cn("min-h-0 bg-muted/30 flex flex-col", !panelOpen ? "" : "")}>
          {showHighlight && (
            <div className="border-b border-emerald-500/30 bg-emerald-500/15 text-emerald-100 px-4 py-2.5 text-xs flex items-start gap-2">
              <span className="mt-0.5 inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" aria-hidden />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-emerald-200">
                  📖 Source highlight {initialPage ? `· Page ${initialPage}` : ""}
                </p>
                <p className="mt-0.5 leading-snug">
                  <mark className="bg-emerald-300/40 text-emerald-50 rounded px-1 py-0.5">
                    {initialHighlight}
                  </mark>
                </p>
                <p className="mt-1 text-emerald-300/70">
                  Scroll to highlighted page below — yeh wahi text hai jis se yeh question banta hai.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setHighlightDismissed(true)}
                className="shrink-0 text-emerald-200/70 hover:text-emerald-100"
                aria-label="Dismiss highlight"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
          <iframe
            src={fileUrl}
            title={title}
            className="block w-full flex-1 border-0"
          />
        </div>

        {/* AI doubt panel */}
        <aside
          className={cn(
            "border-l border-border/40 bg-background min-h-0 flex flex-col",
            !panelOpen && "hidden md:flex"
          )}
        >
          <div className="px-4 py-3 border-b border-border/40 flex items-center justify-between">
            <div className="inline-flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-brand-500" />
              <p className="text-sm font-semibold">AI Doubt Helper</p>
            </div>
            <div className="text-[10px] inline-flex rounded border border-border overflow-hidden">
              <button
                type="button"
                onClick={() => switchLang("en")}
                disabled={translating || loading}
                className={cn("px-2 py-0.5 disabled:opacity-60", lang === "en" ? "bg-brand-500/20 text-brand-500" : "text-muted-foreground")}
              >EN</button>
              <button
                type="button"
                onClick={() => switchLang("hi")}
                disabled={translating || loading}
                className={cn("px-2 py-0.5 disabled:opacity-60", lang === "hi" ? "bg-brand-500/20 text-brand-500" : "text-muted-foreground")}
              >हिं</button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-auto p-3 space-y-3">
            {msgs.length === 0 && (
              <div className="text-xs text-muted-foreground">
                Reading <strong>{title}</strong> · scoped to <strong>{examName}</strong>
                {subjectSlug && <> · <strong>{subjectSlug}</strong></>}.
                <p className="mt-2">
                  Tip: paste the confusing sentence or describe the section you don&apos;t get.
                  Example: <em>&quot;Explain why phloem transport is bidirectional but xylem isn&apos;t.&quot;</em>
                </p>
              </div>
            )}
            {msgs.map((m, i) =>
              m.role === "user" ? (
                <div key={i} className="flex justify-end">
                  <div className="max-w-[85%] bg-brand-500/15 text-foreground rounded-lg px-3 py-2 text-sm whitespace-pre-wrap">
                    {m.text}
                  </div>
                </div>
              ) : (
                <AiMessage key={i} data={m.data} onSpeak={speak} />
              )
            )}
            {loading && (
              <div className="text-xs text-muted-foreground inline-flex items-center gap-2">
                <Loader2 className="h-3 w-3 animate-spin" /> Thinking…
              </div>
            )}
            {translating && (
              <div className="text-xs text-brand-500 inline-flex items-center gap-2">
                <Loader2 className="h-3 w-3 animate-spin" />
                {lang === "hi" ? "Hindi me translate ho raha hai…" : "Translating to English…"}
              </div>
            )}
            {err && <p className="text-xs text-red-500">{err}</p>}
          </div>

          {/* Composer */}
          <form onSubmit={ask} className="border-t border-border/40 p-3 space-y-2">
            <textarea
              ref={taRef}
              value={q}
              onChange={(e) => setQ(e.target.value)}
              rows={3}
              maxLength={2000}
              placeholder="Ask anything about this book…"
              className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm resize-none"
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                  e.preventDefault();
                  ask(e as any);
                }
              }}
            />
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{q.length}/2000 · ⌘/Ctrl + Enter to send</span>
              <Button type="submit" size="sm" disabled={loading || !q.trim()}>
                {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
                Ask
              </Button>
            </div>
          </form>
        </aside>
      </div>
    </div>
  );
}

function AiMessage({ data, onSpeak }: { data: Resp; onSpeak: (t: string) => void }) {
  const [open, setOpen] = useState(true);
  const full = [data.answer, ...data.steps, data.concept].filter(Boolean).join(". ");
  return (
    <div className="rounded-lg border border-border bg-card/40 p-3 space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">{data.answer}</p>
        <button onClick={() => onSpeak(full)} className="text-xs text-brand-500 inline-flex items-center gap-1" title="Listen">
          <Volume2 className="h-3.5 w-3.5" />
        </button>
      </div>
      {data.steps?.length > 0 && (
        <div>
          <button onClick={() => setOpen((v) => !v)} className="text-[11px] text-muted-foreground inline-flex items-center gap-1">
            {open ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            {open ? "Hide steps" : "Show steps"}
          </button>
          {open && (
            <ol className="mt-1 list-decimal pl-5 space-y-0.5 text-xs">
              {data.steps.map((s, i) => <li key={i}>{s}</li>)}
            </ol>
          )}
        </div>
      )}
      {data.concept && (
        <p className="text-[11px] text-muted-foreground border-t border-border/40 pt-2 mt-2">
          <strong className="text-foreground">Concept:</strong> {data.concept}
        </p>
      )}
    </div>
  );
}
