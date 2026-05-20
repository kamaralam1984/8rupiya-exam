"use client";
import { useEffect, useState } from "react";
import { Trophy, Flame, Loader2, Medal } from "lucide-react";
import { motion } from "framer-motion";
import { api } from "@/lib/api-client";

type Row = { rank: number; name: string; xp: number; streak: number };

export function LeaderboardView() {
  const [rows, setRows] = useState<Row[] | null>(null);

  useEffect(() => {
    (async () => {
      const r = await api<Row[]>("/api/leaderboard");
      if (r.ok) setRows(r.data);
    })();
  }, []);

  return (
    <section className="container pt-10 pb-20">
      <header className="mb-6">
        <p className="text-xs text-muted-foreground">All time</p>
        <h1 className="font-display text-3xl md:text-4xl font-bold tracking-tight">
          <Trophy className="inline h-8 w-8 mr-2 text-brand-500" />
          <span className="gradient-text">Leaderboard</span>
        </h1>
      </header>

      {!rows ? (
        <div className="grid place-items-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-brand-500" />
        </div>
      ) : rows.length === 0 ? (
        <div className="glass rounded-2xl p-8 text-center gradient-border">
          <p className="text-muted-foreground">No XP earned yet. Be the first.</p>
        </div>
      ) : (
        <ol className="space-y-2">
          {rows.map((r, i) => (
            <motion.li
              key={r.rank}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: Math.min(i, 20) * 0.02 }}
              className="glass rounded-xl p-3 gradient-border flex items-center gap-4"
            >
              <span className={`grid h-10 w-10 place-items-center rounded-full font-display font-bold ${
                r.rank === 1 ? "bg-amber-500/30 text-amber-500" :
                r.rank === 2 ? "bg-slate-400/30 text-slate-300" :
                r.rank === 3 ? "bg-orange-700/30 text-orange-400" :
                "bg-muted text-muted-foreground"
              }`}>
                {r.rank <= 3 ? <Medal className="h-5 w-5" /> : r.rank}
              </span>
              <span className="flex-1 font-medium truncate">{r.name}</span>
              <span className="inline-flex items-center gap-1 text-sm">
                <Flame className="h-3.5 w-3.5 text-amber-500" /> {r.streak}
              </span>
              <span className="inline-flex items-center gap-1 text-sm font-semibold">
                <Trophy className="h-3.5 w-3.5 text-brand-500" /> {r.xp}
              </span>
            </motion.li>
          ))}
        </ol>
      )}
    </section>
  );
}
