"use client";
import { useEffect, useState } from "react";
import { Clock } from "lucide-react";

function fmt(s: number) {
  const sec = Math.max(0, Math.floor(s));
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const r = sec % 60;
  const pad = (n: number) => n.toString().padStart(2, "0");
  return h > 0 ? `${pad(h)}:${pad(m)}:${pad(r)}` : `${pad(m)}:${pad(r)}`;
}

export function TestTimer({
  startedAt, durationMin, onExpire, onTick,
}: { startedAt: number; durationMin: number; onExpire: () => void; onTick?: (remaining: number) => void }) {
  const total = durationMin * 60;
  const [left, setLeft] = useState(() => Math.max(0, total - Math.floor((Date.now() - startedAt) / 1000)));

  useEffect(() => {
    const tick = () => {
      const elapsed = Math.floor((Date.now() - startedAt) / 1000);
      const remaining = Math.max(0, total - elapsed);
      setLeft(remaining);
      onTick?.(remaining);
      if (remaining <= 0) onExpire();
    };
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [startedAt, total, onExpire, onTick]);

  const danger = left <= 60;
  const warn = left <= 300 && !danger;
  return (
    <div
      className={`inline-flex items-center gap-2 rounded-lg glass px-3 py-1.5 text-sm font-mono tabular-nums ${
        danger ? "text-red-500" : warn ? "text-amber-500" : ""
      }`}
      aria-live="polite"
    >
      <Clock className="h-4 w-4" />
      {fmt(left)}
    </div>
  );
}
