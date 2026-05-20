"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Trophy, Flame, BookOpen, Target, TrendingUp, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { api } from "@/lib/api-client";

type Stats = {
  xp: number;
  streak: number;
  rank: number;
  attempts: number;
  avgAccuracy: number;
  totalScore: number;
  bestScore: number;
};

type Attempt = {
  id: string;
  status: string;
  score: number | null;
  accuracy: number | null;
  startedAt: string;
  submittedAt: string | null;
  testSet: { title: string; slug: string; exam: { name: string; slug: string } };
};

export function DashboardView() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [attempts, setAttempts] = useState<Attempt[] | null>(null);
  const [needAuth, setNeedAuth] = useState(false);

  useEffect(() => {
    (async () => {
      const [s, a] = await Promise.all([
        api<Stats>("/api/me/stats"),
        api<Attempt[]>("/api/me/attempts"),
      ]);
      if (!s.ok && s.error.code === "UNAUTHENTICATED") {
        setNeedAuth(true);
        return;
      }
      if (s.ok) setStats(s.data);
      if (a.ok) setAttempts(a.data);
    })();
  }, []);

  if (needAuth) {
    return (
      <section className="container py-16 max-w-md">
        <div className="glass rounded-2xl p-7 gradient-border">
          <h1 className="font-display text-xl font-bold">Sign in to view your dashboard</h1>
          <div className="mt-4 flex gap-2">
            <Link href="/signin?next=/dashboard"><Button>Sign in</Button></Link>
            <Link href="/signup?next=/dashboard"><Button variant="outline">Create account</Button></Link>
          </div>
        </div>
      </section>
    );
  }

  if (!stats) {
    return (
      <section className="container py-20 grid place-items-center">
        <Loader2 className="h-6 w-6 animate-spin text-brand-500" />
      </section>
    );
  }

  return (
    <section className="container pt-10 pb-20">
      <header className="mb-8">
        <p className="text-xs text-muted-foreground">Welcome back</p>
        <h1 className="font-display text-3xl md:text-4xl font-bold tracking-tight">
          Your <span className="gradient-text">Dashboard</span>
        </h1>
      </header>

      <div className="grid gap-4 md:grid-cols-4">
        <Stat icon={Trophy} label="XP" value={stats.xp.toString()} accent />
        <Stat icon={Flame} label="Streak" value={`${stats.streak} days`} />
        <Stat icon={TrendingUp} label="Rank" value={`#${stats.rank}`} />
        <Stat icon={Target} label="Avg Accuracy" value={`${(stats.avgAccuracy * 100).toFixed(0)}%`} />
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        <Card label="Tests taken" value={stats.attempts} />
        <Card label="Total score" value={stats.totalScore.toFixed(1)} />
        <Card label="Best score" value={(stats.bestScore ?? 0).toFixed(1)} />
      </div>

      <div className="mt-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-xl font-bold">Recent attempts</h2>
          <Link href="/exams" className="text-sm text-brand-500 hover:underline">
            Take new test →
          </Link>
        </div>
        {!attempts ? (
          <div className="glass rounded-2xl p-8 text-center">
            <Loader2 className="h-5 w-5 animate-spin mx-auto text-brand-500" />
          </div>
        ) : attempts.length === 0 ? (
          <div className="glass rounded-2xl p-8 text-center gradient-border">
            <BookOpen className="h-8 w-8 mx-auto text-muted-foreground" />
            <p className="mt-3 text-sm text-muted-foreground">
              No tests yet. Take your first one to start tracking progress.
            </p>
            <Link href="/exams" className="mt-4 inline-block">
              <Button>Browse exams</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {attempts.map((a, i) => (
              <motion.div
                key={a.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="glass rounded-xl p-4 gradient-border flex items-center gap-4"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{a.testSet.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {a.testSet.exam.name} · {new Date(a.startedAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right hidden sm:block">
                  <p className="text-xs text-muted-foreground">Score</p>
                  <p className="text-sm font-semibold">{a.score?.toFixed(1) ?? "—"}</p>
                </div>
                <div className="text-right hidden sm:block w-24">
                  <p className="text-xs text-muted-foreground">Accuracy</p>
                  <Progress value={(a.accuracy ?? 0) * 100} className="mt-1" />
                </div>
                <div>
                  {a.status === "SUBMITTED" ? (
                    <Link href={`/attempt/${a.id}/result`}>
                      <Button size="sm" variant="outline">Result</Button>
                    </Link>
                  ) : (
                    <Link href={`/test/${a.testSet.slug}`}>
                      <Button size="sm">Resume</Button>
                    </Link>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function Stat({
  icon: Icon, label, value, accent,
}: { icon: any; label: string; value: string; accent?: boolean }) {
  return (
    <div className="glass rounded-2xl p-5 gradient-border">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Icon className="h-4 w-4" /> {label}
      </div>
      <div className={`mt-2 font-display text-2xl font-bold ${accent ? "gradient-text" : ""}`}>
        {value}
      </div>
    </div>
  );
}

function Card({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="glass rounded-xl p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 font-display text-xl font-semibold">{value}</p>
    </div>
  );
}
