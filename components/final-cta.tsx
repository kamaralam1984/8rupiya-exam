"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { Smartphone, Sparkles, Zap, Download } from "lucide-react";

export function FinalCTA() {
  return (
    <section className="relative py-20 md:py-28">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="relative overflow-hidden neon-card p-10 md:p-16 text-center bg-gradient-to-br from-indigo-600/20 via-purple-600/15 to-pink-500/15"
        >
          {/* Aurora inside card */}
          <div className="aurora aurora-1 -top-20 -left-20 w-[400px] h-[400px] opacity-50" />
          <div className="aurora aurora-2 -bottom-20 -right-20 w-[400px] h-[400px] opacity-50" />

          <div className="relative">
            <div className="ai-chip mx-auto mb-5">
              <span className="ai-chip-dot" /> Aaj se shuru karo
            </div>

            <h2 className="font-display text-4xl md:text-6xl font-bold tracking-tight leading-tight">
              Sirf <span className="ai-gradient-text">₹8</span> me apna<br />
              selection journey shuru karo
            </h2>

            <p className="mt-5 text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
              12.4 lakh+ students already padh rahe hain. Aaj raat tum bhi join karo —
              ek mock se start, lifetime ka result.
            </p>

            <div className="mt-9 flex flex-wrap justify-center gap-3">
              <Link href="/exams" className="btn-ai">
                <Zap className="h-4 w-4" /> Start Free Test
              </Link>
              <Link href="/onboarding" className="btn-ghost-ai">
                <Sparkles className="h-4 w-4 text-purple-300" /> Sign up free
              </Link>
            </div>

            {/* App download row */}
            <div className="mt-12 pt-10 border-t border-white/10">
              <p className="text-xs uppercase tracking-wider text-muted-foreground font-bold flex items-center justify-center gap-2 mb-5">
                <Smartphone className="h-3.5 w-3.5 text-cyan-300" /> Install karo, offline padho
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <button className="btn-ghost-ai">
                  <Download className="h-4 w-4 text-emerald-400" /> Install as app (PWA)
                </button>
                <button className="btn-ghost-ai">
                  <Smartphone className="h-4 w-4 text-cyan-400" /> Get Android app
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
