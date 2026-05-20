"use client";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  Loader2,
  GraduationCap,
  Calculator,
  Train,
  Landmark,
  BookOpen,
  School,
  TestTube,
  Shield,
  Users,
  Map,
  ArrowRight,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUser } from "@/lib/use-user";
import { api } from "@/lib/api-client";
import { TRACK_CONFIGS, type TrackSlug } from "@/lib/track-config";
import { cn } from "@/lib/utils";

const ICONS = {
  GraduationCap,
  Calculator,
  Train,
  Landmark,
  BookOpen,
  School,
  TestTube,
  Shield,
  Users,
  Map,
} as const;

const ALL_TRACKS = Object.values(TRACK_CONFIGS);

export function OnboardingClient() {
  const router = useRouter();
  const sp = useSearchParams();
  const nextHref = sp.get("next") || "/home";
  const { user, loading, setUser } = useUser();
  const [selected, setSelected] = useState<TrackSlug | null>(null);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [activeSlugs, setActiveSlugs] = useState<Set<string> | null>(null);

  useEffect(() => {
    if (!loading && !user) router.replace("/signin?next=/onboarding");
    if (user?.examTrack && !selected) setSelected(user.examTrack as TrackSlug);
  }, [loading, user, router, selected]);

  useEffect(() => {
    let active = true;
    (async () => {
      const r = await api<string[]>("/api/exams/active");
      if (active && r.ok) setActiveSlugs(new Set(r.data));
    })();
    return () => { active = false; };
  }, []);

  const TRACKS = activeSlugs ? ALL_TRACKS.filter((t) => activeSlugs.has(t.slug)) : ALL_TRACKS;

  async function submit() {
    if (!selected) return;
    setSaving(true);
    setErr(null);
    const r = await api<{ examTrack: string; onboardedAt: string | null }>("/api/me/onboard", {
      method: "POST",
      body: JSON.stringify({ examTrack: selected }),
    });
    setSaving(false);
    if (!r.ok) {
      setErr(r.error.message ?? r.error.code);
      return;
    }
    if (user) {
      setUser({ ...user, examTrack: r.data.examTrack, onboardedAt: r.data.onboardedAt });
    }
    router.replace(nextHref);
  }

  if (loading) {
    return (
      <section className="container py-20 grid place-items-center">
        <Loader2 className="h-6 w-6 animate-spin text-brand-500" />
      </section>
    );
  }

  return (
    <section className="container pt-12 pb-24">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="text-center max-w-2xl mx-auto"
      >
        <p className="text-xs font-medium tracking-[0.2em] text-brand-500 uppercase">
          Step 1 of 1
        </p>
        <h1 className="mt-2 font-display text-3xl md:text-5xl font-bold tracking-tight">
          Tum kis exam ki <span className="gradient-text">tayyari</span> kar rahe ho?
        </h1>
        <p className="mt-3 text-muted-foreground text-base md:text-lg">
          Pick your track — we'll personalize the entire home, daily drills and AI prediction sets for it.
          You can change this any time from Settings.
        </p>
      </motion.div>

      <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {TRACKS.map((tr, i) => {
          const Icon = ICONS[tr.heroIcon as keyof typeof ICONS] ?? GraduationCap;
          const isSelected = selected === tr.slug;
          return (
            <motion.button
              key={tr.slug}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04, duration: 0.3 }}
              whileHover={{ y: -3 }}
              onClick={() => setSelected(tr.slug)}
              className={cn(
                "relative text-left rounded-2xl overflow-hidden border transition group",
                "border-border bg-card hover:border-brand-500/50",
                isSelected && "border-brand-500 ring-2 ring-brand-500/30"
              )}
            >
              <div
                className={cn(
                  "absolute inset-0 opacity-15 bg-gradient-to-br pointer-events-none transition group-hover:opacity-25",
                  tr.gradient
                )}
              />
              <div className="relative p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div
                    className={cn(
                      "h-10 w-10 grid place-items-center rounded-xl bg-gradient-to-br text-white",
                      tr.gradient
                    )}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  {isSelected ? (
                    <span className="grid h-7 w-7 place-items-center rounded-full bg-brand-500 text-white">
                      <Check className="h-4 w-4" />
                    </span>
                  ) : (
                    <span className={cn("text-[10px] px-2 py-0.5 rounded-full", tr.badge)}>{tr.vibe}</span>
                  )}
                </div>
                <div>
                  <h3 className="font-display text-lg font-bold">{tr.name}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">{tr.short}</p>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2">{tr.tagline}</p>
              </div>
            </motion.button>
          );
        })}
      </div>

      <div className="mt-10 flex flex-col items-center gap-3">
        {err && <p className="text-sm text-red-500">{err}</p>}
        <Button
          size="lg"
          onClick={submit}
          disabled={!selected || saving}
          className="min-w-[220px]"
        >
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Saving…
            </>
          ) : (
            <>
              Continue <ArrowRight className="h-4 w-4" />
            </>
          )}
        </Button>
        <button
          onClick={() => router.replace("/exams")}
          className="text-xs text-muted-foreground hover:text-foreground underline-offset-4 hover:underline"
        >
          Skip for now — I'll choose later
        </button>
      </div>
    </section>
  );
}
