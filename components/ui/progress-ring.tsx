"use client";
import { useEffect, useState } from "react";

type Props = {
  value: number;          // 0–100
  size?: number;          // px
  stroke?: number;        // px
  duration?: number;      // ms
  gradientFrom?: string;  // tailwind color value (hex)
  gradientTo?: string;
  label?: string;
  sublabel?: string;
};

export function ProgressRing({
  value,
  size = 140,
  stroke = 10,
  duration = 900,
  gradientFrom = "#22d3ee",
  gradientTo = "#a855f7",
  label,
  sublabel,
}: Props) {
  const clamped = Math.max(0, Math.min(100, value));
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const [animatedPct, setAnimatedPct] = useState(0);

  useEffect(() => {
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setAnimatedPct(clamped * eased);
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [clamped, duration]);

  const dash = (animatedPct / 100) * circ;
  const id = `pr-grad-${gradientFrom}-${gradientTo}`.replace(/[^a-zA-Z0-9-]/g, "");

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <defs>
          <linearGradient id={id} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={gradientFrom} />
            <stop offset="100%" stopColor={gradientTo} />
          </linearGradient>
        </defs>
        <circle cx={size / 2} cy={size / 2} r={r} stroke="currentColor" strokeOpacity="0.12" strokeWidth={stroke} fill="none" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={`url(#${id})`}
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circ}`}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <p className="font-display font-bold ai-gradient-text" style={{ fontSize: size * 0.22 }}>
          {Math.round(animatedPct)}%
        </p>
        {label && <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>}
        {sublabel && <p className="text-[10px] text-muted-foreground">{sublabel}</p>}
      </div>
    </div>
  );
}
