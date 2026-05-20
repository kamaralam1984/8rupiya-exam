"use client";
import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";

function useCountUp(target: number, duration = 1600, start = false) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!start) return;
    let raf = 0;
    const t0 = performance.now();
    const tick = (t: number) => {
      const p = Math.min(1, (t - t0) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setValue(Math.round(target * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration, start]);
  return value;
}

const STATS = [
  { label: "Students", value: 142000, suffix: "+" },
  { label: "Tests Attempted", value: 2850000, suffix: "+" },
  { label: "AI Predictions", value: 96000, suffix: "+" },
  { label: "Avg Improvement", value: 38, suffix: "%" },
];

function fmt(n: number) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(n % 1_000_000 === 0 ? 0 : 1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(n % 1_000 === 0 ? 0 : 1) + "K";
  return String(n);
}

export function StatsCounter() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <div ref={ref} className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {STATS.map((s, i) => (
        <Stat key={s.label} {...s} start={inView} delay={i * 0.1} />
      ))}
    </div>
  );
}

function Stat({
  label, value, suffix, start, delay,
}: { label: string; value: number; suffix: string; start: boolean; delay: number }) {
  const n = useCountUp(value, 1600, start);
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={start ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay }}
      className="glass rounded-2xl p-5 text-center gradient-border"
    >
      <div className="font-display text-2xl md:text-3xl font-bold gradient-text">
        {fmt(n)}{suffix}
      </div>
      <div className="mt-1 text-xs text-muted-foreground">{label}</div>
    </motion.div>
  );
}
