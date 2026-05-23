"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { Award, Clock, Sparkles, IndianRupee } from "lucide-react";
import { useEffect, useState } from "react";

function useCountdown(target: Date) {
  const [mounted, setMounted] = useState(false);
  const [now, setNow] = useState<Date>(target);
  useEffect(() => {
    setMounted(true);
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  if (!mounted) return { d: 0, h: 0, m: 0, s: 0, mounted };
  const diff = Math.max(0, target.getTime() - now.getTime());
  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  return { d, h, m, s, mounted };
}

export function ScholarshipBanner() {
  const target = new Date();
  target.setDate(target.getDate() + 7);
  target.setHours(23, 59, 59, 0);
  const { d, h, m, s } = useCountdown(target);

  return (
    <section className="relative py-16 md:py-20">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="neon-card relative overflow-hidden p-8 md:p-12 bg-gradient-to-br from-amber-500/15 via-orange-500/10 to-rose-500/10"
        >
          <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-amber-500/20 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 -left-20 w-72 h-72 rounded-full bg-rose-500/20 blur-3xl pointer-events-none" />

          <div className="relative grid md:grid-cols-[1fr_auto] gap-8 items-center">
            <div>
              <div className="ai-chip mb-3">
                <Award className="h-3 w-3 text-amber-300" /> Scholarship Test 2026
              </div>
              <h2 className="font-display text-3xl md:text-4xl font-bold tracking-tight">
                Top 100 ko milegi <span className="ai-gradient-text">100% scholarship</span> + ₹50K cash
              </h2>
              <p className="mt-3 text-muted-foreground max-w-xl">
                90-minute online scholarship test — har Sunday 6 PM. Top 100 ranks ko 1-year Pro free,
                top 10 ko cash prize. ₹8 mein register karo, life change ho sakti hai.
              </p>

              <div className="mt-5 flex items-center gap-2 flex-wrap">
                <Clock className="h-4 w-4 text-amber-300" />
                <span className="text-xs text-muted-foreground">Registration closes in:</span>
                <div className="flex gap-1.5">
                  {[
                    { v: d, l: "D" },
                    { v: h, l: "H" },
                    { v: m, l: "M" },
                    { v: s, l: "S" },
                  ].map((b) => (
                    <div key={b.l} className="font-mono text-xs px-2 py-1 rounded bg-foreground/10">
                      <span className="font-bold ai-gradient-text-cyan">{String(b.v).padStart(2, "0")}</span>
                      <span className="text-muted-foreground ml-0.5">{b.l}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 flex gap-3 flex-wrap">
                <Link href="/predict" className="btn-ai">
                  <Sparkles className="h-4 w-4" /> Register for ₹8
                </Link>
                <Link href="/exams" className="btn-ghost-ai">
                  <IndianRupee className="h-4 w-4" /> See prize details
                </Link>
              </div>
            </div>

            <div className="text-center md:text-right shrink-0">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">Prize pool</p>
              <p className="font-display text-5xl md:text-6xl font-bold ai-gradient-text">₹5L+</p>
              <p className="mt-1 text-xs text-muted-foreground">Across cash + scholarships</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
