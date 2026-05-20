"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Loader2, Sparkles, Bookmark as BookmarkIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api-client";
import { useToast } from "@/components/ui/toaster";
import { VoiceButton } from "@/components/voice-button";

type Notes = {
  topic: string;
  summary: string;
  keyPoints: string[];
  definitions: { term: string; meaning: string }[];
  mnemonics: string[];
  exampleQuestions: string[];
};

export function NotesClient() {
  const [topic, setTopic] = useState("");
  const [lang, setLang] = useState<"en" | "hi">("en");
  const [notes, setNotes] = useState<Notes | null>(null);
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!topic.trim()) return;
    setLoading(true); setNotes(null);
    const r = await api<Notes>("/api/ai/notes", {
      method: "POST",
      body: JSON.stringify({ topic: topic.trim(), language: lang }),
    });
    setLoading(false);
    if (!r.ok) { toast(r.error.code === "UNAUTHENTICATED" ? "Sign in to generate notes." : (r.error.message ?? r.error.code), "error"); return; }
    setNotes(r.data);
  }

  async function bookmark() {
    if (!notes) return;
    const r = await api("/api/bookmarks", {
      method: "POST",
      body: JSON.stringify({ kind: "note", label: notes.topic, payload: notes }),
    });
    if (r.ok) toast("Saved to bookmarks", "success");
    else toast(r.error.message ?? "Could not save", "error");
  }

  const listenText = notes
    ? [notes.summary, ...notes.keyPoints, ...notes.mnemonics].join(". ")
    : "";

  return (
    <div className="space-y-5">
      <form onSubmit={submit} className="glass rounded-2xl p-5 gradient-border grid sm:grid-cols-[1fr_auto] gap-3">
        <Input value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="e.g. Indian Constitution – Preamble" required />
        <Button type="submit" disabled={loading || !topic.trim()}>
          {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Generating…</> : <><Sparkles className="h-4 w-4" /> Generate</>}
        </Button>
        <div className="sm:col-span-2 flex items-center gap-1 text-xs">
          <button type="button" onClick={() => setLang("en")} className={`px-2 py-1 rounded ${lang === "en" ? "bg-brand-500/20 text-brand-500" : "text-muted-foreground"}`}>English</button>
          <button type="button" onClick={() => setLang("hi")} className={`px-2 py-1 rounded ${lang === "hi" ? "bg-brand-500/20 text-brand-500" : "text-muted-foreground"}`}>हिंदी</button>
        </div>
      </form>

      {notes && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl p-6 gradient-border space-y-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="font-display text-xl font-bold">{notes.topic}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{notes.summary}</p>
            </div>
            <div className="flex items-center gap-1">
              <VoiceButton text={listenText} lang={lang === "hi" ? "hi-IN" : "en-IN"} />
              <button onClick={bookmark} className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs hover:bg-muted">
                <BookmarkIcon className="h-3.5 w-3.5" /> Save
              </button>
            </div>
          </div>
          {notes.keyPoints?.length > 0 && (
            <div>
              <h3 className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Key points</h3>
              <ul className="space-y-1 list-disc pl-5 text-sm">
                {notes.keyPoints.map((p, i) => <li key={i}>{p}</li>)}
              </ul>
            </div>
          )}
          {notes.definitions?.length > 0 && (
            <div>
              <h3 className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Definitions</h3>
              <dl className="space-y-2 text-sm">
                {notes.definitions.map((d, i) => (
                  <div key={i}>
                    <dt className="font-medium">{d.term}</dt>
                    <dd className="text-muted-foreground">{d.meaning}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}
          {notes.mnemonics?.length > 0 && (
            <div>
              <h3 className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Mnemonics</h3>
              <ul className="space-y-1 list-disc pl-5 text-sm">
                {notes.mnemonics.map((m, i) => <li key={i}>{m}</li>)}
              </ul>
            </div>
          )}
          {notes.exampleQuestions?.length > 0 && (
            <div>
              <h3 className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Example questions</h3>
              <ol className="space-y-1 list-decimal pl-5 text-sm">
                {notes.exampleQuestions.map((q, i) => <li key={i}>{q}</li>)}
              </ol>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
