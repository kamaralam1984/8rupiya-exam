"use client";
import { motion } from "framer-motion";
import { LayoutDashboard, TrendingUp, Compass, Sparkles } from "lucide-react";

const SUBJECT_RADAR = [
  { subj: "Physics", val: 78, color: "#818cf8" },
  { subj: "Chemistry", val: 64, color: "#22d3ee" },
  { subj: "Biology", val: 88, color: "#34d399" },
  { subj: "Maths", val: 52, color: "#f472b6" },
  { subj: "Reasoning", val: 71, color: "#fbbf24" },
];

export function AiControlCenter() {
  return (
    <section id="control-center" className="relative py-20 md:py-28">
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <div className="aurora aurora-3 top-20 left-1/4 w-[480px] h-[480px] opacity-25" />
      </div>

      <div className="container">
        <div className="text-center max-w-3xl mx-auto">
          <div className="ai-chip mx-auto mb-4">
            <LayoutDashboard className="h-3 w-3 text-cyan-300" /> AI Control Center
          </div>
          <h2 className="font-display text-4xl md:text-5xl font-bold tracking-tight">
            Tumhara personal{" "}
            <span className="ai-gradient-text">Exam Operating System</span>
          </h2>
          <p className="mt-4 text-muted-foreground">
            Radar charts, study heatmaps, selection probability meter, career predictor — ek dashboard mein.
          </p>
        </div>

        <div className="mt-14 grid lg:grid-cols-12 gap-6">
          {/* RADAR card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-5 neon-card p-6"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-bold flex items-center gap-2"><TrendingUp className="h-4 w-4 text-cyan-300" /> Subject Radar</h3>
              <span className="text-[10px] uppercase tracking-wider text-emerald-300 font-bold">Live AI</span>
            </div>

            <div className="mt-5 space-y-3">
              {SUBJECT_RADAR.map((s, i) => (
                <div key={s.subj}>
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-medium">{s.subj}</span>
                    <span className="font-bold" style={{ color: s.color }}>{s.val}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${s.val}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 1.1, delay: 0.1 + i * 0.08, ease: "easeOut" }}
                      className="h-full rounded-full"
                      style={{ background: `linear-gradient(90deg, ${s.color}, ${s.color}aa)`, boxShadow: `0 0 12px ${s.color}99` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 p-3 rounded-xl bg-purple-500/10 border border-purple-400/30 flex items-start gap-3">
              <Sparkles className="h-4 w-4 text-purple-300 mt-0.5 shrink-0" />
              <p className="text-xs text-muted-foreground leading-relaxed">
                <span className="text-purple-200 font-semibold">Golu AI says:</span> Maths sabse weak hai. Aaj 30 min Calculus aur 15 min Trigonometry karo — accuracy 12% boost ho sakti hai.
              </p>
            </div>
          </motion.div>

          {/* PROBABILITY METER */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="lg:col-span-4 neon-card p-6 text-center bg-gradient-to-br from-emerald-500/10 via-cyan-500/5 to-transparent"
          >
            <h3 className="font-bold flex items-center justify-center gap-2"><Compass className="h-4 w-4 text-emerald-300" /> Selection Probability</h3>

            <div className="mt-6 mx-auto relative w-40 h-40">
              <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
                <defs>
                  <linearGradient id="aiGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#22d3ee" />
                    <stop offset="50%" stopColor="#818cf8" />
                    <stop offset="100%" stopColor="#ec4899" />
                  </linearGradient>
                </defs>
                <circle cx="60" cy="60" r="50" fill="none" className="ring-track" strokeWidth="10" />
                <motion.circle
                  cx="60" cy="60" r="50" fill="none" strokeWidth="10"
                  className="ring-progress"
                  strokeDasharray={2 * Math.PI * 50}
                  initial={{ strokeDashoffset: 2 * Math.PI * 50 }}
                  whileInView={{ strokeDashoffset: 2 * Math.PI * 50 * (1 - 0.74) }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.6, ease: "easeOut" }}
                />
              </svg>
              <div className="absolute inset-0 grid place-items-center">
                <div>
                  <p className="text-3xl font-display font-bold ai-gradient-text-cyan">74%</p>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold mt-0.5">Chance</p>
                </div>
              </div>
            </div>

            <p className="mt-4 text-sm text-muted-foreground">
              NEET 2026 — current trajectory pe AI ne <span className="text-emerald-300 font-bold">74%</span> selection chance predict kiya.
            </p>
            <p className="mt-2 text-xs text-cyan-300">+ 8% boost possible agar Maths reach 75%</p>
          </motion.div>

          {/* CAREER PREDICTOR */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="lg:col-span-3 neon-card p-6 bg-gradient-to-br from-pink-500/10 via-purple-500/5 to-transparent"
          >
            <h3 className="font-bold flex items-center gap-2"><Sparkles className="h-4 w-4 text-pink-300" /> Career Predictor</h3>
            <p className="text-xs text-muted-foreground mt-2">Performance ke base par AI ne best-fit careers suggest kiye</p>

            <ul className="mt-5 space-y-2.5">
              {[
                { label: "MBBS — Govt", fit: 92, color: "bg-emerald-400" },
                { label: "BDS", fit: 78, color: "bg-cyan-400" },
                { label: "AIIMS Nursing", fit: 71, color: "bg-purple-400" },
                { label: "B.Pharma", fit: 64, color: "bg-pink-400" },
              ].map((c) => (
                <li key={c.label} className="flex items-center gap-3">
                  <span className={`h-2 w-2 rounded-full ${c.color}`} />
                  <span className="flex-1 text-sm">{c.label}</span>
                  <span className="text-xs font-bold">{c.fit}%</span>
                </li>
              ))}
            </ul>

            <button className="mt-5 w-full btn-ghost-ai justify-center text-xs">Explore all paths</button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
