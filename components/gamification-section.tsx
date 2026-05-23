"use client";
import { motion } from "framer-motion";
import { Flame, Trophy, Coins, Target, Swords, Crown, Zap } from "lucide-react";

const MISSIONS = [
  { title: "Daily streak", value: "27 din", icon: Flame, color: "text-orange-300", gradient: "from-orange-500/20" },
  { title: "XP earned", value: "12,480", icon: Zap, color: "text-amber-300", gradient: "from-amber-500/20" },
  { title: "Coins balance", value: "₹824", icon: Coins, color: "text-yellow-300", gradient: "from-yellow-500/20" },
  { title: "Accuracy goal", value: "84%", icon: Target, color: "text-emerald-300", gradient: "from-emerald-500/20" },
];

const LEADERBOARD = [
  { rank: 1, name: "Aarav S.", xp: 28420, badge: "👑" },
  { rank: 2, name: "Diya M.", xp: 26110, badge: "🥈" },
  { rank: 3, name: "You", xp: 24890, badge: "🥉", you: true },
  { rank: 4, name: "Kabir K.", xp: 22600, badge: "" },
  { rank: 5, name: "Meera P.", xp: 21340, badge: "" },
];

export function GamificationSection() {
  return (
    <section id="gamification" className="relative py-20 md:py-28">
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <div className="aurora aurora-4 top-0 left-1/3 w-[480px] h-[480px] opacity-25" />
      </div>

      <div className="container">
        <div className="text-center max-w-3xl mx-auto">
          <div className="ai-chip mb-4 mx-auto">
            <Trophy className="h-3 w-3 text-amber-300" />
            Gamification
          </div>
          <h2 className="font-display text-4xl md:text-5xl font-bold tracking-tight">
            Padhai ko <span className="ai-gradient-text">game</span> bana do
          </h2>
          <p className="mt-4 text-muted-foreground">
            XP, coins, streaks, daily missions aur leaderboards — Duolingo-style addiction, exam-grade results.
          </p>
        </div>

        <div className="mt-14 grid lg:grid-cols-3 gap-6">
          {/* LEFT — Mission cards */}
          <div className="lg:col-span-2 grid sm:grid-cols-2 gap-4">
            {MISSIONS.map((m, i) => (
              <motion.div
                key={m.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: i * 0.08 }}
                className={`neon-card p-5 bg-gradient-to-br ${m.gradient} to-transparent`}
              >
                <div className="flex items-start justify-between">
                  <m.icon className={`h-7 w-7 ${m.color}`} />
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Live</span>
                </div>
                <p className="mt-6 text-3xl font-display font-bold ai-gradient-text-cyan">{m.value}</p>
                <p className="mt-1 text-sm text-muted-foreground">{m.title}</p>
              </motion.div>
            ))}

            {/* Battle CTA card spans full width */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="sm:col-span-2 relative neon-card p-6 overflow-hidden bg-gradient-to-br from-rose-500/15 via-purple-500/10 to-indigo-500/10"
            >
              <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-rose-500/30 blur-3xl" />
              <div className="relative flex flex-col md:flex-row items-start md:items-center gap-5 justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <Swords className="h-5 w-5 text-rose-300" />
                    <span className="ai-chip text-[10px]">
                      <span className="ai-chip-dot" /> Battle Arena
                    </span>
                  </div>
                  <h3 className="mt-3 font-display text-2xl font-bold">
                    1v1 Quiz Battle — 60 seconds, winner takes XP
                  </h3>
                  <p className="mt-1.5 text-sm text-muted-foreground max-w-md">
                    Real students ke saath live multiplayer mock — har battle ke baad rank update.
                  </p>
                </div>
                <button className="btn-ai whitespace-nowrap">
                  <Zap className="h-4 w-4" /> Enter Arena
                </button>
              </div>
            </motion.div>
          </div>

          {/* RIGHT — Leaderboard */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="neon-card p-5"
          >
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="font-bold flex items-center gap-2">
                <Crown className="h-4 w-4 text-amber-300" /> NEET League — Week
              </h3>
              <span className="text-[10px] uppercase tracking-wider text-emerald-300 font-bold">Live</span>
            </div>

            <ul className="mt-4 space-y-2">
              {LEADERBOARD.map((u) => (
                <li
                  key={u.rank}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl ${
                    u.you
                      ? "bg-gradient-to-r from-purple-500/25 to-pink-500/15 border border-purple-400/40"
                      : "bg-white/3 hover:bg-white/5 transition"
                  }`}
                >
                  <span className="text-sm font-bold w-6 text-muted-foreground">#{u.rank}</span>
                  <span className="text-lg">{u.badge}</span>
                  <span className={`flex-1 text-sm ${u.you ? "font-bold text-purple-200" : ""}`}>
                    {u.name}
                  </span>
                  <span className="text-xs font-bold text-amber-300">{u.xp.toLocaleString("en-IN")} XP</span>
                </li>
              ))}
            </ul>

            <button className="mt-4 w-full btn-ghost-ai justify-center">View full league</button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
