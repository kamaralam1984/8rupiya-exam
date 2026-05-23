"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Loader2, Gauge, Target, AlertCircle, Sparkles, TrendingUp, Clock, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api-client";
import { EXAMS } from "@/lib/exams";
import { useUser } from "@/lib/use-user";
import Link from "next/link";

type Resp = {
  probability: number;
  band: "low" | "medium" | "high" | "selectable";
  headline: string;
  signals: {
    accuracy: number;
    consistency: number;
    timeControl: number;
    weakChapters: string[];
    strongChapters: string[];
  };
  actionPlan: string[];
  sampleSize: number;
};

export function ProbabilityClient() {
  const { user } = useUser();
  const [exam, setExam] = useState(EXAMS[0].slug);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<Resp | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (user?.examTrack && EXAMS.some((e) => e.slug === user.examTrack)) setExam(user.examTrack);
  }, [user?.examTrack]);

  async function run() {
    setErr(null);
    setLoading(true);
    const r = await api<Resp>("/api/ai/probability", {
      method: "POST",
      body: JSON.stringify({ examSlug: exam }),
    });
    setLoading(false);
    if (!r.ok) {
      setErr(r.error.code === "UNAUTHENTICATED" ? "Sign in to compute." : r.error.message ?? "Failed");
      return;
    }
    setData(r.data);
  }

  const bandColor = (b?: string) =>
    b === "selectable" ? "from-emerald-500 to-teal-500"
    : b === "high" ? "from-cyan-500 to-blue-500"
    : b === "medium" ? "from-amber-500 to-orange-500"
    : "from-rose-500 to-pink-500";

  return (
    <div className="space-y-6">
      <div className="neon-card p-6 grid sm:grid-cols-[1fr_auto] gap-4 items-end">
        <label className="block">
          <span className="text-xs text-muted-foreground">Target exam</span>
          <select
            value={exam}
            onChange={(e) => setExam(e.target.value)}
            className="mt-1 w-full bg-background border border-border rounded-md px-3 py-2 text-sm"
          >
            {EXAMS.map((e) => <option key={e.slug} value={e.slug}>{e.name}</option>)}
          </select>
        </label>
        <Button onClick={run} disabled={loading} className="btn-ai">
          {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Analyzing…</> : <><Gauge className="h-4 w-4" /> Compute probability</>}
        </Button>
      </div>

      {err && <p className="text-sm text-rose-400">{err}</p>}

      {data && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
          <div className={`neon-card p-8 bg-gradient-to-br ${bandColor(data.band)}/15 to-transparent`}>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">{data.band} band</p>
            <div className="mt-3 flex items-end gap-4">
              <p className="font-display text-7xl md:text-8xl font-bold ai-gradient-text">{data.probability}%</p>
              <p className="text-sm text-muted-foreground mb-3">selection probability</p>
            </div>
            <p className="mt-4 text-base text-foreground/90">{data.headline}</p>
            <p className="mt-2 text-xs text-muted-foreground">Based on {data.sampleSize} recent attempts.</p>
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            <Signal icon={Target} label="Accuracy" value={`${data.signals.accuracy}%`} />
            <Signal icon={TrendingUp} label="Consistency" value={`${data.signals.consistency}%`} />
            <Signal icon={Clock} label="Time control" value={`${data.signals.timeControl}%`} />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="neon-card p-5">
              <p className="ai-chip mb-3"><AlertCircle className="h-3 w-3 text-rose-300" /> Weak chapters</p>
              <ul className="space-y-1 text-sm">
                {data.signals.weakChapters.length === 0 && <li className="text-muted-foreground">No major weak spots yet — keep mocking.</li>}
                {data.signals.weakChapters.map((c) => <li key={c} className="text-rose-300">• {c}</li>)}
              </ul>
            </div>
            <div className="neon-card p-5">
              <p className="ai-chip mb-3"><BookOpen className="h-3 w-3 text-emerald-300" /> Strong chapters</p>
              <ul className="space-y-1 text-sm">
                {data.signals.strongChapters.length === 0 && <li className="text-muted-foreground">Build strength — attempt more.</li>}
                {data.signals.strongChapters.map((c) => <li key={c} className="text-emerald-300">• {c}</li>)}
              </ul>
            </div>
          </div>

          <div className="neon-card p-5 bg-gradient-to-br from-purple-500/10 to-pink-500/5">
            <p className="ai-chip mb-3"><Sparkles className="h-3 w-3 text-purple-300" /> AI action plan</p>
            <ol className="space-y-2 text-sm">
              {data.actionPlan.map((s, i) => (
                <li key={i} className="flex gap-3">
                  <span className="text-purple-300 font-mono">{String(i + 1).padStart(2, "0")}</span>
                  <span>{s}</span>
                </li>
              ))}
            </ol>
          </div>

          <div className="flex gap-3 flex-wrap">
            <Link href="/predict" className="btn-ai"><Sparkles className="h-4 w-4" /> Generate predicted set</Link>
            <Link href="/dpp" className="btn-ghost-ai">Today's DPP</Link>
          </div>
        </motion.div>
      )}
    </div>
  );
}

function Signal({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="neon-card p-5">
      <Icon className="h-5 w-5 text-brand-500" />
      <p className="mt-3 text-xs text-muted-foreground">{label}</p>
      <p className="font-display text-2xl font-bold ai-gradient-text-cyan">{value}</p>
    </div>
  );
}
