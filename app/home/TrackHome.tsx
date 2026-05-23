"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Brain,
  Sparkles,
  Target,
  Calculator,
  BookOpen,
  Calendar,
  Flame,
  Trophy,
  FileText,
  Languages,
  ShieldCheck,
  Radar,
  GraduationCap,
  Newspaper,
  TestTube,
  Megaphone,
  Building2,
  Train,
  Landmark,
  Users,
  Shield,
  School,
  Map,
  Settings,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useT, useLang } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { getTrackConfig, type QuickAction } from "@/lib/track-config";

const ICONS = {
  Brain,
  Sparkles,
  Target,
  Calculator,
  BookOpen,
  Calendar,
  Flame,
  Trophy,
  FileText,
  Languages,
  ShieldCheck,
  Radar,
  GraduationCap,
  Newspaper,
  TestTube,
  Megaphone,
  Building2,
  Train,
  Landmark,
  Users,
  Shield,
  School,
  Map,
} as const;

type Attempt = {
  id: string;
  status: string;
  score: number | null;
  accuracy: number | null;
  startedAt: string;
  testSetSlug: string;
  testSetTitle: string;
};

type TestSetCard = {
  slug: string;
  title: string;
  description: string | null;
  durationMin: number;
  isPremium: boolean;
  priceInPaise: number;
};

type Subject = { name: string; slug: string };

export function TrackHome({
  trackSlug,
  userName,
  xp,
  streak,
  attempts,
  testSets,
  subjects,
}: {
  trackSlug: string;
  userName: string;
  xp: number;
  streak: number;
  attempts: Attempt[];
  testSets: TestSetCard[];
  subjects: Subject[];
}) {
  const t = useT();
  const [lang] = useLang();
  const track = getTrackConfig(trackSlug);
  if (!track) {
    return (
      <section className="container py-16">
        <p className="text-sm text-muted-foreground">Unknown track. <Link href="/onboarding" className="text-brand-500 underline">Pick again</Link></p>
      </section>
    );
  }

  const HeroIcon = ICONS[track.heroIcon as keyof typeof ICONS] ?? GraduationCap;
  const firstName = userName.split(" ")[0]?.split("@")[0] ?? "Student";
  const today = new Date().toLocaleDateString(lang === "hi" ? "hi-IN" : "en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <div className="pb-20">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className={cn("absolute inset-0 -z-10 bg-gradient-to-br opacity-30", track.gradient)} />
        <div className="absolute inset-0 -z-10 [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]">
          <div className={cn("absolute -top-20 left-1/4 h-72 w-72 rounded-full blur-3xl opacity-40 bg-gradient-to-br", track.gradient)} />
          <div className={cn("absolute top-10 right-10 h-64 w-64 rounded-full blur-3xl opacity-30 bg-gradient-to-br", track.gradient)} />
        </div>

        <div className="container pt-12 pb-10">
          <div className="flex items-center justify-between gap-3 text-xs text-muted-foreground">
            <span>{today}</span>
            <Link href="/settings" className="inline-flex items-center gap-1 hover:text-foreground">
              <Settings className="h-3 w-3" /> Change track
            </Link>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="mt-3 flex flex-col gap-4"
          >
            <div className="flex items-center gap-3">
              <div className={cn("h-12 w-12 grid place-items-center rounded-xl bg-gradient-to-br text-white shadow-lg", track.gradient)}>
                <HeroIcon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{track.short}</p>
                <h1 className="font-display text-3xl md:text-5xl font-bold tracking-tight">
                  Hey {firstName}, <span className="text-brand-600">{track.name}</span> mode on
                </h1>
              </div>
            </div>
            <p className="text-base md:text-lg text-muted-foreground max-w-2xl">
              {lang === "hi" ? track.taglineHi : track.tagline}
            </p>

            <div className="flex flex-wrap items-center gap-2 mt-2">
              <span className={cn("inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full", track.badge)}>
                <Sparkles className="h-3 w-3" /> {track.vibe}
              </span>
              <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-amber-500/10 text-amber-400">
                <Flame className="h-3 w-3" /> {streak}-day streak
              </span>
              <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-brand-500/10 text-brand-400">
                <Trophy className="h-3 w-3" /> {xp} XP
              </span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Signature unique feature */}
      <section className="container -mt-2">
        <Link href={track.signatureFeature.href}>
          <motion.div
            whileHover={{ y: -3 }}
            className={cn(
              "relative overflow-hidden rounded-3xl border border-border bg-card shadow-xl group cursor-pointer"
            )}
          >
            <div className={cn("absolute inset-0 opacity-20 bg-gradient-to-br pointer-events-none", track.gradient)} />
            <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-6 md:p-8">
              <div className="flex items-start gap-4">
                <div className={cn("h-12 w-12 grid place-items-center rounded-xl bg-gradient-to-br text-white", track.gradient)}>
                  <Sparkles className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                    Signature for {track.name}
                  </p>
                  <h2 className="font-display text-xl md:text-2xl font-bold mt-1">
                    {lang === "hi" ? track.signatureFeature.titleHi : track.signatureFeature.title}
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1 max-w-xl">
                    {lang === "hi" ? track.signatureFeature.subHi : track.signatureFeature.sub}
                  </p>
                </div>
              </div>
              <Button size="lg" className={cn("self-stretch md:self-auto bg-gradient-to-br text-white", track.gradient)}>
                Launch <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        </Link>
      </section>

      {/* Quick actions */}
      <section className="container mt-10">
        <h2 className="font-display text-xl md:text-2xl font-semibold">Quick actions</h2>
        <div className="mt-4 grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {track.quickActions.map((q: QuickAction, i) => {
            const Icon = ICONS[q.icon as keyof typeof ICONS] ?? Sparkles;
            return (
              <motion.div key={q.title} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.04 * i }}>
                <Link href={q.href} className="block h-full">
                  <div className="h-full glass rounded-2xl p-4 gradient-border hover:bg-muted/30 transition group">
                    <div className="flex items-center gap-3">
                      <span className={cn("h-9 w-9 grid place-items-center rounded-lg bg-muted", q.accent)}>
                        <Icon className="h-5 w-5" />
                      </span>
                      <div className="min-w-0">
                        <p className="font-medium text-sm">{q.title}</p>
                        <p className="text-xs text-muted-foreground truncate">{q.sub}</p>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Subjects + Recent attempts row */}
      <section className="container mt-10 grid lg:grid-cols-[1.2fr_1fr] gap-6">
        {/* Focus subjects */}
        <div className="glass rounded-2xl p-5 gradient-border">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold">Your focus subjects</h2>
            <Link href={`/exams/${track.slug}`} className="text-xs text-brand-500 hover:underline">
              Browse all →
            </Link>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {(subjects.length > 0 ? subjects.map((s) => s.name) : track.focusSubjects).map((label) => (
              <span key={label} className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-full border border-[#1e3a8a]/30 text-[#1e3a8a] dark:text-foreground dark:border-border font-medium">
                <BookOpen className="h-3 w-3" /> {label}
              </span>
            ))}
          </div>
          <div className="mt-6 grid sm:grid-cols-2 gap-3">
            <Link href="/predict" className="glass rounded-xl p-4 hover:bg-muted/30 transition gradient-border">
              <div className="flex items-center gap-3">
                <span className="h-9 w-9 grid place-items-center rounded-lg bg-amber-500/10 text-amber-400">
                  <Sparkles className="h-5 w-5" />
                </span>
                <div>
                  <p className="font-medium text-sm">Predicted set for {track.name}</p>
                  <p className="text-xs text-muted-foreground">Weighted by past-paper trends</p>
                </div>
              </div>
            </Link>
            <Link href="/radar" className="glass rounded-xl p-4 hover:bg-muted/30 transition gradient-border">
              <div className="flex items-center gap-3">
                <span className="h-9 w-9 grid place-items-center rounded-lg bg-emerald-500/10 text-emerald-400">
                  <Radar className="h-5 w-5" />
                </span>
                <div>
                  <p className="font-medium text-sm">Current Affairs Radar</p>
                  <p className="text-xs text-muted-foreground">Today's filtered headlines</p>
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* Recent attempts */}
        <div className="glass rounded-2xl p-5 gradient-border">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold">Recent attempts</h2>
            <Link href="/dashboard" className="text-xs text-brand-500 hover:underline">View dashboard →</Link>
          </div>
          {attempts.length === 0 ? (
            <div className="mt-6 text-center text-sm text-muted-foreground">
              <p>No attempts yet — take your first {track.name} mock now.</p>
              <Link href={`/exams/${track.slug}`}>
                <Button className="mt-3" size="sm">Browse mocks <ArrowRight className="h-4 w-4" /></Button>
              </Link>
            </div>
          ) : (
            <div className="mt-3 space-y-2">
              {attempts.map((a) => (
                <Link key={a.id} href={a.status === "SUBMITTED" ? `/attempt/${a.id}/result` : `/test/${a.testSetSlug}`} className="block">
                  <div className="rounded-xl border border-border p-3 hover:bg-muted/30 transition">
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{a.testSetTitle}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(a.startedAt).toLocaleString(lang === "hi" ? "hi-IN" : "en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </div>
                      <div className="text-right text-xs">
                        <p className={cn("font-medium", a.status === "SUBMITTED" ? "text-[#991b1b] dark:text-emerald-400" : "text-amber-700 dark:text-amber-400")}>{a.status}</p>
                        {a.accuracy !== null && (
                          <p className="text-muted-foreground">{Math.round((a.accuracy ?? 0) * 100)}% acc</p>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Featured mocks for the track */}
      <section className="container mt-10">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl md:text-2xl font-semibold">
            Featured {track.name} mocks
          </h2>
          <Link href={`/exams/${track.slug}`} className="text-xs text-brand-500 hover:underline">
            See all →
          </Link>
        </div>
        {testSets.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">
            New {track.name} mocks coming up. Meanwhile, try the{" "}
            <Link href={track.signatureFeature.href} className="text-brand-500 hover:underline">
              {track.signatureFeature.title}
            </Link>{" "}
            or a{" "}
            <Link href="/predict" className="text-brand-500 hover:underline">
              predicted set
            </Link>.
          </p>
        ) : (
          <div className="mt-4 grid md:grid-cols-2 lg:grid-cols-4 gap-3">
            {testSets.map((ts) => (
              <Link key={ts.slug} href={`/test/${ts.slug}`} className="group">
                <motion.div whileHover={{ y: -2 }} className="h-full glass rounded-2xl p-4 gradient-border">
                  <div className="flex items-center justify-between">
                    <span className={cn("text-[10px] uppercase tracking-wider px-2 py-0.5 rounded", track.badge)}>
                      {ts.isPremium ? "Premium ₹8" : "Free"}
                    </span>
                    <span className="text-xs text-muted-foreground">{ts.durationMin} min</span>
                  </div>
                  <h3 className="mt-3 font-display text-base font-semibold leading-tight line-clamp-2">{ts.title}</h3>
                  {ts.description && (
                    <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{ts.description}</p>
                  )}
                  <p className="mt-3 text-xs text-brand-500 inline-flex items-center gap-1">
                    Start now <ArrowRight className="h-3 w-3 transition group-hover:translate-x-0.5" />
                  </p>
                </motion.div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
