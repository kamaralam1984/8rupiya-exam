"use client";
import { Crown } from "lucide-react";

const TOPPERS = [
  { name: "Rahul V.", exam: "NEET 2025", rank: "AIR 47" },
  { name: "Sneha I.", exam: "JEE Adv 2025", rank: "AIR 112" },
  { name: "Akash S.", exam: "SSC CGL 2024", rank: "AIR 8" },
  { name: "Priya S.", exam: "UPSC 2024", rank: "AIR 84" },
  { name: "Vikram J.", exam: "RRB NTPC", rank: "AIR 23" },
  { name: "Ananya G.", exam: "CUET 2025", rank: "99.8 PCT" },
  { name: "Aman K.", exam: "IBPS PO", rank: "AIR 156" },
  { name: "Meera P.", exam: "CTET Dec 24", rank: "Top 1%" },
];

export function AirTicker() {
  const items = [...TOPPERS, ...TOPPERS];
  return (
    <div className="relative w-full overflow-hidden rounded-xl border border-border/40 bg-foreground/5 backdrop-blur py-2">
      <div className="pointer-events-none absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-background to-transparent z-10" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-background to-transparent z-10" />
      <div className="flex gap-8 animate-marquee whitespace-nowrap">
        {items.map((t, i) => (
          <span key={i} className="inline-flex items-center gap-2 text-xs">
            <Crown className="h-3 w-3 text-amber-300" />
            <span className="font-bold">{t.name}</span>
            <span className="text-muted-foreground">· {t.exam} ·</span>
            <span className="ai-gradient-text font-bold">{t.rank}</span>
          </span>
        ))}
      </div>
      <style jsx>{`
        @keyframes marquee {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 38s linear infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .animate-marquee { animation: none; }
        }
      `}</style>
    </div>
  );
}
