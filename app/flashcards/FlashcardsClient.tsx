"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Loader2, Sparkles, ChevronLeft, ChevronRight, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api-client";

type Card = { front: string; back: string };

export function FlashcardsClient() {
  const [topic, setTopic] = useState("");
  const [count, setCount] = useState(10);
  const [lang, setLang] = useState<"en" | "hi">("en");
  const [cards, setCards] = useState<Card[] | null>(null);
  const [i, setI] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!topic.trim()) return;
    setLoading(true); setErr(null); setCards(null); setI(0); setFlipped(false);
    const r = await api<{ topic: string; cards: Card[] }>("/api/ai/flashcards", {
      method: "POST",
      body: JSON.stringify({ topic: topic.trim(), count, language: lang }),
    });
    setLoading(false);
    if (!r.ok) {
      setErr(r.error.code === "UNAUTHENTICATED" ? "Sign in to generate flashcards." : (r.error.message ?? r.error.code));
      return;
    }
    setCards(r.data.cards);
  }

  const card = cards?.[i];

  return (
    <div className="space-y-5">
      <form onSubmit={submit} className="glass rounded-2xl p-5 gradient-border grid sm:grid-cols-[1fr_120px_auto] gap-3">
        <input
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="e.g. Indian Polity – Fundamental Rights"
          className="bg-background border border-border rounded-md px-3 py-2 text-sm"
        />
        <input
          type="number"
          min={4}
          max={30}
          value={count}
          onChange={(e) => setCount(parseInt(e.target.value) || 10)}
          className="bg-background border border-border rounded-md px-3 py-2 text-sm"
        />
        <Button type="submit" disabled={loading || !topic.trim()}>
          {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Building…</> : <><Sparkles className="h-4 w-4" /> Generate</>}
        </Button>
        <div className="sm:col-span-3 flex items-center gap-1 text-xs">
          <button type="button" onClick={() => setLang("en")} className={`px-2 py-1 rounded ${lang === "en" ? "bg-brand-500/20 text-brand-500" : "text-muted-foreground"}`}>English</button>
          <button type="button" onClick={() => setLang("hi")} className={`px-2 py-1 rounded ${lang === "hi" ? "bg-brand-500/20 text-brand-500" : "text-muted-foreground"}`}>हिंदी</button>
        </div>
      </form>

      {err && <p className="text-sm text-red-500">{err}</p>}

      {cards && card && (
        <div className="space-y-4">
          <motion.button
            key={i + (flipped ? "b" : "f")}
            type="button"
            onClick={() => setFlipped(!flipped)}
            initial={{ rotateY: flipped ? -90 : 90, opacity: 0 }}
            animate={{ rotateY: 0, opacity: 1 }}
            transition={{ duration: 0.25 }}
            className="block w-full min-h-[200px] glass rounded-2xl p-8 gradient-border text-left"
            style={{ perspective: 1000 }}
          >
            <p className="text-xs uppercase tracking-wide text-muted-foreground mb-3">
              {flipped ? "Back" : "Front"} · Card {i + 1} of {cards.length}
            </p>
            <p className="text-lg leading-relaxed">{flipped ? card.back : card.front}</p>
            <p className="mt-6 text-xs text-muted-foreground inline-flex items-center gap-1">
              <RotateCw className="h-3 w-3" /> Click to flip
            </p>
          </motion.button>

          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              disabled={i === 0}
              onClick={() => { setI(i - 1); setFlipped(false); }}
            >
              <ChevronLeft className="h-4 w-4" /> Prev
            </Button>
            <span className="text-sm text-muted-foreground">{i + 1} / {cards.length}</span>
            <Button
              size="sm"
              disabled={i === cards.length - 1}
              onClick={() => { setI(i + 1); setFlipped(false); }}
            >
              Next <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
