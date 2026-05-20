"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Loader2, TrendingUp, TrendingDown, Minus, Radio } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { api } from "@/lib/api-client";
import { EXAMS } from "@/lib/exams";

type Resp = {
  exam: string;
  asOf: string;
  topics: { name: string; subject: string; trend: "up" | "stable" | "down"; frequency: number; rationale: string }[];
  advice: string[];
};

export function RadarClient() {
  const [exam, setExam] = useState(EXAMS[0].slug);
  const [data, setData] = useState<Resp | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function load(slug: string) {
    setLoading(true); setData(null); setErr(null);
    const r = await api<Resp>(`/api/ai/radar?examSlug=${slug}`);
    setLoading(false);
    if (!r.ok) { setErr(r.error.message ?? r.error.code); return; }
    setData(r.data);
  }

  useEffect(() => { load(exam); }, [exam]);

  return (
    <div className="space-y-5">
      <div className="glass rounded-2xl p-5 gradient-border flex items-center gap-3">
        <Radio className="h-5 w-5 text-brand-500" />
        <label className="flex-1">
          <span className="text-xs text-muted-foreground block mb-1">Exam</span>
          <select
            value={exam}
            onChange={(e) => setExam(e.target.value)}
            className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm"
          >
            {EXAMS.map((e) => <option key={e.slug} value={e.slug}>{e.name}</option>)}
          </select>
        </label>
      </div>

      {err && <p className="text-sm text-red-500">{err}</p>}
      {loading && (
        <div className="grid place-items-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-brand-500" />
        </div>
      )}

      {data && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
          <p className="text-xs text-muted-foreground">As of {data.asOf}</p>
          {data.topics
            .sort((a, b) => b.frequency - a.frequency)
            .map((t, i) => (
              <div key={i} className="glass rounded-xl p-4 gradient-border">
                <div className="flex items-center justify-between">
                  <div className="min-w-0">
                    <p className="font-medium truncate">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.subject}</p>
                  </div>
                  <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full ${
                    t.trend === "up" ? "bg-emerald-500/15 text-emerald-500" :
                    t.trend === "down" ? "bg-red-500/15 text-red-500" :
                    "bg-muted text-muted-foreground"
                  }`}>
                    {t.trend === "up" ? <TrendingUp className="h-3 w-3" /> :
                     t.trend === "down" ? <TrendingDown className="h-3 w-3" /> :
                     <Minus className="h-3 w-3" />}
                    {t.trend}
                  </span>
                </div>
                <Progress value={t.frequency * 100} className="mt-3" />
                <p className="mt-2 text-xs text-muted-foreground">{t.rationale}</p>
              </div>
            ))}

          {data.advice?.length > 0 && (
            <div className="glass rounded-2xl p-5 gradient-border mt-4">
              <h3 className="font-display font-semibold mb-2">Smart advice</h3>
              <ul className="space-y-1 text-sm list-disc pl-5">
                {data.advice.map((a, i) => <li key={i}>{a}</li>)}
              </ul>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
