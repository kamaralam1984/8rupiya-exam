"use client";
import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, RadarChart, Radar, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis,
} from "recharts";
import { TrendingUp, TrendingDown, Minus, Zap, Brain, Target, Flame, Star, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api-client";

type Period = "week" | "month" | "year";

type ProgressData = {
  period: Period;
  points: { label: string; accuracy: number; attempts: number; score: number }[];
  current: { attempts: number; accuracy: number };
  previous: { attempts: number; accuracy: number };
  improvement: number;
  subjects: { name: string; accuracy: number; total: number }[];
  streak: number;
  xp: number;
};

const PERIOD_LABELS: Record<Period, string> = {
  week: "7 Din",
  month: "1 Mahina",
  year: "1 Saal",
};

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  accent,
  delay = 0,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  sub?: string;
  accent?: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="glass rounded-2xl p-5 gradient-border"
    >
      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
        <Icon className="h-3.5 w-3.5" /> {label}
      </div>
      <p className={`font-display text-2xl font-bold ${accent ?? ""}`}>{value}</p>
      {sub && <p className="mt-1 text-xs text-muted-foreground">{sub}</p>}
    </motion.div>
  );
}

export function ProgressClient() {
  const [period, setPeriod] = useState<Period>("week");
  const [data, setData] = useState<ProgressData | null>(null);
  const [loading, setLoading] = useState(true);
  const [aiGuide, setAiGuide] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  const load = useCallback(async (p: Period) => {
    setLoading(true);
    setData(null);
    const r = await api<ProgressData>(`/api/me/progress?period=${p}`);
    if (r.ok) setData(r.data);
    setLoading(false);
  }, []);

  useEffect(() => { load(period); }, [period, load]);

  async function fetchAiGuide() {
    if (!data) return;
    setAiLoading(true);
    const r = await api<{ text: string }>("/api/ai/progress-guide", {
      method: "POST",
      body: JSON.stringify({
        accuracy: data.current.accuracy,
        attempts: data.current.attempts,
        improvement: data.improvement,
        period,
        streak: data.streak,
        subjects: data.subjects,
      }),
    });
    if (r.ok) setAiGuide(r.data.text);
    setAiLoading(false);
  }

  const impColor =
    data && data.improvement > 0
      ? "text-emerald-500"
      : data && data.improvement < 0
      ? "text-red-500"
      : "text-muted-foreground";

  const ImpIcon =
    data && data.improvement > 0
      ? TrendingUp
      : data && data.improvement < 0
      ? TrendingDown
      : Minus;

  return (
    <div className="container py-10 pb-20">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}>
        <p className="text-xs text-muted-foreground uppercase tracking-wide">Analytics</p>
        <h1 className="font-display text-3xl md:text-4xl font-bold tracking-tight mt-1">
          Mera <span className="gradient-text">Progress</span>
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Dekho kitna badhe, kitna aur karna hai
        </p>
      </motion.div>

      {/* Period selector */}
      <div className="mt-6 flex gap-2">
        {(["week", "month", "year"] as Period[]).map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`px-4 py-2 rounded-xl text-sm font-medium border transition-colors ${
              period === p
                ? "bg-brand-500 text-white border-brand-500"
                : "glass border-white/10 hover:border-brand-500/50"
            }`}
          >
            {PERIOD_LABELS[p]}
          </button>
        ))}
      </div>

      {loading && (
        <div className="mt-20 grid place-items-center">
          <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
        </div>
      )}

      <AnimatePresence mode="wait">
        {data && !loading && (
          <motion.div
            key={period}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Stat cards */}
            <div className="mt-8 grid gap-4 grid-cols-2 md:grid-cols-4">
              <StatCard
                icon={Target}
                label="Accuracy"
                value={`${(data.current.accuracy * 100).toFixed(0)}%`}
                sub={`Pichle period: ${(data.previous.accuracy * 100).toFixed(0)}%`}
                accent="gradient-text"
                delay={0}
              />
              <StatCard
                icon={ImpIcon}
                label="Improvement"
                value={`${data.improvement > 0 ? "+" : ""}${data.improvement.toFixed(1)}%`}
                sub={data.improvement > 0 ? "Badhiya chal rahe ho!" : data.improvement < 0 ? "Aur mehnat karo" : "Stable hai"}
                accent={impColor}
                delay={0.05}
              />
              <StatCard
                icon={Zap}
                label="Tests Diye"
                value={String(data.current.attempts)}
                sub={`${PERIOD_LABELS[period]} mein`}
                delay={0.1}
              />
              <StatCard
                icon={Flame}
                label="Streak"
                value={`${data.streak} din`}
                sub="Lagatar padhai"
                accent="text-orange-500"
                delay={0.15}
              />
            </div>

            {/* Accuracy area chart */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-6 glass rounded-2xl p-6 gradient-border"
            >
              <h2 className="font-display text-lg font-semibold mb-4">Accuracy Trend</h2>
              {data.points.some((p) => p.accuracy > 0) ? (
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={data.points} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="accGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="label" tick={{ fontSize: 11 }} stroke="transparent" />
                    <YAxis tickFormatter={(v) => `${(v * 100).toFixed(0)}%`} tick={{ fontSize: 11 }} stroke="transparent" domain={[0, 1]} />
                    <Tooltip
                      formatter={(v: number) => [`${(v * 100).toFixed(1)}%`, "Accuracy"]}
                      contentStyle={{ background: "rgba(15,15,20,0.9)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8 }}
                    />
                    <Area type="monotone" dataKey="accuracy" stroke="#7c3aed" strokeWidth={2} fill="url(#accGrad)" isAnimationActive animationDuration={800} />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-sm text-muted-foreground py-10 text-center">Is period mein koi test nahi diya.</p>
              )}
            </motion.div>

            {/* Tests per period bar chart */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="mt-4 glass rounded-2xl p-6 gradient-border"
            >
              <h2 className="font-display text-lg font-semibold mb-4">Tests per {PERIOD_LABELS[period]}</h2>
              {data.points.some((p) => p.attempts > 0) ? (
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={data.points} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="label" tick={{ fontSize: 11 }} stroke="transparent" />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11 }} stroke="transparent" />
                    <Tooltip
                      formatter={(v: number) => [v, "Tests"]}
                      contentStyle={{ background: "rgba(15,15,20,0.9)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8 }}
                    />
                    <Bar dataKey="attempts" fill="#06b6d4" radius={[4, 4, 0, 0]} isAnimationActive animationDuration={700} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-sm text-muted-foreground py-8 text-center">Koi test nahi diya abhi.</p>
              )}
            </motion.div>

            {/* Subject radar */}
            {data.subjects.length >= 2 && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mt-4 glass rounded-2xl p-6 gradient-border"
              >
                <h2 className="font-display text-lg font-semibold mb-4">Subject Performance</h2>
                <ResponsiveContainer width="100%" height={240}>
                  <RadarChart data={data.subjects.map((s) => ({ subject: s.name, accuracy: Math.round(s.accuracy * 100) }))}>
                    <PolarGrid stroke="rgba(255,255,255,0.1)" />
                    <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 9 }} />
                    <Radar name="Accuracy" dataKey="accuracy" stroke="#7c3aed" fill="#7c3aed" fillOpacity={0.3} isAnimationActive animationDuration={800} />
                  </RadarChart>
                </ResponsiveContainer>
              </motion.div>
            )}

            {/* Subject list */}
            {data.subjects.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
                className="mt-4 glass rounded-2xl p-6 gradient-border"
              >
                <h2 className="font-display text-lg font-semibold mb-4">Subject Breakdown</h2>
                <div className="space-y-3">
                  {data.subjects.map((s, i) => {
                    const pct = Math.round(s.accuracy * 100);
                    const color = pct >= 70 ? "bg-emerald-500" : pct >= 40 ? "bg-amber-500" : "bg-red-500";
                    return (
                      <motion.div
                        key={s.name}
                        initial={{ opacity: 0, x: -12 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.35 + i * 0.05 }}
                      >
                        <div className="flex justify-between text-sm mb-1">
                          <span className="font-medium">{s.name}</span>
                          <span className="text-muted-foreground">{pct}% · {s.total} Qs</span>
                        </div>
                        <div className="h-2 rounded-full bg-muted overflow-hidden">
                          <motion.div
                            className={`h-full rounded-full ${color}`}
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={{ duration: 0.7, delay: 0.4 + i * 0.05 }}
                          />
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* AI Study Guide */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mt-4 glass rounded-2xl p-6 gradient-border"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-brand-500" />
                  <h2 className="font-display text-lg font-semibold">AI Study Guide</h2>
                </div>
                {!aiGuide && (
                  <Button size="sm" onClick={fetchAiGuide} disabled={aiLoading}>
                    {aiLoading ? <><Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> Soch raha hai…</> : <><Star className="h-3.5 w-3.5 mr-1" /> Guide lao</>}
                  </Button>
                )}
              </div>
              {!aiGuide && !aiLoading && (
                <p className="text-sm text-muted-foreground">
                  AI tumhara data dekh ke personalized study plan banayega — kahan focus karo, kitna time do, kya padhna hai.
                </p>
              )}
              {aiLoading && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin text-brand-500" /> Tumhara plan ban raha hai…
                </div>
              )}
              {aiGuide && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-sm leading-relaxed whitespace-pre-wrap text-foreground"
                >
                  {aiGuide}
                </motion.div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
