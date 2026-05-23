"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Loader2, Trophy, Flame, Sparkles, Lock } from "lucide-react";
import { api } from "@/lib/api-client";

type Badge = {
  code: string;
  title: string;
  description: string;
  emoji: string;
  gradient: string;
  rarity: "common" | "rare" | "epic" | "legendary";
  earned: boolean;
  awardedAt: string | null;
};
type Resp = {
  badges: Badge[];
  stats: { total: number; earned: number; xp: number; streak: number };
};

const RARITY_ORDER: Record<Badge["rarity"], number> = { legendary: 0, epic: 1, rare: 2, common: 3 };

export function AchievementsClient() {
  const [d, setD] = useState<Resp | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "earned" | "locked">("all");

  useEffect(() => {
    (async () => {
      const r = await api<Resp>("/api/me/badges");
      if (!r.ok) { setErr(r.error.code === "UNAUTHENTICATED" ? "Sign in to view badges." : r.error.message ?? "Failed"); return; }
      setD(r.data);
    })();
  }, []);

  if (err) return <p className="text-sm text-rose-400">{err}</p>;
  if (!d) return <div className="neon-card p-10 text-center"><Loader2 className="h-8 w-8 mx-auto animate-spin text-brand-500" /></div>;

  const filtered = d.badges
    .filter((b) => filter === "all" ? true : filter === "earned" ? b.earned : !b.earned)
    .sort((a, b) => (Number(b.earned) - Number(a.earned)) || (RARITY_ORDER[a.rarity] - RARITY_ORDER[b.rarity]));

  const pct = Math.round((d.stats.earned / Math.max(1, d.stats.total)) * 100);

  return (
    <div className="space-y-6">
      <div className="grid sm:grid-cols-3 gap-4">
        <div className="neon-card p-5 bg-gradient-to-br from-amber-500/15 to-transparent">
          <Trophy className="h-5 w-5 text-amber-300" />
          <p className="mt-3 text-xs text-muted-foreground">Badges earned</p>
          <p className="font-display text-3xl font-bold ai-gradient-text">{d.stats.earned}<span className="text-base text-muted-foreground"> / {d.stats.total}</span></p>
          <div className="mt-2 h-1.5 rounded-full bg-muted overflow-hidden">
            <div className="h-full bg-gradient-to-r from-amber-500 to-orange-500" style={{ width: `${pct}%` }} />
          </div>
        </div>
        <div className="neon-card p-5 bg-gradient-to-br from-orange-500/15 to-transparent">
          <Flame className="h-5 w-5 text-orange-300" />
          <p className="mt-3 text-xs text-muted-foreground">Current streak</p>
          <p className="font-display text-3xl font-bold ai-gradient-text">{d.stats.streak} <span className="text-base text-muted-foreground">din</span></p>
        </div>
        <div className="neon-card p-5 bg-gradient-to-br from-cyan-500/15 to-transparent">
          <Sparkles className="h-5 w-5 text-cyan-300" />
          <p className="mt-3 text-xs text-muted-foreground">Total XP</p>
          <p className="font-display text-3xl font-bold ai-gradient-text-cyan">{d.stats.xp.toLocaleString("en-IN")}</p>
        </div>
      </div>

      <div className="flex gap-2 text-xs">
        {(["all", "earned", "locked"] as const).map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-full border transition ${filter === f ? "border-brand-500 bg-brand-500/10 text-foreground" : "border-border text-muted-foreground hover:text-foreground"}`}>
            {f === "all" ? "All" : f === "earned" ? "Earned" : "Locked"}
          </button>
        ))}
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((b, i) => (
          <motion.div
            key={b.code}
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.35, delay: i * 0.03 }}
            className={`neon-card p-5 relative overflow-hidden ${b.earned ? "" : "opacity-60"}`}
          >
            <div className={`absolute -top-10 -right-10 h-32 w-32 rounded-full bg-gradient-to-br ${b.gradient} blur-2xl opacity-30`} />
            <div className="relative">
              <div className={`h-16 w-16 rounded-2xl bg-gradient-to-br ${b.gradient} flex items-center justify-center text-3xl ${b.earned ? "" : "grayscale"}`}>
                {b.earned ? b.emoji : <Lock className="h-7 w-7 text-white" />}
              </div>
              <div className="mt-3 flex items-center justify-between">
                <h3 className="font-display font-bold">{b.title}</h3>
                <span className="ai-chip text-[10px] uppercase">{b.rarity}</span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">{b.description}</p>
              {b.earned && b.awardedAt && (
                <p className="mt-2 text-[10px] text-emerald-300">
                  Earned {new Date(b.awardedAt).toLocaleDateString("en-IN")}
                </p>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
