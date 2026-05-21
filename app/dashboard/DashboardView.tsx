"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Trophy, Flame, BookOpen, Target, TrendingUp, Loader2,
  Crown, Wallet, Sparkles, Brain, FileQuestion, MessageCircleQuestion,
  PlayCircle, ChevronRight, CheckCircle2, ArrowUpRight, Clock,
} from "lucide-react";
import { motion } from "framer-motion";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, ResponsiveContainer,
  Tooltip, Cell, CartesianGrid,
} from "recharts";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { api } from "@/lib/api-client";

type DashboardPayload = {
  stats: {
    xp: number; streak: number; rank: number; attempts: number;
    avgAccuracy: number; totalScore: number; bestScore: number;
  };
  dailyGoal: { target: number; done: number };
  streakHistory: Array<{ date: string; count: number }>;
  performance: {
    weeklyTrend: Array<{ weekStart: string; avgScore: number; tests: number }>;
    subjects: Array<{ name: string; accuracy: number; count: number }>;
  };
  recommendations: {
    inProgress: {
      id: string; startedAt: string; testSetSlug: string;
      testSetTitle: string; examName: string; examSlug: string;
    } | null;
    suggested: Array<{
      slug: string; title: string; examName: string; examSlug: string;
      durationMin: number; questionCount: number; isPremium: boolean;
    }>;
  };
  plan: {
    name: string; role: string; daysRemaining: number | null;
    endsAt: string | null; isPaid: boolean;
  };
  wallet: { balance: number; currency: string };
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
  const [data, setData] = useState<DashboardPayload | null>(null);
  const [attempts, setAttempts] = useState<Attempt[] | null>(null);
  const [needAuth, setNeedAuth] = useState(false);

  useEffect(() => {
    (async () => {
      const [d, a] = await Promise.all([
        api<DashboardPayload>("/api/me/dashboard"),
        api<Attempt[]>("/api/me/attempts"),
      ]);
      if (!d.ok && d.error.code === "UNAUTHENTICATED") {
        setNeedAuth(true);
        return;
      }
      if (d.ok) setData(d.data);
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

  if (!data) {
    return (
      <section className="container py-20 grid place-items-center">
        <Loader2 className="h-6 w-6 animate-spin text-brand-500" />
      </section>
    );
  }

  const { stats, dailyGoal, streakHistory, performance, recommendations, plan, wallet } = data;

  return (
    <section className="container pt-10 pb-20">
      <header className="mb-8 flex items-end justify-between flex-wrap gap-4">
        <div>
          <p className="text-xs text-muted-foreground">Welcome back</p>
          <h1 className="font-display text-3xl md:text-4xl font-bold tracking-tight">
            Your <span className="gradient-text">Dashboard</span>
          </h1>
        </div>
        <DailyGoalBadge done={dailyGoal.done} target={dailyGoal.target} />
      </header>

      {/* Top stat tiles */}
      <div className="grid gap-4 md:grid-cols-4">
        <Stat icon={Trophy} label="XP" value={stats.xp.toString()} accent />
        <Stat icon={Flame} label="Streak" value={`${stats.streak} days`} />
        <Stat icon={TrendingUp} label="Rank" value={`#${stats.rank}`} />
        <Stat icon={Target} label="Avg Accuracy" value={`${(stats.avgAccuracy * 100).toFixed(0)}%`} />
      </div>

      {/* Plan/Wallet + Streak heatmap */}
      <div className="mt-8 grid gap-4 lg:grid-cols-3">
        <PlanWalletCard plan={plan} wallet={wallet} />
        <div className="lg:col-span-2">
          <StreakCard history={streakHistory} streak={stats.streak} />
        </div>
      </div>

      {/* Continue where you left off */}
      {recommendations.inProgress && (
        <ContinueBanner inProgress={recommendations.inProgress} />
      )}

      {/* Performance Charts */}
      <div className="mt-10">
        <h2 className="font-display text-xl font-bold mb-4">Performance</h2>
        <div className="grid gap-4 lg:grid-cols-2">
          <ChartCard title="Weekly score trend" subtitle="Last 8 weeks">
            {performance.weeklyTrend.length < 2 ? (
              <EmptyChart message="Submit at least 2 tests across different weeks to see your trend." />
            ) : (
              <WeeklyTrendChart data={performance.weeklyTrend} />
            )}
          </ChartCard>
          <ChartCard title="Subject-wise accuracy" subtitle="Last 90 days · top 6 subjects">
            {performance.subjects.length === 0 ? (
              <EmptyChart message="Take a few tests to see subject-wise accuracy." />
            ) : (
              <SubjectAccuracyChart data={performance.subjects} />
            )}
          </ChartCard>
        </div>
      </div>

      {/* Recommended Tests */}
      <div className="mt-10">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-display text-xl font-bold">Recommended for you</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Fresh tests from your exam track</p>
          </div>
          <Link href="/exams" className="text-sm text-brand-500 hover:underline">
            Browse all →
          </Link>
        </div>
        {recommendations.suggested.length === 0 ? (
          <div className="glass rounded-2xl p-6 text-center gradient-border">
            <p className="text-sm text-muted-foreground">
              All caught up! No new tests to recommend right now.
            </p>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {recommendations.suggested.map((t) => (
              <RecommendedCard key={t.slug} test={t} />
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="mt-10">
        <h2 className="font-display text-xl font-bold mb-4">Quick actions</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <QuickAction href="/pyq" icon={FileQuestion} label="PYQ" sub="Previous-year questions" />
          <QuickAction href="/flashcards" icon={Sparkles} label="Flashcards" sub="Quick revision" />
          <QuickAction href="/doubt" icon={MessageCircleQuestion} label="Ask doubt" sub="AI-powered answers" />
          <QuickAction href="/predict" icon={Brain} label="Predicted set" sub="AI mock for next exam" />
        </div>
      </div>

      {/* Bottom stat cards */}
      <div className="mt-10 grid gap-4 md:grid-cols-3">
        <Card label="Tests taken" value={stats.attempts} />
        <Card label="Total score" value={stats.totalScore.toFixed(1)} />
        <Card label="Best score" value={(stats.bestScore ?? 0).toFixed(1)} />
      </div>

      {/* Recent attempts */}
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

/* ---------- sub-components ---------- */

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

function DailyGoalBadge({ done, target }: { done: number; target: number }) {
  const met = done >= target;
  return (
    <div className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm ${
      met ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
          : "glass border border-amber-500/30 text-amber-300"
    }`}>
      {met ? <CheckCircle2 className="h-4 w-4" /> : <Target className="h-4 w-4" />}
      <span className="font-medium">
        {met ? "Daily goal hit" : `Daily goal: ${done}/${target}`}
      </span>
    </div>
  );
}

function PlanWalletCard({
  plan, wallet,
}: { plan: DashboardPayload["plan"]; wallet: DashboardPayload["wallet"] }) {
  const balanceRupees = (wallet.balance / 100).toFixed(0);
  return (
    <div className="glass rounded-2xl p-5 gradient-border h-full flex flex-col">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Crown className="h-4 w-4" /> Plan
      </div>
      <div className="mt-2 flex items-baseline gap-2">
        <p className="font-display text-2xl font-bold gradient-text">{plan.name}</p>
        {plan.isPaid && plan.daysRemaining !== null && (
          <p className="text-xs text-muted-foreground">
            {plan.daysRemaining} day{plan.daysRemaining === 1 ? "" : "s"} left
          </p>
        )}
      </div>

      <div className="mt-4 pt-4 border-t border-white/5 flex items-center gap-2 text-xs text-muted-foreground">
        <Wallet className="h-4 w-4" /> Wallet
      </div>
      <p className="mt-1 font-display text-xl font-semibold">₹{balanceRupees}</p>

      <div className="mt-auto pt-4 flex gap-2">
        {plan.isPaid ? (
          <Link href="/pricing" className="flex-1">
            <Button variant="outline" size="sm" className="w-full">Manage plan</Button>
          </Link>
        ) : (
          <Link href="/pricing" className="flex-1">
            <Button size="sm" className="w-full">
              Upgrade <ArrowUpRight className="h-3 w-3 ml-1" />
            </Button>
          </Link>
        )}
        <Link href="/wallet">
          <Button variant="outline" size="sm">Top up</Button>
        </Link>
      </div>
    </div>
  );
}

function StreakCard({
  history, streak,
}: { history: DashboardPayload["streakHistory"]; streak: number }) {
  const max = useMemo(() => history.reduce((m, d) => Math.max(m, d.count), 0), [history]);
  const activeDays = history.filter((d) => d.count > 0).length;

  return (
    <div className="glass rounded-2xl p-5 gradient-border h-full">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Flame className="h-5 w-5 text-orange-400" />
          <div>
            <p className="font-display text-lg font-bold">{streak}-day streak</p>
            <p className="text-xs text-muted-foreground">
              Active {activeDays} of last 30 days
            </p>
          </div>
        </div>
        <p className="text-xs text-muted-foreground hidden sm:block">Last 30 days →</p>
      </div>

      <div className="mt-5 grid grid-cols-15 gap-1.5" style={{ gridTemplateColumns: "repeat(15, minmax(0, 1fr))" }}>
        {history.map((d) => {
          const intensity = max === 0 ? 0 : Math.min(1, d.count / Math.max(1, max));
          const bg =
            d.count === 0 ? "bg-white/5"
              : intensity < 0.34 ? "bg-orange-500/30"
              : intensity < 0.67 ? "bg-orange-500/60"
              : "bg-orange-500";
          return (
            <div
              key={d.date}
              title={`${d.date}: ${d.count} attempt${d.count === 1 ? "" : "s"}`}
              className={`aspect-square rounded-sm ${bg} transition-all hover:scale-110`}
            />
          );
        })}
      </div>
    </div>
  );
}

function ContinueBanner({
  inProgress,
}: { inProgress: NonNullable<DashboardPayload["recommendations"]["inProgress"]> }) {
  return (
    <Link href={`/test/${inProgress.testSetSlug}`} className="block mt-6">
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-2xl p-5 gradient-border flex items-center gap-4 hover:bg-white/[0.03] transition-colors"
      >
        <div className="rounded-full bg-brand-500/15 p-3">
          <PlayCircle className="h-6 w-6 text-brand-500" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-muted-foreground">Continue where you left off</p>
          <p className="font-medium truncate">{inProgress.testSetTitle}</p>
          <p className="text-xs text-muted-foreground">
            {inProgress.examName} · Started {new Date(inProgress.startedAt).toLocaleDateString()}
          </p>
        </div>
        <ChevronRight className="h-5 w-5 text-muted-foreground" />
      </motion.div>
    </Link>
  );
}

function ChartCard({
  title, subtitle, children,
}: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div className="glass rounded-2xl p-5 gradient-border">
      <div className="mb-3">
        <p className="font-semibold">{title}</p>
        <p className="text-xs text-muted-foreground">{subtitle}</p>
      </div>
      {children}
    </div>
  );
}

function EmptyChart({ message }: { message: string }) {
  return (
    <div className="h-64 flex items-center justify-center text-center px-6">
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
}

function WeeklyTrendChart({
  data,
}: { data: DashboardPayload["performance"]["weeklyTrend"] }) {
  const chart = data.map((d) => ({
    week: new Date(d.weekStart).toLocaleDateString("en", { month: "short", day: "numeric" }),
    score: Number(d.avgScore.toFixed(1)),
    tests: d.tests,
  }));
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer>
        <LineChart data={chart} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted-foreground) / 0.15)" />
          <XAxis dataKey="week" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
          <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
          <Tooltip
            contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }}
            formatter={(v: any, name: any) => name === "tests" ? `${v} tests` : v}
          />
          <Line
            type="monotone"
            dataKey="score"
            stroke="hsl(var(--primary))"
            strokeWidth={2.5}
            dot={{ r: 4, fill: "hsl(var(--primary))" }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

function SubjectAccuracyChart({
  data,
}: { data: DashboardPayload["performance"]["subjects"] }) {
  const chart = data.map((d) => ({
    name: d.name.length > 14 ? d.name.slice(0, 13) + "…" : d.name,
    value: Math.round(d.accuracy * 100),
    count: d.count,
  }));
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer>
        <BarChart data={chart} layout="vertical" margin={{ left: 0, right: 16 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted-foreground) / 0.15)" />
          <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
          <YAxis dataKey="name" type="category" width={90} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
          <Tooltip
            contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }}
            formatter={(v: any) => `${v}%`}
          />
          <Bar dataKey="value" radius={[0, 6, 6, 0]} isAnimationActive>
            {chart.map((d, i) => (
              <Cell key={i} fill={
                d.value >= 70 ? "hsl(142 71% 45%)" :
                d.value >= 40 ? "hsl(45 93% 47%)" :
                "hsl(0 84% 60%)"
              } />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function RecommendedCard({
  test,
}: { test: DashboardPayload["recommendations"]["suggested"][number] }) {
  return (
    <Link href={`/test/${test.slug}`} className="block group">
      <div className="glass rounded-xl p-4 gradient-border h-full hover:bg-white/[0.03] transition-colors flex flex-col">
        <div className="flex items-start justify-between gap-2">
          <p className="font-medium leading-snug line-clamp-2">{test.title}</p>
          {test.isPremium && (
            <Crown className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
          )}
        </div>
        <p className="mt-1 text-xs text-muted-foreground">{test.examName}</p>
        <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" /> {test.durationMin}m
          </span>
          <span>·</span>
          <span>{test.questionCount} Qs</span>
        </div>
        <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between text-xs">
          <span className="text-brand-500 group-hover:underline">Start test</span>
          <ChevronRight className="h-3 w-3 text-muted-foreground" />
        </div>
      </div>
    </Link>
  );
}

function QuickAction({
  href, icon: Icon, label, sub,
}: { href: string; icon: any; label: string; sub: string }) {
  return (
    <Link href={href} className="block group">
      <div className="glass rounded-xl p-4 gradient-border hover:bg-white/[0.03] transition-colors flex items-center gap-3">
        <div className="rounded-lg bg-brand-500/10 p-2.5">
          <Icon className="h-5 w-5 text-brand-500" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm">{label}</p>
          <p className="text-xs text-muted-foreground truncate">{sub}</p>
        </div>
      </div>
    </Link>
  );
}
