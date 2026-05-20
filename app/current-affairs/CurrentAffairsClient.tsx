"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Loader2, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { api } from "@/lib/api-client";

type Q = { stem: string; options: string[]; correctIndex: number; explanation: string; topic: string };

export function CurrentAffairsClient() {
  const [qs, setQs] = useState<Q[] | null>(null);
  const [date, setDate] = useState<string>("");
  const [picked, setPicked] = useState<Record<number, number>>({});
  const [revealed, setRevealed] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const r = await api<{ date: string; questions: Q[] }>("/api/ai/current-affairs");
      if (!r.ok) { setErr(r.error.message ?? r.error.code); return; }
      setQs(r.data.questions);
      setDate(r.data.date);
    })();
  }, []);

  if (err) return <p className="text-sm text-red-500">{err}</p>;
  if (!qs) return <div className="grid place-items-center py-20"><Loader2 className="h-6 w-6 animate-spin text-brand-500" /></div>;

  const answered = Object.keys(picked).length;
  const correct = qs.reduce((acc, q, i) => acc + (picked[i] === q.correctIndex ? 1 : 0), 0);

  return (
    <div className="space-y-4">
      <div className="glass rounded-2xl p-4 gradient-border flex items-center justify-between text-sm">
        <span className="text-muted-foreground">Quiz for {date}</span>
        <div className="flex items-center gap-3">
          <span>{answered}/{qs.length} answered</span>
          {revealed && <span className="text-emerald-500">Score: {correct}/{qs.length}</span>}
        </div>
      </div>
      <Progress value={(answered / qs.length) * 100} />

      {qs.map((q, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.03 }}
          className="glass rounded-2xl p-5 gradient-border"
        >
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Q{i + 1}</span>
            <span>{q.topic}</span>
          </div>
          <p className="mt-2 font-medium">{q.stem}</p>
          <div className="mt-3 grid gap-1.5">
            {q.options.map((opt, j) => {
              const sel = picked[i] === j;
              const right = revealed && j === q.correctIndex;
              const wrong = revealed && sel && !right;
              return (
                <button
                  key={j}
                  disabled={revealed}
                  onClick={() => setPicked({ ...picked, [i]: j })}
                  className={`text-left rounded-md px-3 py-2 text-sm border transition flex items-center gap-2 ${
                    right ? "border-emerald-500/60 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300" :
                    wrong ? "border-red-500/60 bg-red-500/10 text-red-500" :
                    sel ? "border-brand-500 bg-brand-500/10" :
                    "border-border hover:border-brand-500/40"
                  }`}
                >
                  <span className="font-mono">{String.fromCharCode(65 + j)}</span>
                  <span className="flex-1">{opt}</span>
                  {right && <Check className="h-3.5 w-3.5" />}
                  {wrong && <X className="h-3.5 w-3.5" />}
                </button>
              );
            })}
          </div>
          {revealed && (
            <p className="mt-3 text-xs text-muted-foreground"><span className="font-medium">Why:</span> {q.explanation}</p>
          )}
        </motion.div>
      ))}

      <div className="flex justify-center">
        {!revealed ? (
          <Button size="lg" onClick={() => setRevealed(true)} disabled={answered === 0}>Reveal answers</Button>
        ) : (
          <p className="text-sm text-muted-foreground">Come back tomorrow for a fresh set.</p>
        )}
      </div>
    </div>
  );
}
